<template>
  <div class="ks-row-middle">
    <a-input-number
      class="ks-col"
      v-model:value="start"
      :placeholder="$t('sys.inputText')"
      :precision="precision"
      :max="max"
      :min="min"
      size="small"
    />
    <div class="ml5px mr5px">-</div>
    <a-input-number
      class="ks-col"
      v-model:value="end"
      :placeholder="$t('sys.inputText')"
      :max="max"
      :min="min"
      :precision="precision"
      size="small"
    />
  </div>
</template>

<script setup lang="ts" name="number-rang-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { computed } from 'vue';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor<RangValue>(defProps.propName, defProps.changeCallback);
  type RangValue = { start: number; end: number };
  const start = computed({
    get() {
      return propValue.value.start;
    },
    set(val) {
      propValue.value = { ...propValue.value, start: val };
    },
  });
  const end = computed({
    get() {
      return propValue.value.end;
    },
    set(val) {
      propValue.value = { ...propValue.value, end: val };
    },
  });
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
</script>

<style scoped></style>
