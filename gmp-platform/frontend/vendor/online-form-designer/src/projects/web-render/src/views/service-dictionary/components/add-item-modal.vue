<template>
  <div class="px20px pt20px pb6px">
    <a-form ref="formRef" :model="form">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-form-item label="字典项目名称" required name="text">
            <a-input
              v-model:value="form.text"
              type="text"
              allowClear
              placeholder="请输入字典项目名称"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="字典项目编码" required name="value">
            <a-input
              v-model:value="form.value"
              type="text"
              row
              allowClear
              placeholder="请输入字典项目编码"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { IModal, useModal } from '@gct/runtime';

  const props = defineProps<{
    modal: IModal;
    data?: object;
  }>();

  const form = ref({});
  const formRef = ref();

  onMounted(() => {
    form.value = { ...props.data };
  });

  async function onSave() {
    await formRef.value.validate();
    return {
      ok: true,
      params: {
        ...form.value,
      },
    };
  }

  useModal(onSave);
</script>
<style lang="less" scoped></style>
