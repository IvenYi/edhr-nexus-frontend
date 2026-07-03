<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.preview')"
    centered
    width="640px"
    :maskClosable="false"
    :showOkBtn="false"
    :afterClose="handleClose"
  >
    <a-form
      ref="prevForm"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
    >
      <template v-for="(rule, index) in formState.placeHolders">
        <a-form-item
          :name="['placeHolders', index, 'value']"
          :rules="[{ required: true }]"
          :label="`${t('sys.model.placeholder')}(${rule.key}) `"
        >
          <a-input v-model:value="rule.value"></a-input>
        </a-form-item>
      </template>
    </a-form>
    <a-divider>
      <a-button type="primary" @click="preview">{{ t('sys.preview') }}</a-button>
    </a-divider>
    <div style="min-height: 200px;">
      <p v-for="serial in serialData">{{ serial }}</p>
    </div>
  </basic-modal>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TypeEnum } from '../../../constant/serial';
  import { postFieldMetaPreview } from '/@/apis/gct-apaas/FieldMetaController';
  import { FormInstance } from 'ant-design-vue';

  const prevForm = ref<FormInstance>();
  const { t } = useI18n();
  const formState = ref({
    placeHolders: [],
    fieldKey: '',
  });
  const ruleConfig = ref();
  const serialData = ref<any[]>([]);
  const [registerInner] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  function onDataReceive(data) {
    ruleConfig.value = data.ruleConfig;
    formState.value.placeHolders = data.ruleConfig
      .filter((rule) => {
        return rule.type === TypeEnum.PLACEHOLDER;
      })
      .map((d) => {
        return { key: d.config.modelKey, value: '' };
      });
    formState.value.fieldKey = data.fieldKey;
  }
  const handleClose = () => {
    serialData.value = [];
    formState.value = {
      placeHolders: [],
      fieldKey: '',
    };
    prevForm.value?.resetFields();
  };
  const preview = () => {
    const placeHolders = {};
    formState.value.placeHolders.forEach((holder) => {
      placeHolders[holder.key] = holder.value;
    });
    prevForm.value?.validate().then(async () => {
      serialData.value =
        (await postFieldMetaPreview({
          fieldKey: formState.value.fieldKey,
          ruleJson: JSON.stringify(ruleConfig.value),
          placeHolders,
        })) || [];
    });
  };
</script>

<style lang="less" scoped></style>
