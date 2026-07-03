<template>
  <a-input-group compact ref="i18nInputGroup" id="i18nInputGroup">
    <slot name="i18n-input">
      <a-input
        ref="inputRef"
        :style="{
          height: btnHeight ? btnHeight : size === ButtonSize.SMALL ? '28px' : '32px',
          width: !isApp
            ? '100%'
            : `calc(100% - ${btnWidth ? btnWidth : size === ButtonSize.SMALL ? '28px' : '32px'}`,
        }"
        v-bind="inputExtraProps"
        v-model:value.trim="inputValue"
        :placeholder="placeholderText"
        :size="size"
        allowClear
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </slot>
    <i18n-select-btn
      v-if="isApp"
      :btnHeight="btnHeight"
      :btnWidth="btnWidth"
      :i18nValue="i18nValue"
      :size="size"
      :i18nModalKey="i18nModalKey"
      @on-select-i18n="handleSelectI18n"
      @closed="emit('clickOutside')"
    />
  </a-input-group>
</template>
<script setup lang="ts" name="i18n-select-input">
  import { computed, ref } from 'vue';
  import type { InputProps } from 'ant-design-vue';
  import I18nSelectBtn from './i18n-select-btn.vue';
  import { isEmpty, omit } from 'lodash-es';
  import { onClickOutside } from '@vueuse/core';
  import { ButtonSize } from '/@/projects/page-designer/src/enum';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { appInfo } = useAppInfoStore();

  const isApp = computed(() => {
    return !!appInfo.id;
  });

  interface Props {
    attr: string;
    inputExtraProps?: InputProps;
    i18nConfig?: string | Record<string, string>;
    i18nText?: string;
    placeholderText?: string;
    size?: ButtonSize;
    i18nModalKey?: string;
    forceUpdate?: boolean;
    btnHeight?: string;
    btnWidth?: string;
  }

  const props = defineProps<Props>();

  const emit = defineEmits([
    'update:i18nText',
    'update:i18nConfig',
    'on-i18n-select',
    'clickOutside',
    'focus',
    'blur',
  ]);

  const inputValue = computed<string>({
    get() {
      return props.i18nText ?? '';
    },
    set(value: string) {
      if (value !== props.i18nText) {
        emit('update:i18nText', value);
      }
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
    console.log('emit', params, props);
    if (params) {
      if (isEmpty(inputValue.value) || props.forceUpdate === true) {
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
  const handleBlur = () => {
    emit('blur', inputRef.value);
  };
  const i18nInputGroup = ref();
  onClickOutside(i18nInputGroup, () => {
    emit('clickOutside');
  });
</script>
<style lang="less" scoped>
  :deep(.ant-form-item-has-error) {
    .ant-btn {
      border-color: var(--ant-error-color) !important;
    }
  }
</style>
