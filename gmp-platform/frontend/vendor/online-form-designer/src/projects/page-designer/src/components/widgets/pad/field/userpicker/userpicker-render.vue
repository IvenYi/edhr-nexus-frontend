<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :validate-trigger="['onChange']"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #right-icon>
      <!-- 自定义右侧图标区域 -->
      <div class="right-icons">
        <!-- 多选清除按钮 -->
        <van-icon
          v-if="multiple && validateField && fieldValue.length > 0 && !showDisabled && !readonly"
          name="clear"
          class="clear-icon"
          @click.stop="handleClear"
        />
      </div>
    </template>
    <template #input v-if="validateField">
      <tagFields
        :multiple="multiple"
        v-bind="separatorAttr"
        :valueOptions="valueOptions"
        :maxTagTextLength="readonly ? undefined : 12"
      >
        <template #prefix="{ option, label }">
          <img
            v-if="option._protoValue"
            class="user-avatar mr4px"
            :src="
              option._protoValue.avatar
                ? `${MOBILE_MINIO_PATH}${option._protoValue.avatar}`
                : defaultAvatar
            "
          />
        </template>
      </tagFields>
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
  import vantField from '../../__components__/vantField.vue';
  import { tagFields, useFiledLabels } from '/@page-designer/components/widgets/pad/__components__';
  import { UserData, CurrentTenant } from '@mobile/stores/loginHooks';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useReadyonly, useDisabled } from '../../../hooks/useReadyonly';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { get } from 'lodash-es';
  import { IMobUserpickerComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { useSelectByField } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import defaultAvatar from '@mobile/assets/ipad/default_avatar.png';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

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
    modeldata,
    readonly,
  } = reactive(props.widget.props);
  const { labelArr } = useFiledLabels(props);
  const { formData } = toRefs(props);
  const Event = getPageEvent();
  //父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory;
  const fieldConfig = {
    modelKey,
    fieldKey: field,
    modelCategory,
    fieldType,
  };
  const { openSelect, multiple, getOptionsByIds } = useSelectByField(fieldConfig, {
    title: label || fieldName,
    paged: true,
  });
  const checkeOpts = ref<RetrunList[]>([]);
  const valueOptions = computed(() => {
    if (checkeOpts.value.length) {
      return checkeOpts.value;
    }
    return Array.isArray(labelArr.value)
      ? labelArr.value.map((label, index) => {
          return {
            label,
          };
        })
      : [{ label: labelArr.value }];
  });
  onBeforeMount(async () => {
    !props.widget?.props.enableDepScope && setDefaultMain();
  });

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
      readonly: true,
      fieldType: fieldType,
      tagWidgetStyle: props.widget.style,
      options: checkeOpts.value,
      multiple: multiple,
      maxTagTextLength: 12,
    };
  });

  const deptValue = toRef(() => {
    const enableDepScope = props.widget?.props.enableDepScope;
    if (enableDepScope) {
      const departmentScope = props.widget?.props.departmentScope?.split('$')[0];
      return formData.value[departmentScope]?.length ? formData.value[departmentScope] : '';
    }
  });

  watch(deptValue, () => {
    checkeOpts.value = [];
    emit('update:modelValue', undefined);
  });

  const fieldValue = computed<any>({
    get() {
      let value = props.modelValue;
      return multiple ? value?.split(',').filter((i) => i) || [] : value;
    },
    set(value: string[]) {
      emit('update:modelValue', multiple ? value && value?.join(',') : value);
    },
  });
  watch(
    () => fieldValue.value,
    async (val) => {
      const ids = multiple ? val : val ? [val] : [];
      if (ids.length && ids.some((e) => !checkeOpts.value.find((f) => f.value === e))) {
        checkeOpts.value = await getOptionsByIds(ids);
      }
    },
    { immediate: true },
  );

  // 用于表单校验的字段
  const validateField = computed(() => {
    if (fieldValue.value) {
      return String(fieldValue.value);
    }
    return null;
  });

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
    let data = setOptionList();
    changeFormData();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data, formData.value);
    if (!enableAutofill || multiple) return;
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = data?._protoValue?.[fromField];
    });
  }

  function deselect(clearValue) {
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

  async function openView() {
    if (enableDepScope && departmentScope && !deptValue.value) {
      const departmentId = departmentScope.split('$')[1] || '';
      departmentId && Event.context.$ref(departmentId)?.setError();
      return;
    }
    const { options, values } = await openSelect({
      value: fieldValue.value,
      queryData: {
        query: {
          orgIds: deptValue.value,
        },
      },
    });

    fieldValue.value = values;
    checkeOpts.value = multiple ? options : [options];
    changeSelect(values);
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
      const keys = Object.keys(obj);
      const values = Object.values(obj);
      if (!formData.value._DICT[field]) {
        formData.value._DICT[field] = {};
      }
      Object.assign(formData.value._DICT[field], { [keys.join(',')]: values.join('，') });
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
<style scoped lang="less">
  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    vertical-align: middle;
  }
  .right-icons {
    display: flex;
    align-items: center;

    .clear-icon {
      color: rgb(200, 201, 204);
      font-size: 16px;
      cursor: pointer;
    }
  }
</style>
