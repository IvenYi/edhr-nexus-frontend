<template>
  <div style="padding: 16px">
    <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.printDesigner.labelName') }}</a-col>
      <a-col class="desc-value" :span="12">{{ labelInfo?.name }}</a-col>
    </a-row>
    <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.printDesigner.labelKey') }}</a-col>
      <a-col class="desc-value" :span="12">
        <copy-module-key :moduleKey="labelInfo?.key" />
      </a-col>
    </a-row>
    <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.creator') }}</a-col>
      <a-col class="desc-value" :span="12">{{ labelInfo?.createUserName }}</a-col>
    </a-row>
    <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.createTime') }}</a-col>
      <a-col class="desc-value" :span="12">{{ labelInfo?.createTime }}</a-col>
    </a-row>
    <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.updatePerson') }}</a-col>
      <a-col class="desc-value" :span="12">{{ labelInfo?.modifyUserName }}</a-col>
    </a-row>
    <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.updateTime') }}</a-col>
      <a-col class="desc-value" :span="12">{{ labelInfo?.modifyTime }}</a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup name="panel-page">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { labelInfo } from '../../hooks/usePage';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .desc-label {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #666666;
    line-height: 28px;
  }
  .desc-value {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 28px;
    text-align: right;
  }
  .tab-wrap {
    padding: 0 12px;
  }
  .page-event-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
