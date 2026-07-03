<template>
  <div class="h-full">
    <div class="panel-title">{{ t('sys.pageDesigner.globalSetting') }}</div>
    <div class="global-setting">
      <div class="p-16px">
        <a-form layout="vertical">
          <a-form-item :label="t('sys.nameOfSth', { sth: t('sys.process.index') })">
            {{ processResponse.name }}
          </a-form-item>
          <a-form-item :label="t('sys.keyOfSth', { sth: t('sys.process.index') })">
            {{ processResponse.key }}
          </a-form-item>
          <a-form-item :label="t('sys.process.refModel')">
            {{ `${processResponse.tableMetaName}【${processResponse.tableMetaKey}】` }}
          </a-form-item>
          <a-form-item :label="t('sys.description')">
            {{ processVersionInfo.description }}
          </a-form-item>
        </a-form>
      </div>

      <a-form ref="formRef" :model="globalSettingDataObject" autocomplete="off" layout="vertical">
        <bpmn-form-items :forms="(globalSettingDataObject as any)" :required="false" />
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBpmn } from '../../hooks/useBpmn';
  import BpmnFormItems from '../components/bpmn-form-items.vue';

  const { t } = useI18n();
  const { processResponse, processVersionInfo, globalSettingDataObject } = useBpmn();
</script>

<style lang="less" scoped>
  .panel-title {
    height: 44px;
    line-height: 44px;
    text-align: center;
    font-weight: bold;
    border-bottom: 1px solid #eaeaea;
    background-color: #fff;
  }
  .global-setting {
    height: calc(100% - 46px);
    background: #fff;
    overflow-y: auto;

    .ant-descriptions :deep(.ant-descriptions-item-content) {
      justify-content: flex-end;
    }
  }
</style>
