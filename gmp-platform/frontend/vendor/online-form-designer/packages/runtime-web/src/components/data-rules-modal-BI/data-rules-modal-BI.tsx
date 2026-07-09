import { defineComponent, PropType, ref, provide } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal } from '@gct/runtime';
import './data-rules-modal-BI.scss';
import { DataRulesContainerBI } from '/@/projects/bi-designer/src/views/components/data-rules-container-BI';
import { getDatabaseColumnInformation } from '/@/apis/gct-platform/DatabaseController';
import { ColumnInformationSchema } from '/@/apis/gct-platform/model';
import type { BIFieldMeta } from '/@/projects/bi-designer/src/views/components/data-rules-container-BI/constant/interface';
import { BIFieldTypeEnum } from '/@/projects/bi-designer/src/views/data-set/interface/type'; 
/**
 * 字段条件规则配置模态框
 */
export const DataRulesModalBI = defineComponent({
  name: 'DataRulesModalBI',
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
    databaseId: {
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
      type: Object as PropType<BIFieldTypeEnum[]>,
    },
  },
  setup(props) {
    const ns = useNamespace('data-rules-modal-BI');

    const dataRulesRef = ref();

    provide('isDataFilterEditor', true);

    if (props.modal) {
      props.modal.callback(
        async () => {
          const dataRulesRes = dataRulesRef.value?.getDataRulesResult();
          dataRulesRef.value?.resetData();
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

    const fieldTypeMapping = (type: string = 'string') => {
      let fieldType = BIFieldTypeEnum.TEXT;
      if (['integer', 'long', 'int4', 'int8', 'bytea', 'float8', 'numeric'].includes(type)) {
        fieldType = BIFieldTypeEnum.NUMBER;
      } else if (['date', 'timestamp'].includes(type)) {
        fieldType = BIFieldTypeEnum.DATE;
      } else {
        fieldType = BIFieldTypeEnum.TEXT;
      }
      return fieldType;
    };

    const list = ref<BIFieldMeta[]>([]);

    const getConditionField = async (modelKey) => {
      const result: ColumnInformationSchema[] =
        (await getDatabaseColumnInformation({
          id: props.databaseId,
          tbName: modelKey,
        })) || [];

      const array = result?.map((i) => {
        return {
          id: i.column + '&' + i.columnType,
          key: i.column,
          type: fieldTypeMapping(i.columnType),
          columnType: i.columnType,
          name: i.column,
          modelKey,
        };
      });

      const filterFieldKeys = props.filterFieldKeys || [
        BIFieldTypeEnum.DATE,
        BIFieldTypeEnum.NUMBER,
        BIFieldTypeEnum.TEXT,
        BIFieldTypeEnum.IMG,
      ];

      list.value = array.filter((i) => filterFieldKeys.includes(i.type));
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
        <DataRulesContainerBI
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
