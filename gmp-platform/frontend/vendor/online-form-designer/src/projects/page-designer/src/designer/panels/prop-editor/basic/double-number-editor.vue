<template>
  <div class="ks-row-middle">
    <double-input
      :class="['ks-col', { 'gct-number-input': addonAfter }]"
      v-model:double-value="propValue"
      :placeholder="$t('sys.inputText')"
      :max="max"
      :min="min"
    >
      <template v-if="addonAfter" #addonAfter>{{ addonAfter }}</template>
    </double-input>
  </div>
</template>

<script setup lang="ts" name="double-number-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { DoubleInput } from '/@/components/DoubleInput';
  import { computed, inject } from 'vue';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(
    defProps.propName,
    defProps.changeCallback,
    defProps.propConfig.supportGlobData ? globFieldInfo : {},
  );
  const { addonAfter } = defProps.propConfig || {};
  const max = computed(() => getValue(defProps.propConfig.max));
  const min = computed(() => getValue(defProps.propConfig.min));
  // console.log(max.value, min.value, precision.value);

  function getValue(propkey) {
    if (typeof propkey === 'function') {
      return propkey(defProps.widget);
    } else {
      return propkey;
    }
  }
</script>

<style scoped></style>
