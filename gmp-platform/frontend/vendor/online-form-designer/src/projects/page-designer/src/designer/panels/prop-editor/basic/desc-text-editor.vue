<template>
  <div class="mb-6px" style="line-height: 14px">{{ t(defProps.propConfig.tips) }}</div>
  <a-input
    v-model:value="propValue"
    :placeholder="t('sys.inputText') + t(defProps.propConfig.placeholder)"
    :maxlength="maxlength"
    :showCount="defProps.propConfig.showCount && maxlength"
    @blur="handleInputBlur"
    size="small"
  />
</template>

<script setup lang="ts" name="desc-text-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const maxlength = computed(() => getValue(defProps.propConfig.maxlength));

  function getValue(propkey) {
    if (typeof propkey === 'function') {
      return propkey(defProps.widget);
    } else {
      return propkey;
    }
  }
</script>

<style lang="less" scoped></style>
