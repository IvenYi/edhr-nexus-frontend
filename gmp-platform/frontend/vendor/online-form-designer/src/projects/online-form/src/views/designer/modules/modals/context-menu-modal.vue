<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 16 }"
  >
    <a-form-item
      :label="label"
      name="num"
      :rules="[
        {
          required: true,
          message: t('sys.pleaseInputSth', { sth: label }),
        },
      ]"
    >
      <a-input-number v-model:value="formState.num" :min="0" :precision="2"
    /></a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, inject } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';

  const { t } = useI18n();

  const modal = inject<any>('modal');
  const formRef = ref<FormInstance>();
  const props = defineProps<{
    label: string;
    defaultValue?: number;
  }>();

  const formState = ref<{ num: number }>({
    num: props.defaultValue || 0,
  });

  modal.ok = async () => {
    try {
      // todo 当前字段已被映射
      await formRef.value?.validate();
      return {
        ok: true,
        data: [cloneDeep(formState.value)],
      };
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style></style>
