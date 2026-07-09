<template>
  <!-- 只读或禁用模式 -->
  <div v-if="readonly" class="search-input readonly">
    <span>{{ value || emptyDisplayValue }}</span>
  </div>
  <!-- 正常交互模式 -->
  <van-field
    v-else
    :class="{ 'search-input': true, 'is-disabled': disabled, 'search-inputxxx': true }"
    v-bind="formAttr"
    v-model="value"
  >
    <template #button v-if="value && !disabled">
      <div style="padding-top: 3px" @click.stop="onClear">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="16" height="16" rx="8" fill="currentColor" />
          <path
            d="M10.0763 5.07564C10.3106 4.84132 10.6897 4.84132 10.924 5.07564C11.1583 5.30997 11.1583 5.68902 10.924 5.92333L8.84774 7.99956L10.924 10.0758C11.1583 10.3101 11.1583 10.6892 10.924 10.9235C10.6897 11.1578 10.3106 11.1578 10.0763 10.9235L8.00005 8.84725L5.92382 10.9235C5.68951 11.1578 5.31046 11.1578 5.07613 10.9235C4.84181 10.6892 4.84181 10.3101 5.07613 10.0758L7.15237 7.99956L5.07613 5.92333C4.84181 5.68901 4.84181 5.30997 5.07613 5.07564C5.31045 4.84132 5.68949 4.84132 5.92382 5.07564L8.00005 7.15188L10.0763 5.07564Z"
            fill="white"
          />
        </svg>
      </div>
    </template>
  </van-field>
</template>

<script name="gct-search-input" setup lang="ts">
  import { computed, reactive } from 'vue';
  import { SearchInput } from '/@page-designer/types/pad';
  import type { FieldProps } from 'vant';
  import { toRefs } from '@vueuse/core';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const props = defineProps<{ modelValue?: string; widget: SearchInput }>();

  const emit = defineEmits(['update:modelValue', 'search']);

  const { defaultValue, placeholder, maxlength } = reactive(props.widget.props);

  const { readonly, disabled } = toRefs(props.widget.props);

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder,
      maxlength: maxlength,
      inputAlign: 'right',
      readonly: readonly.value,
      disabled: disabled.value,
    } as FieldProps;
  });

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value || undefined);
    },
  });

  value.value = defaultValue;

  const onClear = () => {
    if (readonly.value || disabled.value) {
      return;
    }
    emit('update:modelValue', undefined);
  };

  defineExpose({});
</script>

<style lang="scss" scoped>
  .search-input {
    height: var(--editor-height);
    background-color: var(--editor-bg-color);
    border-radius: var(--editor-border-radius);
    font-size: var(--editor-font-size);

    &.is-disabled {
      cursor: default;
      --editor-bg-color: #e6e9ef;
      --editor-placeholder-color: var(--gct-color-text-7);
      border: 1px solid var(--gct-color-bg-5);
    }

    :deep(.van-field__button) {
      padding-right: 12px;
      height: 21px;
      color: var(--editor-placeholder-color);
    }

    &.readonly {
      display: flex;
      align-items: center;
      padding: 0;
      background-color: transparent;
      color: var(--editor-font-color);
      cursor: default;

      span {
        width: 100%;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: clip;
      }
    }
  }

  :deep(.van-field__control) {
    height: var(--editor-height);
    padding: var(--editor-padding);
    text-align: left;
    @include utils-ellipsis;

    &::placeholder {
      font-size: var(--editor-font-size);
      color: var(--editor-placeholder-color);
    }
  }
</style>
