<template>
  <div>
    <a-select :disabled="disabled" class="w-full" v-model:value="_value" size="small">
      <a-select-option v-for="item in FontFamilyOptions" :value="item.value" :key="item.value">
        <span
          :style="{
            fontFamily: item.value,
          }"
          >{{ item.label }}</span
        >
      </a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FontFamilyOptions, FontFamilyEnum } from '/@online-form/views/designer/enums';

  const props = defineProps<{
    value: string;
    disabled?: boolean;
  }>();

  const emit = defineEmits(['update:value']);

  const _value = computed({
    get() {
      return props.value || FontFamilyEnum.Serif;
    },
    set(value) {
      emit('update:value', value);
    },
  });
</script>

<style></style>
