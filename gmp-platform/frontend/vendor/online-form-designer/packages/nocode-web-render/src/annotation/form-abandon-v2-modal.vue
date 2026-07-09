<template>
  <a-modal
    :closable="false"
    :visible="visible"
    v-bind="props.options ?? {}"
    :wrapClassName="[ns.e('wrap')].join(' ')"
    destroyOnClose
    :centered="true"
    :keyboard="false"
    :okText="labelInfo.submitBtnTitle"
    :cancelText="t('sys.cancel')"
    :okButtonProps="{ loading: okLoading }"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div :class="[ns.e('header')]">
      <ExclamationCircleFilled :class="[ns.e('icon')]" />
      <span :class="['title']">{{ labelInfo.headerTitle }}</span>
    </div>
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      :label-col="{ span: 4 }"
      :class="['content', 'gct-label-wrap-form']"
    >
      <a-form-item :labelWrap="true" name="applicant" :label="labelInfo.applicantLabel" required>
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
        name="reason"
        :label="labelInfo.reasonLabel"
        :rules="[
          {
            required: true,
            message: t('sys.inputTextTip', { name: labelInfo.reasonLabel }),
          },
        ]"
        :labelWrap="true"
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
  </a-modal>
</template>

<script lang="ts" setup name="form-abandon-v2-modal">
  import { reactive, ref, computed } from 'vue';
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';
  import { FormInstance } from 'ant-design-vue';
  import { useNamespace } from '@gct/runtime';
  import dayjs from 'dayjs';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SubmitFormChangeModal from './submit-form-change-modal.vue';
  import { openSelectProcessModal } from '/@web-render/views/edhr-application/render/edhr-summary';
  import { getPreviewUrl } from '/@/components/Signature';

  const { t } = useI18n() as any;

  const ns = useNamespace('form-abandon-v2-modal');

  const okLoading = ref(false);

  interface SignatureInfo {
    url?: string;
    time?: string;
    historyId?: string;
    username?: string;
  }

  const visible = ref<boolean>(true);
  const submitting = ref(false);

  const props = withDefaults(
    defineProps<{
      docName: string;
      isFormChange?: boolean;
      options?: object;
      okCallback: (data: IData) => void;
      cancelCallback: () => void;
    }>(),
    {},
  );

  const formData = reactive<{
    reason: string;
    applicant: SignatureInfo;
  }>({
    reason: '',
    applicant: {},
  });

  const formRef = ref<FormInstance>();

  const rules = reactive({
    applicant: [{ validator: modifiedValidator, required: true }],
  });

  const labelInfo = computed(() => {
    if (props.isFormChange) {
      return {
        headerTitle: t('sys.onlineForm.formChangeConfirmTitle1', { name: props.docName }),
        submitBtnTitle: $t('sys.onlineForm.selectChangeProcess'),
        applicantLabel: $t('sys.edhr.changedUser'),
        reasonLabel: t('sys.onlineForm.formChangeReason'),
      };
    }
    return {
      headerTitle: t('sys.onlineForm.formAbandonConfirmTitle', { name: props.docName }),
      submitBtnTitle: $t('sys.onlineForm.selectVoidProcess'),
      applicantLabel: $t('sys.onlineForm.voidPerson'),
      reasonLabel: t('sys.onlineForm.formAbandonReason'),
    };
  });

  function modifiedValidator(_rule: any, value: SignatureInfo) {
    if (!value || !(value.url || value.username)) {
      return Promise.reject(new Error($t('sys.onlineForm.pleaseSign')));
    }
    return Promise.resolve();
  }

  async function openSignature(field: 'applicant') {
    const result = await gct.openUtil.modal(
      SubmitFormChangeModal,
      {},
      {
        title: $t('sys.component.dataConnection.modelField.sign'),
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

  function clearSignature(field: 'applicant') {
    formData[field] = {};
    formRef.value?.clearValidate([field]);
  }

  const handleOk = async () => {
    if (submitting.value) return;
    submitting.value = true;
    okLoading.value = true;

    try {
      await formRef.value?.validate();

      const res = await openSelectProcessModal({
        title: $t('sys.onlineForm.processSelection'),
        categoryId: '__change_process__',
      });

      if (res.ok) {
        await props.okCallback({ ...formData, approveTmplId: res.data.id });
        visible.value = false;
      }
    } catch (err) {
    } finally {
      submitting.value = false;
      okLoading.value = false;
    }
  };

  const handleCancel = () => {
    visible.value = false;
    props.cancelCallback();
  };
</script>

<style lang="scss" scoped>
  $form-abandon-v2-modal: (
    height: auto,
  );

  @include b(form-abandon-v2-modal) {
    @include set-component-css-var(form-abandon-v2-modal, $form-abandon-v2-modal);
    height: getCssVar(form-abandon-v2-modal, height);

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

  :deep(.ant-form-item-label) {
    &:has(div.label-wrap) {
      overflow: visible;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>

<style lang="less">
  .gct-form-abandon-modal__wrap {
    .ant-modal-footer {
      border-width: 0;
    }
  }
</style>
