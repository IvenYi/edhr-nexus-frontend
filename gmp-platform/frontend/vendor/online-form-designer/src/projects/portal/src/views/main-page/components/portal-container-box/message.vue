<template>
  <CardBox :cardExtraProps="{ style: { height: '100%' } }" :needExtra="!props.isDesign">
    <template #title>
      <div class="flex" style="align-items: center">
        <span>{{ $t('sys.menu.messageCenter') }}</span>
      </div>
    </template>
    <template #extra>
      <a class="cursor-pointer ml-6px flex items-center" @click="goToDetail">
        {{ $t('sys.seeMore')
        }}<i class="gct-iconfont icon-arrow_right" style="line-height: 22px"></i>
      </a>
    </template>
    <template #card-body>
      <div class="h100% px12px">
        <a-tabs v-model:activeKey="activeKey" class="h100%" @change="getTableData">
          <template #rightExtra>
            <div class="text-[#5A5F6B] cursor-pointer read-all" @click="readAll">{{ $t('sys.allRead') }}</div>
          </template>
          <a-tab-pane key="1" :tab="`${$t('sys.unRead')} (${unReadListTotal})`" class="h100%">
            <Scrollbar ref="scrollbarRef" class="scroll-container" v-if="unReadList.length">
              <div class="h100% message-wrap scroll-wrap pl-8px pr-8px">
                <div
                  v-for="item in unReadList"
                  :key="item.id"
                  class="message-item w100% flex position-relative"
                  @click="goToDetail"
                >
                  <div class="position-relative" :class="{ 'unread-dot': !item.read }">
                    <img :src="message" />
                  </div>
                  <div
                    class="ml-12px flex-1 message-item-contant"
                    :class="{ 'opacity-read': item.read }"
                  >
                    <div class="message-item-title mb-2px flex justify-between items-center">
                      <div
                        class="gct-text-overflow ks-col text-[#1A1D23] font-600 message-item-content"
                      >
                        {{ item.appName }}
                      </div>
                      <div class="gct-text-overflow text-[#8B8B8B] text-12px">
                        {{ item.modifyTime }}
                      </div>
                    </div>
                    <div class="message-item-content gct-text-overflow text-12px text-[#5A5F6B]">
                      {{ item.content }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="unReadListTotal > 30"
                  class="w100% text-center my12px more-select"
                  @click="goToDetail"
                >
                  {{ $t('sys.seeMore') }} <i class="gct-iconfont icon-arrow_right"></i>
                </div>
              </div>
            </Scrollbar>
            <div v-else class="h100% flex justify-center items-center">
              <a-empty :image="noData" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" :tab="`${$t('sys.read')} (${readListTotal})`" force-render>
            <Scrollbar v-if="readList.length" ref="scrollbarRef" class="scroll-container">
              <div class="h100% message-wrap scroll-wrap">
                <div
                  v-for="item in readList"
                  :key="item.id"
                  class="message-item w100% flex position-relative"
                  @click="goToDetail"
                >
                  <div class="position-relative" :class="{ 'unread-dot': !item.read }">
                    <img :src="message" />
                  </div>
                  <div
                    class="ml-12px flex-1 message-item-contant"
                    :class="{ 'opacity-read': item.read }"
                  >
                    <div class="message-item-title mb-2px flex justify-between items-center">
                      <div
                        class="gct-text-overflow ks-col text-[#1A1D23] font-600 message-item-conten"
                      >
                        {{ item.appName }}
                      </div>
                      <div class="gct-text-overflow text-[#8B8B8B] text-12px">
                        {{ item.modifyTime }}
                      </div>
                    </div>
                    <div class="message-item-content gct-text-overflow text-12px text-[#5A5F6B]">
                      {{ item.content }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="readListTotal > 30"
                  class="w100% text-center my12px more-select"
                  @click="goToDetail"
                >
                  {{ $t('sys.seeMore') }} <i class="gct-iconfont icon-arrow_right"></i>
                </div>
              </div>
            </Scrollbar>
            <div v-else class="h100% flex justify-center items-center">
              <a-empty :image="noData" />
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" :tab="$t('sys.all')" force-render>
            <Scrollbar v-if="msgList.length" ref="scrollbarRef" class="scroll-container">
              <div class="h100% message-wrap scroll-wrap">
                <div
                  v-for="item in msgList"
                  :key="item.id"
                  class="message-item w100% flex position-relative"
                  @click="goToDetail"
                >
                  <div class="position-relative" :class="{ 'unread-dot': !item.read }">
                    <img :src="message" />
                  </div>
                  <div
                    class="ml-12px flex-1 message-item-contant"
                    :class="{ 'opacity-read': item.read }"
                  >
                    <div class="message-item-title mb-2px flex justify-between items-center">
                      <div
                        class="mr16px gct-text-overflow ks-col text-[#1A1D23] font-600 message-item-conten"
                      >
                        {{ item.appName }}
                      </div>
                      <div class="gct-text-overflow text-[#8B8B8B] text-12px">
                        {{ item.modifyTime }}
                      </div>
                    </div>
                    <div class="message-item-content gct-text-overflow text-12px text-[#5A5F6B]">
                      {{ item.content }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="msgListTotal > 30"
                  class="w100% text-center my12px more-select"
                  @click="goToDetail"
                >
                  {{ $t('sys.seeMore') }} <i class="gct-iconfont icon-arrow_right"></i>
                </div>
              </div>
            </Scrollbar>
            <div v-else class="h100% flex justify-center items-center">
              <a-empty :image="noData" />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
  </CardBox>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import CardBox from './card-box.vue';
  import { Empty } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
  import {
    getInternalMessagePageList,
    putInternalMessageReadAll,
  } from '/@/apis/gct-platform/InternalMessageController';
  import { Scrollbar } from '/@/components/Scrollbar';
  import message from '/@/assets/svg/pic_message.svg';
  import noData from '/@/assets/svg/pic_nodata.svg';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  interface Props {
    /** 组件标题 */
    compTitle: string;
    /** 是否是设计器 */
    isDesign?: boolean;
  }
  const { mitt } = useMitt();
  const props = defineProps<Props>();
  const activeKey = ref('1');
  const Router = useRouter();
  const msgListTotal = ref<number>(0);
  const unReadListTotal = ref<number>(0);
  const readListTotal = ref<number>(0);

  const msgList = ref<any>([]);
  const unReadList = ref<any>([]);
  const readList = ref<any>([]);

  onMounted(() => {
    if (!props.isDesign) {
      getUnReadList();
      getReadList();
    } else {
      unReadListTotal.value = 4;
      readListTotal.value = 142;
      unReadList.value = [
        {
          appName: 'GCT-MedPro',
          modifyTime: '今天 11:00:03',
          content: '设备申请了维修，请及时处理',
          read: 0,
        },
        {
          appName: 'GCT-eDHR',
          modifyTime: '昨天 11:00:15',
          content: '张三提交的清场记录待您处理，请及时处理',
          read: 0,
        },
        {
          appName: 'GCT-电子记录',
          modifyTime: '星期二 11:00:10',
          content: '李四提交的超声换能器成品检验报告待您处理，请及时处理',
          read: 0,
        },
        {
          appName: 'GCT-MedPro',
          modifyTime: '2022-05-20 11:10',
          content: '设备申请了维修，请及时处理',
          read: 0,
        },
      ];
    }
  });

  const getUnReadList = async () => {
    const res = await getInternalMessagePageList({
      pageNo: 1,
      pageSize: 30,
      status: 'UNREAD',
    });
    unReadListTotal.value = res!.totalCount;
    unReadList.value = res!.data;
  };

  const getReadList = async () => {
    const res = await getInternalMessagePageList({
      pageNo: 1,
      pageSize: 30,
      status: 'READ',
    });
    readListTotal.value = res!.totalCount;
    readList.value = res!.data;
  };

  const getTableData = async () => {
    if (props.isDesign) {
      return;
    }
    if (activeKey.value === '1') {
      getUnReadList();
    } else if (activeKey.value === '2') {
      getReadList();
    } else {
      const res = await getInternalMessagePageList({
        pageNo: 1,
        pageSize: 30,
      });
      msgListTotal.value = res!.totalCount;
      msgList.value = res!.data;
    }
  };

  const goToDetail = () => {
    if (props.isDesign) {
      return;
    }
    Router.push({ path: '/message/unread' });
  };

  const readAll = () => {
    putInternalMessageReadAll().then(() => {
      getUnReadList();
      getReadList();
      getTableData();
      mitt.emit('read-message-all');
    });
  };
</script>
<style lang="less" scoped>
  .icon-a-Rightarrow {
    font-size: 12px;
  }

  .message-wrap {
    padding: 0;
    overflow: auto;
  }

  .message-item {
    padding: 16px 12px;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
      background: #f9fafb;
    }
  }

  .unread-dot::before {
    content: ' ';
    display: inline-block;
    position: absolute;
    z-index: 2;
    top: -2px;
    right: -6px;
    width: 10px;
    height: 10px;
    margin-right: 4px;
    border: 2px solid #fff;
    border-radius: 50%;
    background-color: #f54547;
  }

  :deep(.ant-tabs-content) {
    height: 100%;
  }

  :deep(.ant-tabs-nav) {
    padding: 0 12px;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0 0 12px;

    &::before {
      right: 12px;
      left: 12px;
    }
  }

  .opacity-read {
    opacity: 0.5;
  }

  .more-select {
    margin-bottom: 8px;
    color: #5a5f6b;
    cursor: pointer;

    &:hover {
      color: var(--ant-primary-color);
    }
  }

  .message-item-contant {
    max-width: calc(100% - 54px);
  }

  .message-item-content {
    max-width: calc(100% - 150px);
  }

  .read-all {
    &:hover {
      color: #1a1d23;
    }
  }
</style>
