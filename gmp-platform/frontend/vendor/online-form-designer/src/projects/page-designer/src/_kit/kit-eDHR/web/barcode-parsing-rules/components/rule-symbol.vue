<template>
  <div class="bg-[#f2f4f7] px8px py8px rounded-[4px] ks-row gap-16px">
    <div class="ks-col ks-row-middle">
      <div>{{ $t('sys.edhr.splitChar') }}：</div>
      <RuleInput v-model:value="sep" class="ks-col" default-value="*" :disabled="disabled" />
    </div>
    <div class="ks-col ks-row-middle">
      <div>{{ $t('sys.edhr.emptyChar') }}：</div>
      <RuleInput v-model:value="empty" class="ks-col" :disabled="disabled" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import RuleInput from './rule-input.vue';

  const props = defineProps<{
    separator?: string;
    nullSymbol?: string;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:separator', val: string): void;
    (e: 'update:nullSymbol', val: string): void;
  }>();

  const sep = computed({
    get() {
      return props.separator;
    },
    set(val) {
      emit('update:separator', val!);
    },
  });

  const empty = computed({
    get() {
      return props.nullSymbol;
    },
    set(val) {
      emit('update:nullSymbol', val!);
    },
  });
</script>
<style lang="less" scoped></style>
