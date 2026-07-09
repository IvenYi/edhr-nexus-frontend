<template>
  <BasicPopup
    :show="show"
    :title="opts.title"
    :extraStyle="{ width: '480px' }"
    :show-cancel-button="true"
    @cancel="onCancel"
    @confirm="onOk"
  >
    <div class="approval-modal">
      <van-form ref="formRef" layout="vertical">
        <UserSelect
          v-if="opts.showFields.includes(ApprovalField.PERSON)"
          :label="t('sys.process.selectUser')"
          :name="ApprovalField.PERSON"
          :required="opts.requiredFields.includes(ApprovalField.PERSON)"
          :rules="[
            {
              required: opts.requiredFields.includes(ApprovalField.PERSON),
              message: t('sys.chooseTextTip', { name: t('sys.pageDesigner.user') }),
            },
          ]"
          v-model:value="formState[ApprovalField.PERSON]"
          :multiple="false"
        />
        <van-field
          v-if="opts.showFields.includes(ApprovalField.MEMO)"
          :label="t('sys.notes')"
          label-align="top"
          :name="ApprovalField.MEMO"
          :required="opts.requiredFields.includes(ApprovalField.MEMO)"
          :rules="[
            {
              required: opts.requiredFields.includes(ApprovalField.MEMO),
              message: `请输入${t('sys.notes')}`,
            },
          ]"
          v-model="formState[ApprovalField.MEMO]"
          type="textarea"
          :placeholder="t('sys.inputText')"
          :rows="3"
          :maxlength="120"
          show-word-limit
        />
        <van-field
          v-if="opts.showFields.includes(ApprovalField.COMMENT)"
          :label="t('sys.appDesigner.approval.opinion')"
          label-align="top"
          :name="ApprovalField.COMMENT"
          :required="opts.requiredFields.includes(ApprovalField.COMMENT)"
          :rules="[
            {
              required: opts.requiredFields.includes(ApprovalField.COMMENT),
              message: `请输入${t('sys.appDesigner.approval.opinion')}`,
            },
          ]"
          v-model="formState[ApprovalField.COMMENT]"
          type="textarea"
          :placeholder="t('sys.inputText')"
          :rows="3"
          :maxlength="120"
          show-word-limit
        />
        <SignSwitcher
          class="mt-8px"
          v-if="opts.showFields.includes(ApprovalField.SIGNATURE)"
          :required="opts.requiredFields.includes(ApprovalField.SIGNATURE)"
          :fix-sign-mode="props.opts.signatureType !== ApprovalSignatureTypeEnum.Any"
          ref="switchRef"
          v-model:sign-mode="signMode"
        />
      </van-form>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="approval-modal">
  import { reactive, ref } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { type SignerInstance, SignMode, SignSwitcher } from '../sign';
  import type { ApprovalModalOptions, IApprovalData } from './types';
  import { pick } from 'lodash-es';
  import { ApprovalField, ApprovalSignatureTypeEnum } from './constant';
  import { showFailToast } from 'vant';
  import { UserSelect } from '../user-select';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';

  const show = ref(true);

  const { t } = i18n.global;

  const props = defineProps<{
    opts: ApprovalModalOptions;
    beforeClose: (data?: any) => boolean | undefined;
  }>();

  // 参数
  const switchRef = ref<SignerInstance>();
  const signMode = ref<SignMode | undefined>();
  if (props.opts.signatureType === ApprovalSignatureTypeEnum.Any) {
    signMode.value = SignMode.HANDWRITING;
  } else {
    signMode.value = props.opts.signatureType as any;
  }
  const formRef = ref();
  const formState = reactive<Partial<IApprovalData>>({});

  const validate = async () => {
    return formRef.value?.validate();
  };

  /** 上传签名并设置签名属性 */
  const setSignature = async () => {
    if (!props.opts.showFields.includes(ApprovalField.SIGNATURE)) {
      return;
    }
    const signInfo = await switchRef.value?.submit();
    formState[ApprovalField.SIGNATURE] = signInfo;
    console.log('保存', signInfo);
    // try {
    // } catch (error) {
    //   if (error.message) {
    //     showFailToast(error.message);
    //   }
    //   throw error;
    // }
  };

  /** 执行关闭操作 */
  const doClose = (info?: any) => {
    const isClosed = props.beforeClose(info);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    await Promise.all([validate(), setSignature()]);
    const resultData = pick(formState, props.opts.showFields);
    doClose(resultData);
  };
</script>

<style lang="less" scoped>
  .approval-modal {
    padding: 16px 16px;
    position: relative;

    :deep(.ant-form-item-label > label:after) {
      display: block;
    }

    :deep(.van-form) {
      .van-field ~ .van-field {
        margin-top: 8px;
      }
    }

    :deep(.sign-switcher) {
      width: auto;
    }
  }
</style>
