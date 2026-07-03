<template>
  <a-checkbox-group v-model:value="value">
    <div v-for="(i, index) in options" :key="index">
      <a-checkbox :value="i.value">{{ i.label }}</a-checkbox>
    </div>
  </a-checkbox-group>
</template>

<script setup lang="ts" name="checkbox-editor">
  import { props, useStyleEditor } from '/@page-designer/hooks/useStyleEditor';
  import { computed, toRaw } from 'vue';

  const defProps = defineProps(props);
  const { options: propOptions, minlength, maxlength } = defProps.editor._config || {};

  const { styleValue } = useStyleEditor(defProps.editor);
  const options = computed(() => {
    if (typeof propOptions === 'function') {
      return propOptions(toRaw(defProps.widget));
    } else {
      return propOptions || [];
    }
  });
  const value = computed({
    get() {
      return styleValue.value;
    },
    set(val: string[]) {
      if (maxlength && val.length > maxlength) {
        val.shift();
      }
      if (minlength && val.length < minlength) {
        return;
      }
      styleValue.value = val;
    },
  });
</script>

<style lang="less" scoped></style>
