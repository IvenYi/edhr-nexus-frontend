<template>
  <div class="perm-action-node">
    <a-form-item-rest>
      <FieldCascader
        v-if="modelName && cascadeField"
        :value="data?.leftValue?.field_search_key || data?.leftValue?.key"
        :filterFieldByFunction="filterFieldByFunction"
        :fieldMetaList="fieldList"
        :modelName="modelName"
        style="flex: 1; min-width: 0; margin-right: 12px"
        @FieldClick="FieldClick"
      />
      <a-select
        v-else
        :value="leftValue"
        :options="fields"
        :disabled="readonly"
        :allowClear="isAllowClear"
        :filterOption="filterOption"
        :placeholder="t('sys.chooseText')"
        showSearch
        style="width: 212px; margin-right: 12px"
        :class="[
          'tree-action-select',
          hasPermScopeError && !leftValue ? 'is-perm-scope-error' : '',
        ]"
        @change="handleLeftChange"
      />
    </a-form-item-rest>

    <a-form-item-rest>
      <a-select
        :class="readonly ? 'tree-action-select' : ''"
        :disabled="readonly || false"
        :placeholder="t('sys.chooseText')"
        :options="permOperatorOpts"
        :value="data?.operatorValue"
        style="width: 120px; margin-right: 12px"
        @change="handleOperatorChange"
      />
    </a-form-item-rest>

    <template v-if="Array.isArray(configs) && configs.length === 0">
      <a-form-item-rest>
        <a-input
          :disabled="true"
          :placeholder="t('sys.chooseText')"
          style="flex: 1; min-width: 0"
        />
      </a-form-item-rest>
    </template>

    <template v-for="(config, index) of configs" :key="index">
      <span v-if="configs.length > 1 && index === configs.length - 1" class="mx-4px">{{
        t('sys.webRender.to')
      }}</span>
      <template v-if="config.isHide">
        <div style="flex: 1; min-width: 0; background-color: #f5f6f7"></div>
      </template>
      <template v-else>
        <a-form-item-rest>
          <div class="perm-action-node__flex-value">
            <component
              :is="cmps[config[data?.rightValue?.[index].valueType]?.cmp]"
              :disabled="readonly"
              style="width: 100%"
              :placeholder="t('sys.pleaseSelectSth')"
              :value="value[index]"
              bordered
              v-bind="config[data?.rightValue?.[index].valueType]?.attrs"
              :filterType="filterType"
              :class="[
                readonly ? 'tree-action-select left-border' : '',
                hasPermScopeError && leftValue && (!value[index] || !value[index]?.length)
                  ? 'is-perm-scope-error'
                  : '',
              ]"
              @change="(event) => handleInputChange(event, index)"
              @update:pageNo="handlePageNo(index)"
            />
          </div>
        </a-form-item-rest>
      </template>
    </template>

    <div class="perm-action-node__actions">
      <a-button
        v-if="!readonly && ((selectFiledKeys && selectFiledKeys.length > 1) || data.dataLen > 1)"
        type="link"
        size="small"
        class="ml-12px perm-action-delete"
        @click="handleDeleteRow"
      >
        <template #icon>
          <i class="gct-iconfont icon-icon_shanchu"></i>
        </template>
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="perm-action-node">
  import { ref, computed, watch, nextTick } from 'vue';
  import { Input, Select, DatePicker } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDataRulesTree } from '../../../hooks/useDataRulesTree';
  import { SEARCH_SEVICE } from '@/enums/designEnum';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import SelectUserDepCmp from './select-userdep-cmp.vue';
  import RequestSelectCmp from './request-select-cmp.vue';
  import RequestTreeSelectCmp from './request-tree-select-cmp.vue';
  import NdoSelectCmp from './ndo-select-cmp.vue';
  import RdoSelectCmp from './rdo-select-cmp.vue';
  import TreeSelectCmp from './tree-select-cmp.vue';
  import AddBuiltinParamSelect from '/@online-form/views/designer/modules/panel/panel-data-init-config/common/add-builtin-param/add-builtin-param-select.vue';
  import { getCmpConfig, ValueTypeEnum, ComponentTypeEnum } from '../../../constant/config';
  import dayjs from 'dayjs';
  import { isEmpty } from 'lodash-es';
  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';
  import { FieldCascader } from '/@/components/FieldCascader';

  export interface Props {
    data: any;
    /** 字段列表 | 模型列表 */
    fieldList?: FieldMetaDTO[];
    /** 已经选择的字段key */
    selectFiledKeys?: string[];
    filterType?: string;
    readonly: boolean;
    // mainModelKey?: string;
    isPageDesigner?: boolean;
    // isOnlineFormDesigner?: boolean;
    isAllowClear?: boolean;
    excludeValueType?: string[];
    excludeOperatorType?: string[];
    apiConfig?: object;
    // onlineFormFieldList?: any[];
    modelName?: string;
    /**是否级联字段模式 */
    cascadeField?: boolean;
    /**数据权限时-是否开启校验 */
    hasPermScopeError?: boolean;
  }

  const { t } = useI18n();

  const filterFieldKeys = [
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

  function filterFieldByFunction(field) {
    return (
      filterFieldKeys.includes(field.type) &&
      (field.createType === 'USER_DEFINED' || field.createType === 'BUILTIN')
    );
  }

  const cmps = {
    [ComponentTypeEnum.INPUT]: Input,
    [ComponentTypeEnum.SELECT]: Select,
    [ComponentTypeEnum.DATEPICKER]: DatePicker,
    [ComponentTypeEnum.CUSTOM]: SelectUserDepCmp,
    [ComponentTypeEnum.REQUEST_SELECT]: RequestSelectCmp,
    [ComponentTypeEnum.REQUEST_TREE_SELECT]: RequestTreeSelectCmp,
    [ComponentTypeEnum.NDO_SELECT]: NdoSelectCmp,
    [ComponentTypeEnum.RDO_SELECT]: RdoSelectCmp,
    [ComponentTypeEnum.TREE_SELECT]: TreeSelectCmp,
    [ComponentTypeEnum.SELECT_BUILTIN_PARAMS]: AddBuiltinParamSelect,
  };

  const dateFormat = {
    [FIELD_TYPE.DATE]: 'YYYY-MM-DD',
    [FIELD_TYPE.DATE_TIME]: 'YYYY-MM-DD HH:mm:ss',
    [FIELD_TYPE.TIME]: 'HH:mm:ss',
  };

  const props = defineProps<Props>();
  const { deleteRow, updateNodeItem } = useDataRulesTree(props.readonly);

  const configs = ref<any>([]);
  const varOptions = ref<any>([]);
  const fieldOptions = ref<any>([]);

  const isFilterConfig = computed(() => props.filterType === 'filterConfig');
  const isPermScope = computed(() => props.filterType === 'permissionScope');
  const treeId = computed(() => props.data.key);
  const fieldType = computed(() => props.data.leftValue?.type);

  const isDate = computed(() =>
    [FIELD_TYPE.DATE, FIELD_TYPE.DATE_TIME, FIELD_TYPE.TIME].includes(fieldType.value),
  );

  const fields = computed(() => {
    if (isPermScope.value) {
      const list = props.fieldList?.map((i) => ({
        key: i.key,
        value: i.id,
        label: i.name,
        filedInfo: {
          id: i.id,
          key: i.key,
          name: i.name,
          type: i.type,
        },
      }));
      return list;
    }

    return props.fieldList
      ?.filter(
        (field) =>
          ![FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.MASTERSLAVE].includes(field.type!),
      )
      .map((item) => {
        return {
          label: isFilterConfig.value ? `${item.modelName}.${item.name}` : item.name,
          value: item.id,
          disabled: false,
          filedInfo: {
            id: item.id,
            key: item.key,
            name: item.name,
            type: item.type,
            bindInfo: item.bindInfo,
            modelKey: item.modelKey,
            refModelType: item.refModelType,
            nodeKey: undefined,
          },
        };
      });
  });

  const fieldOpts = computed(() => {
    return fields.value?.filter(
      (i) =>
        i.filedInfo?.type === props.data?.leftValue?.type &&
        i.filedInfo?.key !== props.data?.leftValue?.key,
    );
  });

  const permOperatorOpts = computed(() => {
    return [
      {
        label: t(`sys.appDesigner.conditionVisible`),
        value: fieldType.value === 'RDO' ? 'defVersionIn' : SEARCH_SEVICE.IN,
      },
      {
        label: t(`sys.appDesigner.conditionInvisible`),
        value: fieldType.value === 'RDO' ? 'defVersionNotIn' : SEARCH_SEVICE.NOTIN,
      },
    ];
  });

  const value = computed(() => {
    return (
      props.data?.rightValue?.map((item) => {
        if (isDate.value) {
          if (item.result && item.valueType === ValueTypeEnum.FIXED) {
            return dayjs(item.result).format(dateFormat[fieldType.value] || 'YYYY-MM-DD');
          }
        }
        return item.result;
      }) || []
    );
  });

  if (isPermScope.value) {
    props.data.operatorValue = fieldType.value === 'RDO' ? 'defVersionIn' : SEARCH_SEVICE.IN;
  }

  function handlePageNo(index) {
    const config = configs.value[index];
    const pageNo = config[config?.typeKeys?.[index]]?.attrs?.apiParams?.pageNo;
    if (pageNo) {
      configs.value[index][configs.value[index].typeKeys[index]].attrs.apiParams.pageNo++;
    }
  }

  /* eslint-disable */
  const getConfig = async (opts?) => {
    configs.value = getCmpConfig({
      fieldType: fieldType.value,
      operatorType: opts?.operatorType || props.data?.operatorValue,
      modelKey: props.data.leftValue?.modelKey,
      fieldKey: props.data.leftValue?.key,
      bindInfo: props.data.leftValue?.bindInfo,
      refModelType: props.data.leftValue?.refModelType,
      valueType: opts?.valueType || undefined,
      fieldOptions: props.isPageDesigner ? fieldOpts.value : fieldOptions.value,
      mainModelKey: undefined,
      isPageDesigner: props.isPageDesigner,
      isOnlineFormDesigner: false,
      varOptions: varOptions.value,
    });

    configs.value.forEach((config, index) => {
      const options = config[config?.typeKeys?.[index]]?.attrs?.options || [];
      options.length &&
        options.forEach((item) => {
          item.label = t(item.label);
        });
      config.valueTypeOptions = config.valueTypeOptions?.filter(
        (e) => !props.excludeValueType?.includes(e.value),
      );
    });
  };
  /* eslint-enable */ // 重新开启校验

  watch(
    [fieldType.value, () => props.data.leftValue, () => props.data.operatorValue],
    async () => {
      if (fieldType.value && props.data.leftValue && props.data.operatorValue) {
        const params = {};
        if (
          isDate.value &&
          props.data?.operatorValue === SEARCH_SEVICE.RANGE &&
          Array.isArray(props.data.rightValue) &&
          props.data.rightValue.length !== 0
        ) {
          const rightValueItem = props.data.rightValue[0];
          if (rightValueItem.valueType === ValueTypeEnum.FIXED) {
            Object.assign(params, {
              valueType: rightValueItem.valueType,
            });
          }
        }
        if (
          props.isPageDesigner &&
          props.data.rightValue?.[0]['valueType'] == 'FIELD' &&
          !fieldOpts.value?.length
        ) {
          setTimeout(() => getConfig(params), 200);
        } else {
          getConfig(params);
        }
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const FieldClick = (value, row) => {
    if (!value) {
      handleLeftChange(value, {});
      return;
    }
    const { key, bindInfo, id, modelKey, name, refModelType, type } = row;
    const filedInfo = {
      field_search_key: value,
      key,
      bindInfo,
      id,
      modelKey,
      name,
      refModelType,
      type,
    };
    handleLeftChange(id, { filedInfo });
  };

  const filterOption = (input: string, option: any) => {
    if (option.name) {
      return option.name.includes(input?.trim());
    }
    return option.label?.includes(input?.trim());
  };

  const leftValue = computed(() => {
    const ids = fields.value?.map((i) => i.value);
    if (!ids?.includes(props.data.leftValue?.id)) {
      return props.data.leftValue?.name;
    }
    return props.data.leftValue?.id;
  });

  const handleLeftChange = async (value, option) => {
    if (value) {
      updateNodeItem(treeId.value, 'leftValue', option.filedInfo);
      configs.value = [];
      if (isPermScope.value) {
        const permOpt = permOperatorOpts.value?.[0];
        await nextTick();
        handleOperatorChange(permOpt.value, permOpt);
      }
    } else {
      updateNodeItem(treeId.value, 'leftValue', undefined);
      configs.value = [];
    }
  };

  const handleOperatorChange = (value, _option) => {
    if (isPermScope.value && !props.data?.leftValue?.key) return;
    getConfig({ operatorType: value, valueType: undefined });
    const defaultValues = configs.value.map((item) => item.default);
    updateNodeItem(treeId.value, 'operatorValue', value, { key: 'valueType', defaultValues });
  };

  const handleInputChange = (event, index) => {
    const valueType = props.data?.rightValue?.[index].valueType;
    let value;
    if (isDate.value) {
      if (valueType === ValueTypeEnum.FIXED && !isEmpty(event)) {
        value = dayjs(event).format(dateFormat[fieldType.value]);
      } else {
        value = event;
      }
    } else {
      value = event?.target ? event.target?.value : event;
    }
    updateNodeItem(treeId.value, 'rightValue', value, { index, key: 'result' });
  };

  const handleDeleteRow = () => {
    deleteRow(treeId.value);
  };
</script>
<style scoped lang="less">
  .perm-action-node {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;

    &__actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
    }

    &__flex-value {
      flex: 1 1 0%;
      min-width: 0;

      :deep(.ant-select),
      :deep(.ant-tree-select) {
        max-width: 100%;
      }
    }

    :deep(.ant-select.tree-action-select.ant-select-disabled) {
      .ant-select-selector {
        border-color: #fff !important;
        background: #fff;
        color: rgb(0 0 0 / 85%);
        cursor: default;
      }

      &.is-unit {
        .ant-select-selector {
          color: #3168ec;
        }
      }

      &.left-border {
        border-left: 1px solid #e8ebf0 !important;
      }

      .ant-select-arrow {
        display: none;
      }
    }

    :deep(.ant-input.ant-input-disabled.tree-action-select) {
      border-left: 1px solid #e8ebf0 !important;
      border-color: #fff !important;
      background: #fff;
      color: rgb(0 0 0 / 85%);
      cursor: default;
    }

    :deep(.ant-picker.tree-action-select.ant-picker-disabled) {
      border-left: 1px solid #e8ebf0 !important;
      border-color: #fff !important;
      background: #fff;
      cursor: default;

      .ant-picker-input > input {
        border-color: #fff !important;
        background: #fff;
        color: rgb(0 0 0 / 85%);
      }
    }

    .perm-action-delete {
      width: 32px;
      height: 32px;
      padding: 6px;
      border-radius: 4px;
      color: #8b8b8b;
      &:hover {
        color: #000000;
        background: #e8eaee;
      }
    }

    .ant-btn-icon-only.ant-btn-sm > * {
      font-size: 18px;
    }

    :deep(.is-perm-scope-error.ant-select .ant-select-selector) {
      border-color: #f54547;
    }

    // .is-perm-scope-error {
    //   .ant-select-selector {
    //     border-color: #f54547;
    //   }
    //   &.ant-select-focused {
    //     .ant-select-selector {
    //       border-color: #f54547;
    //     }
    //   }
    // }

    // .is-perm-scope-error
  }

  :deep(.anticon) {
    color: #797a7d;
    font-size: 16px;
  }
</style>
