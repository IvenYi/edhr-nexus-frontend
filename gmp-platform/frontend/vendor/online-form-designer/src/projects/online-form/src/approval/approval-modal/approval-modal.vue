<template>
  <div :class="ns.b()">
    <a-form ref="formRef" layout="vertical" :model="formState">
      <a-form-item
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
      >
        <a-select
          :open="false"
          :showArrow="false"
          :placeholder="$t('sys.onlineForm.pleaseSelectReassignPersonnel')"
          dropdownClassName="gct-project-select-dropdown"
          @click="handleOpenModal"
          v-model:value="showValue"
          :options="selectOptions"
        />
      </a-form-item>
      <a-form-item
        v-if="opts.showFields.includes(ApprovalField.MEMO)"
        :label="t('sys.notes')"
        :name="ApprovalField.MEMO"
        :required="opts.requiredFields.includes(ApprovalField.MEMO)"
      >
        <a-textarea
          v-model:value="formState[ApprovalField.MEMO]"
          :placeholder="t('sys.inputText')"
          :rows="3"
          show-count
          :maxlength="120"
        />
      </a-form-item>
      <a-form-item
        v-if="opts.showFields.includes(ApprovalField.COMMENT)"
        :label="t('sys.appDesigner.approval.opinion')"
        :name="ApprovalField.COMMENT"
        :required="opts.requiredFields.includes(ApprovalField.COMMENT)"
      >
        <a-textarea
          v-model:value="formState[ApprovalField.COMMENT]"
          :placeholder="t('sys.inputText')"
          :rows="3"
          show-count
          :maxlength="120"
        />
      </a-form-item>
      <a-form-item
        v-if="opts.showFields.includes(ApprovalField.SIGNATURE)"
        :name="ApprovalField.SIGNATURE"
      >
        <SignSwitcher
          :required="opts.requiredFields.includes(ApprovalField.SIGNATURE)"
          ref="switchRef"
          :fix-sign-mode="props.opts.signatureType !== SignatureTypeEnum.Any"
          v-model:sign-mode="signMode"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="approval-modal">
  import { reactive, ref, watch, computed } from 'vue';
  import { type FormInstance, message, SelectProps } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IModalData, useModal, useNamespace } from '@gct/runtime';
  import { SignerInstance, SignMode, SignSwitcher } from '/@/components/Signature';
  import { ApprovalModalOptions, IApprovalData } from './types';
  import { pick } from 'lodash-es';
  import { ApprovalField } from './constant';
  import { openSelectUserModal } from '/@/components/SelectUserModal';
  import { useModalPicker, PickType } from '/@/components/UserPick';
  import { SignatureTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import { useDebouncePromise } from '@vben/hooks';

  const { t } = useI18n();

  const { getUserByIds } = useModalPicker({ type: PickType.ViSIBLE });

  const ns = useNamespace('approval-modal');

  const props = defineProps<{
    opts: ApprovalModalOptions;
  }>();

  const selectOptions = ref<SelectProps['options']>([]);

  // 参数
  const switchRef = ref<SignerInstance>();
  const signMode = ref<SignMode | undefined>();
  if (props.opts.signatureType === SignatureTypeEnum.Any) {
    signMode.value = SignMode.HANDWRITING;
  } else {
    signMode.value = props.opts.signatureType as any;
  }
  const formRef = ref<FormInstance>();
  const formState = reactive<Partial<IApprovalData>>({});

  const validate = async () => {
    return formRef.value?.validate();
  };

  const showValue = computed<any>({
    get() {
      let value = formState[ApprovalField.PERSON] || undefined;

      return Array.isArray(value) ? value : value?.split(',').filter((i) => i) || [];
    },
    set(v) {},
  });

  watch(
    () => formState[ApprovalField.PERSON],
    async (usersIds) => {
      let userOptions: any = [];
      if (usersIds) {
        const userList = await getUserByIds({ ids: usersIds });
        userOptions = userList?.map((item) => {
          return {
            label: item.__LABEL__ || item.fullname,
            value: item.id,
          };
        });
      }

      selectOptions.value = [...userOptions];
    },
    { deep: true, immediate: true },
  );

  /** 上传签名并设置签名属性 */
  const setSignature = async () => {
    if (!props.opts.showFields.includes(ApprovalField.SIGNATURE)) {
      return;
    }
    try {
      const signInfo = await switchRef.value?.submit();
      formState[ApprovalField.SIGNATURE] = signInfo;
      console.log($t('sys.appDesigner.approval.button.Save'), signInfo);
    } catch (error) {
      console.log('error', error);
      // if (error.message) {
      //   message.error({
      //     content: error.message,
      //     class: 'top-ant-message',
      //   });
      // }
      throw error;
    }
  };

  const handleOpenModal = async () => {
    openSelectUserModal({
      title: t('sys.appDesigner.approval.approvalUserSelect'),
      values: showValue.value.map((id) => `USER:${id}`),
      modelKey: '',
      multiple: false,
      showTabs: ['User'],
      callback: async (ids) => {
        const userIds = ids.map((e) => e.replace(/USER:/, ''));

        formState[ApprovalField.PERSON] =
          Array.isArray(userIds) && userIds.length ? userIds.join(',') : undefined;
        formRef.value!.validateFields([ApprovalField.PERSON]);
      },
    });
  };

  async function doSubmit(): Promise<IModalData | null> {
    // 先校验，再上传签名
    await validate();
    await setSignature();
    const resultData = pick(formState, props.opts.showFields);
    return {
      ok: true,
      data: [resultData],
    };
  }

  const { run } = useDebouncePromise(doSubmit, 500);

  useModal(run);
</script>

<style lang="scss" scoped>
  @include b(approval-modal) {
    padding: 32px 50px;
    position: relative;

    :deep(.ant-form-item-label > label:after) {
      display: block;
    }
  }
</style>
