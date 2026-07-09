<template>
  <a-input
    v-model:value="inputVal"
    @blur="onBlur()"
    :disabled="disabled"
    @change="emit('update:value', inputVal)"
  />
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';

  const props = defineProps<{ value?: any; defaultValue?: any; disabled?: boolean }>();

  const emit = defineEmits<{ (e: 'update:value', value: any): void }>();

  const inputVal = ref(props.value);

  watch(
    () => props.value,
    (val) => {
      inputVal.value = val;
    },
  );

  const onBlur = () => {
    if (props.defaultValue && (!inputVal.value || !inputVal.value?.trim())) {
      emit('update:value', props.defaultValue);
    }
  };
</script>
<style lang="less" scoped></style>
