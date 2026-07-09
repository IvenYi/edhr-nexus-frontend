<template>
  <div class="px34px py28px">
    <a-form ref="formRef" :model="formState">
      <a-form-item
        :label="$t('sys.onlineForm.formRemarkName')"
        :rules="[{ required: true }]"
        name="title"
      >
        <a-input
          v-model:value="formState.title"
          allowClear
          :placeholder="$t('sys.inputText') + $t('sys.onlineForm.formRemarkName')"
          show-count
          :maxlength="64"
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
        title: '',
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
