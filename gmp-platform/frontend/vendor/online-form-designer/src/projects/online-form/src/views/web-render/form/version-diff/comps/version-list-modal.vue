<template>
  <div class="bg-[#F7F8FA] h100% pt8px pr4px pl9px overflow-auto">
    <Timeline :items="options">
      <template #default="{ item }">
        <div class="bg-[#fff] rounded-4px p16px item">
          <div class="item-title">
            <div>{{ `${$t('sys.webRender.version')}：` }}{{ item.version }}</div>
            <div class="time">{{ item.createTime }}</div>
          </div>
          <div class="item-remark">
            {{ `${$t('sys.edhr.updateRemark')}：` }}{{ item.updateRemark ?? '--' }}
          </div>
          <div class="item-user">
            <UserAvatar :userId="item.createUserId" />
          </div>
        </div>
      </template>
    </Timeline>
  </div>
</template>
<script setup lang="ts">
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import Timeline from '/@/components/Timeline/timeline.vue';
  import UserAvatar from './user-avatar.vue';

  defineProps<{
    options: OnlineFormTmplResponse[];
  }>();
</script>
<style lang="less" scoped>
  :deep(.gct-timeline) {
    .ant-timeline-item-content {
      border: 0;
    }
    .ant-timeline-item-head {
      background-color: transparent;
    }
  }

  .item {
    color: #1a1d23;
    display: flex;
    flex-direction: column;
    row-gap: 16px;

    &-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .time {
        font-size: 12px;
        font-weight: normal;
        color: #8b8b8b;
      }
    }
  }
</style>
