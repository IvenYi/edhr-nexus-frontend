<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="popupProps"
    :title="labelInfo.popupTitle"
    :extra-style="{
      width: '480px',
    }"
    @cancel="onCancel"
  >
    <div class="flex flex-col h-full w-full form-abandon-v2-popup">
      <div class="header flex items-center">
        <gct-icon value="icon-jinggao1 mr-8px" color="#fbad14" :size="20" />
        <span :class="['title']">{{ labelInfo.headerTitle }}</span>
      </div>
      <van-form ref="formRef">
        <NocodeField
          name="作废人"
          label="作废人"
          :required="true"
          :clearable="false"
          input-align="right"
          :model-value="formData.applicant"
          :disableRules="false"
        >
          <template #input>
            <SignEditor
              :class="['sign-editor']"
              v-model:value="formData.applicant"
              :multiple="false"
              :hiddenSignMode="true"
              :signatureType="SignatureTypeEnum.SIGNATURE_DATETIME"
              :disableUserName="true"
            >
              <template #default>
                <van-button class="sign-btn">
                  <template #icon>
                    <gct-icon value="icon-dianziqianmingdd" color="#1A1D23" :size="14" />
                  </template>
                  点击签名
                </van-button>
              </template>
            </SignEditor>
          </template>
        </NocodeField>
        <NocodeField
          v-if="!singleSign"
          name="复核人"
          label="复核人"
          :required="true"
          :clearable="false"
          input-align="right"
          :model-value="formData.reviewer"
          :disableRules="false"
        >
          <template #input>
            <SignEditor
              :class="['sign-editor']"
              v-model:value="formData.reviewer"
              :multiple="false"
              :hiddenSignMode="true"
              :signatureType="SignatureTypeEnum.SIGNATURE_DATETIME"
              :disabled="!formData.applicant"
              :disableUserName="true"
            >
              <template #default>
                <van-button class="sign-btn" :disabled="!formData.applicant">
                  <template #icon>
                    <gct-icon value="icon-dianziqianmingdd" color="#1A1D23" :size="14" />
                  </template>
                  点击签名
                </van-button>
              </template>
            </SignEditor>
          </template>
        </NocodeField>
        <NocodeField
          class="mt-8px"
          name="作废原因"
          label="作废原因"
          :required="true"
          :clearable="false"
          rows="1"
          type="textarea"
          maxlength="120"
          label-align="top"
          input-align="left"
          show-word-limit
          v-model="formData.reason"
          :disableRules="false"
        />
      </van-form>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确定</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="form-abandon-v2-popup">
  import { computed, reactive, ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { NocodeField, SignEditor, SignatureTypeEnum } from '../../components';
  import GctIcon from '@mobile/components/icon/index.vue';

  const { t } = i18n.global;

  const show = ref(true);
  const formRef = ref();

  const props = withDefaults(
    defineProps<{
      docName: string;
      isFormChange?: boolean;
      singleSign?: boolean;
      popupProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  const labelInfo = computed(() => {
    return {
      popupTitle: t('sys.onlineForm.AnnotationChangeType.Abandon'),
      headerTitle: t('sys.onlineForm.formAbandonConfirmTitle', { name: props.docName }),
      applicantLabel: '作废人',
      reasonLabel: t('sys.onlineForm.formAbandonReason'),
    };
  });

  const formData = reactive<{
    reason?: string;
    applicant: any;
    reviewer: any;
  }>({
    reason: undefined,
    applicant: undefined,
    reviewer: undefined,
  });

  /** 执行关闭操作 */
  const doClose = (data?: any) => {
    const isClosed = props.beforeClose(data);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    try {
      await formRef.value?.validate();
      doClose(formData);
    } catch (err) {
      console.error(err);
    }
  };
</script>

<style lang="less" scoped>
  .form-abandon-v2-popup {
    padding: 16px;
    :deep(.nocode-field) {
      padding: 16px 16px 16px 29px;
      border-radius: 8px 8px 8px 8px;
    }
    .header {
      margin-bottom: 16px;
      .title {
        font-size: 16px;
        color: #1a1d23;
        line-height: 1;
      }
    }

    .sign-btn {
      height: 40px;
      font-weight: 400;
      font-size: 15px;
      color: #1a1d23;
      border-radius: 6px 6px 6px 6px;
      border: 1px solid #e0e3eb;
    }
  }
</style>
