<template>
  <view-container class="transform-data-model-info pt-24px">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.appDesigner.approval.buttonTitle')"
        name="title"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.title"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.appDesigner.approval.buttonTitle') })"
        />
      </a-form-item>

      <a-form-item :label="t('sys.appDesigner.approval.buttonAlias')" name="alias">
        <a-input
          v-model:value="formState.alias"
          show-count
          :maxlength="32"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.appDesigner.approval.buttonAlias') })"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.approval.buttonKey')"
        name="type"
        :rules="[{ required: true }, { validator: validateSpecialCharacters }]"
      >
        <a-input
          v-model:value="formState.type"
          show-count
          :maxlength="32"
          :disabled="formState.buttonType === 'builtin'"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.appDesigner.approval.buttonKey') })"
        />
      </a-form-item>

      <a-form-item :label="t('sys.appDesigner.approval.signType')" name="signatureType">
        <a-select
          v-model:value="formState.signatureType"
          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.appDesigner.approval.signType') })"
        >
          <a-select-option
            v-for="value in [SignatureTypeEnum.None, SignatureTypeEnum.Account]"
            :value="value"
            :key="value"
            >{{ $t(`sys.appDesigner.approval.signatureType.${value}`) }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.appDesigner.approval.enableOpinionTip')" name="signatureType">
        <OpinionSelect size="default" v-model:value="formState.opinionMode" />
      </a-form-item>
      <a-form-item :label="t('sys.appDesigner.approval.enableMemo')" name="enableMemo">
        <a-checkbox v-model:checked="formState.enableMemo" />
      </a-form-item>
      <a-form-item :label="t('sys.appDesigner.approval.executeAction')" class="add-actions">
        <BpmnEventConfig
          v-model:value="formState.events"
          noEvent
          :addLabel="t('sys.add') + t('sys.appDesigner.approval.executeAction')"
        />
      </a-form-item>
    </a-form>
  </view-container>
</template>

<script setup lang="ts" name="EditButtonInfo">
  import { ref, reactive, toRaw, watch } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { ButtonOpinionMode, SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModal, useModal } from '@gct/runtime';
  import { BpmnEventConfig } from '/@online-form/approval';
  import OpinionSelect from '/@online-form/approval/operation-permission/ui/opinion-select.vue';

  const { t } = useI18n();

  const props = defineProps<{
    context: IParams;
    params: IParams;
    modal: IModal;
  }>();

  const formRef = ref<FormInstance>();

  const formState = reactive<{
    title?: string; // 按钮名称
    alias?: string; // 按钮别名
    type?: string; // 按钮KEY
    signatureType?: string; // 签名方式
    buttonType?: string; // 按钮类型
    enable?: number; // 状态
    events?: any[];
    /** 是否开启审批意见 */
    opinionMode?: ButtonOpinionMode;
    /** 是否开启备注 */
    enableMemo?: boolean;
  }>({});

  watch(
    () => props.context,
    () => {
      Object.keys(props.context).forEach((key) => {
        formState[key] = props.context[key];
      });
      if (!formState.signatureType) {
        formState.signatureType = SignatureTypeEnum.None;
      }
    },
    {
      immediate: true,
    },
  );

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value)) {
      callback(t('sys.appDesigner.approval.validateBtnKeyErrorMsg'));
    }
    callback();
  };

  async function onSave() {
    try {
      await formRef.value?.validate();

      return {
        ok: true,
        data: { ...toRaw(formState) },
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  }

  useModal(onSave);
</script>

<style scoped lang="less">
  .tag {
    padding: 0 8px;
    border-radius: 4px;
    background: rgba(from #f7f8fa r g b / 50%);

    &.process {
      background: #cfeced;
      color: #1d969b;
    }

    &.auth {
      background: #d5e0fb;
      color: #3168ec;
    }

    &.policy {
      background: #e8e2f3;
      color: #5822b4;
    }

    &.trace {
      background: #f5e5ef;
      color: #b12f7c;
    }

    &.ident {
      background: #ffe5d6;
      color: #e96c25;
    }
  }
  .button-footer {
    border-top: 1px solid rgb(240, 240, 240);
    padding: 10px 16px;

    &-content {
      display: flex;
      justify-content: space-between;
    }
  }
  .add-actions {
    :deep(.gct-bpmn-event-config) {
      padding: 5px 1px 4px;
    }
  }
</style>
