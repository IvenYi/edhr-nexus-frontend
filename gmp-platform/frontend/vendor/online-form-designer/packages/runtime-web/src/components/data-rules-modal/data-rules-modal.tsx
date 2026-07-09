import { defineComponent, PropType, ref, provide } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FIELD_TYPE, FieldMetaDTO, IModal } from '@gct/runtime';
import { getFieldMetaListConditionField } from '/@/apis/gct-apaas/FieldMetaController';
import './data-rules-modal.scss';

/**
 * 字段条件规则配置模态框
 */
export const DataRulesModal = defineComponent({
  name: 'DataRulesModal',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    detail: {
      type: Object as PropType<any>,
      default: () => ({
        dataRule: '',
        dataRuleConfig: '',
        dataRuleEnabled: true,
      }),
    },
    modelKey: {
      type: String as PropType<string>,
      default: '',
    },
    excludeValueType: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    excludeOperatorType: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    filterFieldKeys: {
      type: Object as PropType<FIELD_TYPE[]>,
    },
  },
  setup(props) {
    const ns = useNamespace('data-rules-modal');

    const dataRulesRef = ref();

    provide('isDataFilterEditor', true);

    if (props.modal) {
      props.modal.callback(
        async () => {
          const dataRulesRes = dataRulesRef.value.getDataRulesResult();
          dataRulesRef.value.resetData();
          return {
            ok: true,
            data: [
              {
                dataRule: {
                  query: dataRulesRes.query,
                  varKeys: dataRulesRes.varKeys,
                  exp: dataRulesRes.exp,
                  typeMap: dataRulesRes?.typeMap || {},
                },
                dataRuleConfig: dataRulesRes.treeStr,
                dataRuleEnabled: true,
              },
            ],
          };
        },
        async () => {
          dataRulesRef.value.resetData();
          return true;
        },
      );
    }

    const list = ref<FieldMetaDTO[]>([]);
    const getConditionField = async (modelKey) => {
      const result =
        (await getFieldMetaListConditionField({
          modelKey: modelKey,
        })) || [];
      const filterFieldKeys = props.filterFieldKeys || [
        FIELD_TYPE.TEXT,
        FIELD_TYPE.LONG_TEXT,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
        FIELD_TYPE.DOUBLE,
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.BOOLEAN,
        FIELD_TYPE.DATE,
        FIELD_TYPE.DATE_TIME,
        FIELD_TYPE.TIME,
        FIELD_TYPE.ENUM,
        FIELD_TYPE.ENUM_MULTI,
        FIELD_TYPE.REF,
        FIELD_TYPE.REF_MULTI,
      ];
      list.value = result
        .filter((i) => filterFieldKeys.includes(i.type as FIELD_TYPE))
        .filter((v) => v.createType === 'USER_DEFINED' || v.createType === 'BUILTIN');
    };

    async function onInit(): Promise<void> {
      if (props.modelKey) {
        getConditionField(props.modelKey);
      }
    }

    onInit();
    return { ns, dataRulesRef, list };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <data-rules-container
          ref="dataRulesRef"
          fieldList={this.list}
          detail={this.detail}
          isDesign={true}
          isPageDesigner={true}
          excludeValueType={this.excludeValueType}
          excludeOperatorType={this.excludeOperatorType}
        />
      </div>
    );
  },
});
