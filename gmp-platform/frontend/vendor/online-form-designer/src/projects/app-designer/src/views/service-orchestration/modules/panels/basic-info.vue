<template>
  <div class="so-basic-info">
    <div class="so-basic-info__title">{{ t('基础信息') }}</div>
    <div class="p-16px">
      <a-descriptions
        :column="1"
        :colon="false"
        :labelStyle="{
          color: '#666',
        }"
        :contentStyle="{
          color: '#333',
        }"
      >
        <a-descriptions-item label="服务编排名称">{{ soResponse.name }}</a-descriptions-item>
        <a-descriptions-item label="服务编排KEY">
          <copy-module-key :moduleKey="soResponse?.key" />
        </a-descriptions-item>
        <a-descriptions-item label="版本">
          {{ soResponse.orchestrationVersion?.version }}
        </a-descriptions-item>
        <a-descriptions-item label="描述">{{ soResponse.description }}</a-descriptions-item>
        <a-descriptions-item label="创建人">{{ soResponse.createUserName }}</a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ soResponse.createTime }}</a-descriptions-item>
        <a-descriptions-item label="修改人">
          {{ soResponse.modifyUserName }}
        </a-descriptions-item>
        <a-descriptions-item label="修改时间">
          {{ soResponse.modifyTime }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useSOInstance } from '../../hooks/useSOInstance';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const { t } = useI18n();

  const { soResponse } = useSOInstance();
</script>

<style lang="less" scoped>
  .so-basic-info {
    height: 100%;
    width: 100%;
    background: #fff;

    &__title {
      font-weight: bold;
      color: #333;
      height: 48px;
      line-height: 48px;
      text-align: center;
      border-bottom: 1px solid #d9d9d9;
    }

    .ant-descriptions :deep(.ant-descriptions-item-content) {
      justify-content: flex-end;
    }
  }
</style>
