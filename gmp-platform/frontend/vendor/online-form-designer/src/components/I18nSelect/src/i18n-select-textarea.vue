<template>
  <div class="inline-block w100% relative">
    <a-textarea
      ref="inputRef"
      v-model:value="inputValue"
      :placeholder="placeholderText"
      v-bind="inputExtraProps"
      @focus="handleFocus"
      :style="{
        resize: 'none',
        ...style,
      }"
    />
    <i18n-select-btn
      :i18nValue="i18nValue"
      :simpleBtn="true"
      type="text"
      @on-select-i18n="handleSelectI18n"
      @closed="emit('clickOutside')"
    />
  </div>
</template>
<script setup lang="ts" name="i18n-select-input">
  import { computed, ref } from 'vue';
  import type { InputProps } from 'ant-design-vue';
  import I18nSelectBtn from './i18n-select-btn.vue';
  import { isEmpty, omit } from 'lodash-es';

  interface Props {
    attr: string;
    inputExtraProps?: InputProps;
    i18nConfig?: string | Record<string, string>;
    i18nText?: string;
    placeholderText?: string;
    rows?: number;
    style?: object;
  }

  const props = defineProps<Props>();

  const emit = defineEmits([
    'update:i18nText',
    'update:i18nConfig',
    'on-i18n-select',
    'clickOutside',
    'focus',
  ]);

  const inputValue = computed<string>({
    get() {
      return props.i18nText ?? '';
    },
    set(value: string) {
      emit('update:i18nText', value);
      // if (isEmpty(value)) {
      //   emit('update:i18nConfig', omit(props.i18nConfig, props.attr));
      // }
    },
  });

  const i18nConfigState = computed(() => {
    if (isEmpty(props.i18nConfig)) {
      return {};
    }
    if (typeof props.i18nConfig === 'string') {
      return JSON.parse(props.i18nConfig) ?? {};
    }
    return props.i18nConfig ?? {};
  });

  const i18nValue = computed<string>(() => {
    return i18nConfigState.value?.[props.attr];
  });

  const handleSelectI18n = (params: { i18nKey: string; i18nTitle: string }) => {
    if (params) {
      if (isEmpty(inputValue.value)) {
        emit('update:i18nText', params.i18nTitle);
      }

      emit(
        'update:i18nConfig',
        JSON.stringify(
          isEmpty(params)
            ? omit(i18nConfigState.value, props.attr)
            : { ...i18nConfigState.value, [props.attr]: params.i18nKey },
        ),
      );
      emit('on-i18n-select', params);
    }
  };

  const inputRef = ref();
  const handleFocus = () => {
    emit('focus', inputRef.value);
  };
</script>
<style lang="less" scoped>
  :deep(.i18n-icon) {
    position: absolute;
    right: 16px;
    bottom: 12px;
    color: #212528;
    font-size: 16px;
    cursor: pointer;
  }

  :deep(div.ant-input-textarea.ant-input-textarea-show-count.ant-input-textarea-show-count::after) {
    right: 33px;
  }

  :deep(.ant-input) {
    border: 2px dashed #dbdbdb;
    background: transparent;
  }
</style>
