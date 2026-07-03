<template>
  <div class="ks-row-middle">
    <div v-if="propConfig.label" class="mr8px">{{ $t(propConfig.label) }}</div>
    <a-input-number
      :class="['ks-col']"
      v-model:value="propValue"
      :placeholder="$t('sys.inputText')"
      :max="max"
      :min="min"
      :precision="precision"
      size="small"
      @blur="propValue==undefined && min != undefined && min != null && (propValue = min)"
    >
      <template v-if="addonAfter" #addonAfter>{{ addonAfter }}</template>
    </a-input-number>
    <!-- <span class="ml8px" v-if="addonAfter">{{ addonAfter }}</span> -->
  </div>
</template>

<script setup lang="ts" name="label-number-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
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
  const precision = computed(() => getValue(defProps.propConfig.precision) || 0);
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
