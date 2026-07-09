<template>
  <div class="number-range">
    <a-input-number
      v-model:value="minValue"
      :min="minLimit.lowerLimit"
      :max="minLimit.upperLimit"
      :disabled="disabled"
      :precision="precision"
      :placeholder="minPlaceholder"
      size="small"
    />
    <div class="middle">
      <slot name="middle"><span class="line"></span></slot>
    </div>
    <a-input-number
      v-model:value="maxValue"
      :min="maxLimit.lowerLimit"
      :max="maxLimit.upperLimit"
      :disabled="disabled"
      :precision="precision"
      :placeholder="maxPlaceholder"
      size="small"
    />
  </div>
</template>
<script setup lang="ts">
  import { isNil } from 'lodash-es';
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      min?: number;
      max?: number;
      precision?: number;
      disabled?: boolean;
      /** 可填写范围最小值 */
      lowerLimit?: number;
      /** 可填写范围最大值 */
      upperLimit?: number;
      minPlaceholder?: string;
      maxPlaceholder?: string;
    }>(),
    {
      precision: 0,
      disabled: false,
      lowerLimit: 0,
      upperLimit: Infinity,
      minPlaceholder: $t('sys.inputText'),
      maxPlaceholder: $t('sys.inputText'),
    },
  );

  const emit = defineEmits(['update:min', 'update:max']);

  const minValue = computed({
    get() {
      return props.min;
    },
    set(v) {
      emit('update:min', v);
    },
  });

  const maxValue = computed({
    get() {
      return props.max;
    },
    set(v) {
      emit('update:max', v);
    },
  });

  const minLimit = computed(() => {
    const lowerLimit = props.lowerLimit;
    const upperLimit = isNil(maxValue.value) ? props.upperLimit : maxValue.value;
    return {
      lowerLimit,
      upperLimit,
    };
  });

  const maxLimit = computed(() => {
    const lowerLimit = isNil(minValue.value) ? props.lowerLimit : minValue.value;
    const upperLimit = props.upperLimit;
    return {
      lowerLimit,
      upperLimit,
    };
  });
</script>

<style lang="less" scoped>
  .number-range {
    display: flex;
    align-items: center;

    .middle {
      width: 20px;
      flex-shrink: 0;
      text-align: center;
      .line {
        display: inline-block;
        border-top: 1px solid #d9d9d9;
        width: 12px;
        vertical-align: middle;
      }
    }
  }
</style>
