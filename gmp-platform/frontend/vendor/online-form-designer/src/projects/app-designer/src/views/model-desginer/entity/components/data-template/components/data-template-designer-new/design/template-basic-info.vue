<template>
  <div class="ks-row-center py24px h100%">
    <div class="ks-row-center bg-[#ffffff] w1200px py32px">
      <a-form
        ref="formRef"
        :model="tmplInfo"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
        name="basic"
        autocomplete="off"
        style="width: 540px"
        validateTrigger="onSubmit"
      >
        <a-form-item :label="t('sys.app.tmplType')" name="username">
          <a-radio-group
            v-model:value="tmplInfo.type"
            :disabled="modelDetail.type === 'QUERY' || tmplInfo.id"
          >
            <a-radio v-for="item in Object.keys(DataTemplateEnum)" :value="item" :key="item">
              {{ t(`sys.app.templateType.${item}`) }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="t('sys.nameOfSth', { sth: t('sys.appDesigner.template') })"
          name="name"
          :rules="[
            { required: true },
            { max: 100, message: t('sys.designView.title.errorMsg'), trigger: ['change', 'blur'] },
          ]"
        >
          <a-input
            v-model:value="tmplInfo.name"
            :placeholder="t('sys.inputText')"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.keyOfSth', { sth: t('sys.appDesigner.template') })"
          name="key"
          :rules="[
            { required: true },
            { max: 100, message: t('sys.designView.title.errorMsg'), trigger: ['change', 'blur'] },
            { pattern: /^[a-zA-Z0-9_]+$/, message: t('sys.permissionKeyFormat') },
          ]"
        >
          <a-input
            v-model:value="tmplInfo.key"
            style="width: 100%"
            :addon-before="keyPrefix"
            :addon-after="keySuffix"
            :disabled="tmplInfo.id"
            :placeholder="t('sys.inputText')"
          />
        </a-form-item>
        <!-- <div class="text-right">
          <a-button type="link" @click="emit('onSave')">{{ t('sys.saveText') }}</a-button>
        </div> -->
      </a-form>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DataTemplateEnum } from '../../../type';
  import { useDesigner } from '../hook/useDesigner';

  const { t } = useI18n();
  const formRef = ref();

  const { tmplInfo, keyPrefix, keySuffix, modelDetail } = useDesigner();

  const validate = async () => {
    await formRef.value?.validate();
  };

  defineExpose({ validate });
</script>
<style lang="less" scoped></style>
