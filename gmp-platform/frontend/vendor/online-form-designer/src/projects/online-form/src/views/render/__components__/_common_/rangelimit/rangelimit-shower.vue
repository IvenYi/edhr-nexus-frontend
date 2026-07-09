<template>
  <span v-if="!!value">
    <template v-if="value.type === RangeLimitType.Range">
      {{ `${value.min} ~ ${value.max}` }}
    </template>
    <template v-if="value.type === RangeLimitType.OnlyUpperLimit">
      {{ `≥${value.max}` }}
    </template>
    <template v-if="value.type === RangeLimitType.OnlyLowerLimit"> {{ `≤${value.min}` }} </template>
    <template v-if="value.type === RangeLimitType.SameTolerance">
      {{ `${value.standard} (± ${minus(value.max!, value.standard!)})` }}
    </template>
    <template v-if="value.type === RangeLimitType.DifferentTolerance">
      {{
        `${value.standard}(+${minus(value.max!, value.standard!)}/${minus(
          value.min!,
          value.standard!,
        )})`
      }}
    </template>
  </span>
</template>

<script setup lang="ts">
  import { RangeLimitType } from '/@online-form/views/designer/enums';
  import { SaveDataObj } from './use-rangelimit';
  import { minus } from '/@/utils/number-util';

  defineProps<{
    value?: SaveDataObj;
  }>();
</script>

<style></style>
