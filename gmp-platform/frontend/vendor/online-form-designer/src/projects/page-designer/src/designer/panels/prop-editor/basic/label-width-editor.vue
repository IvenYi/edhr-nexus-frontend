<template>
  <div class="label-width-wrapper">
    <a-input-group compact>
      <a-select
        class="mode"
        v-model:value="propValue.labelType"
        size="small"
        @change="handleSelChange"
        style="width: 80px"
      >
        <a-select-option v-for="item in leftOptions" :key="item.value" :value="item.value">
          {{ t(item.label) }}
        </a-select-option>
      </a-select>
      <a-input-number
        v-model:value="propValue.labelWidth"
        :min="0"
        :max="maxValue"
        :controls="true"
        :precision="0"
        size="small"
        :addonAfter="propValue.labelType == 'percent' ? '%' : 'px'"
        @change="(val) => handleChange(val)"
      />
    </a-input-group>
  </div>
</template>

<script setup name="label-width-editor" lang="ts">
  import { reactive, computed, watch } from 'vue';
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const leftOptions = reactive([
    { value: 'percent', label: 'sys.pageDesigner.percentage' },
    { value: 'fixed', label: 'sys.pageDesigner.fixedValue' },
  ]);

  const maxValue = computed(() => {
    return propValue.value.labelType == 'percent' ? 100 : 500;
  });

  watch(
    () => propValue.value.labelType,
    (val) => {
      if (!val) {
        propValue.value = { labelType: 'percent', labelWidth: '30' };
      }
    },
    {
      immediate: true,
    },
  );

  function handleSelChange(v) {
    propValue.value = { ...propValue.value, labelWidth: v == 'percent' ? '30' : '100' };
  }

  const handleChange = (e) => {
    propValue.value = { ...propValue.value, labelWidth: e };
  };
</script>

<style lang="scss" scoped>
  :deep(.ant-input-group-compact) {
    display: flex;
    .ant-input-number {
      flex: 1;
      .ant-input-number-input {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
    .ant-input-number-group > .ant-input-number:first-child {
      border-radius: 0;
    }
  }
</style>
