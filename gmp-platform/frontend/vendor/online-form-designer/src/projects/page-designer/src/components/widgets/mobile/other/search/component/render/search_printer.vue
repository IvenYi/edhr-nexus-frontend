<template>
  <van-field
    v-bind="formAttr"
    v-model="showValue"
    style="padding: 0; background-color: transparent"
    :class="useMore && 'is-disabled'"
    @click="openView"
  >
    <template #input v-if="showValue || isEmptyValueDisplay">
      <template v-if="showValue">{{ showValue }}</template>
      <template v-if="isEmptyValueDisplay">{{ emptyDisplayValue }}</template>
    </template>
    <template #button v-if="!showIcon">
      <van-icon v-if="showValue" name="clear" size="20" color="#c8c9cc" @click.stop="onClear" />
    </template>
  </van-field>
</template>

<script setup lang="ts">
  import { computed, reactive, toRefs, ref, onBeforeMount, toRaw, nextTick } from 'vue';
  import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchPrinter } from '/@page-designer/types/web';
  import { type FieldProps } from 'vant';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { createTreePopup } from '../../../../__components__/treePopup';
  import { useReadyonly } from '../../../../../hooks/useReadyonly';
  import { SEARCH_SEVICE } from '/@/enums/designEnum';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchPrinter;
    modelCategory: string;
    formData: IData;
    showIcon: boolean;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const state = reactive(props.widget.props);
  const {
    defaultValue,
    fieldType,
    placeholder,
    bindCompStyleType,
    selectOption,
    ope,
    readonly,
    ignoreOptions,
  } = state;
  const isOrgin = ref<boolean>(true);
  const { useMore } = toRefs(state);
  const multiple = !ope.includes(SEARCH_SEVICE.EQ) && !ope.includes(SEARCH_SEVICE.GE);
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const showReadonly = computed(() => useReadyonly(props.widget.props.readonly));

  function getExistPrinter() {
    if (selectOption && selectOption.length) {
      selectOption.forEach((opt) => {
        opt.active = 0;
      });
      selectOption.forEach((opt) => {
        options.value.forEach((i) => {
          if (opt.value === i.value) {
            opt.active = 1;
          }
        });
      });
    }
  }

  onBeforeMount(async () => {
    fieldValue.value = fieldValue.value || defaultValue || '';
    await getAsyncOptions({ selectType: bindCompStyleType, id: 'printer' });
    await nextTick();
    getExistPrinter();
  });

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder: useMore?.value
        ? $t(`sys.model.${useMore?.value}`)
        : placeholder || $t('sys.pleaseSelectSth'),
      inputAlign: 'right',
      readonly,
      clickable: false,
      border: false,
    } as FieldProps;
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue;
          return value ? (multiple ? (Array.isArray(value) ? value : [value]) : value) : undefined;
        },
        set(value: string | string[]) {
          emit('update:modelValue', value);
        },
      })
    : ref();

  const showValue = computed(() => {
    const optionList = options.value;
    const key = 'value';
    const info = optionList.length
      ? optionList
          .filter((i: any) => {
            return multiple
              ? (fieldValue.value || []).find((e) => e === i[key])
              : fieldValue.value === i[key];
          })
          .map((i) => toRaw(i))
      : [];
    if (info && info.length) {
      return info
        .map((item) => `${item.dftPrintInfo?.label || item?.label || item?.name}`)
        .join(',');
    }
    if (props.modelValue && selectOption && selectOption.length && isOrgin.value) {
      isOrgin.value = false;
      return selectOption
        .map((item) => `${item?.label || item?.name}${item.active ? '' : '(离线)'}`)
        .join(',');
    }
    return '';
  });

  const isEmptyValueDisplay = computed(() => {
    return !showValue.value && props.widget.props.readonly;
  });

  const { openTreePopup } = createTreePopup({
    showSearch: true,
    options: options,
    ignoreCase: ignoreCase.value,
    disabledOk: (data) => {
      const { checkedData } = data;
      if (
        !checkedData ||
        (checkedData.type === PrintResourceEnum.INTERNET_PRINT &&
          (checkedData.parentId === 'ROOT' || !checkedData.parentId))
      ) {
        return true;
      }
      return false;
    },
    showTag: (data) => {
      return data.defaultPrint === '是';
    },
  });

  async function openView() {
    if (useMore?.value || props.showIcon) return;
    if (showReadonly.value) return;

    await getAsyncOptions({ selectType: bindCompStyleType, id: 'printer' });
    await options.value.map(
      (item) =>
        (item.disabled =
          item.parentId === 'ROOT' && item.type === PrintResourceEnum.INTERNET_PRINT),
    );
    await openTreePopup({
      title: props.widget.props.label || props.widget.props.fieldName,
      ids: fieldValue.value,
      type: multiple ? 'multiple' : 'single',
      saved: async (id, data) => {
        isOrgin.value = false;
        fieldValue.value = id;
        emit('update:modelValue', id);
      },
    });
  }

  const onClear = () => {
    emit('update:modelValue', undefined);
  };

  defineExpose({});
</script>
<style scoped lang="less">
  .is-disabled {
    :deep(.van-field__control) {
      opacity: 0.5;
    }
  }
  :deep(.van-cell__right-icon) {
    display: flex;
    align-items: center;
    height: auto;
    margin-left: -2px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    line-height: inherit;
  }
</style>
