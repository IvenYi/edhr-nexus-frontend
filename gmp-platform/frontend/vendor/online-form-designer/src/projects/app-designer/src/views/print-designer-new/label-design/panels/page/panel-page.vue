<template>
  <div class="panel-page-wrapper">
    <div class="panel-page-title">{{ t('sys.pageDesigner.pageProp') }}</div>
    <div class="panel-page-con">
      <a-row>
        <a-col class="desc-label" :span="8">{{ t('sys.printDesigner.labelName') }}</a-col>
        <a-col class="desc-value" :span="16">{{ labelInfo?.name }}</a-col>
      </a-row>
      <!-- <a-row>
      <a-col class="desc-label" :span="12">{{ t('sys.printDesigner.labelKey') }}</a-col>
      <a-col class="desc-value" :span="12">
        <copy-module-key :moduleKey="labelInfo?.key" />
      </a-col>
    </a-row> -->
      <a-row>
        <a-col class="desc-label" :span="8">{{ t('sys.creator') }}</a-col>
        <a-col class="desc-value" :span="16">{{ labelInfo?.createUserName }}</a-col>
      </a-row>
      <a-row>
        <a-col class="desc-label" :span="8">{{ t('sys.createTime') }}</a-col>
        <a-col class="desc-value" :span="16">{{ labelInfo?.createTime }}</a-col>
      </a-row>
      <a-row>
        <a-col class="desc-label" :span="8">{{ t('sys.updatePerson') }}</a-col>
        <a-col class="desc-value" :span="16">{{ labelInfo?.modifyUserName }}</a-col>
      </a-row>
      <a-row>
        <a-col class="desc-label" :span="8">{{ t('sys.updateTime') }}</a-col>
        <a-col class="desc-value" :span="16">{{ labelInfo?.modifyTime }}</a-col>
      </a-row>
    </div>
  </div>
</template>

<script lang="ts" setup name="panel-page">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { labelInfo } from '../../hooks/usePage';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .panel-page-wrapper {
    // padding: 16px;
    .panel-page-title {
      font-weight: bold;
      height: 42px;
      line-height: 42px;
      text-align: center;
      border-bottom: 1px solid #eaeaea;
    }
    .panel-page-con {
      padding: 12px 16px;
    }
  }
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
