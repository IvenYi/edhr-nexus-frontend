<template>
  <div>
    <a-radio-group
      v-model:value="propValue"
      :disabled="(propConfig.disabled as Function)?.(widget)"
      size="small"
    >
      <a-radio v-for="(opt, index) in options" :value="opt.value" :key="index">
        {{t(opt.label)}}
      </a-radio>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts" name="radio-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed } from 'vue';
  import type { SelectProps } from 'ant-design-vue';

  const t = window.$t;
  const defProps = defineProps(props);
  const propConfig = defProps.propConfig as SelectProps;
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const options = computed(() => propConfig.options);
</script>

<style lang="less" scoped>
  :deep(.ant-radio-wrapper) {
    margin: 0;
  }
</style>
