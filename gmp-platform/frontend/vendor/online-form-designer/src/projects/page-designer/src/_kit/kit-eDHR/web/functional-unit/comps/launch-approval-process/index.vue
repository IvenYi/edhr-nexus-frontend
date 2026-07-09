<template>
  <div class="launch-approval-process">
    <div class="launch-approval-process_top" v-if="!props.onlyEffect">
      <div class="subject-title">
        <info-circle-outlined class="color-yellow mr-2" />
        <span>{{
          t('sys.edhr.processChoice.subjectTitle', {
            type: t(`sys.edhr.processChoice.${props.processType}`),
            name: props.subjectData.name_,
          })
        }}</span>
      </div>
      <div class="subject-desc">
        {{
          t(`sys.edhr.processChoice.subjectDesc`, {
            sth: t(`sys.edhr.processChoice.${props.processType}`),
          })
        }}
      </div>
    </div>

    <div class="launch-approval-process_main">
      <a-form :model="formState">
        <a-form-item :label="t('sys.edhr.processChoice.effectDate')" :required="true">
          <a-radio-group v-model:value="effectiveValue">
            <a-radio v-for="op in effectTypeOptions" :value="op.value" :key="op.value">
              {{ op.label }}
            </a-radio>
            <a-date-picker
              v-if="formState.effectiveValue === 1"
              v-model:value="formState.effectiveDate"
              :disabled-date="disabledBeforeToday"
              :format="'YYYY-MM-DD'"
              :valueFormat="'YYYY-MM-DD'"
              :showToday="false"
              :defaultPickerValue="defaultPickerValue()"
            />
          </a-radio-group>
        </a-form-item>
      </a-form>
      <div class="subject-desc bg-[#F9FAFB] rounded p-2">
        {{
          t('sys.edhr.processChoice.effectDesc', {
            sth: t(`sys.edhr.processChoice.${props.processType}`),
          })
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { IModal, useModal } from '@gct/runtime';
  import { reactive, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import dayjs from 'dayjs';
  import { message as Message } from 'ant-design-vue';
  import {
    getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
    postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
    putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import SelectProcessModal from './select-process-modal.vue';
  import { modelKeyMap, ProcessType } from '.';

  const props = defineProps<{
    modal: IModal;
    processType: ProcessType;
    processId: string;
    subjectData: {
      id_: string;
      name_: string;
      [key: string]: any;
    };
    // 只修改生效时间
    onlyEffect?: boolean;
    customSubmit?: (data?) => Promise<any>;
    customLoad?: (processId?: string) => Promise<any>;
  }>();

  const { t } = useI18n();

  const effectTypeOptions = [
    {
      label: t('sys.edhr.processChoice.effectType.0'),
      value: 0,
    },
    {
      label: t('sys.edhr.processChoice.effectType.1'),
      value: 1,
    },
  ];

  // 不能选择早于今天的日期
  const disabledBeforeToday = (current) => {
    return current && current <= dayjs().startOf('day');
  };
  const defaultPickerValue = () => {
    return dayjs().add(1, 'day').format('YYYY-MM-DD');
  };

  const formState = reactive({
    processType: props.processType,
    processId: props.processId,
    effectiveValue: 0,
    effectiveDate: null,
  });

  const effectiveValue = computed({
    get() {
      return formState.effectiveValue;
    },
    set(value) {
      formState.effectiveValue = value;
      if (value === 0) {
        formState.effectiveDate = null;
      }
    },
  });

  useModal(onOkClick);

  async function onOkClick() {
    if (formState.effectiveValue === 1 && !formState.effectiveDate) {
      Message.warn(t('sys.pleaseSelectSth', { sth: t('sys.ipaas.connectionFlow') }));
      return;
    }
    let result;
    if (props.onlyEffect) {
      result = await postEffectiveDate();
    } else {
      switch (props.processType) {
        case ProcessType.ROUTING:
        case ProcessType.PRODUCT_PROCESS:
          result = await handleChoseProcess({
            processType: props.processType,
            processId: props.processId,
          });
          break;
        case ProcessType.ONLINE_FORM_TEMP:
        case ProcessType.DHR_TEMP:
          result = await postApprovalProcess();
          break;
      }
    }

    if (result && result.ok) {
      return { ok: true, data: result.data || formState };
    }
    return null;
  }

  async function handleChoseProcess(params) {
    const res: any = await gct.openUtil.modal(
      SelectProcessModal,
      {
        ...params,
      },
      { width: 800, title: '流程选择' },
    );
    if (res && res.ok) {
      Object.assign(formState, {
        approveTmplId: res.data?.approveTmplId,
      });
      return await postApprovalProcess();
    }
    console.log(res, formState, 'res: launch-approval-process');
  }

  async function postApprovalProcess() {
    const res = props.customSubmit
      ? await props.customSubmit(formState)
      : await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: 'entity',
            modelKey: modelKeyMap[props.processType],
            bsKey: 'approve',
          },
          {
            ...formState,
            id: props.subjectData.id_,
          },
        );

    return {
      ok: true,
      data: res,
    };
  }

  async function postEffectiveDate() {
    const res = props.customSubmit
      ? await props.customSubmit(formState)
      : await putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: 'entity',
            modelKey: 'em_edhr_summary_approve_his',
            bsKey: 'biz_update_effective_date',
          },
          {
            id: props.processId,
            effective_date_: formState.effectiveDate,
          },
          {
            id: props.processId,
            effective_date_: formState.effectiveDate,
          },
        );

    return {
      ok: true,
      data: res,
    };
  }

  async function loadEffectiveDate() {
    if (!props.processId) return;

    try {
      const res: any = props.customLoad
        ? await props.customLoad(props.processId)
        : await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
            {
              modelCategory: 'entity',
              modelKey: 'em_edhr_summary_approve_his',
              bsKey: 'getById',
            },
            {
              id: props.processId,
            },
            {
              id: props.processId,
            },
          );
      const data = res?.data || res;
      const effectiveDate = data?.effectiveDate || data.effective_date_;
      formState.effectiveValue = effectiveDate ? 1 : 0;
      formState.effectiveDate = effectiveDate ?? null;
    } catch (e) {
      console.log(e);
    }
  }

  onMounted(() => {
    loadEffectiveDate();
  });
</script>

<style lang="less" scoped>
  .launch-approval-process {
    padding: 24px;

    .subject-desc {
      font-size: 12px;
      color: #5a5f6b;
    }

    &_top {
      padding: 16px;
      background: #ff94421a;
      border-radius: 4px;
    }

    &_main {
      margin-top: 24px;

      :deep(.ant-radio-group) {
        width: 100% !important;
        display: flex !important;
        align-items: center;
      }

      :deep(.ant-picker) {
        flex: 1;
      }
    }
  }
</style>
