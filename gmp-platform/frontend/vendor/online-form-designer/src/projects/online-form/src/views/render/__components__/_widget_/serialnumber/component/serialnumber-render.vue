<template>
  <span class="nocode-read-only-text" :style="widget.style">{{ serialNumberValue }}</span>
</template>

<script setup lang="ts" name="online-form-serialnumber-render">
  import { computed, reactive } from 'vue';
  import type { ISerialnumber } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      widget: ISerialnumber;
      formData: Object;
      /** 子表实际行数 */
      realRowIndex?: number;
      /** 子表在分页情况下，当前页面的行数 */
      pageRowIndex?: number;
    }>(),
    {
      realRowIndex: 0,
      pageRowIndex: 0,
    },
  );

  const { initialValue, autoAddValue } = reactive(props.widget.props);

  const serialNumberValue = computed(() => {
    const _initialValue = Number(initialValue);
    const _autoAddValue = Number(autoAddValue);
    if (isNaN(_initialValue) || isNaN(_autoAddValue)) {
      return '';
    }

    return _initialValue + autoAddValue * props.realRowIndex;
  });
</script>
