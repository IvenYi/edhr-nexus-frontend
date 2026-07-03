<template>
  <CardBox :cardExtraProps="{ style: { height: '100%' } }" :needExtra="!props.isDesign">
    <template #title>
      <div class="flex" style="align-items: center">
        <span>{{ $t('sys.menu.processCenter') }}</span>
      </div>
    </template>
    <template #extra>
      <a class="cursor-pointer ml-6px more flex items-center" @click="goToPage('/process/todo')">
        {{ $t('sys.seeMore')
        }}<i class="gct-iconfont icon-arrow_right" style="line-height: 22px"></i>
      </a>
    </template>
    <template #card-body>
      <div class="scroll-wrap px8px" style="height: 100%">
        <a-tabs v-model:activeKey="activeKey" class="h100%" @change="getTableData">
          <a-tab-pane
            key="1"
            :tab="`${$t('sys.menu.myTodo')} (${dataListTotal})`"
            force-render
            class="h100%"
          >
            <Scrollbar v-if="dataList.length" ref="scrollbarRef" class="scroll-container">
              <div class="h100% message-wrap scroll-wrap">
                <div
                  v-for="item in dataList"
                  :key="item.id"
                  class="message-item"
                  @click="goToDetail(item)"
                >
                  <div class="message-item-title flex justify-between items-center">
                    <div class="gct-text-overflow title">
                      <img
                        :src="themeSetting.themeColor === '#026AC8' ? shenpiSvg : shenpiSvgGreen"
                      />
                      <span class="ml16px">
                        {{ item.title }}
                      </span>
                    </div>
                    <div class="text-[#8B8B8B] text-12px">{{ item.taskStartTime }}</div>
                  </div>
                  <div class="message-item-info text-[#5A5F6B] text-12px mb2px pb4px">
                    <div class="pb4px gct-text-overflow border-dash">
                      {{ $t('sys.process.name') }}：{{ item.procDefName }}
                    </div>
                    <div class="pb4px gct-text-overflow border-dash">
                      {{ $t('sys.process.approvalStage') }}：{{ item.taskName }}
                    </div>
                    <div class="pl13px h10px position-relative dot-dash">
                      {{ $t('sys.process.needToApprove') }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="dataListTotal > 30"
                  class="w100% text-center more-select"
                  @click="goToPage('/process/todo')"
                >
                  {{ $t('sys.seeMore') }} <i class="gct-iconfont icon-arrow_right"></i>
                </div>
              </div>
            </Scrollbar>
            <div v-else class="h100% flex justify-center items-center">
              <a-empty :image="noData" />
            </div>
          </a-tab-pane>
          <a-tab-pane
            key="2"
            :tab="`${$t('sys.menu.myApplication')} (${initiateDatalistTotal})`"
            force-render
          >
            <Scrollbar v-if="initiateDatalist.length" ref="scrollbarRef" class="scroll-container">
              <div class="h100% message-wrap scroll-wrap">
                <div
                  v-for="item in initiateDatalist"
                  :key="item.id"
                  class="message-item"
                  @click="handleTitleClick(item)"
                >
                  <div class="message-item-title flex justify-between items-center">
                    <div class="gct-text-overflow title">
                      <img
                        :src="themeSetting.themeColor === '#026AC8' ? shenpiSvg : shenpiSvgGreen"
                      />
                      <span class="ml16px">
                        {{ item.title }}
                      </span>
                    </div>
                    <div
                      class="text-12px status"
                      :style="{
                        '--bg-color': getStatusColor(item.combinedStatus),
                      }"
                    >
                      <span class="status-dot"></span>
                      {{ t(ch_ProcessStatusMap[item.combinedStatus]) }}</div
                    >
                  </div>

                  <div class="message-item-info text-[#5A5F6B] text-12px mb2px">
                    <div class="pb4px gct-text-overflow border-dash">
                      {{ $t('sys.process.launchTime') }}：{{ item.startTime }}
                    </div>
                    <div class="pb4px gct-text-overflow border-dash">
                      {{ $t('sys.process.name') }}：{{ item.procDefName }}
                    </div>
                    <div class="flex">
                      <div
                        class="pl13px step-title position-relative"
                        :class="{
                          'border-dash': item.assignees,
                          'dot-dash': !item.assignees,
                          h10px: !item.assignees,
                        }"
                      >
                      {{ $t('sys.process.approvalStage') }}：
                      </div>
                      <div class="gct-text-overflow">{{ item.taskNames }}</div>
                    </div>

                    <div class="flex" v-if="item.assignees">
                      <div class="avatar-title pl13px h14px dot-dash position-relative pt3px">
                      {{ $t('sys.process.currentProcessor') }}：</div
                      >
                      <div class="flex flex-wrap">
                        <UserAvatar :userList="item.assignList" />
                        <!-- <div
                          v-for="p in item.assignList"
                          :key="p"
                          class="flex justify-center items-center mr8px"
                        >
                          <a-tooltip :title="p.fullname" :overlayStyle="{ 'max-width': '208px' }">
                            <div class="flex">
                              <img
                                class="avatar"
                                :src="transformUrl(p.avatar || globSetting.defaultAvatar)"
                              />
                              <div class="ml6px name ell">{{ p.fullname }}</div>
                            </div>
                          </a-tooltip>
                        </div> -->
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="initiateDatalistTotal > 30"
                  class="w100% text-center my12px more-select"
                  @click="goToPage('/process/todo')"
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
  import { useRouter } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPmTaskTodoPageList } from '/@/apis/gct-platform/PmTaskTodoController';
  import { getPmProcessInstancePageList } from '/@/apis/gct-platform/PmProcessInstanceController';
  import { getUserInfoByIds } from '/@/apis/gct-platform/UserController';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { useProcessPage } from '/@/hooks/web/useProcessPage';
  import { ch_ProcessStatusMap, ProcessStatusEnum } from '@gct/runtime';
  import shenpiSvg from '/@/assets/svg/pic_shenpi.svg';
  import shenpiSvgGreen from '/@/assets/svg/pic_shenpi_green.svg';
  import noData from '/@/assets/svg/pic_nodata.svg';

  import UserAvatar from './user.vue';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  interface Props {
    /** 组件标题 */
    compTitle: string;
    /** 是否是设计器 */
    isDesign?: boolean;
  }

  const props = defineProps<Props>();

  const { t } = useI18n();
  const Router = useRouter();
  const dataList = ref<any>([]);
  const dataListTotal = ref<number>(0);
  const initiateDatalistTotal = ref<number>(0);
  const initiateDatalist = ref<any>([]);
  const activeKey = ref('1');
  // 获取主题色
  const { themeSetting } = useThemeSetting();
  onMounted(() => {
    if (!props.isDesign) {
      getInitiateDatalist();
      getDataList();
    } else {
      dataListTotal.value = 4;
      initiateDatalistTotal.value = 1;
      dataList.value = [
        {
          id: 1,
          title: '物料A的入库申请单',
          procDefName: '入库申请单',
          taskName: '审批节点',
          taskStartTime: '5分钟前',
        },
        {
          id: 2,
          title: '物料B的入库申请单',
          procDefName: '入库申请单',
          taskName: '审批节点',
          taskStartTime: '2020-10-21 20:14',
        },
        {
          id: 3,
          title: '物料C的入库申请单',
          procDefName: '入库申请单',
          taskName: '审批节点',
          taskStartTime: '2020-10-21 20:14',
        },
        {
          id: 4,
          title: '物料D的入库申请单',
          procDefName: '入库申请单',
          taskName: '审批节点',
          taskStartTime: '2020-10-21 20:14',
        },
      ];
    }
  });

  const getDataList = async () => {
    const res = await getPmTaskTodoPageList({
      pageNo: 1,
      pageSize: 30,
    });
    dataListTotal.value = res.totalCount;
    dataList.value =
      res!.data?.map((i) => ({ ...i, processInstanceId: i.processInstanceId || i.id })) || [];
  };

  const getInitiateDatalist = async () => {
    const res = await getPmProcessInstancePageList({
      pageNo: 1,
      pageSize: 30,
    });
    initiateDatalistTotal.value = res.totalCount;

    initiateDatalist.value = await Promise.all(
      res?.data?.map(async (i) => {
        const assignList = i.assignees ? await getUsers(i.assignees) : [];
        return {
          ...i,
          processInstanceId: i.processInstanceId || i.id,
          assignList,
        };
      }) || [],
    );
    console.log('initiateDatalist.value', initiateDatalist.value);
  };

  /** 获取当前处理人（返回 Promise） */
  const getUsers = (ids) => {
    return getUserInfoByIds({ ids }).then((result) => {
      return result.map((p) => ({
        avatar: p.avatar,
        fullname: p.fullname,
      }));
    });
  };

  const getStatusColor = (ststus) => {
    if (ststus === ProcessStatusEnum.APPROVING) {
      return '#2C8FFF';
    } else if (ststus === ProcessStatusEnum.COMPLETED) {
      return '#48C65C';
    } else if (ststus === ProcessStatusEnum.REFUSED) {
      return '#F54547';
    } else if (ststus === ProcessStatusEnum.REJECTED) {
      return '#F54547';
    } else if (ststus === ProcessStatusEnum.TERMINATED) {
      return '#FF9442';
    } else if (ststus === ProcessStatusEnum.WITHDRAWN) {
      return '#8B8B8B';
    }
  };

  const getTableData = () => {
    if (props.isDesign) {
      return;
    }
    if (activeKey.value === '1') {
      getDataList();
    } else {
      getInitiateDatalist();
    }
  };

  const goToPage = (path) => {
    if (props.isDesign) {
      return;
    }
    Router.push({ path });
  };

  const goToDetail = async (rowData) => {
    if (props.isDesign) {
      return;
    }
    const { goTodoPage } = useProcessPage(rowData);
    await goTodoPage();
  };

  const handleTitleClick = async (rowData) => {
    if (props.isDesign) {
      return;
    }
    const { goMyApplicationPage } = useProcessPage(rowData);
    await goMyApplicationPage();
  };
</script>
<style lang="less" scoped>
  .icon-a-Rightarrow {
    font-size: 12px;
  }

  .message-wrap {
    padding: 0 4px;
    overflow: auto;
  }

  .message-item {
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;

    & + .message-item {
      // margin-top: 12px;
    }

    &:hover {
      background: #f9fafb;
    }
  }

  :deep(.gct-custom-tag) {
    padding-bottom: 2px;
    font-size: 12px;
  }

  :deep(.ant-tabs-content) {
    height: 100%;
  }

  :deep(.ant-tabs-nav) {
    padding: 0 16px;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0 0 12px;

    &::before {
      right: 16px;
      left: 16px;
    }
  }

  .process-warper {
    padding: 16px 20px;
  }

  .message-item-info {
    margin-left: 52px;
    // border-left: 1px dashed #e0e3ea;
    padding-right: 160px;

    .border-dash {
      position: relative;
      padding-left: 12px;
      border-left: 1px dashed #e0e3ea;
    }

    .dot-dash {
      &::before {
        content: ' ';
        display: block;
        position: absolute;
        bottom: -3px;
        left: -2px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #ff9442;
        box-shadow: 0 0 0 2px hsl(from #ff9442 h s 93%);
      }
    }
  }

  .title {
    width: calc(100% - 150px);
    color: #1a1d23;
    font-size: 14px;
    font-weight: 600;
  }

  .more {
    color: var(--ant-primary-color);
  }

  .more-select {
    margin-bottom: 8px;
    color: #5a5f6b;
    cursor: pointer;

    &:hover {
      color: var(--ant-primary-color);
    }
  }

  .name {
    max-width: 77px;
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    padding: 3px 8px;
    border: 1px solid hsl(from var(--bg-color) h s l / 50%);
    border-radius: 12px;
    background: hsl(from var(--bg-color) h s l / 8%);
    color: #1a1d23;
    font-size: 12px;

    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 4px;
      border-radius: 50%;
      background: var(--bg-color);
    }
  }

  .avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  .avatar-title {
    min-width: 85px;
  }

  .step-title {
    min-width: 73px;
  }
</style>
