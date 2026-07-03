<template>
  <ModalWrapper
    :opts="modalOptions"
    :class="['form-import-modal']"
    :disabled-ok="disabledOk"
    :do-ok="doOk"
    :do-cancel="doCancel"
  >
    <div v-if="step === 1" :class="['form-import-modal__step1']">
      <a-alert
        class="mb-24px gct-alert"
        :message="$t('sys.onlineForm.formImportTip1')"
        type="info"
        show-icon
      >
        <template #icon>
          <icon-next :size="14" value="icon-preset:edhr-tips" color="" />
        </template>
      </a-alert>
      <a-form-item :label="$t('sys.appDesigner.importPolicy')" :inline="true">
        <a-radio-group v-model:value="strategy">
          <a-radio :value="ImportType.JUMP">{{ $t('sys.onlineForm.skip') }}</a-radio>
          <a-radio :value="ImportType.UPDATE">{{
            $t('sys.onlineForm.updateCorrespondingVersion')
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <ImportFileUploader v-model="fileInfo" />
    </div>
    <div v-if="step === 2" :class="['form-import-modal__step2']">
      <ImportProgress
        :percent="processStatus.percent"
        :message="processStatus.message"
        :result-status="processStatus.resultStatus"
      />
      <ResultInfo v-if="processStatus.showResult" :result="result" />
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="form-import-modal">
  import { reactive, ref, computed } from 'vue';
  import { useModal, IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';
  import ImportFileUploader from './import-file-uploader.vue';
  import ImportProgress from './import-progress.vue';
  import { IImportResult, ImportType } from './types';
  import ResultInfo from './result-info.vue';
  import { postOnlineFormTmplExportImportJsonl } from '/@/apis/gct-apaas/FormExportController';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    title: $t('sys.import'),
    width: 640,
  });

  const processStatus = reactive({
    percent: 0,
    message: $t('sys.component.upload.importing'),
    resultStatus: '',
    showResult: true,
  });

  const result = reactive<IImportResult>({
    total: 0,
    success: 0,
    fail: 0,
    failList: [] as any[],
  });

  const props = defineProps<{
    modal: IModal;
    categoryKey?: string;
  }>();

  /** 导入策略 */
  const step = ref(1);
  const strategy = ref(ImportType.JUMP);
  const fileInfo = ref();

  console.log('modal', props.modal);

  /** 禁用确认按钮 */
  const disabledOk = computed(() => {
    return !fileInfo.value;
  });

  const doOk = async () => {
    console.log('确认');

    let formData: any = new FormData();
    formData.append('file', fileInfo.value);
    const promise = postOnlineFormTmplExportImportJsonl(
      formData,
      {
        importType: strategy.value,
        categoryId: props.categoryKey!,
      },
      {
        transferToConfig: { headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' } },
      },
    );
    // 请求过程中隐藏底部
    step.value = 2;
    modalOptions.showFooter = false;
    modalOptions.title = $t('sys.onlineForm.importResult');
    modalOptions.height = 500;

    // 模拟进度条
    processStatus.percent = 0;
    const timer = setInterval(() => {
      if (processStatus.percent < 95) {
        processStatus.percent++;
      }
    }, 100);

    // 接口结束后
    try {
      const res = await promise;
      if (!res) {
        return false;
      }
      console.log('res', res);
      const { successCount, totalLines, errorCount, list } = res!;
      processStatus.percent = 100;
      processStatus.message = $t('sys.component.upload.importSuccess');
      processStatus.resultStatus = errorCount ? 'warning' : 'success';
      processStatus.showResult = true;
      modalOptions.showFooter = true;
      modalOptions.showOkBtn = false;
      modalOptions.cancelText = $t('sys.closeText');
      Object.assign(result, {
        total: totalLines,
        success: successCount,
        fail: errorCount,
      });

      // 转换错误数据
      if (list) {
        const parentMap: any = {};
        list
          // 按创建时间倒序排序
          .sort((a, b) => new Date(b.createTime!).getTime() - new Date(a.createTime!).getTime())
          .forEach((item) => {
            const parentId = item.baseId!;
            if (!parentMap[parentId]) {
              parentMap[parentId] = {
                name: item.name,
                formType: item.type,
                categoryName: item.categoryName,
                children: [],
              };
            }
            parentMap[parentId].children.push({
              version: item.version,
              default: item.default,
              reason: item.failsMessage,
            });
          });

        Object.assign(result, {
          failList: Object.values(parentMap),
        });
      }
    } catch (error) {
      console.log('error', error);
      processStatus.percent = 100;
      processStatus.message = $t('sys.onlineForm.importFailed');
      processStatus.resultStatus = 'warning';
      processStatus.showResult = false;
    } finally {
      clearInterval(timer);
    }

    return false;
  };

  const doCancel = () => {
    if (step.value === 1) {
      // 如果是第一步，点击取消则关闭模态框
      props.modal.dismiss();
    } else {
      props.modal.dismiss({
        ok: true,
      });
    }
    return false;
  };
</script>

<style lang="less" scoped>
  .form-import-modal {
    &__step1 {
      padding: 24px;
    }

    &__step2 {
    }
  }

  .gct-alert.ant-alert {
    border-radius: 4px 4px 4px 4px;
    line-height: 36px;
    padding: 0 16px;
    --ant-info-color-deprecated-bg: rgba(0, 153, 255, 0.08);
    --ant-info-color-deprecated-border: rgba(0, 153, 255, 0.3);

    :deep(.ant-alert-message) {
      line-height: 20px;
      padding: 8px 0;
    }
  }
</style>
