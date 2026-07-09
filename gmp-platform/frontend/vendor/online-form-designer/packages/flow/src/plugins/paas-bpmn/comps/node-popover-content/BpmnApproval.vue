<template>
  <div class="content py16px">
    <div
      v-if="data.statusMsg === FlowNodeInstStatus.RUNNING"
      class="ks-row-middle text-[#797A7D] mb16px px16px"
    >
      <div
        class="ks-col text-center cursor-pointer"
        :class="[activeTab === '1' && 'text-[#3168EC]']"
        @click="activeTab = '1'"
      >
        {{ $t('sys.process.unapproved') }}（{{ data.unApprovedUsers?.length ?? 0 }}）
      </div>
      <a-divider type="vertical" :orientationMargin="12" style="height: 18px; top: 0" />
      <div
        class="ks-col text-center cursor-pointer"
        :class="[activeTab === '2' && 'text-[#3168EC]']"
        @click="activeTab = '2'"
      >
        {{ $t('sys.process.approved') }}（{{ data.approvedUsers?.length ?? 0 }}）
      </div>
    </div>
    <div v-if="data.statusMsg === FlowNodeInstStatus.PENDING" class="px16px mb8px text-[#212528]">
      {{ $t('sys.process.approver') }}
    </div>
    <div
      :style="{
        height: userHeight ? `${userHeight}px` : 'auto',
      }"
    >
      <UserList :userList="userList" :tag="data?.congifString" :modelKey="data.modelKey" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import UserList from '../user-list.vue';
  import { FlowNodeInstStatus } from '../../../../enums';

  const props = defineProps<{
    data: any;
  }>();

  const activeTab = ref(props.data?.statusMsg === FlowNodeInstStatus.COMPLETED ? '2' : '1');
  const userList = computed(() => {
    const { approvedUsers, unApprovedUsers } = props.data;
    return (
      (activeTab.value === '1' ? unApprovedUsers : approvedUsers)?.map((e) => {
        return {
          avatar: e.middle,
          username: e.left,
          time: e.right,
        };
      }) || []
    );
  });

  const userHeight = computed(() => {
    if (props.data?.statusMsg === FlowNodeInstStatus.RUNNING) {
      const { approvedUsers, unApprovedUsers } = props.data;
      let len =
        (approvedUsers?.length > unApprovedUsers?.length
          ? approvedUsers.length
          : unApprovedUsers?.length) || 0;
      if (len > 10) len = 10;
      return 40 * len + 8 * (len - 1);
    }
    return 0;
  });
</script>
<style lang="less" scoped></style>
