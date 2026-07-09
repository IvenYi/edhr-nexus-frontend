<template>
  <van-field
    v-bind="formAttr"
    v-model="fieldValue"
    style="padding: 0; background-color: transparent"
    :class="useMore && 'is-disabled'"
    :formData="formData"
    clearable
    @click="openView"
    @clearValue="handleClear"
    :disabled="disabled"
  >
    <template #input v-if="fieldValue || isEmptyValueDisplay">
      <template v-if="fieldValue">
        {{ fieldObj.fieldLabel }}
        <span v-if="!fieldObj.value?.includes(':')" class="version ml6px">默认</span>
      </template>
      <template v-if="isEmptyValueDisplay">{{ emptyDisplayValue }}</template>
    </template>
    <template #button v-if="!showIcon">
      <van-icon
        v-if="fieldValue"
        name="clear"
        size="20"
        color="#c8c9cc"
        @click.stop="handleClear"
      />
    </template>
  </van-field>
</template>

<script setup lang="ts" name="gct-label-template-ref">
  import { ref, computed, toRefs, toRaw, nextTick, reactive, watch } from 'vue';
  import { createTreePopup, optionType, SelectType } from '../../../../__components__/treePopup';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { cacheAdapter } from '../../../../../hooks/cacheAdapter';
  import {
    getPrintDesignerInfo,
    getPrintDesignerListAllVersion,
    getPrintDesignerRdoPageBaseList,
  } from '/@/apis/gct-apaas/PrintDesignerController';
  import { getFormRelateListAllCategory } from '@mobile/apis/gct-apaas/FormRelateController';
  import { FieldProps } from 'vant';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { PrintTypeEnum, FormDesignEnum } from '/@/layouts/tree-sider-page/enum';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { intersection, isEqual } from 'lodash-es';
  import { SEARCH_SEVICE } from '/@/enums/designEnum';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const props = defineProps<{
    modelValue?: string;
    widget: LowCodeWidget.FieldSchema;
    formData: Object;
    moduleType: string;
    showIcon: boolean;
  }>();
  // 非单选算子
  const notSingleArr = [
    SEARCH_SEVICE.IN,
    SEARCH_SEVICE.NOTIN,
    SEARCH_SEVICE.CONTAINANY,
    SEARCH_SEVICE.CONTAINALL,
    SEARCH_SEVICE.VERSIONIN,
    SEARCH_SEVICE.VERSIONNOTIN,
  ];
  /**
   * 是否完全为多选算子
   *
   * @description 只有全部是多选算子时，下拉才可以算是多选
   * @author zhanghanrui
   * @date 2024-09-20 11:09:47
   * @export
   * @param {string[]} arr
   * @return {*}  {boolean}
   */
  function isMultipleOperator(arr: string[]): boolean {
    // 计算多选算子交集
    const items = intersection(arr, notSingleArr) as string[];
    // 给入算子全是多选算子，返回 true
    if (items.length > 0 && items.length === arr.length) {
      return true;
    }
    return false;
  }
  const emit = defineEmits(['update:modelValue']);
  const { formData } = toRefs(props);
  const { label, fieldName, field, placeholder, fieldType, disabled, readonly, ignoreOptions } =
    reactive(props.widget.props);
  const { ope, useMore } = toRefs(props.widget.props);
  const multiple = isMultipleOperator(ope.value);
  const options = ref<any[]>([]);
  let fieldObj = ref<any>({});
  const selectedOptions = ref<optionType[]>([]);
  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder: useMore.value
        ? $t(`sys.model.${useMore.value}`)
        : placeholder || $t('sys.pleaseSelectSth'),
      inputAlign: 'right',
      readonly,
      clickable: false,
      border: false,
    } as FieldProps;
  });

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  const _moduleType = computed(() => {
    if (fieldType === FIELD_TYPE.E_DHR_TEMPLATE) {
      return FormDesignEnum.EDHR;
    }
    if (fieldType === FIELD_TYPE.LABEL_TEMPLATE_REF) {
      return PrintTypeEnum.LABEL;
    }
    // if (fieldType === FIELD_TYPE.DOCUMENT_TEMPLATE) {
    //   return PrintTypeEnum.RECEIPT;
    // }
    return FormDesignEnum.ONLINE_FORM;
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          const value = props.modelValue;
          return value ? (multiple ? value[0] : value) : undefined;
        },
        set(value: string[]) {
          emit('update:modelValue', multiple ? (value ? [value] : undefined) : value);
        },
      })
    : ref();

  const isEmptyValueDisplay = computed(() => {
    return !fieldValue.value && props.widget.props.readonly;
  });

  watch(
    () => fieldValue.value,
    async (newVal, oldVal) => {
      if (isEqual(newVal, oldVal)) return;
      if (!fieldValue.value) {
        fieldObj.value = {};
      } else {
        const fieldVal = multiple ? fieldValue.value?.[0] : fieldValue.value;
        const obj: any = (await getOptionValue(fieldVal)) || {};
        fieldObj.value = {
          ...obj,
          fieldLabel: !obj.version ? obj.name : `${obj.name} : ${obj.version}`,
        };
      }
    },
    {
      immediate: true,
    },
  );

  const { openTreePopup } = createTreePopup({
    asyncApi: cacheFunc,
    lazy: true,
    async: true,
    ids: fieldValue.value,
    options: options,
    showSearch: true,
    title: label || fieldName,
    ignoreCase: ignoreCase.value,
    showTag: (data) => data.default === 1,
    showBtnArea: (data) => {
      return data.checkedId && data.checkedData.parentId !== 'ROOT';
    },
  });

  async function cacheFunc(params) {
    return await cacheAdapter({ ...params, field: field }, getTmplList);
  }

  async function getTmplList(params) {
    const { id, categoryId, module: nodeModule } = params;
    if (nodeModule) return getLevel2Data(params);

    const res = categoryId
      ? await getPrintDesignerListAllVersion({ baseId: id, moduleType: _moduleType.value })
      : await getFormRelateListAllCategory({ moduleType: _moduleType.value });
    // let api: any;
    // if (categoryId) api = getPrintDesignerListAllVersion;
    // else api = getFormRelateListAllCategory;
    // const res = await api({
    //   moduleType: moduleType.value,
    //   categoryId: id,
    //   baseId: id,
    //   pageNo: 1,
    //   pageSize: 30,
    // });
    const data = res || [];
    const list = formatData(data, id);
    list.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value)) {
        options.value.push(e);
      }
    });
    return true;
  }

  async function getLevel2Data(params) {
    const { id, pageNo = 1 } = params;
    const res: any = await getPrintDesignerRdoPageBaseList({
      moduleType: _moduleType.value,
      categoryId: id,
      pageNo,
      pageSize: 30,
    });
    const list = formatData(res.data, id);
    list.forEach((e) => {
      if (!options.value.find((f) => f.value === e.value)) {
        options.value.push(e);
      }
    });
    return !res.totalPage || res.pageNo === res.totalPage;
  }

  function formatData(data, parentId) {
    const list: Array<any> = [];
    data?.forEach((i) => {
      const obj = {
        ...i,
        label: i.version || i.name,
        value: i.baseId ? i.baseId + ':' + i.id : i.id,
        parentId,
      };
      list.push({ ...obj });
    });
    return list;
  }

  /**
   * 获取选中的options
   */
  async function getOptionValue(v) {
    if (!v) return {};
    let data: optionType = options.value.find((i: any) => i.value === v);
    if (!data) {
      const id = props.modelValue
        ? Array.isArray(props.modelValue)
          ? props.modelValue[0].split(':')[1] || props.modelValue[0].split(':')[0]
          : props.modelValue.split(':')[1] || props.modelValue.split(':')[0]
        : '';
      const res = (await getTmplInfo(id)) || {};
      data = formatData([res], res.baseId || res.categoryId)[0]; // 接口没有返回parentId，且此数据只作为回显使用，故将自身ID作为parentId临时使用
      selectedOptions.value = [{ ...data, categoryId: '' }];
      const pData = [
        {
          value: res.categoryId,
          label: res.categoryName,
          id: res.categoryId,
          name: res.categoryName,
          parentId: 'ROOT',
          hasChild: true,
          module: _moduleType.value,
        },
      ];
      if (res.baseId) {
        // 第二层做了分页，若选择的是第三层，需手动把第二层的数据组装好塞到已选项中，回显用
        pData.push({
          value: res.baseId,
          label: res.name,
          version: '',
          id: res.baseId,
          name: res.name,
          default: 0,
          hasChild: true,
          parentId: res.categoryId,
          categoryId: res.categoryId,
        });
        selectedOptions.value.push(...pData);
      }
    } else {
      selectedOptions.value = [data];
    }
    return toRaw(data);
  }
  async function getTmplInfo(id) {
    const res = await getPrintDesignerInfo({ id, moduleType: _moduleType.value });
    return res;
  }

  async function openView() {
    if (useMore?.value || props.showIcon) return;
    if (isEmptyValueDisplay.value) return;
    await getTmplList({});
    openTreePopup({
      // ids: fieldValue.value,
      title: label || fieldName,
      type: SelectType.SINGLE,
      checked: async (id) => {
        console.log(id);
      },
      saved: async (a: any, data) => {
        fieldValue.value = a;
      },
    });
  }

  const handleClear = () => {
    emit('update:modelValue', null);
    fieldValue.value = null;
  };

  defineExpose({});
</script>

<style lang="less" scoped>
  .is-disabled {
    :deep(.van-field__control) {
      opacity: 0.5;
    }
  }
  .version {
    color: var(--van-primary-color);
    background: rgb(239, 243, 250);
    border-radius: 4px;
    padding: 0 6px;
    font-size: 12px;
  }
</style>
