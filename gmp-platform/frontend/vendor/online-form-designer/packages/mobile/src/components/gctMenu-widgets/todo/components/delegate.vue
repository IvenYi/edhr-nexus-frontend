<template>
  <div class="ks-col ks-column overflow-hidden">
    <div class="bg-[#FFFFFF] rounded-8px p8px ks-row text-[12px] py12px px14px">
      <div class="ks-col ks-row-middle">
        <div
          class="delegate-tab py4px px10px text-center"
          :class="[delegateType === '1' && 'current']"
          @click="changeType('1')"
          >当前委托</div
        >
        <div
          class="delegate-tab py4px px10px text-center ml12px rounded-4px"
          :class="[delegateType === '2' && 'current']"
          @click="changeType('2')"
          >委托历史</div
        >
      </div>
      <div
        class="py5px px8px bg-[var(--van-primary-color)] rounded-4px text-[#FFFFFF] ks-row-middle"
        @click="initiateDelegateRef?.open()"
      >
        <i class="icon-fasong iconfont mr4px lh-16px"></i>
        发起委托
      </div>
    </div>
    <div class="ks-col overflow-y-auto py12px px14px">
      <van-list v-model:loading="loading" :finished="finished" finished-text="" @load="onLoad">
        <div
          v-for="item in delegateData"
          :key="item.id"
          class="mb10px bg-[#FFFFFF] py16px px12px rounded-8px"
        >
          <div class="title ks-row pb10px border-b-solid">
            <div class="ks-col text-[#474747]">
              <span class="text-[#212528] font-500 mr4px"> {{ item.delegateUserName }} </span>的委托
            </div>
            <div
              class="text-12px"
              :class="[
                item.status === 'STARTED' && 'blue-color',
                item.status === 'EXPIRED' && 'error-gct',
              ]"
            >
              {{ $t(`sys.process.delegation.${item.status}`) }}
            </div>
          </div>
          <div class="pt12px text-12px">
            <div class="mb8px">
              <div class="text-[#474747] mb2px">委托时间</div>
              <div>
                {{ dayjs(item.startAt).format('YYYY-MM-DD HH:mm') }}
                <span class="mx8px text-[#8F8F8F]">至</span>
                {{ dayjs(item.endAt).format('YYYY-MM-DD HH:mm') }}
              </div>
            </div>
            <div>
              <div class="text-[#474747] mb2px">委托流程</div>
              <div class="ks-row gap-8px" style="flex-wrap: wrap">
                <div
                  v-for="p in item.children?.filter((e, i) => i < 5)"
                  :key="p.processKey"
                  class="gct-custom-tag"
                >
                  {{ p.processName }}
                </div>
                <div v-if="item.children?.length > 5" class="primary-gct">......</div>
                <div
                  v-if="!item.children?.length"
                  class="gct-custom-tag"
                  :style="{
                    '--van-primary-color': '#0FBA84',
                  }"
                >
                  全部流程
                </div>
              </div>
            </div>
          </div>
          <div v-show="item.status !== 'EXPIRED'" class="mt12px text-right border-t-solid pt12px">
            <van-button
              v-show="item.status === 'STARTED'"
              plain
              type="danger"
              @click="onCancel(item.id)"
            >
              取消委托
            </van-button>
            <van-button v-show="item.status === 'NOT_STARTED'" plain @click="onDelete(item.id!)"
              >删除</van-button
            >
            <van-button plain type="primary" @click="onEdit(item)">编辑</van-button>
          </div>
        </div>
      </van-list>
      <div v-if="!delegateData.length" class="van-list__finished-text"> 暂无信息 </div>
    </div>
  </div>
  <initiateDelegate ref="initiateDelegateRef" @close="onClosePopup" />
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import initiateDelegate from './initiate-delegate.vue';
  import {
    getTaskDelegatePageList,
    deleteTaskDelegate,
    postTaskDelegateCancelById,
  } from '@mobile/apis/gct-platform/TaskDelegateController';
  import { TaskDelegateResponse } from '@mobile/apis/gct-platform/model';
  import dayjs from 'dayjs';
  import { showToast, showConfirmDialog } from 'vant';

  const initiateDelegateRef = ref();
  const delegateType = ref<string>('1');
  const loading = ref(false);
  const finished = ref(true);
  const delegateData = ref<Array<TaskDelegateResponse>>([]);
  const pageNo = ref(1);

  onMounted(() => {
    getData();
  });

  async function getData() {
    const res = await getTaskDelegatePageList({
      valid: delegateType.value === '1',
      pageNo: pageNo.value,
      pageSize: 20,
    });
    if (pageNo.value === 1) {
      delegateData.value = [];
    }
    finished.value = res?.pageNo >= res?.totalPage;
    loading.value = false;
    const data = (res?.data || []).map((e) => {
      return {
        ...e,
        children: e.appProcessList?.map((f) => f.processList).flat() || [],
      };
    });
    delegateData.value.push(...data);
  }

  function onLoad() {
    pageNo.value++;
    getData();
  }

  function changeType(type: string) {
    delegateType.value = type;
    pageNo.value = 1;
    getData();
  }

  function onClosePopup() {
    delegateData.value = [];
    pageNo.value = 1;
    getData();
  }

  function onEdit(data: any) {
    initiateDelegateRef.value?.open(data);
  }

  function onDelete(ids: string) {
    showConfirmDialog({
      message: '你确定要删除吗？',
    })
      .then(async () => {
        await deleteTaskDelegate({ ids });
        showToast('操作成功');
        pageNo.value = 1;
        getData();
      })
      .catch(() => {});
  }

  function onCancel(id: string) {
    showConfirmDialog({
      message: '确认要取消委托吗？',
    })
      .then(async () => {
        await postTaskDelegateCancelById({ id });
        showToast('操作成功');
        pageNo.value = 1;
        getData();
      })
      .catch(() => {});
  }
</script>
<style lang="less" scoped>
  .border-b {
    border-bottom: 1px dashed #f0f0f0;
  }
  .border-b-solid {
    border-bottom: 1px solid #f0f0f0;
  }
  .border-t-solid {
    border-top: 1px solid #f0f0f0;
  }
  .blue-color {
    color: #3168ec;
  }
  .primary-gct {
    color: var(--van-primary-color);
  }
  .delegate-tab {
    border: 1px solid #f7f8fa;
    border-radius: 4px;
    box-sizing: border-box;
    background-color: #f7f8fa;

    &.current {
      color: var(--van-primary-color);
      border-color: var(--van-primary-color);
      background-color: #f0f5fe;
    }
  }
</style>
