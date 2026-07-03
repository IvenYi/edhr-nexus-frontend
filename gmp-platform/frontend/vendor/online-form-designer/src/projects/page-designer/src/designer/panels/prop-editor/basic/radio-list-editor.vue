<template>
  <a-radio-group v-model:value="value">
    <div v-for="(i, index) in options" :key="index">
      <a-radio :value="i.value">{{ $t(i.label) }}</a-radio>
    </div>
  </a-radio-group>
</template>

<script setup lang="ts" name="radio-list-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed, toRaw, watch, ref } from 'vue';

  const options = ref<any[]>([]);
  const defProps = defineProps(props);
  const cfg = defProps.propConfig || {};

  if (defProps.propConfig) {
    watch(
      () => defProps.propConfig.options,
      () => {
        const opts = defProps.propConfig.options as any;
        if (typeof opts === 'function') {
          options.value = opts(toRaw(defProps.widget));
        } else {
          options.value = opts || [];
        }
      },
      { immediate: true },
    );
  }

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const value = computed({
    get() {
      return propValue.value[0];
    },
    set(val: string) {
      propValue.value = [val];
      if (cfg.dataChange) {
        cfg.dataChange(defProps.widget, [val]);
      }
    },
  });
</script>

<style lang="less" scoped></style>
