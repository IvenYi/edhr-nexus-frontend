<template>
  <div class="px34px py28px">
    <a-form ref="formRef" :model="formState">
      <a-form-item
        :label="$t('sys.onlineForm.remarkName')"
        :rules="[{ required: true }]"
        name="description"
      >
        <a-input
          v-model:value="formState.description"
          allowClear
          :placeholder="$t('sys.inputText')"
          maxlength="64"
          showCount
        />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { useModal } from '@gct/runtime';
  import { ref, unref } from 'vue';
  import { merge } from 'lodash-es';

  const props = defineProps<{
    data: any;
  }>();

  const formRef = ref();
  const formState = ref(
    merge(
      {
        description: '',
      },
      props.data || {},
    ),
  );

  const onSave = async () => {
    await formRef.value?.validate();
    return {
      ok: true,
      params: unref(formState),
    };
  };

  useModal(onSave);
</script>
<style lang="less" scoped></style>
