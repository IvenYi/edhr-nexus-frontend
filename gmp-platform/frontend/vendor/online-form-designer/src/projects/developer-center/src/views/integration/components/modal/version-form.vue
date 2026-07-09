<template>
  <div class="p20px">
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
      <a-form-item
        :label="t('sys.appDesigner.version')"
        name="version"
        :rules="[{ required: true, message: t('sys.chooseText') + t('sys.appDesigner.version') }]"
      >
        <a-select
          v-model:value="formState.version"
          :placeholder="t('sys.chooseText')"
          :options="data"
          show-search
          allow-clear
          optionFilterProp="displayName"
          :fieldNames="{ label: 'displayName', value: 'version' }"
        />
      </a-form-item>
      <a-form-item :label="t('sys.notes')" name="mark">
        <a-textarea v-model:value="formState.mark" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '@gct/runtime';

  defineProps<{
    data: any[];
  }>();

  const { t } = useI18n();
  const formState = ref({ version: '', mark: '' });
  const formRef = ref();

  const onSave = async () => {
    await formRef.value?.validate();
  };

  useModal(async () => {
    await onSave();
    return { ok: true, form: { ...formState.value } };
  });
</script>
<style lang="less" scoped>
  .tag-status {
    padding: 3px 6px;
    border-radius: 4px;

    &.success-tag {
      color: #309c41;
      background-color: #def8e2;
    }
    &.error-tag {
      color: #f54547;
      background-color: #feecec;
    }
  }
</style>
