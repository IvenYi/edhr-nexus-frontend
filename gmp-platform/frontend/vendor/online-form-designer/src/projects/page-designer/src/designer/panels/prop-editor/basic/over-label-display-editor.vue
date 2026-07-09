<template>
  <div class="over-label-display-wrapper">
    <span class="mr-4px">{{ t('sys.pageDesigner.overWidth') }}</span>
    <a-select class="mode" v-model:value="propValue" size="small" @change="handleSelChange">
      <a-select-option v-for="item in options" :key="item.value" :value="item.value">
        {{ t(item.label) }}
      </a-select-option>
    </a-select>
    <span class="ml-4px">{{ t('sys.pageDesigner.showProp') }}</span>
  </div>
</template>

<script setup name="over-label-display-editor" lang="ts">
  import { reactive, watch } from 'vue';
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const options = reactive([
    { value: 'ellipsis', label: '...' },
    { value: 'wrap', label: 'sys.pageDesigner.wrap' },
  ]);

  watch(
    () => propValue.value,
    (val) => {
      if (!val) {
        propValue.value = 'wrap';
      }
    },
    {
      immediate: true,
    },
  );

  function handleSelChange(v) {
    propValue.value = v;
  }
</script>

<style lang="scss" scoped>
  .over-label-display-wrapper {
    display: flex;
    line-height: 26px;
    .ant-select {
      flex: 1;
    }
  }
</style>
