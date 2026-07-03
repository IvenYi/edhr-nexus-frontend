<template>
  <div class="_absolute _z-0 _inset-0 flex flex-col overflow-hidden">
    <!-- tabs -->
    <div class="flex-shirk-0 p-4 md:p-6">
      <ButtonTabs
        :tabs="DELEGATE_TABS"
        :activeTab="activeDelegationType"
        @change="handleTabChange"
      />
    </div>

    <!-- list -->
    <div class="flex-grow px-3 overflow-y-auto">
      <van-list v-model:loading="isLoading" :finished="isFinished" @load="handleLoad">
        <div
          v-for="row in rowList"
          :key="row.id"
          class="relative z-0 mb-3 md:mb-4 px-3 py-4 bg-white rounded-lg"
        >
          <!-- header -->
          <div class="flex items-center">
            <div class="flex-grow mr-2 text-lg font-500 text-black truncate">
              {{ getTitle(row) }}
            </div>
            <div class="flex-shrink-0" :class="{ hidden: activeDelegationType !== '1' }">
              <StatusTag v-bind="{ ...getStatusTypeAndText(row.status!) }" />
            </div>
          </div>

          <!-- print -->
          <div
            class="justify-center items-center absolute z-10 top-8 right-4 w-20 h-20 -rotate-15"
            :class="[
              activeDelegationType === '2' ? 'flex' : 'hidden',
              row.status === 'EXPIRED' ? 'grayscale' : '',
            ]"
          >
            <img class="absolute z-0 inset-0" :src="svgStatusPrint" />
            <div class="text-[#F5454740] text-sm font-900">
              {{ getStatusTypeAndText(row.status!).text }}
            </div>
          </div>

          <!-- body -->
          <div class="mt-1">
            <Description label="开始时间">
              {{ formatDatetime(row.startAt!) }}
            </Description>

            <Description label="结束时间">
              {{ formatDatetime(row.endAt!) }}
            </Description>

            <Description label="代理人">
              {{ row.delegateUserName }}
            </Description>

            <!-- <Description label="委托流程">
              <div class="ks-row gap-8px flex-wrap">
                <div
                  v-for="p in row.children?.filter((e, i) => i < 5)"
                  :key="p.processKey"
                  class="gct-custom-tag"
                >
                  {{ p.processName }}
                </div>
                <div v-if="row.children?.length > 5" class="primary-gct">......</div>
                <div
                  v-if="!row.children?.length"
                  class="gct-custom-tag"
                  :style="{
                    '--van-primary-color': '#0FBA84',
                  }"
                >
                  全部流程
                </div>
              </div>
            </Description> -->
          </div>

          <div v-show="row.status !== 'EXPIRED'" class="mt-2 text-right">
            <van-button plain size="small" class="ml-3 w-20" @click="handleEdit(row)">
              编辑
            </van-button>
            <van-button
              v-show="row.status === 'STARTED'"
              plain
              size="small"
              type="danger"
              class="ml-3 w-20"
              @click="handleCancel(row.id!)"
            >
              撤销
            </van-button>
            <van-button
              v-show="row.status === 'NOT_STARTED'"
              plain
              size="small"
              class="ml-3 w-20"
              @click="handleDelete(row.id!)"
            >
              删除
            </van-button>
          </div>
        </div>
      </van-list>

      <Empty
        v-if="!isLoading && !rowList.length"
        :tip="`暂无${DELEGATE_TABS.find((t) => t.key === activeDelegationType)!.name}`"
        style="height: calc(100vh - 20rem)"
      />
    </div>
  </div>

  <!-- fixed button -->
  <div
    class="flex justify-center items-center fixed z-20 right-4 bottom-24 md:bottom-12 w-16 h-16 rounded-2xl shadow-lg"
    :class="extraTheme.shadow"
    @click="delegateFormPopupRef?.open()"
  >
    <div class="absolute -z-10 inset-0">
      <img class="w-full h-full" :src="extraTheme.bgSvg" />
    </div>
    <div class="text-center text-white">
      <img class="w-6 h-6" :src="svgPlane" />
      <div class="-mt-1 text-xs font-500">发起委托</div>
    </div>
  </div>

  <DelegateFormPopup ref="delegateFormPopupRef" @close="handlePopupClose" />
</template>
<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import DelegateFormPopup from './delegate-form-popup.vue';
  import {
    getTaskDelegatePageList,
    deleteTaskDelegate,
    postTaskDelegateCancelById,
  } from '@mobile/apis/gct-platform/TaskDelegateController';
  import { type Process, type TaskDelegateResponse } from '@mobile/apis/gct-platform/model';
  import dayjs from 'dayjs';
  import { showToast, showConfirmDialog } from 'vant';
  import { ButtonTabs } from '@mobile/components/common/button-tabs';
  import Description from '@mobile/components/common/description.vue';
  import Empty from '@mobile/components/common/empty.vue';
  import StatusTag from '@mobile/components/common/status-tag/index.vue';
  import { StatusType } from '@mobile/components/common/status-tag';
  import svgStatusPrint from '@mobile/assets/svg-icons/icon-todo-delegate-status-print.svg';
  import svgPlane from '@mobile/assets/svg-icons/icon-todo-delegate-plane.svg';
  import svgCreateBlue from '@mobile/assets/svg-icons/icon-todo-delegate-create-blue.svg';
  import svgCreateGreen from '@mobile/assets/svg-icons/icon-todo-delegate-create-green.svg';
  import { useplatSetting } from '@mobile/utils/useplatSetting';

  interface IDelegate extends TaskDelegateResponse {
    children: Process[];
  }

  const STATUS_TYPE_MAP: Record<string, StatusType> = {
    STARTED: StatusType.primary,
    EXPIRED: StatusType.danger,
  };

  const DELEGATE_TABS = [
    { key: '1', name: '当前委托' },
    { key: '2', name: '委托历史' },
  ];

  const delegateFormPopupRef = ref();
  const activeDelegationType = ref('1');
  const pageNo = ref(1);
  const isLoading = ref(false);
  const isFinished = ref(false);
  const rowList = ref<IDelegate[]>([]);

  const { themeSetting } = useplatSetting();

  const extraTheme = computed(() => {
    return {
      blue: { bgSvg: svgCreateBlue, shadow: 'shadow-blue-500/20' },
      green: { bgSvg: svgCreateGreen, shadow: 'shadow-teal-500/20' },
    }[themeSetting.primaryColor === '#026AC8' ? 'blue' : 'green'];
  });

  const getStatusTypeAndText = (status: string) => {
    const type: StatusType = STATUS_TYPE_MAP[status] || StatusType.info;
    const text: string = $t(`sys.process.delegation.${status}`);
    return { type, text };
  };

  const getTitle = (row: IDelegate) => {
    const names = (row.appProcessList || [])
      .map((ap) => ap.processList || [])
      .flat()
      .map((p) => p?.processName || '');

    return names.length
      ? names.length === 1
        ? `「${names[0]}」`
        : `「${names[0]}」等${names.length}个流程的委托`
      : '全部';
  };

  const formatDatetime = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  };

  const handleQueryList = async () => {
    isLoading.value = true;

    if (pageNo.value === 1) {
      rowList.value = [];
      isFinished.value = false;
    }

    const res: any = await getTaskDelegatePageList({
      valid: activeDelegationType.value === '1',
      pageNo: pageNo.value,
      pageSize: 20,
    });

    const data = (res?.data || []).map((row: IDelegate) => {
      return {
        ...row,
        children: (row.appProcessList?.map((f) => f.processList).flat() || []) as Process[],
      };
    });
    rowList.value.push(...data);
    isFinished.value = res?.pageNo >= res?.totalPage;
    isLoading.value = false;
  };

  const handleLoad = () => {
    handleQueryList();
    pageNo.value++;
  };

  const handleTabChange = (type: string) => {
    activeDelegationType.value = type;
    pageNo.value = 1;
    handleQueryList();
  };

  const handlePopupClose = () => {
    rowList.value = [];
    pageNo.value = 1;
    handleQueryList();
  };

  const handleEdit = (row: TaskDelegateResponse) => {
    delegateFormPopupRef.value?.open(row);
  };

  const handleDelete = (id: string) => {
    showConfirmDialog({
      message: '你确定要删除吗？',
    })
      .then(async () => {
        await deleteTaskDelegate({ ids: id });
        showToast('操作成功');
        pageNo.value = 1;
        handleQueryList();
      })
      .catch(() => {});
  };

  const handleCancel = (id: string) => {
    showConfirmDialog({
      title: '提示',
      message: '确认要撤销委托吗？',
    })
      .then(async () => {
        await postTaskDelegateCancelById({ id });
        showToast('操作成功');
        pageNo.value = 1;
        handleQueryList();
      })
      .catch(() => {});
  };

  onMounted(() => {
    handleQueryList();
  });
</script>
