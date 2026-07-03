<template>
  <a-select
    :allow-clear="clearable === false ? false : true"
    v-model:value="value"
    :placeholder="t('sys.chooseText')"
    @dropdownVisibleChange="changeOptions"
    size="small"
    @change="changeValue"
  >
    <a-select-opt-group v-for="opt in options" :key="opt.value" :label="opt.label">
      <a-select-option
        v-for="subopt in opt.children"
        :key="subopt.value"
        :value="subopt.value"
        :rowValue="subopt"
        >{{ subopt.label }}</a-select-option
      >
    </a-select-opt-group>
  </a-select>
</template>

<script setup lang="ts" name="select-group-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, toRaw, ref } from 'vue';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { options: propOptions, clearable, eventCallback } = defProps.propConfig || {};

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const value = computed({
    get() {
      return propValue.value || undefined;
    },
    set(val) {
      propValue.value = val;
    },
  });

  interface Options {
    label: string;
    value: string | number | boolean;
    children?: Options[];
  }

  const options = ref<Options[]>([]);
  async function changeOptions() {
    if (typeof propOptions === 'function') {
      options.value = await propOptions(toRaw(defProps.widget));
    } else {
      options.value = propOptions || [];
    }
  }
  function changeValue(v, row) {
    eventCallback && eventCallback(defProps.widget, row.rowValue);
  }
  changeOptions();
</script>

<style lang="less" scoped></style>
