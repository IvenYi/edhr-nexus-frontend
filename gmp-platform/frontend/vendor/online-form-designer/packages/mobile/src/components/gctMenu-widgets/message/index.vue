<template>
  <div class="gct-mobile-message" :style="{ '--height': height }">
    <div class="py9px text-[16px] text-center relative">
      <!-- <div>{{ console.log('model', model) }}</div> -->
      <div v-if="displayContent.length > 1" class="text-[#212528] font-500">{{
        model?.data?.name || '消息中心'
      }}</div>
      <div v-else class="text-[#212528] font-500">{{
        $t(`sys.menu.message.${displayContent[0]}`)
      }}</div>
      <div class="primary-color text-right setRead" @click="readAll">{{ '全部标为已读' }}</div>
    </div>
    <div v-if="displayContent.length > 1" class="gct-mobile-message-filter mt8px mb10px">
      <div class="filter-button" @click="changeTab('ALL')">
        <span :class="{ 'primary-color': activeTab === 'ALL' }">
          <i class="iconfont icon-quanbuxinxi mr8px"></i>
          {{ $t(`sys.menu.message.${MessageType.ALL}`) }}
        </span>
      </div>
      <van-divider vertical :style="{ '--van-divider-border-color': '#D9D9D9' }" />
      <div class="filter-button" @click="changeTab('UNREAD')">
        <span :class="{ 'primary-color': activeTab === 'UNREAD' }">
          <i
            class="iconfont icon-weishibieyouxiang mr8px"
            :class="[dataListRef?.hasUnreadMsg && 'unread-icon']"
          ></i>
          {{ $t(`sys.menu.message.${MessageType.UNREAD}`) }}
        </span>
      </div>
    </div>
    <div class="gct-mobile-message-content ks-col">
      <DataList ref="dataListRef" class="message-list" :type="activeTab" :key="activeTab" />
    </div>
    <div class="message-tips">{{ $t('sys.menu.messageTips') }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { putInternalMessageReadAll } from '/@/apis/gct-platform/InternalMessageController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import DataList from './list.vue';
  import { MessageType } from '@gct/runtime';

  // withDefaults(
  //   defineProps<{
  //     displayContent?: MessageType[];
  //   }>(),
  //   {
  //     displayContent: () => [MessageType.ALL, MessageType.UNREAD],
  //   },
  // );

  const props = defineProps<{
    model: object;
  }>();

  const { mitt } = useMitt();
  const dataListRef = ref();
  const activeTab = ref('ALL');

  const displayContent = computed(() => {
    return props.model?.data?.displayContent || [MessageType.ALL, MessageType.UNREAD];
  });

  const height = computed(() => {
    return props.model?.data?.height || 'calc(100vh - 16vw)';
  });

  watch(
    () => displayContent.value.length,
    (val) => {
      if (val === 1) {
        activeTab.value = displayContent.value[0]?.toUpperCase();
      } else {
        activeTab.value = 'ALL';
      }
    },
  );

  const readAll = () => {
    putInternalMessageReadAll().then(() => {
      mitt.emit('read-message-all');
      // mitt.emit('update-message-count');
    });
  };

  const changeTab = (tab) => {
    activeTab.value = tab;
  };
</script>
<style scoped lang="less">
  .gct-mobile-message {
    // background: #fff;
    display: flex;
    flex-direction: column;
    height: var(--height);

    .van-nav-bar {
      // background: #fafafa;
    }

    .setRead {
      position: absolute;
      top: 8px;
      right: 0;
    }

    &-filter {
      display: flex;
      align-items: center;
      // height: 40px;
      // margin: 12px 16px;
      padding: 4px;
      border-radius: 8px;
      background: #edf1f7;

      .filter-button {
        display: flex;
        justify-content: center;
        width: 50%;
        color: #212528;

        span {
          display: block;
          width: 100%;
          padding: 3px 0;
          border-radius: 4px;
          font-size: 16px;
          text-align: center;

          &.primary-color {
            background-color: #fff;
            font-weight: 500;
          }
        }
      }
    }

    &-content {
      // height: var(--content-height);
      overflow: auto;
    }

    .message-tips {
      padding: 10px 0;
      color: #c3c3c3;
      font-size: 12px;
      font-weight: 400;
      text-align: center;
    }
  }

  .unread-icon {
    position: relative;

    &::after {
      content: ' ';
      position: absolute;
      top: 1px;
      right: 0;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #ff792e;
    }
  }
</style>
