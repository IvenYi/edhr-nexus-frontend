<template>
  <div class="lo-basic-info">
    <div class="pl-16px pr-16px">
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
        <a-descriptions-item :label="t('逻辑编排名称')">{{
          loDataObject.title
        }}</a-descriptions-item>
        <a-descriptions-item label="逻辑编排KEY">{{ loDataObject.name }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.createUser')">{{
          loDataObject.createBy
        }}</a-descriptions-item>
        <a-descriptions-item :label="t('sys.createTime')">
          {{ dayjs(loDataObject.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('sys.updatePerson')">
          {{ loDataObject.modifyBy }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('sys.updateTime')">
          {{ dayjs(loDataObject.modifyTime).format('YYYY-MM-DD HH:mm:ss') }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useLo } from '../../hooks/useLo';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dayjs from 'dayjs';

  const { t } = useI18n();
  const { loDataObject } = useLo();
</script>

<style lang="less" scoped>
  .lo-basic-info {
    height: 100%;
    background: #fff;

    .ant-descriptions :deep(.ant-descriptions-item-content) {
      justify-content: flex-end;
    }
  }
</style>
