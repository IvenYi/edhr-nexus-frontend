<template>
  <scroll-list
    class="h-full bg-white overflow-auto"
    :loader="loaderFn"
    v-slot="{ list }: { list: ProcessTaskDoneResponse[] }"
  >
    <div class="bg-white pl-20px pr-20px h-full">
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
          <span class="color-[#C3C3C3]">{{ item.taskEndTime }}</span>
        </div>
        <div class="color-[#5A5F6B] mt-12px">
          <span>{{ item.materialNo }}</span>
          <span v-show="item.materialNo && item.productName" class="color-[#CACFD8] ml-4px mr-4px"
            >-</span
          >
          <span>{{ item.productName }}</span>
          <span v-show="item.productCode" class="color-[#434855]">[{{ item.productCode }}]</span>
        </div>
      </div>
    </div>
  </scroll-list>
</template>

<script setup lang="ts">
  import { getProcessTaskDonePageList } from '@mobile/apis/gct-apaas/ProcessTaskDoneController';
  import type { ProcessTaskDoneResponse } from '@mobile/apis/gct-apaas/model';
  import ScrollList from '@mobile/views/edhr/_comps_/scroll-list/index.vue';
  import TaskTypeTag from '@mobile/views/edhr/_comps_/status-tag/task-type-tag.vue';
  import MaterialStatusTag from '@mobile/views/edhr/_comps_/status-tag/material-status-tag.vue';
  import { MaterialStatusEnum } from './enums';
  import { useRouter } from 'vue-router';

  import { GctPopup } from '@mobile/utils/popup';
  import { MobileEdhrFillModal, MobileSingleFormFillModal } from '@gct/nocode-mobile-render';

  const router = useRouter();

  const props = defineProps<{
    query?: any;
  }>();

  const loaderFn = (params: any) => {
    console.log('loaderFn', params);
    return getProcessTaskDonePageList({
      ...params,
      ...props.query,
    });
  };
  const handleClick = (record: ProcessTaskDoneResponse) => {
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
          isViewPage: true,
          needAutoSave: false,
          pageType: '',
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
