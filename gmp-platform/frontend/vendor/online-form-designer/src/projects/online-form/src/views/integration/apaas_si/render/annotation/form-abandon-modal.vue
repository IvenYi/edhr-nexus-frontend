<template>
  <a-modal
    :closable="false"
    :visible="visible"
    v-bind="props.options ?? {}"
    :wrapClassName="[ns.e('wrap')].join(' ')"
    destroyOnClose
    :centered="true"
    :keyboard="false"
    :okText="t('sys.ok')"
    :cancelText="t('sys.cancel')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div :class="[ns.e('header')]" v-if="!isFormChange">
      <ExclamationCircleFilled :class="[ns.e('icon')]" />
      <span :class="['title']">{{
        isDhr
          ? t('sys.edhr.edhrAbandonConfirmTitle', { name: docName })
          : t('sys.onlineForm.formAbandonConfirmTitle', { name: docName })
      }}</span>
    </div>
    <a-form ref="formRef" :model="formData" :rules="rules" :class="['content']">
      <a-form-item name="applicant" :label="$t('sys.submitBy')" required>
        <div class="abandon-signature-item">
          <div
            v-if="formData.applicant.url || formData.applicant.username"
            class="abandon-signature-img-wrapper"
          >
            <img
              :src="getPreviewUrl(formData.applicant.url, formData.applicant.username)"
              class="abandon-signature-img"
            />

            <div class="abandon-signature-meta-row">
              <div v-if="formData.applicant.time" class="abandon-signature-meta">
                {{ $t('sys.onlineForm.signatureDate') }}：{{
                  dayjs(formData.applicant.time).format('YYYY-MM-DD HH:mm')
                }}
              </div>
              <a-button
                type="link"
                danger
                class="abandon-signature-delete-btn"
                @click="clearSignature('applicant')"
              >
                {{ $t('sys.onlineForm.deleteSignature') }}
              </a-button>
            </div>
          </div>
          <a-button v-else @click="openSignature('applicant')">
            {{ $t('sys.onlineForm.clickToSign') }}
          </a-button>
        </div>
      </a-form-item>

      <a-form-item
        v-if="!singleSign"
        name="reviewer"
        :label="$t('sys.onlineForm.reviewer2')"
        required
      >
        <div class="abandon-signature-item">
          <div
            v-if="formData.reviewer.url || formData.reviewer.username"
            class="abandon-signature-img-wrapper"
          >
            <img
              :src="getPreviewUrl(formData.reviewer.url, formData.reviewer.username)"
              class="abandon-signature-img"
            />

            <div class="abandon-signature-meta-row">
              <div v-if="formData.reviewer.time" class="abandon-signature-meta">
                {{ $t('sys.onlineForm.signatureDate') }}：{{
                  dayjs(formData.reviewer.time).format('YYYY-MM-DD HH:mm')
                }}
              </div>
              <a-button
                type="link"
                danger
                class="abandon-signature-delete-btn"
                @click="clearSignature('reviewer')"
              >
                {{ $t('sys.onlineForm.deleteSignature') }}
              </a-button>
            </div>
          </div>
          <a-button
            v-else
            @click="openSignature('reviewer')"
            :disabled="!(formData.applicant.url || formData.applicant.username)"
            >{{ $t('sys.onlineForm.clickToSign') }}</a-button
          >
        </div>
      </a-form-item>

      <a-form-item
        v-if="!isFormChange"
        name="reason"
        :label="t('sys.onlineForm.formAbandonReason')"
        :rules="[
          {
            required: true,
            message: t('sys.inputTextTip', { name: t('sys.onlineForm.formAbandonReason') }),
          },
        ]"
      >
        <a-textarea
          v-model:value="formData.reason"
          :placeholder="t('sys.inputText')"
          :rows="3"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
    <div :class="[ns.e('tip')]" v-if="isShowTip">
      {{ t('sys.onlineForm.formAbandonConfirmTipNew') }}
    </div>
  </a-modal>
</template>

<script lang="ts" setup name="form-abandon-modal">
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';
  import { useNamespace } from '@gct/runtime';
  import { FormInstance } from 'ant-design-vue';
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SubmitFormChangeModal from './submit-form-change-modal.vue';

  import { getPreviewUrl } from '/@/components/Signature';
  import dayjs from 'dayjs';

  const { t } = useI18n() as any;

  const ns = useNamespace('form-abandon-modal');

  interface SignatureInfo {
    url?: string;
    time?: string;
    historyId?: string;
    username?: string;
    singleSign?: boolean;
  }

  const visible = ref<boolean>(true);
  const submitting = ref(false);

  const props = withDefaults(
    defineProps<{
      userName: string;
      docName: string;
      isShowTip: boolean;
      options?: object;
      isFormChange?: boolean;
      isDhr?: boolean;
      singleSign?: boolean;
      okCallback: (data: IData) => void;
    }>(),
    {
      isDhr: false,
    },
  );

  const formData = reactive<{
    reason: string;
    applicant: SignatureInfo;
    reviewer: SignatureInfo;
  }>({
    reason: '',
    applicant: {},
    reviewer: {},
  });

  const formRef = ref<FormInstance>();

  const rules = reactive({
    applicant: [{ validator: modifiedValidator, required: true }],
    reviewer: [
      {
        validator: (rule: any, value: SignatureInfo) => {
          if (!(formData.applicant.url || formData.applicant.username)) {
            return Promise.reject(
              new Error($t('sys.onlineForm.pleaseFillSubmitterSignatureFirst')),
            );
          }
          if (!value || !(value.url || value.username)) {
            return Promise.reject(new Error($t('sys.onlineForm.pleaseSign')));
          }
          return Promise.resolve();
        },
        required: true,
      },
    ],
  });

  function modifiedValidator(_rule: any, value: SignatureInfo) {
    if (!value || !(value.url || value.username)) {
      return Promise.reject(new Error($t('sys.onlineForm.pleaseSign')));
    }
    return Promise.resolve();
  }

  async function openSignature(field: 'applicant' | 'reviewer') {
    const result = await gct.openUtil.modal(
      SubmitFormChangeModal,
      {},
      {
        title: $t('sys.signatureImage'),
        centered: true,
        width: 600,
      },
    );

    if (result.ok) {
      const signInfo = result.data?.[0].signInfo;
      formData[field] = {
        url: signInfo.url,
        time: signInfo.time,
        historyId: signInfo.historyId,
        username: signInfo.username,
      };
      formRef.value?.clearValidate([field]);
    }
  }

  function clearSignature(field: 'applicant' | 'reviewer') {
    formData[field] = {};
    formRef.value?.clearValidate([field]);

    if (field === 'applicant') {
      formData.reviewer = {}; // 清空复核人的签名
      formRef.value?.clearValidate(['reviewer']);
    }
  }

  const handleOk = async () => {
    if (submitting.value) return;
    submitting.value = true;

    try {
      await formRef.value?.validate();
      await props.okCallback({ ...formData });
      visible.value = false;
    } catch (err) {
    } finally {
      submitting.value = false;
    }
  };

  const handleCancel = () => {
    visible.value = false;
  };
</script>

<style lang="scss" scoped>
  $form-abandon-modal: (
    height: auto,
  );

  @include b(form-abandon-modal) {
    @include set-component-css-var(form-abandon-modal, $form-abandon-modal);
    height: getCssVar(form-abandon-modal, height);

    @include e(header) {
      margin-bottom: 12px;
    }

    @include e(icon) {
      color: #ff8c4b;
      margin-right: 8px;
    }

    @include e(title) {
      font-weight: 500;
      font-size: 14px;
      color: #212528;
      line-height: 22px;
    }

    @include e(tip) {
      font-weight: 400;
      font-size: 14px;
      color: #797a7d;
    }
  }

  .abandon-signature-item {
    margin-bottom: 0;
  }
  .abandon-signature-img-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .abandon-signature-img {
    width: 120px;
    height: auto;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }
  .abandon-signature-meta-row {
    display: flex;
    width: 100%;
    align-items: center;
    margin-top: 4px;
  }
  .abandon-signature-meta {
    font-size: 12px;
    color: #888;
    line-height: 22px;
  }
  .abandon-signature-delete-btn {
    padding: 0;
    font-size: 12px;
    padding: 0;
    line-height: 22px;
    height: 22px;
    border: none;
    margin-left: 6px;
  }
</style>

<style lang="less">
  .gct-form-abandon-modal__wrap {
    .ant-modal-footer {
      border-width: 0;
    }
  }
</style>
