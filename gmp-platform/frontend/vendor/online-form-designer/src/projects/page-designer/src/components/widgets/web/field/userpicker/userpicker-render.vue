<template>
  <FieldSelect
    v-model:value="value"
    :design="false"
    :readonly="readonly"
    :fieldType="fieldType"
    :type="widget.type"
    :tagStyle="widget.style"
    :selectExtraProps="separatorAttr"
    @change="chnageSelect"
    @deselect="deselect"
    @click="openView"
    :options="options"
    class="w100%"
    :getPopupContainer="PopupContainer"
    @dropdownVisibleChange="onDropLoad"
    :maxTagTextLength="12"
    maxTagCount="responsive"
    @search="fetchUser"
    :filter-option="false"
  />
</template>

<script setup lang="ts" name="gct-department">
  import {
    ref,
    computed,
    reactive,
    toRefs,
    toRaw,
    nextTick,
    onBeforeMount,
    watch,
    toRef,
  } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useUserStore } from '/@/store/modules/user';
  import { Userpicker } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { useModalPicker, PickType } from '/@/components/UserPick';
  import FieldSelect from '../../__components__/formcomponent/FieldSelect';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { get, debounce } from 'lodash-es';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { Form } from 'ant-design-vue';
  import { IUserpickerComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const { onFieldChange } = Form.useInjectFormItemContext();
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Userpicker;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      //getPopupContainer: (triggerNode) => document.body,
    },
  );
  const PopupContainer = getParentPopupContainer(props);
  const {
    placeholder,
    clearable,
    fieldType,
    enableAutofill,
    autofillRules,
    modelKey,
    field: fieldKey,
    selectType,
    defaultMain,
    enableDepScope,
    departmentScope,
    isFieldModel,
  } = reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const { getAsyncOptions, multiple, options } = useAsyncOptions(fieldType!);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  onBeforeMount(() => {
    !props.widget?.props.enableDepScope && setDefaultMain();
  });

  // 设置默认值
  async function setDefaultMain() {
    await getAsyncOptions({ fieldKey, modelKey });
    const userStore = useUserStore();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
    if (
      userStore.getUserInfo &&
      !props.formData.id_ &&
      props.formData[fieldKey] === undefined &&
      !isFieldModel
    ) {
      const _defaultMain = defaultMain ?? get(fieldInfo, 'defaultValue.value');
      if (_defaultMain === FieldSysVarDefaultValueEnum.CURRENT_USER) {
        emit('update:modelValue', userStore.getUserInfo.userId);
        chnageValue(userStore.getUserInfo.userId);
      }
    }
  }

  const { openPickerByUser } = useModalPicker({
    type: PickType.APP,
    fieldKey,
    modelKey,
  });
  const Event = getPageEvent();

  const { formData } = toRefs(props);
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      optionLabelProp: multiple ? undefined : 'showTitle',
      allowClear: clearable,
      // optionNoStyle: true,
      showSearch: true,
    };
    if (selectType === BindCmpStyleEnum.CMP_MODAL) {
      attr.dropdownClassName = 'hidden';
    }
    return attr;
  });

  const deptValue = toRef(() => {
    const enableDepScope = props.widget?.props.enableDepScope;
    if (enableDepScope) {
      const departmentScope = props.widget?.props.departmentScope.split('$')[0];
      return formData.value[departmentScope];
    }
  });
  watch(deptValue, (orgIds) => {
    if (orgIds) {
      getAsyncOptions({ fieldKey, modelKey, orgIds });
    } else {
      options.value = [];
    }
  });

  const value = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue;
          return multiple ? value?.split(',').filter((i) => i) || [] : value || undefined;
        },
        set(value: string[]) {
          emit('update:modelValue', multiple ? value?.join(',') : value || '');
        },
      })
    : ref();
  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    if (multiple) {
      return options.value.filter((i) => v.indexOf(i.value) > -1).map((i) => toRaw(i));
    } else {
      let data = options.value.find((i) => i.value === v);
      return toRaw(data);
    }
  }
  /**选择人员 */
  async function chnageSelect(v) {
    const data = await chnageValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  /**值变化 */
  async function chnageValue(v) {
    await nextTick();
    let data = getOptionValue(v);
    if (enableAutofill && !multiple) {
      autofillRules.forEach(({ fromField, toField }) => {
        formData.value[toField] = data?._item?.[fromField];
      });
    }
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[fieldKey] = {
        [value.value]: multiple ? data.map((i) => i.label) : data.label,
      };
    }
    onFieldChange();
    return data;
  }
  function deselect(clearValue) {
    Event.runEventByName('afterClear', props.widget.events, clearValue, formData.value);
  }

  const onDropLoad = (v) => {
    if (enableDepScope && departmentScope && !deptValue.value && v) {
      const departmentId = departmentScope.split('$')[1] || '';
      departmentId && Event.context.$ref(departmentId)?.setError();
      return;
    }
    //影响部门范围时，不自动加载
    if (v && !(multiple ? value.value?.length : value.value)) {
      getAsyncOptions({
        fieldKey,
        modelKey,
        orgIds: deptValue.value,
      });
    }
  };

  function openView() {
    if (selectType === BindCmpStyleEnum.CMP_DROPDOWN_SELECT) return;
    openPickerByUser({
      userIds: value.value,
      multiple,
      callback(a) {
        value.value = multiple ? a : a[0];
        chnageSelect(value.value);
      },
    });
  }
  const fetchUser = debounce((keyword) => {
    keyword = keyword.trim();
    getAsyncOptions({
      fieldKey,
      modelKey,
      keyword,
    });
  }, 300);
  defineExpose<IUserpickerComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less"></style>
