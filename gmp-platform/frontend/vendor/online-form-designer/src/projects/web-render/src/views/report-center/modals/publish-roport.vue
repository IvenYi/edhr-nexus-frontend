<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="300"
    :title="t('sys.publish')"
    centered
    :okText="t('sys.okText')"
    width="640px"
    @ok="handleOk"
    :afterClose="handleClose"
  >
    <div class="pt36px px-48px">
      <div class="text-[#888888] mb-12px">
        {{ t('sys.report.publishTip') }}
      </div>

      <a-form :model="formState" layout="vertical" ref="formRef">
        <a-form-item :label="t('sys.developer.appCenter.viewerUser')" name="visibleRange">
          <ApprovalUserSelectConfig
            v-model:modelValue="formState.visibleRange"
            :showTabs="showTabs"
            :placeholder="t('sys.report.noSelectedTip')"
            size="middle"
          />
        </a-form-item>
      </a-form>
    </div>
  </basic-modal>
</template>
<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import ApprovalUserSelectConfig from '/@app-designer/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import { postReportDeploy } from '/@/apis/gct-apaas/ReportController';
  import { message } from 'ant-design-vue';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);
  const showTabs = ['User', 'Org', 'Role'];
  const formRef = ref();

  const formState = reactive({
    visibleRange: '',
    id: '',
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) return;
    formState.id = data.id;
  });

  const handleClose = () => {
    formRef.value.resetFields();
  };

  const handleOk = () => {
    postReportDeploy({
      id: formState.id,
      visibleRange: formState.visibleRange,
    }).then(() => {
      emit('ok');
      message.success(t('sys.app.publish.SUCCESS'));
      formRef.value.resetFields();
      closeModal();
    });
  };
</script>
