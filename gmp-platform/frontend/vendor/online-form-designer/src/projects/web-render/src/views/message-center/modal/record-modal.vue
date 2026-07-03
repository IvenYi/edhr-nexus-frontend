<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.message.detail')"
    centered
    width="640px"
    :maskClosable="false"
    :showOkBtn="!inEDHRApp"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item :label="t('sys.message.object')">
        <div>{{ formState.userName }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.message.pushType')">
        <div>{{ formState.pushTypeStr }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.message.pushTime')">
        <div>{{ formState.pushTime }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.message.pushResult')">
        <div>{{ formState.result === 'SUCCEED' ? t('sys.success') : t('sys.fail') }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.message.failResult')" v-if="formState.result !== 'SUCCEED'">
        <div>{{ formState.resultMsg }}</div>
      </a-form-item>
      <a-form-item :label="t('sys.message.content')" />
      <div class="message-content">
        <div class="title" v-if="formState.pushType === 'email'">{{ formState.title }}</div>
        <div class="content" v-html="formState.messageInfo"></div>
      </div>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { ScriptType } from '../types/script';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const appInfoStore = useAppInfoStore();
  const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

  defineProps<{
    scriptCategory;
    versions?;
  }>();

  const { t } = useI18n();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const formRef = ref<FormInstance>();
  const formState = reactive<ScriptType>({
    title: '',
    pushType: '',
    pushTypeStr: '',
    pushTime: '',
    result: '',
    resultMsg: '',
    messageInfo: '',
  });

  const onDataReceive = (data) => {
    const { userName, pushType, pushTypeStr, pushTime, result, resultMsg, title, messageInfo } =
      data;
    formState.userName = userName;
    formState.pushType = pushType;
    formState.pushTypeStr = pushTypeStr;
    formState.pushTime = pushTime;
    formState.result = result;
    formState.resultMsg = resultMsg;
    formState.title = title;
    formState.messageInfo = messageInfo;
  };

  const handleOk = async () => {
    closeModal();
  };
</script>

<style lang="less" scoped>
  .message-content {
    margin-left: 80px;
    background: #f7f8fa;
    border-radius: 4px;
    border: 1px solid #e8ebf0;
    padding: 12px;

    .title,
    .content {
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      padding: 12px;
    }

    .title {
      margin-bottom: 8px;
    }
  }
</style>
