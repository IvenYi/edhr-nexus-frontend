<template>
  <a-select
    class="custom-select"
    v-model:value="currentValue"
    :placeholder="$t('sys.dataSet.pleaseSelectField')"
    :bordered="false"
    :showSearch="false"
    :showArrow="false"
    :allowClear="false"
    :open="false"
    :fieldNames="{ label: 'fieldName', value: 'fieldId' }"
    :options="dataSource"
    @click.stop="openModal()"
  />
</template>

<script setup lang="ts" name="add-builtin-field-select">
  import { computed, h, ref, toRaw, watch } from 'vue';
  import { GctDialog } from '/@/utils/Dialog';
  import AddBuiltinFieldModal from './add-builtin-field-modal.vue';

  const props = withDefaults(
    defineProps<{
      value: string | undefined;
      dataSource: any;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
  }>();

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const openModal = async () => {
    GctDialog.open(AddBuiltinFieldModal, {
      fieldSelected: currentValue.value,
      dataSource: props.dataSource,
      callback: (result) => {
        const { fieldSelected } = result ?? {};

        currentValue.value = fieldSelected?.[0];
      },
    });
  };
</script>
