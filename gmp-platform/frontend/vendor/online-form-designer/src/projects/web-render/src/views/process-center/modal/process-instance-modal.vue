<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.process.reassign') + t('sys.process.approver')"
    centered
    width="640px"
    :maskClosable="false"
    @ok="handleOk"
    :afterClose="handleClose"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.process.approvalNode')"
        name="actId"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', { sth: t('sys.process.approvalNode') }),
          },
        ]"
      >
        <a-select v-model:value="formState.actId" allowClear :placeholder="t('sys.chooseText')">
          <a-select-option v-for="item in taskOptions" :value="item.value" :key="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.process.currentApprover')"
        name="approveUserId"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', { sth: t('sys.process.currentApprover') }),
          },
        ]"
      >
        <a-select
          v-model:value="formState.approveUserId"
          allowClear
          :placeholder="t('sys.chooseText')"
        >
          <a-select-option v-for="item in assigneeOptions" :value="item.value" :key="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.process.reassignApprover')"
        name="reassignId"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', { sth: t('sys.process.reassignApprover') }),
          },
        ]"
      >
        <a-select
          class="assignees-select"
          v-model:value="formState.reassignId"
          readonly
          :placeholder="t('sys.chooseText')"
          @click="handleClick"
          dropdownClassName="gct-project-select-dropdown hidden"
        >
          <a-select-option v-for="item in userOptions" :value="item.id" :key="item.id">
            {{ item.fullname }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts" name="process-instance-modal">
  import { reactive, ref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { postPmProcessEngineProcExecute } from '/@/apis/gct-apaas/PmProcessEngineController';
  import { openUserSlectModal } from '/@/projects/app-designer/src/components/user-select/index';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data.data);
  });

  const formRef = ref<FormInstance>();
  const formState = reactive({
    actId: undefined,
    reassignId: undefined,
    approveUserId: undefined,
    procInstId: undefined,
  });

  const taskOptions = ref<any[]>([]);
  const assigneeOptions = ref<any[]>([]);
  const userOptions = ref<any[]>([]);

  const onDataReceive = (data) => {
    formState.procInstId = data.id;
    const assignees = data.assignees.split(',');
    const assigneeNames = data.assigneeNames.split(',');
    if (assignees.length && assignees.length === assigneeNames.length) {
      assigneeOptions.value = assignees.map((i, index) => ({
        value: i,
        label: assigneeNames[index],
      }));
      formState.approveUserId = assignees[0];
    }

    const taskKeys = data.taskKeys.split(',');
    const taskNames = data.taskNames.split(',');
    if (taskKeys.length && taskKeys.length === taskNames.length) {
      taskOptions.value = taskKeys.map((i, index) => ({
        value: i,
        label: taskNames[index],
      }));
      formState.actId = taskKeys[0];
    }
  };

  const handleClick = async (event) => {
    event.stopPropagation();
    const data = await openUserSlectModal({
      selectKeys: formState.reassignId ? [formState.reassignId] : [],
      multiple: false,
      callback: () => {},
    });
    formState.reassignId = data?.selectKeys;
    userOptions.value = data?.selectOptions;
  };

  const handleOk = async () => {
    formRef.value?.validate().then(async () => {
      const processData = {
        ...formState,
        button: 'ForceReassign',
      } as any;
      await postPmProcessEngineProcExecute(processData);
      emit('ok');
      closeModal();
    });
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    assigneeOptions.value = [];
    taskOptions.value = [];
    userOptions.value = [];
  };
</script>

<style lang="less" scoped></style>
