<template>
  <NocodeField
    :class="['field-select']"
    v-model="value"
    :label="label"
    v-bind="$attrs"
    @click-input="openPopup"
    @clearValue="onClear"
    clearable
    readonly
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
    <template #input2>
      <div class="w-full flex justify-end items-center text-right">
        {{ labelValue }}
      </div>
    </template>
  </NocodeField>
</template>

<script lang="ts" setup name="field-select">
  import { computed, ref } from 'vue';
  import { isEmpty } from 'lodash-es';
  import { renderUtils } from '@gct/nocode-base';
  import NocodeField from '../nocode-field/nocode-field.vue';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';

  const props = withDefaults(
    defineProps<{
      /** 多选的时候值是用,分隔的字符串 */
      modelValue?: string;
      label?: string;
      multiple: boolean;
      options: any[];
      placeholder?: string;
      labelKey?: string;
      filterFn?: (query: string, option: any) => boolean;
      onChange: Function;
    }>(),
    {
      label: '用户',
      multiple: false,
      labelKey: 'label',
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const selectedIds = computed<any>({
    get() {
      return renderUtils.getValue(props.modelValue, props.multiple);
    },
    set(v) {
      emit('update:modelValue', renderUtils.setValue(v, props.multiple));
    },
  });

  const labelValue = computed(() => getOptionLabel(value.value));

  const popupSelectOpts = ref<any[]>([]);
  const checkeOpts = ref<any[]>([]);

  const searchVal = ref<string>();

  const onClear = () => {
    emit('update:modelValue', undefined);
    props.onChange?.(getOptionLabel);
  };

  async function getOptionsByQuery(
    params: {
      keyword?: string;
      pageNo?: number;
    } = {},
  ) {
    console.log('getOptionsByQuery', params);
    const { keyword, pageNo } = params;
    if (searchVal.value !== keyword) {
      popupSelectOpts.value = [];
    }
    searchVal.value = keyword;
    popupSelectOpts.value = props.options.filter((n) => {
      if (!keyword) {
        return true;
      }
      // 补充自定义过滤函数
      if (props.filterFn) {
        return props.filterFn(keyword, n);
      } else {
        return n.label.includes(keyword);
      }
    });

    console.log('popupSelectOpts', popupSelectOpts.value);
    return true;
  }

  /**下拉框异步请求统一入口 */
  const { openListPopup } = createListPopup({
    api: getOptionsByQuery,
    options: popupSelectOpts,
    remote: true,
    lazy: true,
    title: '请选择',
    showSearch: true,
    multiple: props.multiple,
    selectedOptions: checkeOpts,
    filterFn: props.filterFn,
  })!;

  const openPopup = () => {
    openListPopup({
      ids: selectedIds.value,
      callback({ a, checkOptions }) {
        console.log('popup close', a, checkOptions);
        selectedIds.value = a;
        checkeOpts.value = [...checkOptions];
        props.onChange?.(getOptionLabel);
      },
    });
  };

  function getOptionLabel(val) {
    if (val) {
      const res = renderUtils.getSelectOptions({
        value: val,
        multiple: props.multiple,
        options: props.options,
        key: props.labelKey,
      });

      return isEmpty(res.selectOptions) ? val : res.labelJson;
    }
  }
</script>
