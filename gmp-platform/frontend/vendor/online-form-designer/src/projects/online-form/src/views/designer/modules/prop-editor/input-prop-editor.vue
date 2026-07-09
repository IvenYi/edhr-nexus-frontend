<template>
  <div>
    <a-checkbox v-model:checked="_required">
      {{ $t('sys.appDesigner.approval.opinionMode.Required') }}
    </a-checkbox>
    <a-checkbox v-model:checked="_disabled">{{ $t('sys.disable') }}</a-checkbox>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    required?: boolean;
    disabled?: boolean;
  }>();

  const emit = defineEmits(['update:required', 'update:disabled']);

  const _required = computed({
    get() {
      return props.required;
    },
    set(v) {
      emit('update:required', v);
    },
  });

  const _disabled = computed({
    get() {
      return props.disabled;
    },
    set(v) {
      emit('update:disabled', v);
    },
  });
</script>

<style></style>
