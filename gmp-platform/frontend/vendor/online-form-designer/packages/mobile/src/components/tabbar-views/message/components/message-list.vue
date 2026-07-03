<template>
  <van-list
    v-model:loading="loading"
    class="p-3 md:p-6"
    style="min-height: calc(100% - 4rem)"
    :finished="isFinished"
    @load="handleQueryList"
  >
    <div
      v-for="row in rowList"
      :key="row.id"
      class="mb-3 md:mb-4 p-3 bg-white rounded-lg active:bg-[#E8EBF0]"
      @click="handleMessageClick(row)"
    >
      <!-- message header -->
      <div class="flex items-center">
        <!-- icon -->
        <div class="flex-shrink-0 relative z-0 w-8 h-8">
          <img class="w-full h-full" :src="row.supportProcess !== 1 ? svgBell : svgStamp" />
          <dot
            v-if="!row.read"
            class="absolute z-10 -top-1 -right-1 w-3 h-3 border-2 border-solid border-white rounded-full bg-[#F54547]"
          />
        </div>
        <!-- title -->
        <div class="flex-grow ml-3 mr-5 text-black font-600 truncate">
          {{ row.appName }}
        </div>
        <!-- time -->
        <div class="flex-shrink-0 text-xs text-gray-500">
          {{ row.createTime }}
        </div>
      </div>

      <!-- message content -->
      <div class="mt-2 py-1 text-base text-[#5A5F6B] whitespace-pre-line">
        {{ row.content }}
      </div>

      <!-- detail -->
      <div
        v-if="row.supportProcess === 1 && row.supportJump"
        class="primary-color text-sm text-right cursor-pointer"
      >
        {{ $t('sys.viewDetails') }}
      </div>
    </div>
  </van-list>

  <Empty
    v-if="!loading && !rowList.length"
    tip="暂无消息"
    class="absolute z-0 inset-0 bg-white md:bg-transparent"
  />

  <!-- 仅展示半年 -->
  <div class="relative z-10 flex justify-center">
    <van-divider class="w-2/3" contentPosition="center">
      <span class="text-sm">{{ $t('sys.menu.messageTips') }}</span>
    </van-divider>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import {
    getInternalMessagePageList,
    putInternalMessageReadById,
  } from '/@/apis/gct-platform/InternalMessageController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
  import Empty from '@mobile/components/common/empty.vue';
  import { MessageType } from '@gct/runtime';
  import svgBell from '@mobile/assets/svg-icons/icon-message-bell.svg';
  import svgStamp from '@mobile/assets/svg-icons/icon-message-stamp.svg';
  import type { InternalMessageResponse } from '@mobile/apis/gct-platform/model';

  const { mitt } = useMitt();
  const router = useRouter();

  const props = defineProps<{
    type: MessageType;
  }>();

  const rowList = ref<InternalMessageResponse[]>([]);
  const loading = ref(false);
  const isFinished = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const timeQuery = {
    startTime: dayjs().subtract(6, 'months').format('YYYY-MM-DD 00:00:00'),
    endTime: dayjs().format('YYYY-MM-DD 23:59:59'),
  };

  const handleQueryList = async () => {
    loading.value = true;

    getInternalMessagePageList({
      ...timeQuery,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      status: props.type.toUpperCase(),
    })
      .then(async (res) => {
        if (!res) return;
        const { data, totalPage } = res;
        rowList.value = rowList.value.concat(data || []);
        isFinished.value = pagination.current > totalPage;
        pagination.current++;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const handleMessageClick = (row: InternalMessageResponse) => {
    if (!row.read) {
      putInternalMessageReadById({ id: row.id! }).then(() => {
        row.read = 1;
        // mitt.emit('update-message-count', -1);
      });
    }

    // 审批详情跳转
    if (row.supportProcess && row.supportJump) {
      router.push('/main/todo');
    }
  };

  watch(() => props.type, handleQueryList);

  onMounted(() => {
    mitt.on('read-message-all', () => {
      rowList.value.forEach((item) => {
        item.read = 1;
      });
    });
    mitt.on('update-message-list', () => {
      rowList.value = [];
      pagination.current = 1;
      handleQueryList();
    });
    handleQueryList();
  });

  onBeforeUnmount(() => {
    mitt.off('read-message-all');
    mitt.off('update-message-list');
  });
</script>
