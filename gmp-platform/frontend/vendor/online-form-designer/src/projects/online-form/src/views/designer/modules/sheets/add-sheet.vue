<template>
  <div class="p24px">
    <a-form ref="formRef" :model="formState" name="basic" autocomplete="off" layout="vertical">
      <a-form-item
        :label="$t('sys.onlineForm.worksheetName')"
        name="title"
        :rules="[{ required: true, validator: validator }, { max: 20 }]"
      >
        <a-input v-model:value="formState.title" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { IModal, useModal } from '@gct/runtime';
  import { onMounted, ref } from 'vue';

  const props = defineProps<{
    modal: IModal;
    data: any;
    validator: any;
  }>();

  const formRef = ref();
  const formState = ref({ title: '' });

  onMounted(() => {
    formState.value.title = props.data?.title;
  });
  const onSave = async () => {
    await formRef.value.validate();
    return {
      ok: true,
      data: formState.value,
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
