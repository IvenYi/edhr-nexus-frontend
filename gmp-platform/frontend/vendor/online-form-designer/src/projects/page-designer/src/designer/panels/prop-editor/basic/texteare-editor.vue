<template>
  <div class="textare-box">
    <a-textarea
      v-model:value="propValue"
      :placeholder="t(propConfig.placeholder || '') || t('sys.inputText')"
      :auto-size="{ minRows: 2, maxRows: 5 }"
      :maxlength="maxlength"
      :showCount="defProps.propConfig.showCount && maxlength"
      :class="{ 'i18n-textarea': defProps.propConfig.i18n }"
      size="small"
    />
    <i18n-select-btn
      v-if="defProps.propConfig.i18n"
      :buttonExtraProps="{ type: 'link', class: 'custom-i18n-btn' }"
      :i18nValue="i18nValue"
      @on-select-i18n="handleSelectI18n"
    />
  </div>
</template>

<script setup lang="ts" name="texteare-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectBtn } from '/@/components/I18nSelect';
  import { isEmpty, omit } from 'lodash-es';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const maxlength = computed(() => getValue(defProps.propConfig.maxlength));

  const i18nValue = computed(() => {
    if (defProps.propConfig.i18n) {
      return defProps?.widget?.i18n?.[defProps.propName] ?? '';
    }
    return '';
  });

  const handleSelectI18n = (params: { i18nKey: string; i18nTitle: string }) => {
    if (isEmpty(propValue.value) && !isEmpty(params)) {
      propValue.value = params.i18nTitle;
    }

    if (defProps && defProps.widget && defProps.widget.i18n) {
      if (isEmpty(params)) {
        // eslint-disable-next-line vue/no-mutating-props
        defProps.widget.i18n = omit(defProps.widget?.i18n, defProps.propName);
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        defProps.widget.i18n = { ...defProps.widget?.i18n, [defProps.propName]: params.i18nKey };
      }
    }
  };

  function getValue(propkey) {
    if (typeof propkey === 'function') {
      return propkey(defProps.widget);
    } else {
      return propkey;
    }
  }
</script>

<style lang="less" scoped>
  .textare-box {
    position: relative;
    :deep(.i18n-textarea.ant-input-textarea) {
      &::after {
        right: 30px !important;
      }
    }
    :deep(.ant-btn.custom-i18n-btn.ant-btn-icon-only) {
      position: absolute;
      right: 6px;
      bottom: 2px;
      background: transparent !important;
      height: 20px;
      width: 20px;
    }
  }
</style>
