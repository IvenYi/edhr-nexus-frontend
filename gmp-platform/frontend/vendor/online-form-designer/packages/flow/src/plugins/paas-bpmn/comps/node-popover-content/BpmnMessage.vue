<template>
  <div class="content py16px">
    <div class="px16px">
      <div v-if="data.statusMsg === FlowNodeInstStatus.COMPLETED" class="text-[#666666] mb12px">
        {{ $t('sys.process.bpmnMessageNodeTip') }}
      </div>
      <div class="ks-row text-[#212528]" style="column-gap: 4px">
        <div>{{ $t('sys.menu.MessageTemplate') }}: </div>
        <div class="ell ks-col break-all" :title="data.msgTmplName">
          {{ data.msgTmplName }}
        </div>
      </div>
      <div
        v-if="data.statusMsg === FlowNodeInstStatus.COMPLETED"
        class="ks-row-start text-[#212528] mt12px"
        style="column-gap: 4px"
      >
        <div>{{ $t('sys.message.pushResult') }}: </div>
        <div class="ell ks-col">
          <div v-if="data.messages?.SUCCEED" class="text-[#309C41] ell">
            {{ $t('sys.pageDesigner.numOfSuccesses', { num: data.messages?.SUCCEED }) }}
          </div>
          <div v-if="data.messages?.FAILURE" class="text-[#F54547] ell">
            {{ $t('sys.pageDesigner.numOfError', { num: data.messages?.FAILURE }) }}
          </div>
        </div>
        <div class="text-[12px] text-[#8F8F8F]" style="line-height: 24px">
          {{ data.finishTime }}
        </div>
      </div>
      <div class="text-[#212528] mt12px">
        {{ $t('sys.process.messagePusher') }}
      </div>
      <div class="mt9px mx--16px">
        <UserList :userList="userList" :tag="data?.congifString" :modelKey="data.modelKey" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import UserList from '../user-list.vue';
  import { FlowNodeInstStatus } from '../../../../enums';

  const props = defineProps<{
    data: any;
  }>();

  const userList = computed(() => {
    const { approvedUsers } = props.data;
    return (
      approvedUsers?.map((e) => {
        return {
          avatar: e.middle,
          username: e.left,
          time: e.right,
        };
      }) || []
    );
  });
</script>
<style lang="less" scoped></style>
