<template>
  <vantField
    v-model="validateField"
    :props="widget.props"
    :style="widget.style"
    :formData="formData"
    readonly
    clearable
    :isLink="!validateField"
    @clearValue="handleClear"
    @click="openView"
  />
</template>

<script setup lang="ts" name="gct-txn-data-collection-select-field">
  import { ref, computed, reactive, nextTick, onMounted, useSlots, provide } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import { type RetrunList } from '/@page-designer/components/widgets/hooks/hooks';
  import vantField from '/@page-designer/components/widgets/pad/__components__/vantField.vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';

  const props = withDefaults(
    defineProps<{
      widget: Select;
      rowValue: {
        _DICT: object;
        _STYLE: object;
        [key: string]: string | number | undefined | object;
      };
      index: number;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );

  const Fieldslots = useSlots();
  provide('Fieldslots', Fieldslots);

  const { field, selectMode, defaultValue } = reactive(props.widget.props);
  const { value: modelValue, formRowData: formData } = useDependency(
    props.widget,
    props.rowValue,
    true,
  );

  const checkeOpts = ref<RetrunList[]>([]);

  const fieldValue = computed<any>({
    get() {
      let value = modelValue.value ?? undefined;
      if (multiple.value) {
        return Array.isArray(value) ? value : value?.split(',').filter((i) => i) || [];
      }
      return value;
    },
    set(val: Array<string>) {
      const newVal = multiple.value && Array.isArray(val) ? val && val.join(',') : val;
      modelValue.value = newVal;
    },
  });

  const validateField = computed(() => {
    const item = selectOptions.value.find((n) => n.value === fieldValue.value);
    return item?.label ?? item?.value ?? (fieldValue.value && String(fieldValue.value));
  });

  const multiple = computed(() => {
    return selectMode === 'multiple';
  });

  const selectOptions = computed(() => {
    return props.widget.props?.options;
  });

  async function openView() {
    const { openListPopup } = createListPopup({
      api: undefined,
      options: selectOptions.value.map((n) => {
        return {
          label: n.label,
          value: n.value,
          _item: n,
        };
      }),
      title: '选项',
      fieldKey: field,
      fieldType: multiple.value ? FIELD_TYPE.REF_MULTI : FIELD_TYPE.REF,
      multiple: multiple.value ? true : false,
      activeKey: fieldValue.value,
      selectedOptions: checkeOpts.value,
      showSearch: true,
    });
    openListPopup({
      ids: fieldValue.value,
      callback({ a, checkOptions }) {
        fieldValue.value = a;
        checkeOpts.value = checkOptions;
      },
    });
  }

  async function handleClear() {
    fieldValue.value = multiple.value ? [] : '';
    modelValue.value = null;
  }

  onMounted(async () => {
    await nextTick();
    if (fieldValue.value === undefined && defaultValue) {
      fieldValue.value = defaultValue;
    }
  });
</script>
