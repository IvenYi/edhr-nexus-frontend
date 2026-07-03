<template>
  <a-checkbox-group v-model:value="value">
    <div v-for="(i, index) in options" :key="index">
      <a-checkbox :value="i.value">{{ $t(i.label) }}</a-checkbox>
    </div>
  </a-checkbox-group>
</template>

<script setup lang="ts" name="checkbox-list-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed, toRaw, watch, ref } from 'vue';
  import { SEARCH_SEVICE } from '@/enums/designEnum';

  const options = ref<any[]>([]);

  const defProps = defineProps(props);
  const cfg = defProps.propConfig || {};
  const { maxlength, minlength, dataChange } = cfg;

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
      return propValue.value;
    },
    set(val: string[]) {
      if (maxlength && val.length > maxlength) {
        val.shift();
      }
      if (minlength && val.length < minlength) {
        return;
      }
      propValue.value = val;
      // 处理空值条件的顺序
      if (
        defProps.propName === 'moreOptions' &&
        val[0] == SEARCH_SEVICE.ISNOTNULL &&
        val[1] == SEARCH_SEVICE.ISNULL
      ) {
        propValue.value = val.reverse();
      }

      if (dataChange) {
        dataChange(defProps.widget, val);
      }
    },
  });
</script>

<style lang="less" scoped></style>
