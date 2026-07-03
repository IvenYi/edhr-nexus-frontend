<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="validateField">
      <FieldSelect
        v-bind="separatorAttr"
        v-model:value="fieldValue"
        :maxTagTextLength="readonly ? undefined : attrObj.maxTagTextLength"
      />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-userpicker">
  import {
    ref,
    watch,
    computed,
    reactive,
    toRefs,
    toRef,
    toRaw,
    nextTick,
    defineEmits,
    onBeforeMount,
  } from 'vue';
  import {
    useAsyncOptions,
    getPageEvent,
    type RetrunList,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { Userpicker } from '/@page-designer/types/mobile';
  import { createListPopup } from '../../__components__/listPopup';
  import vantField from '../../__components__/vantField.vue';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import { UserData, CurrentTenant } from '@mobile/stores/loginHooks';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { getDesignerCommonListUserByIds } from '/@/apis/gct-apaas/DesignerCommonController';
  import { IMobUserpickerComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

  const props = defineProps<{ modelValue?: string; widget: Userpicker; formData: Object }>();
  const emit = defineEmits(['update:modelValue']);
  const {
    label,
    fieldName,
    enableAutofill,
    autofillRules,
    modelKey,
    field,
    fieldType,
    defaultMain,
    enableDepScope,
    departmentScope,
    isFieldModel,
    readonly,
  } = reactive(props.widget.props);

  const Event = getPageEvent();
  const preLocation = props.widget.preLocation;
  //父表单获取模型大类型
  const modelCategory = preLocation
    ? Event.context.gctWidgets[preLocation]?.props?.modeldata?.modelCategory
    : undefined;

  const { getAsyncOptions, multiple, options } = useAsyncOptions(fieldType!);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  const checkeOpts = ref<RetrunList[]>([]);
  const userOptions = ref<any[]>([]);

  onBeforeMount(async () => {
    !props.widget?.props.enableDepScope && setDefaultMain();
    if (multiple) {
      getmaxTagLength({ fieldKey: field, modelKey: modelKey });
    }
  });

  /**下拉框异步请求统一入口 */
  const searchVal = ref<string>();
  async function getOptionsByquery(
    params: {
      keyword?: string;
      orgIds?: Array<String>;
      pageNo?: number;
      deptValue?: string;
    } = {},
  ) {
    const { keyword, orgIds = deptValue.value, pageNo } = params;
    if (searchVal.value !== keyword) {
      userOptions.value = [];
    }
    searchVal.value = keyword;
    const { valueList = [], finished = true } = await getAsyncOptions({
      fieldKey: field,
      modelKey,
      keyword,
      orgIds,
      modelCategory,
      pageNo,
      pageSize: 30,
    });
    valueList.forEach((i: any) => {
      if (!userOptions.value.find((j) => j.value === i.value)) {
        userOptions.value.push({
          ...i,
          showTitle: `<div class="flex items-center">
          <img fit="cover" class="mr-12px rounded-17px" style="width: 34px; height: 34px" round src="${transformUrl(
            i._item?.avatar,
          )}" />
          <div>
          <div>${i.label}</div>
          <div class="text-[#8F8F8F] text-[12px] mt2px">${i._item?.masterOrgName}</div>
          </div>
          </div>`,
        });
      }
    });
    return finished;
  }

  // 设置默认值
  async function setDefaultMain() {
    if (
      UserData.value &&
      !props.formData.id_ &&
      props.formData[field] === undefined &&
      !isFieldModel
    ) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);

      const _defaultMain = defaultMain ?? get(fieldInfo, 'defaultValue.value');

      if (_defaultMain === FieldSysVarDefaultValueEnum.CURRENT_USER) {
        emit('update:modelValue', UserData.value?.userId);
      }
    }
  }

  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      readonly: readonly,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      options: checkeOpts.value,
      multiple: multiple,
    };
  });

  const { openListPopup } = createListPopup({
    api: getOptionsByquery,
    options: userOptions,
    title: label || fieldName,
    fieldKey: field,
    optionLabelProp: 'showTitle',
    // modelKey,
    fieldType,
    remote: true,
    lazy: true,
    showSearch: true,
    multiple: multiple,
    selectedOptions: checkeOpts,
    modelKey: modelKey,
  });

  // const Event = getPageEvent();
  const { formData } = toRefs(props);

  const deptValue = toRef(() => {
    const enableDepScope = props.widget?.props.enableDepScope;
    if (enableDepScope) {
      const departmentScope = props.widget?.props.departmentScope?.split('$')[0];
      return formData.value[departmentScope];
    }
  });

  watch(deptValue, () => {
    // if (orgIds) {
    //   // getAsyncOptions({ fieldKey: field, modelKey, orgIds });
    //   getOptionsByquery({ orgIds });
    // } else {
    // }
    userOptions.value = [];
    emit('update:modelValue', undefined);
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue;
          return multiple ? value?.split(',').filter((i) => i) || [] : value;
        },
        set(value: string[]) {
          emit('update:modelValue', multiple ? value && value?.join(',') : value);
        },
      })
    : ref();

  watch(
    () => fieldValue.value,
    async (val) => {
      const opts = [...userOptions.value, ...checkeOpts.value];
      const ids = multiple ? val : val ? [val] : [];
      if (ids.length && ids.some((e) => !opts.find((f) => f.value === e))) {
        await getUserDataByIds(ids);
      }
    },
    { immediate: true },
  );
  // 用于表单校验的字段
  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });
  /**
   * 获取选中的options
   */
  function getOptionValue(v = fieldValue.value) {
    if (multiple) {
      return checkeOpts.value.filter((i) => v.indexOf(i.value) > -1).map((i) => toRaw(i));
    } else {
      let data = checkeOpts.value.find((i) => i.value === v);
      return toRaw(data);
    }
  }
  /**
   * 设置返回的选中options
   */
  function setOptionList() {
    if (multiple) {
      return checkeOpts.value.map((i) => toRaw(i));
    } else {
      return toRaw(checkeOpts.value[0]);
    }
  }

  async function changeSelect(v: any) {
    if (!v || !v.length) {
      deselect(fieldValue.value);
    }
    await nextTick();
    // let data = getOptionValue(v);
    let data = setOptionList();
    changeFormData();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data, formData.value);
    if (!enableAutofill || multiple) return;
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = data?._item?.[fromField];
    });
  }

  function deselect(clearValue) {
    // let data = getOptionValue(clearValue);
    let data = setOptionList();
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
  }

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = multiple ? [] : '';
    formData.value._DICT[field] = undefined;
    await nextTick();
  }

  function openView() {
    if (enableDepScope && departmentScope && !deptValue.value) {
      const departmentId = departmentScope.split('$')[1] || '';
      departmentId && Event.context.$ref(departmentId)?.setError();
      return;
    }
    openListPopup({
      ids: fieldValue.value,
      callback({ a, checkOptions }) {
        fieldValue.value = a;
        checkeOpts.value = [...checkOptions];
        changeSelect(a);
      },
    });
  }

  async function getUserDataByIds(ids) {
    const res = await getDesignerCommonListUserByIds({ ids: ids.join(',') });
    const data = (res || []).map((i) => {
      return { label: i.__LABEL__!, value: i.id!, _item: i };
    });
    checkeOpts.value = data;
    return data;
  }

  async function changeFormData() {
    await nextTick();
    !!formData.value._DICT || (formData.value._DICT = {});
    if (checkeOpts.value.length) {
      /**填充翻译后的值 */
      const obj = {};
      checkeOpts.value.forEach((e) => {
        obj[e.value] = e.label;
      });
      formData.value._DICT[field] = obj;
    }
  }

  defineExpose<IMobUserpickerComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return fieldValue.value;
      }
    },
    setValue(v) {
      fieldValue.value = v;
    },
  });
</script>
<style scoped lang="less"></style>
