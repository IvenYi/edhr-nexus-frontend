<template>
  <div class="h64px ks-row items-center header gap-16px">
    <div class="title ks-col ks-row items-center overflow-hidden">
      <i class="iconfont icon-zuocefanhui mr16px cursor-pointer" @click="onBack()"></i>
      <div class="gct-custom-tag mr6px text-12px!">{{
        edhrInfo?.materialStatus ? $t(`sys.edhr.materialStatus.${edhrInfo?.materialStatus}`) : ''
      }}</div>
      <div class="ks-col ell text-[#1A1D23] font-500">
        {{ edhrInfo.lotSnNo }} / {{ edhrInfo.productName }}
      </div>
    </div>
    <div class="btn-wrap">
      <template v-if="!readonlySummary">
        <a-button class="plain-primary" :loading="loadingSave" @click="onSave">
          <!-- <i class="iconfont icon-baocun3"></i> -->
          {{ $t('sys.designView.save') }}
        </a-button>
        <a-button type="primary" :loading="loadingFinish" @click="onFinish">{{
          $t('sys.submit')
        }}</a-button>
      </template>
      <BaseButton
        v-for="item in actionButtonList"
        :key="item.type"
        :loading="item.loading"
        @click="handleBtnClick(item)"
        :title="item.customTitle"
        v-bind="{ ...(item.style || {}) }"
      />
      <a-button v-if="detailMode" type="default" @click="onBatchPrint">{{
        $t('sys.edhr.batchPrint')
      }}</a-button>
      <template v-if="readonlySummary && edhrInfo?.processInstId">
        <a-button type="primary" @click="onViewPath">{{ $t('sys.edhr.approvalProcess') }}</a-button>
      </template>
      <a-button @click="onBack()">{{ $t('sys.closeText') }}</a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { h, ref, toRaw } from 'vue';
  import { useEdhrSummary } from '../hook/useEdhrSummary';
  import { openProcessModal } from '../index';
  import { message, Modal } from 'ant-design-vue';
  import BaseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { excApprovalOperate } from '/@/projects/online-form/src/approval';
  import { isEmpty } from 'lodash-es';
  import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';

  const emit = defineEmits(['on-back', 'on-save', 'on-finish']);
  const {
    edhrInfo,
    saveSummary,
    finishSummary,
    readonlySummary,
    detailMode,
    hasBeenUpdated,
    actionButtonList,
    getActionBtns,
  } = useEdhrSummary();
  const loadingFinish = ref(false);
  const loadingSave = ref(false);
  const needRefresh = ref(false);

  const onSave = async () => {
    loadingSave.value = true;
    try {
      await saveSummary();
      needRefresh.value = true;
      loadingSave.value = false;
    } catch (error) {
      loadingSave.value = false;
    }
  };

  const onFinish = async () => {
    loadingFinish.value = true;
    try {
      await finishSummary();
      loadingFinish.value = false;
      emit('on-back', true);
    } catch (error) {
      loadingFinish.value = false;
    }
  };

  const onViewPath = () => {
    openProcessModal({ instId: edhrInfo.value.processInstId, processId: edhrInfo.value.processId });
  };

  const onBatchPrint = () => {
    if (!edhrInfo.value?.edhrInstId) {
      message.warn($t('sys.edhr.instNotExist'));
      return;
    }
    postFileTaskSubmit({
      tmplInstantId: edhrInfo.value?.edhrInstId,
      type: 'EDHR',
    });
    message.success($t('sys.edhr.printTaskCreationWasSuccessful'));
  };

  const handleBtnClick = async (btn) => {
    console.log('btn---', btn);
    btn.loading = true;
    if (!btn.api || typeof btn.api !== 'function') return;
    const signResult = await excApprovalOperate(btn);
    console.log('signResult----', signResult);
    if (!signResult) {
      btn.loading = false;
      return;
    }
    let params = {
      edhrInstanceId: edhrInfo.value.edhrInstId,
      btnKey: btn.type,
      taskId: btn.taskId,
      businessId: btn.businessId,
      buttonConfig: JSON.stringify({
        title: btn.customTitle,
        color: btn.style?.backgroundColor,
      }),
    };
    if (typeof signResult === 'object') {
      const signature = toRaw(signResult.signature);
      params = {
        ...params,
        opinion: signResult.comment,
        remark: signResult.memo,
        signature: !isEmpty(signature) ? JSON.stringify([signature]) : undefined,
        toUserId: signResult.person,
      };
    }
    try {
      await btn.api(params);
      message.success($t('sys.operationSuccess'));
      getActionBtns(edhrInfo.value.processInstId);
      needRefresh.value = true;
    } catch (error) {
      btn.loading = false;
    }
  };

  const onBack = () => {
    if (hasBeenUpdated()) {
      const cfg = Modal.confirm({
        title: $t('sys.hasNoSavedDataTitle'),
        content: h('div', { class: 'unsaved-modal' }, [
          h('span', $t('sys.hasNoSavedDataTips')),
          h('div', { class: 'continue-edit' }, [
            h(
              'button',
              {
                type: 'button',
                onClick: () => cfg.destroy(),
              },
              $t('sys.app.continueEdit'),
            ),
          ]),
        ]),
        okText: $t('sys.cardDesign.back_info.saveAndExit'),
        cancelText: $t('sys.cardDesign.back_info.notSave'),
        onOk: async () => {
          await saveSummary();
          emit('on-back', true);
        },
        onCancel: () => {
          cfg.destroy();
          emit('on-back');
        },
      });
      return;
    }
    emit('on-back', needRefresh.value);
  };
</script>
<style lang="less" scoped>
  .header {
    padding: 0 16px;
  }
  .btn-wrap {
    display: flex;
    column-gap: 12px;
    .iconfont {
      vertical-align: middle;
      margin-right: 4px;
    }
    // .ant-btn + .ant-btn {
    //   margin-left: 12px;
    // }
    .plain-primary.ant-btn {
      color: var(--ant-primary-color);
      border-color: var(--ant-primary-color);
    }
  }

  // .btns-process {
  //   display: flex;
  //   column-gap: 16px;
  // }
</style>
