<template>
  <div class="basic-setting-form pt-32px">
    <!-- {{ basicSetting }} -->
    <a-form
      ref="formRef"
      :model="basicSetting"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.systemIcon')" name="icon" :rules="[{ required: true }]">
        <simple-upload v-model:file="basicSetting.icon" :size="100">
          <template #tip> {{ t('sys.imgSizeTips') }} </template>
        </simple-upload>
      </a-form-item>
      <a-form-item :label="t('sys.systemLogo')" name="logo" :rules="[{ required: true }]">
        <simple-upload v-model:file="basicSetting.logo" :size="100">
          <template #tip> {{ t('sys.imgSizeTips2') }} </template>
        </simple-upload>
      </a-form-item>
      <a-form-item :label="t('sys.systemName')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="basicSetting.name"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.systemName') })"
          show-count
          :maxlength="32"
          style="width: 50%"
        />
      </a-form-item>
      <!-- <a-form-item :label="t('sys.platform.copyright')" name="copyright">
        <a-textarea
          v-model:value="basicSetting.copyright"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.platform.copyright') })"
          style="width: 50%"
        />
      </a-form-item> -->
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import SimpleUpload from '/@/components/SimpleUpload/index.vue';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const formRef = ref<FormInstance>();
  const { basicSetting } = useBasicSetting(false);

  const validateValue = () => {
    return formRef.value?.validate();
  };

  defineExpose({ validateValue });
</script>

<style lang="less" scoped>
  .basic-setting-form {
    height: 100%;
    overflow: auto;
  }
</style>
