<template>
  <div>
    <a-textarea
      class="custom-textarea"
      :placeholder="$t('sys.onlineForm.pleaseEnterSQLStatement')"
      :auto-size="{ minRows: 2, maxRows: 5 }"
      :readonly="true"
      v-model:value="currentValue"
      @click="openModal"
    />
  </div>
</template>

<script setup lang="ts" name="add-sql-input">
  import { computed } from 'vue';
  import { GctDialog } from '/@/utils/Dialog';
  import AddSqlModal from './add-sql-modal.vue';

  const props = withDefaults(
    defineProps<{
      value: string | undefined;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: string): void;
    (e: 'on-clear-field'): void;
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
    GctDialog.open(AddSqlModal, {
      value: currentValue.value,
      callback: (result) => {
        console.log('result', result);
        if (result?.value !== currentValue.value) {
          emit('on-clear-field');
        }

        currentValue.value = result?.value;
      },
    });
  };
</script>

<style scoped lang="less">
  .custom-textarea {
    border: none;
    padding: 4px;
    font-size: 12px;
    background-color: #fff;
    cursor: pointer;
  }
</style>
