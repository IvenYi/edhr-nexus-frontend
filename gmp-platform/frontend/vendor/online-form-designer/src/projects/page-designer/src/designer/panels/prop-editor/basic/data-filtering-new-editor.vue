<template>
  <div class="data-filter-wrapper">
    <div class="ks-row-middle">
      <div>{{ propConfig?.label || t('sys.pageDesigner.datafiltering') }}</div>
    </div>
    <div class="data-filter-box" @click="handleFilterClick">
      <a-tooltip placement="top">
        <!-- <template #title v-if="filterValue">{{ filterValue }}</template> -->
        <div class="inpt-box">
          <a-button :type="filterValue ? 'primary' : 'default'" block>
            {{
              filterValue
                ? t('sys.pageDesigner.editFilterCondition')
                : t('sys.pageDesigner.setFilterCondition')
            }}
          </a-button>
        </div>
      </a-tooltip>
      <span class="text-[#bfbfbf] mt-8px">{{
        t('sys.pageDesigner.restrictedDataRange', { sth: t(widget?.name) })
      }}</span>
    </div>
    <field-condition-rules-modal
      @register="fieldConditionRulesRegister"
      @refresh="onRefresh"
      :cascadeField="propConfig.cascadeField && isEntityModel"
    />
  </div>
</template>

<script setup lang="ts" name="data-filtering-new-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { ref, toRefs, reactive, toRef, watch, computed, provide, nextTick } from 'vue';
  // import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useModal } from '/@/components/Modal';
  import FieldConditionRulesModal from '../../prop-editor/modals/field-condition-rules-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUUid } from '@/hooks/web/useUUid';
  import { isArray, isBoolean } from '/@/utils/is';
  import { getFieldMetaListConditionField } from '/@/apis/gct-apaas/FieldMetaController';
  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';

  interface dataRuleType {
    dataRule: string;
    dataRuleConfig: string;
    dataRuleEnabled: Boolean;
  }
  provide('isDataFilterEditor', true);

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { widget } = toRefs(defProps);
  const propConfig = reactive(defProps.propConfig);
  const fieldList = ref<FieldMetaDTO[]>([]);
  const detail = ref<dataRuleType>({
    dataRule: '',
    dataRuleConfig: '',
    dataRuleEnabled: true,
  });
  const isEntityModel = computed(() => {
    return (
      defProps.widget!.props?.modeldata?.modelCategory === EntityModelCategoryEnum.ENTITY ||
      !defProps.widget!.props?.modeldata?.modelCategory
    );
  });
  const [fieldConditionRulesRegister, { openModal: openFieldConditionRulesModal }] = useModal();

  const { getUuidGenerate } = useUUid(ref([]), ref(''), {
    needPrefix: true,
    isString: false,
    prefix: 't_',
  });

  const filterValue = computed(() => {
    if (detail.value?.dataRule) {
      const obj = JSON.parse(detail.value.dataRule);
      return obj.exp;
    } else {
      return null;
    }
  });

  const getRuleConfig = (key, ope, uuid, value, index) => {
    const className =
      index == 0 ? 'first-node ' : index == propValue.value.length - 1 ? ' last-node' : '';
    const findItem: any = fieldList.value.find((item) => item.key === key) || {};
    const { id, name, type, bindInfo, refModelType, modelKey } = findItem;
    return {
      class: className,
      firstRow: index === 0,
      key: uuid,
      level: 2,
      operatorValue: ope,
      pathStr: '|AND|content',
      pid: 'root',
      leftValue: {
        id,
        name,
        type,
        bindInfo,
        refModelType,
        modelKey,
        key,
      },
      rightValue: [
        {
          valueType: 'FIXED',
          result: value,
        },
      ],
    };
  };

  // 对老数据进行兼容
  const handleDetail = async () => {
    const result =
      (await getFieldMetaListConditionField({
        modelKey: widget.value?.props[propConfig.modelKey!],
      })) || [];
    fieldList.value = result.filter((i) =>
      [FIELD_TYPE.BOOLEAN, FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(i.type),
    );
    let query = {};
    let dataRuleConfig = [
      {
        pid: '',
        key: 'root',
        type: 'group',
        level: 1,
        operatorType: 'AND',
        pathStr: '|AND',
        class: 'ree-group',
        children: [],
      },
    ];
    propValue.value.forEach((item, index) => {
      const uuidGenerate = getUuidGenerate([]);
      const uuid = uuidGenerate.next();
      const value = isBoolean(item.value) ? `${item.value}` : item.value;
      const config = getRuleConfig(item.key, item.ope, uuid, value, index);
      dataRuleConfig[0].children?.push(config);
      query[`${item.key}.${item.ope}:${uuid}`] = value;
    });
    const expStr = propValue.value.length ? `AND(${Object.keys(query).join(',')})` : '';
    const dataRule = {
      query,
      exp: expStr,
      varKeys: [],
      typeMap: {},
    };
    return {
      dataRule: JSON.stringify(dataRule),
      dataRuleConfig: propValue.value.length ? JSON.stringify(dataRuleConfig) : '',
      dataRuleEnabled: true,
    };
  };

  watch(
    () => propValue.value,
    async () => {
      await nextTick();
      if (isArray(propValue.value)) {
        const result = propValue.value.length ? await handleDetail() : {};
        detail.value = Object.assign(detail.value, result);
      } else {
        detail.value = {
          dataRule: propValue.value?.dataRule || '',
          dataRuleConfig: propValue.value?.dataRuleConfig || '',
          dataRuleEnabled: true,
        };
      }
    },
    { immediate: true },
  );

  // const detail = computed(() => {
  //   if (isArray(propValue.value)) {
  //     return handleDetail();
  //   } else {
  //     return {
  //       dataRule: propValue.value ? propValue.value.dataRule : null,
  //       dataRuleConfig: propValue.value ? propValue.value.dataRuleConfig : null,
  //       dataRuleEnabled: true,
  //     };
  //   }
  // });

  const handleFilterClick = () => {
    openFieldConditionRulesModal(true, {
      detail: detail.value,
      modelKey: widget.value?.props[propConfig?.modelKey],
    });
  };

  const onRefresh = async (data) => {
    propValue.value = data;
    await nextTick();
    console.log(propValue.value, 'propValue.value-------');
  };
</script>

<style lang="less" scoped>
  .data-filter-box {
    .ant-input-affix-wrapper {
      pointer-events: none;
    }
  }
</style>
