<template>
  <scroll-list
    class="h-full bg-white overflow-auto"
    :loader="loaderFn"
    v-slot="{ list }: { list: ProcessTaskTodoResponse[] }"
  >
    <div class="bg-white pl-20px pr-20px">
      <div
        v-for="item in list"
        :key="item.id"
        class="text-14px pt-16px pb-16px task-item"
        @click="handleClick(item)"
      >
        <div class="flex items-center justify-between">
          <span>
            <!-- <TaskTypeTag :code="item.taskType" /> -->
            <MaterialStatusTag :code="item.materialStatus" />
            <span class="font-bold ml-8px">{{ item.ofTmplName }}</span>
            <span class="color-[#5A5F6B] ml-8px">{{ item.ofCode }}</span>
          </span>
          <span class="color-[#C3C3C3]">{{ item.taskStartTime }}</span>
        </div>
        <div class="color-[#5A5F6B] mt-12px">
          <span>{{ item.materialNo }}</span>
          <span v-show="item.materialN && item.productName" class="color-[#CACFD8] ml-4px mr-4px"
            >-</span
          >
          <span>{{ item.productName }}</span>
          <span v-show="item.productCode" class="color-[#434855]">[{{ item.productCode }}]</span>
          <span>需要您进行审核</span>
        </div>
      </div>
    </div>
  </scroll-list>
</template>

<script setup lang="ts">
  import { getProcessTaskTodoPageList } from '@mobile/apis/gct-apaas/ProcessTaskTodoController';
  import type { ProcessTaskTodoResponse } from '@mobile/apis/gct-apaas/model';
  import ScrollList from '@mobile/views/edhr/_comps_/scroll-list/index.vue';
  import TaskTypeTag from '@mobile/views/edhr/_comps_/status-tag/task-type-tag.vue';
  import MaterialStatusTag from '@mobile/views/edhr/_comps_/status-tag/material-status-tag.vue';
  import { useRouter } from 'vue-router';
  import { MaterialStatusEnum } from './enums';
  import { GctPopup } from '@mobile/utils/popup';
  import { MobileEdhrFillModal, MobileSingleFormFillModal } from '@gct/nocode-mobile-render';

  const router = useRouter();

  const props = defineProps<{
    query?: any;
  }>();

  const loaderFn = (params: any) => {
    console.log('loaderFn', params);
    return getProcessTaskTodoPageList({
      ...params,
      ...props.query,
    });
  };

  const handleClick = (record: ProcessTaskTodoResponse) => {
    if (record.edhrInstanceId && record.materialStatus !== MaterialStatusEnum.PRODUCT_RELEASE) {
      GctPopup.open(MobileEdhrFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          materialNo: record.materialNo,
          ofTmplId: record.docOutlineId,
          ofInstanceId: record.ofInstanceId,
          viewPageLimit: false,
          isViewPage: false,
          needAutoSave: false,
          pageType: 'document-task-audit',
        },
        onOk: async (payload: { instId: string }, done: Function) => {},
      });
    } else {
      GctPopup.open(MobileSingleFormFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          selfId: record.ofInstanceId,
          isViewPage: false,
          needAutoSave: false,
        },
        onOk: async (payload: { instId: string }, done: Function) => {},
      });
    }
  };
</script>

<style scoped lang="less">
  .task-item:not(:last-child) {
    border-bottom: 1px solid #f7f8fa;
  }
</style>
