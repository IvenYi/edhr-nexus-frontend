<template>
  <van-list
    v-model:loading="loading"
    :finished="finished"
    :finished-text="list.length ? '没有更多信息' : '暂无信息'"
    @load="onLoad"
  >
    <van-cell v-for="item in list" :key="item.appId" :border="false" @click="handleClick(item)">
      <template #title>
        <div class="item-top">
          <div :class="['message-icon-box', item.supportProcess === 1 ? 'process' : '']">
            <i v-if="item.supportProcess !== 1" class="iconfont icon-yidongduan-xiaoxi"></i>
            <i v-else class="iconfont icon-a-liuchengbiaodan2"></i>
            <span class="unread-dot" v-if="!item.read"></span>
          </div>
          <div class="app-name mr-4px ks-col break-all">{{ item.appName }}</div>
        </div>
      </template>
      <template #label>
        <div class="content">
          <div :class="{ 'message-item-content': true, expanded: item.isExpanded }">
            {{ item.content }}
            <span
              v-if="item.supportProcess === 1 && item.supportJump && !isSandbox"
              class="primary-color cursor-pointer"
              @click="goProcessCenter()"
              >{{ $t('sys.goToProcessCenter') }}</span
            >
          </div>
          <div @click="toggleExpanded(item)" class="toggle-button" v-if="item.isOverflowed">
            <van-icon name="arrow-down" v-if="!item.isExpanded" />
            <van-icon name="arrow-up" v-else />
            {{ item.isExpanded ? '收起' : '展开' }}
          </div>
        </div>
        <div class="modify-time mt8px">
          {{ item.createTime }}
        </div>
      </template>
    </van-cell>
  </van-list>
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
  import { useEnv } from '@mobile/utils/useEnv';

  const { isSandbox } = useEnv();

  const { mitt } = useMitt();
  const router = useRouter();
  const props = defineProps<{
    type: string;
  }>();

  const list = ref<any>([]);
  const loading = ref(false);
  const finished = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const time = {
    startTime: dayjs().subtract(6, 'months').format('YYYY-MM-DD 00:00:00'),
    endTime: dayjs().format('YYYY-MM-DD 23:59:59'),
  };

  watch(props.type, () => {
    onLoad();
  });

  onMounted(() => {
    mitt.on('read-message-all', () => {
      list.value.forEach((item) => {
        item.read = 1;
      });
    });
    mitt.on('update-message-list', () => {
      list.value = [];
      pagination.current = 1;
      onLoad();
    });
    onLoad();
  });

  onBeforeUnmount(() => {
    mitt.off('read-message-all');
    mitt.off('update-message-list');
  });

  const textElements = ref([]);

  const hasUnreadMsg = computed(() => {
    return list.value.some((e) => !e.read);
  });

  const onLoad = async () => {
    loading.value = true;

    getInternalMessagePageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      status: props.type || 'ALL',
      ...time,
    }).then(async (res) => {
      const dataList = res!.data?.map((i) => {
        return {
          ...i,
          // content: i.content?.replace(
          //   '前往流程中心',
          //   '前往<span class="primary-color cursor-pointer" onClick="goProcessCenter()">流程中心</span>',
          // ),
        };
      });
      list.value = list.value.concat(dataList);

      await nextTick();
      const elements = document.querySelectorAll('.message-item-content');
      textElements.value = Array.from(elements);
      if (textElements.value.length > 0) {
        textElements.value.forEach((element, index) => {
          list.value[index].isOverflowed = element?.scrollHeight > element?.clientHeight;
          list.value[index].isExpanded = false;
        });
      }

      pagination.current++;
      loading.value = false;
      finished.value = pagination.current > res?.totalPage;
    });
  };

  const toggleExpanded = (item) => {
    item.isExpanded = !item.isExpanded;
  };

  const handleClick = (item) => {
    if (!item.read) {
      putInternalMessageReadById({ id: item.id }).then(() => {
        item.read = 1;
        // mitt.emit('update-message-count', -1);
      });
    }
  };

  const goProcessCenter = () => {
    router.push('/main/todo');
  };

  defineExpose({ hasUnreadMsg });
</script>
<style lang="less" scoped>
  .item-top {
    display: flex;
    align-items: center;
    font-style: normal;
    text-transform: none;

    .message-icon-box {
      position: relative;
      width: 28px;
      height: 28px;
      margin-right: 8px;
      padding-top: 2px;
      border-radius: 50%;
      background: #3168ec;
      color: #fff;
      text-align: center;

      &.process {
        background: #31b4ec;
      }

      .iconfont {
        font-size: 14px;
        line-height: 26px;
      }

      .unread-dot {
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff792e;
      }
    }

    .app-name {
      flex: 1;
      color: #212528;
      font-size: 16px;
      font-weight: 500;
      word-break: break-all;
      // overflow: hidden;
      // text-overflow: ellipsis;
      // white-space: nowrap;
    }

    .modify-time {
      margin-left: auto;
      color: #c3c3c3;
      font-size: 14px;
      font-weight: 400;
    }
  }

  .toggle-button {
    float: right;
    color: #3168ec;
    font-size: 14px;
    font-weight: 400;
  }

  .message-item-content {
    display: -webkit-box;
    overflow: hidden;
    color: #797a7d;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
    text-align: left;
    text-overflow: ellipsis;
    text-transform: none;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    white-space: pre-line;
  }

  .expanded {
    -webkit-line-clamp: initial;
  }

  :deep(.van-cell) {
    padding: 14px 10px;
    border-radius: 8px;
    background: #fff;

    & + .van-cell {
      margin-top: 10px;
    }

    .van-cell__label {
      margin-top: 8px;
    }
  }
</style>
