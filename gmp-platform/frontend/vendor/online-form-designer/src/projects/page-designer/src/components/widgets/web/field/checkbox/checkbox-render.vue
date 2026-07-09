<template>
  <FieldCheckbox
    v-model:value="value"
    :disabled="disabled"
    :readonly="readonly"
    :fieldType="fieldType"
    :tagStyle="widget.style"
    :options="optionsList.length ? optionsList : selectOptions"
    :design="false"
    @change="changeCheckbox"
    ref="checkboxRef"
    :checkboxWidth="checkboxWidth"
  />
</template>

<script setup lang="ts" name="gct-checkbox">
  import {
    toRefs,
    computed,
    reactive,
    toRaw,
    nextTick,
    inject,
    watch,
    ref,
    onMounted,
    onUnmounted,
  } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Checkbox } from '/@page-designer/types/web';
  import { FieldCheckbox } from '../../__components__/formcomponent';
  import { ICheckboxComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { calcMutiLineTags, isNotSignalLine } from '../../../hooks/useTag';

  const props = defineProps<{ modelValue?: string[]; widget: Checkbox; formData: Object }>();
  const {
    modelKey,
    fieldType,
    field,
    bindModelKey,
    disabled,
    bindFieldKey,
    customMenu,
    customMenuFilter,
  } = reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const Event = getPageEvent();
  const checkboxWidth = ref(0);

  const checkboxRef = ref();
  const preLocation = !bindFieldKey ? props.widget.preLocation! : null;
  //父表单获取模型大类型
  const modelCategory = preLocation
    ? Event.context.gctWidgets[preLocation]?.props?.modeldata?.modelCategory
    : undefined;
  getAsyncOptions({ modelKey, fieldKey: field, bindModelKey, modelCategory });
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const optionsList = ref([]);
  const tableCellHeight = inject('tableCellHeight', {});
  // 自定义枚举值
  const selectOptions = computed<any>(() => {
    if (customMenu) {
      const customOption = options.value.filter((item) => {
        return customMenuFilter.includes(item.value);
      });
      return customOption.map((i) => {
        return {
          ...i,
          type: 'checkbox',
        };
      });
    } else {
      return options.value.map((i) => {
        return {
          ...i,
          type: 'checkbox',
        };
      });
    }
  });
  const caclulateOptions = () => {
    // if (isNotSignalLine(tableCellHeight)) return;
    const el = checkboxRef.value?.$el;
    if (!el) return;
    checkboxWidth.value = el.offsetWidth - 40;

    if (selectOptions.value && selectOptions.value.length) {
      const maxTagCount = calcMutiLineTags(
        selectOptions.value,
        tableCellHeight.cellHeight,
        el.offsetWidth,
      );
      optionsList.value = selectOptions.value.slice(0, maxTagCount);
    }
  };
  watch(
    () => selectOptions.value,
    async () => {
      await nextTick();
      caclulateOptions();
    },
  );
  const value = computed({
    get() {
      return props.modelValue || [];
    },
    set(value: string[]) {
      emit('update:modelValue', value?.join(','));
    },
  });

  /**
   * 获取选中的options
   */
  function getOptionValue() {
    return options.value.filter((i) => value.value.indexOf(i.value) > -1).map((i) => toRaw(i));
  }
  async function changeCheckbox() {
    await nextTick();
    let data = getOptionValue();
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [value.value]: data.map((i) => i.label) };
    }
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    const el = checkboxRef.value?.$el;
    checkboxWidth.value = el.offsetWidth - 40;
    // if (isNotSignalLine(tableCellHeight)) return;

    if (!el) return;
    nextTick(() => {
      resizeObserver = new ResizeObserver((entries) => {
        caclulateOptions();
      });
      resizeObserver.observe(el);
    });
  });
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
  defineExpose<ICheckboxComponentExpose>({
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
