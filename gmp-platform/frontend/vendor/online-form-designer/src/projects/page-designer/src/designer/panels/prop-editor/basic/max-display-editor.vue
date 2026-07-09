<template>
  <div class="max-display-editor w-full">
    <div class="max-input-num flex w-full">
      <span>超出</span>
      <a-input-number
        v-model:value="propValue"
        :placeholder="t('sys.inputText')"
        :min="min"
        :max="max"
        :precision="precision"
        size="small"
        @blur="handleBlur"
      />
      <span>个后折叠显示</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="max-display-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const max = computed(() => getValue(defProps.propConfig.max));
  const min = computed(() => getValue(defProps.propConfig.min));
  const precision = computed(() => getValue(defProps.propConfig.precision) || 0);

  function getValue(propkey) {
    if (typeof propkey === 'function') {
      return propkey(defProps.widget);
    } else {
      return propkey;
    }
  }

  function handleBlur() {
    if (!propValue.value) {
      propValue.value = 1;
    }
  }
</script>

<style lang="less" scoped>
  .max-input-num {
    justify-content: space-between;
    align-items: center;
  }
  :deep(.max-input-num .ant-input-number) {
    width: 116px !important;
  }
</style>
