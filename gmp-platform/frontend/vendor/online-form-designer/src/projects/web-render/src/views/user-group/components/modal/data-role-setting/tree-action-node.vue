<template>
  <div class="tree-action-node">
    <a-form-item-rest>
      <a-select
        v-if="isBusinessFlow"
        style="width: 140px; margin-right: 16px"
        :placeholder="t('sys.chooseText')"
        :options="fieldList"
        :value="data?.leftValue?.nodeKey"
        class="tree-action-select"
        :disabled="readonly"
        :field-names="{ label: 'nodeName', value: 'key' }"
        @change="onNodeChange"
      />
      <FieldCascader
        :filterFieldByFunction="filterFieldByFunction"
        style="flex: 1; min-width: 0; margin-right: 16px"
        v-if="modelName && cascadeField"
        :fieldMetaList="fieldList"
        :modelName="modelName"
        @FieldClick="FieldClick"
        :value="data?.leftValue?.field_search_key || data?.leftValue?.key"
      />
      <a-select
        v-else
        style=" flex: 1;width: 200px; min-width: 0; margin-right: 16px"
        :placeholder="isEdhrBuiltPerms ? t('sys.chooseText') : t('sys.appDesigner.leftValue')"
        :options="fields"
        :value="leftValue"
        @change="handleLeftChange"
        class="tree-action-select"
        :disabled="readonly"
        :allowClear="isAllowClear"
        showSearch
        :filterOption="filterOption"
      />
    </a-form-item-rest>
    <a-form-item-rest>
      <a-select
        :class="readonly ? 'tree-action-select' : ''"
        style="flex: 1; min-width: 0; margin-right: 16px"
        :disabled="readonly || !data.leftValue"
        :placeholder="isEdhrBuiltPerms ? t('sys.chooseText') : t('sys.appDesigner.operator')"
        :options="operatorOptions"
        :value="data?.operatorValue"
        @change="handleOperatorChange"
      />
    </a-form-item-rest>
    <template v-if="Array.isArray(configs) && configs.length === 0">
      <a-form-item-rest>
        <a-input
          :disabled="true"
          :placeholder="isEdhrBuiltPerms ? t('sys.chooseText') : ''"
          style="flex: 1; min-width: 0"
        />
      </a-form-item-rest>
    </template>
    <template v-for="(config, index) of configs" :key="index">
      <span v-if="configs.length > 1 && index === configs.length - 1" class="ml-4px mr-4px">{{
        t('sys.webRender.to')
      }}</span>
      <template v-if="config.isHide">
        <div style="flex: 1; min-width: 0; background-color: #f5f6f7"></div>
      </template>
      <template v-else>
        <a-form-item-rest>
          <a-input-group compact class="tree-action-node__flex-value">
            <a-select
              :class="readonly ? 'tree-action-select is-unit' : ''"
              :disabled="readonly"
              style="width: 40px"
              :options="config.valueTypeOptions"
              :dropdown-match-select-width="false"
              option-label-prop="abbr"
              :show-arrow="false"
              :value="data?.rightValue?.[index].valueType"
              @change="(value) => handleValueTypeChange(value, index)"
              class="primary-gct"
            />
            <component
              :is="cmps[config[data?.rightValue?.[index].valueType]?.cmp]"
              :class="readonly ? 'tree-action-select left-border' : ''"
              :disabled="readonly"
              style="width: calc(100% - 40px)"
              :placeholder="t('sys.appDesigner.value')"
              :value="value[index]"
              bordered
              v-bind="config[data?.rightValue?.[index].valueType]?.attrs"
              :filterType="filterType"
              @change="(event) => handleInputChange(event, index)"
              @update:pageNo="(val) => handlePageNo(index, val)"
            />
          </a-input-group>
        </a-form-item-rest>
      </template>
    </template>

    <div class="tree-action-node__actions">
      <a-button
        v-if="!readonly && (!data.firstRow || !!isDataFilterEditor)"
        type="link"
        style="padding: 4px 0"
        size="small"
        class="ml-8px"
        @click="handleDeleteRow"
        ><template #icon> <DeleteOutlined class="text-16px" /> </template
      ></a-button>

      <a-button
        v-if="!readonly"
        type="link"
        size="small"
        style="padding: 4px 0"
        @click="handleAddRow"
      >
        <template #icon>
          <PlusOutlined />
        </template>
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="tree-action-node">
  import { ref, computed, watchEffect, watch, inject, nextTick } from 'vue';
  import { Input, Select, DatePicker } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDataRulesTree } from '../../../hooks/useDataRulesTree';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';
  import { SEARCH_SEVICE } from '@/enums/designEnum';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import SelectUserDepCmp from './select-userdep-cmp.vue';
  import RequestSelectCmp from './request-select-cmp.vue';
  import RequestTreeSelectCmp from './request-tree-select-cmp.vue';
  import NdoSelectCmp from './ndo-select-cmp.vue';
  import RdoSelectCmp from './rdo-select-cmp.vue';
  import TreeSelectCmp from './tree-select-cmp.vue';
  import SelectModalCmp from './select-modal-cmp.vue';
  import AddBuiltinParamSelect from '/@online-form/views/designer/modules/panel/panel-data-init-config/common/add-builtin-param/add-builtin-param-select.vue';
  import { getCmpConfig, ValueTypeEnum, ComponentTypeEnum } from '../../../constant/config';
  import dayjs from 'dayjs';
  import { cloneDeep, isEmpty } from 'lodash-es';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { getAppGlobalSettingsList } from '/@/apis/gct-apaas/AppGlobalSettingsController';
  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';
  import { platform } from '/@page-designer/hooks/usePage';
  import { FieldCascader } from '/@/components/FieldCascader';

  export interface Props {
    data: any;
    /** 字段列表 | 模型列表 */
    fieldList?: FieldMetaDTO[];
    /** 已经选择的字段key */
    selectFiledKeys?: string[];
    filterType?: string;
    readonly: boolean;
    mainModelKey?: string;
    isPageDesigner?: boolean;
    isOnlineFormDesigner?: boolean;
    isAllowClear?: boolean;
    excludeValueType?: string[];
    excludeOperatorType?: string[];
    apiConfig?: object;
    onlineFormFieldList?: any[];
    modelName?: string;
    /**是否级联字段模式 */
    cascadeField?: boolean;
  }
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
  const isDataFilterEditor = inject('isDataFilterEditor') as boolean;

  const { t } = useI18n();

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
    [ComponentTypeEnum.MODAL_SELECT]: SelectModalCmp,
  };

  const dateFormat = {
    [FIELD_TYPE.DATE]: 'YYYY-MM-DD',
    [FIELD_TYPE.DATE_TIME]: 'YYYY-MM-DD HH:mm:ss',
    [FIELD_TYPE.TIME]: 'HH:mm:ss',
  };

  const props = defineProps<Props>();

  const { addNewRow, deleteRow, updateNodeItem } = useDataRulesTree(props.readonly);

  // const operatorOptions = ref<any>([]);

  const configs = ref<any>([]);

  const varOptions = ref<any>([]);

  const fieldOptions = ref<any>([]);

  const isFilterConfig = computed(() => props.filterType === 'filterConfig');

  const isBusinessFlow = computed(() => {
    return props.filterType === 'businessFlow';
  });

  const isEdhrBuiltPerms = computed(() => props.filterType === 'edhrBuiltPerms');

  // const isPermScope = computed(() => props.filterType === 'permissionScope');

  const treeId = computed(() => props.data.key);

  const fieldType = computed(() => props.data.leftValue?.type);

  const isDate = computed(() =>
    [FIELD_TYPE.DATE, FIELD_TYPE.DATE_TIME, FIELD_TYPE.TIME].includes(fieldType.value),
  );

  console.log('props----------', props);

  const fields = computed(() => {
    if (isEdhrBuiltPerms.value) {
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

    let data;
    if (isBusinessFlow.value) {
      if (!props.data?.leftValue?.nodeKey) {
        props.data.leftValue.nodeKey = props.fieldList?.find((e) => e.defaultValue)?.key;
      }
      const mainModel: any = props.fieldList?.find((e: any) => e.fixed);
      data = (mainModel?.children || [])
        .filter((item) => Object.keys(SEARCH_TYPE).includes(item.type))
        .map((e) => {
          return {
            ...e,
            id: `${mainModel.id}.${e.id}`,
          };
        });
      if (props.data.leftValue.nodeKey !== mainModel.key) {
        const obj: any = props.fieldList?.find((e) => e.key === props.data?.leftValue?.nodeKey);
        const objChildren = (obj?.children || [])
          .filter((item) => Object.keys(SEARCH_TYPE).includes(item.type))
          .map((e) => {
            return {
              ...e,
              id: `${obj.id}.${e.id}`,
            };
          });
        data = objChildren.concat(data);
      }
    }
    return (isBusinessFlow.value ? data : props.fieldList)
      ?.filter(
        (field) =>
          ![FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.MASTERSLAVE].includes(field.type),
      )
      .map((item) => {
        return {
          label:
            isFilterConfig.value || isBusinessFlow.value
              ? `${item.modelName}.${item.name}`
              : item.name,
          value: item.id,
          // disabled: props.selectFiledKeys?.includes(item.id ?? ''),
          disabled: false,
          filedInfo: {
            id: item.id,
            key: isBusinessFlow.value ? item.id : item.key,
            name: item.name,
            type: item.type,
            bindInfo: item.bindInfo,
            modelKey: item.modelKey,
            refModelType: item.refModelType,
            nodeKey: isBusinessFlow.value ? props.data?.leftValue?.nodeKey : undefined,
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

  const operatorOptions = computed(() => {
    if (isEdhrBuiltPerms.value) {
      return [
        {
          label: t(`sys.appDesigner.conditionVisible`),
          value: SEARCH_SEVICE.IN,
        },
        {
          label: t(`sys.appDesigner.conditionInvisible`),
          value: SEARCH_SEVICE.NOTIN,
        },
      ];
    }

    if (!fieldType.value) {
      return [];
    }
    const typeMap = SEARCH_TYPE[fieldType.value];
    /**
     * 处理首次选择关联型字段时，操作符为禁用状态的问题
     */
    const filterArr = typeMap?.['filter'] || [];
    const list = filterArr
      ?.concat(...(typeMap?.contain?.map((i) => SEARCH_TYPE[i]?.filter || []) || []))
      ?.map((item) => {
        return { label: t(`sys.model.${item}`), value: item };
      });
    return list?.filter((e) => !props.excludeOperatorType?.includes(e.value));
  });

  const value = computed(() => {
    return (
      props.data?.rightValue?.map((item) => {
        if (isDate.value) {
          if (item.result && item.valueType === ValueTypeEnum.FIXED) {
            return dayjs(item.result, dateFormat[fieldType.value]);
          }
        }
        return item.result;
      }) || []
    );
  });

  watch(
    () => props.mainModelKey,
    async (val) => {
      if (val) {
        await getFieldOpts(val);
        getConfig({ operatorType: props.data?.operatorValue, valueType: undefined });
      } else {
        fieldOptions.value = [];
      }
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.data?.leftValue?.modelKey,
    (val) => {
      if (isBusinessFlow.value && !val) {
        if (!props.data.leftValue) props.data.leftValue = {};
        props.data.leftValue['nodeKey'] = props.fieldList?.find((e) => e.default)?.key;
      }
    },
    {
      immediate: true,
    },
  );

  async function queryGVar(fullInfo: boolean = true) {
    const data =
      (await getAppGlobalSettingsList(
        { type: 'var', fullInfo, source: platform.value },
        props.apiConfig,
      )) || [];
    varOptions.value =
      data?.map((v) => {
        return {
          value: v.id!,
          label: v.key!,
          varInfo: v.configJson ? JSON.parse(v.configJson) : null,
        };
      }) || [];
  }

  async function getFieldOpts(mainModelKey) {
    const modelKeys = [mainModelKey];
    if (isBusinessFlow.value && props.data?.leftValue?.modelKey) {
      modelKeys.push(props.data.leftValue.modelKey);
    }
    const fnList = modelKeys.map((e) => getModelFields(e));
    const data = await Promise.all(fnList);
    fieldOptions.value = data.flat();
    // const res = (await getModelMetaDetail({ modelKey: mainModelKey })) || {};
    // fieldOptions.value = res.fieldMetaList?.map((i) => {
    //   return {
    //     label: `${res.name}.${i.name}`,
    //     value: i.key,
    //   };
    // });
  }

  async function getModelFields(mainModelKey) {
    const res = (await getModelMetaDetail({ modelKey: mainModelKey }, props.apiConfig)) || {};
    return (
      res.fieldMetaList?.map((i) => {
        return {
          // label: `${res.name}.${i.name}`,
          label: i.name,
          value: i.key,
        };
      }) || []
    );
  }

  function handlePageNo(index, val?: number) {
    const config = configs.value[index];
    const pageNo = config[config?.typeKeys?.[index]]?.attrs?.apiParams?.pageNo;
    if (val) {
      configs.value[index][configs.value[index].typeKeys[index]].attrs.apiParams.pageNo = val;
      return;
    }
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
      fieldOptions: props.isOnlineFormDesigner
        ? props.onlineFormFieldList
        : props.isPageDesigner || isBusinessFlow.value
        ? fieldOpts.value
        : fieldOptions.value,
      mainModelKey: props.mainModelKey,
      isPageDesigner: props.isPageDesigner || isBusinessFlow.value,
      isOnlineFormDesigner: props.isOnlineFormDesigner,
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
        if (props.isPageDesigner && !varOptions.value.length) {
          await queryGVar();
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

  const onNodeChange = (value, _option) => {
    props.data.leftValue.nodeKey = value;
  };
  const FieldClick = (value, row) => {
    console.log(value, row);
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
    } else {
      updateNodeItem(treeId.value, 'leftValue', undefined);
      configs.value = [];
    }
  };

  const handleOperatorChange = (value, _option) => {
    getConfig({ operatorType: value, valueType: undefined });
    const defaultValues = configs.value.map((item) => item.default);
    updateNodeItem(treeId.value, 'operatorValue', value, { key: 'valueType', defaultValues });
  };

  const handleValueTypeChange = (value, index) => {
    if (props.data?.operatorValue === SEARCH_SEVICE.RANGE && isDate.value && index === 0) {
      getConfig({ operatorType: props.data?.operatorValue, valueType: value });
      const defaultValues = configs.value.map((item) => item.default);

      updateNodeItem(treeId.value, 'rightValue', value, {
        index,
        key: 'valueType',
        isRest: true,
        defaultValues,
      });
    } else {
      updateNodeItem(treeId.value, 'rightValue', value, { index, key: 'valueType' });
    }
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

  const handleAddRow = () => {
    addNewRow(props.data.pid, treeId.value);
  };

  const handleDeleteRow = () => {
    deleteRow(treeId.value);
  };
</script>
<style scoped lang="less">
  .tree-action-node {
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

    &__flex-value.ant-input-group {
      display: flex;
      align-items: stretch;

      :deep(> *:first-child) {
        flex-shrink: 0;
      }

      :deep(> *:last-child) {
        flex: 1 1 0%;
        min-width: 0;
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
  }

  :deep(.anticon) {
    color: #797a7d;
    font-size: 16px;
  }
</style>
