<template>
  <a-layout class="paas-portal-layout">
    <platform-header class="flex-none" />
    <a-layout-content class="paas-content" v-if="compList.length">
      <!-- <div class="flex mt12px pl16px">
        <div
          v-for="item in compList"
          :key="item.id"
          @click="selectActive(item)"
          class="card"
          :class="{ selected: item.id === activeKey }"
        >
          {{ item.name }}
        </div>
      </div> -->

      <a-tabs v-model:activeKey="activeKey" class="dashboard-tab" :animated="false">
        <template #moreIcon>
          <div class="w32px h32px flex items-center justify-center more-icon">
            <i class="gct-iconfont icon-arrow_down_more"></i>
          </div>
        </template>
        <template #rightExtra>
          <div class="flex items-center px16px">
            <a-tooltip>
              <template #title> {{ $t('sys.edit') }} </template>
              <div
                class="mr8px w32px h32px flex items-center justify-center action-icon"
                @click="editDashboard(activeKey)"
              >
                <i class="gct-iconfont icon-icon_edit_name"></i>
              </div>
            </a-tooltip>

            <a-tooltip>
              <template #title> {{ $t('sys.redo') }} </template>
              <div
                class="w32px h32px flex items-center justify-center action-icon"
                @click="refresh"
              >
                <i class="gct-iconfont icon-a-shuaxin1"></i>
              </div>
            </a-tooltip>
          </div>
        </template>
        <a-tab-pane
          v-for="item in compList"
          :key="item.id"
          :class="{ 'signal-tab': compList.length === 1 }"
        >
          <template #tab>
            <!-- <ToolTip
              v-if="compList.length > 1"
              :name="item.name"
              :showIcon="true"
              style="max-width: 220px"
            /> -->
            <div
              v-if="compList.length > 1"
              class="gct-text-overflow tab-name"
              v-ellipsis-title="item.name"
            >
              <i class="gct-iconfont icon-yibiaopan mr2px"></i>
              {{ item.name }}
            </div>
            <!-- <ToolTip v-else :name="item.name" style="max-width: 220px" /> -->
            <div v-else class="gct-text-overflow tab-name" v-ellipsis-title="item.name">
              {{ item.name }}
            </div>
          </template>
          <Scrollbar ref="scrollbarRef" class="scroll-container" style="margin-top: -12px">
            <div
              v-if="!item.config?.length"
              class="flex justify-center items-center absolute z-0 top-3 right-3 bottom-2 left-3 bg-white rounded-lg select-none"
            >
              <div class="text-center">
                <img :src="svgEmpty" class="h-[188px] pointer-events-none" />
                <div class="mt-1 text-lg text-[#1A1D23]">{{ $t('sys.portal.dashboardNoContent') }}</div>
                <a-button type="link" class="mt-1" @click="editDashboard(activeKey)">
                  <div class="flex items-center">
                    <i class="gct-iconfont icon-a-btn_add mr-1 text-base"></i>
                    <span>{{ $t('sys.portal.addCard') }}</span>
                  </div>
                </a-button>
              </div>
            </div>
            <grid-layout
              v-else
              v-model:layout="item.config"
              :col-num="24"
              :row-height="16"
              :margin="[12, 12]"
              :is-draggable="false"
              :is-resizable="false"
              :is-bounded="true"
              :vertical-compact="true"
              :use-css-transforms="true"
              :key="timestamp"
            >
              <grid-item
                v-for="i in item.config"
                :key="i.id"
                :x="i.x"
                :y="i.y"
                :w="i.w"
                :h="i.h"
                :i="i.i"
              >
                <component
                  :is="components[i.workbenchComponentId ?? '']"
                  :compTitle="i.workbenchComponentName"
                  :info="i"
                />
              </grid-item>
            </grid-layout>
          </Scrollbar>
        </a-tab-pane>
      </a-tabs>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { pick, isEmpty } from 'lodash-es';
  import PlatformHeader from '/@/layouts/platform/platform-header.vue';
  import { createSessionStorage } from '/@/utils/cache';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { GridLayout, GridItem } from 'grid-layout-plus';
  import {
    MineAppEntry,
    QuickAccess,
    TestAppEntry,
    Message,
    Process,
    Report,
  } from './components/portal-container-box';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import {
    getDashboardList,
    getDashboardPageList,
    postDashboard,
  } from '/@/apis/gct-platform/DashboardController';
  import dashboardDesignerNew from '../user-center/component/dashboard/index.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { INIT_POSITION } from '../user-center/component/dashboard/hook';
  import svgEmpty from '/@/assets/svg/empty-workbench-component.svg';

  const { createMessage } = useMessage();
  const { getEnv } = useEnv();

  const components = {
    // 我的测试应用
    '3f0ab4c6-fa4d-4e3d-9cbc-b55d8e5b2776': TestAppEntry,
    // 快捷访问
    '276a84c4-f39b-4e1d-a8e9-9fb00ef9e91c': QuickAccess,
    // 我的应用
    '564d4dc4-e78a-41d0-b4e2-8e9f8361077f': MineAppEntry,
    // 消息
    ucr4l6P7EpvHVzHq: Process,
    // 流程
    '38GlalT6NPCzUo9Z': Message,
    // 报表
    report: Report,
  };

  const activeKey = ref();
  /** 初始宽度 */
  const INIT_WIDTH = 4;
  /** 初始高度 */
  const INIT_HEIGHT = 4;
  /** 一行3个 */
  const GRID_ITEM = 3;

  const timestamp = ref();
  /** 初始化position信息 */
  // const INIT_POSITION = [
  //   // 消息
  //   {
  //     workbenchComponentId: 'ucr4l6P7EpvHVzHq',
  //     positionJson: { x: 16, y: 4, w: 8, h: 12 },
  //   },
  //   // 流程
  //   {
  //     workbenchComponentId: '38GlalT6NPCzUo9Z',
  //     positionJson: { x: 0, y: 8, w: 16, h: 8 },
  //   },
  //   // 我的测试应用
  //   {
  //     workbenchComponentId: '3f0ab4c6-fa4d-4e3d-9cbc-b55d8e5b2776',
  //     positionJson: { x: 16, y: 0, w: 8, h: 4 },
  //   },
  //   // 快捷访问
  //   {
  //     workbenchComponentId: '276a84c4-f39b-4e1d-a8e9-9fb00ef9e91c',
  //     positionJson: { x: 0, y: 4, w: 16, h: 4 },
  //   },
  //   // 我的应用
  //   {
  //     workbenchComponentId: '564d4dc4-e78a-41d0-b4e2-8e9f8361077f',
  //     positionJson: { x: 0, y: 0, w: 16, h: 4 },
  //   },
  // ];

  const compList = ref<Array<any>>([]);

  async function getWorkBenchCompData() {
    timestamp.value = Date.now();
    const res = await getDashboardList(
      {},
      // {
      //   transferToConfig: { headers: { env: getEnv() } },
      // },
    );

    // judgeEmpty(res);
    if (res && res.length) {
      compList.value = (res ?? [])
        .filter((i) => i.status)
        .map((item) => {
          let config = [] as any;
          if (item.config) {
            config = JSON.parse(item.config);
          }
          return {
            ...item,
            config: handleLayoutdata(config),
          };
        });

      activeKey.value =
        activeKey.value && judgeActiveKeyExist(res) ? activeKey.value : compList.value[0].id;
    }
  }

  /** 判断系统仪表盘有没有数据，没有则初始化历史数据并兼容从12栅格转化为24栅格 */
  const judgeEmpty = () => {
    getDashboardPageList(
      {
        source: 0,
      },
      // {
      //   transferToConfig: { headers: { env: getEnv() } },
      // },
    ).then((result) => {
      if (result?.data?.length) {
        getWorkBenchCompData();
        return;
      } else {
        const json = INIT_POSITION.map((i) => {
          return {
            ...i,
            positionJson: JSON.stringify(i.positionJson),
          };
        });
        postDashboard(
          {
            source: 0,
            status: 1,
            name: $t('sys.portal.systemDashboard'),
            config: JSON.stringify(json),
          },
          // {
          //   transferToConfig: { headers: { env: getEnv() } },
          // },
        ).then(() => {
          getWorkBenchCompData();
        });
        // getWorkbenchComponentRelationList(
        //   { enabled: false },
        //   {
        //     transferToConfig: { headers: { source: 501 } },
        //   },
        // ).then((res) => {
        //   const json = res?.map((i) => {
        //     const position = i?.positionJson ? JSON.parse(i?.positionJson) : null;
        //     return {
        //       ...i,
        //       positionJson: position
        //         ? JSON.stringify({
        //             x: position.x * 2,
        //             y: position.y,
        //             w: position.w * 2,
        //             h: position.h,
        //           })
        //         : position,
        //     };
        //   });

        // });
      }
    });
  };
  onMounted(() => {
    judgeEmpty();
  });
  const judgeActiveKeyExist = (res) => {
    const filter = res.filter((i) => i.id === activeKey.value && i.status);
    return filter.length;
  };

  const handleLayoutdata = (res) => {
    const list = (res ?? []).map((item) => {
      return {
        ...pick(item, [
          'id',
          'workbenchComponentName',
          'workbenchComponentId',
          'positionJson',
          'appId',
          'reportId',
        ]),
        i: item.id,
        static: true,
      };
    });
    const hasPosList = list
      .filter((item) => !isEmpty(item.positionJson))
      .map((item) => {
        return {
          ...item,
          ...(typeof item.positionJson === 'string'
            ? JSON.parse(item.positionJson)
            : item.positionJson),
        };
      });
    const noPosList = list.filter((item) => isEmpty(item.positionJson));

    let startPos = 0;
    if (Array.isArray(hasPosList) && hasPosList.length !== 0) {
      startPos = Math.max(...hasPosList.map((item) => item.y + item.h));
    }

    const list2 = noPosList.map((item, index) => {
      const m = index % GRID_ITEM;
      const n = Math.floor(index / GRID_ITEM);
      const intiPosition = INIT_POSITION.find(
        (n) => n.workbenchComponentId === item.workbenchComponentId,
      )?.positionJson;

      return {
        ...item,
        x: intiPosition?.x ?? m * INIT_WIDTH,
        y: intiPosition?.y ?? startPos + n * INIT_HEIGHT,
        w: intiPosition?.w ?? INIT_WIDTH,
        h: intiPosition?.h ?? INIT_HEIGHT,
      };
    });

    // compList.value = [...hasPosList, ...list2];
    const ss = createSessionStorage({
      hasEncrypt: false,
    });
    if (ss.get('suite-app-online-count')) {
      ss.remove('suite-app-online-count');
    }
    return [...hasPosList, ...list2];
  };

  const editDashboard = async (id) => {
    const res = await gct.openUtil.fullScreen(dashboardDesignerNew, {
      id,
    });
    if (res.ok && res.params?.refresh) {
      getWorkBenchCompData();
    }
  };

  /** 刷新 */
  const refresh = () => {
    getWorkBenchCompData();
    createMessage.success($t('sys.reloadSuccess'));
  };
</script>

<style lang="less" scoped>
  .paas-portal-layout {
    height: 100%;
    min-height: 100%;
    overflow: hidden;

    .paas-content {
      position: relative;
      flex: 1 1 auto;
      padding: 24px 12px 0;
      overflow: auto;
      background-color: #eff3f9;
    }
  }

  .card {
    height: 32px;
    padding: 4px 16px;
    border-radius: 16px;
    cursor: pointer;
  }

  .selected {
    background: #fff;
  }

  :deep(
      .dashboard-tab > .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-ink-bar
    ) {
    height: 0;
  }

  :deep(.dashboard-tab > .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab) {
    height: 32px;
    padding: 4px 16px;
    border-radius: 16px;
    background: #e5e9f0;
    color: #5a5f6b;
    cursor: pointer;

    &:hover {
      background: v-bind("compList.length===1 ? 'transparent': '#ffffff'");
      color: var(--ant-primary-color);
    }

    & + .ant-tabs-tab {
      margin: 0 0 0 8px;
    }
  }

  :deep(.dashboard-tab > .ant-tabs-nav) {
    margin: 0 0 12px;

    &::before {
      border: none;
    }
  }

  :deep(
      .dashboard-tab
        > .ant-tabs-nav
        > .ant-tabs-nav-wrap
        > .ant-tabs-nav-list
        > .ant-tabs-tab-active
    ) {
    padding-left: v-bind("compList.length===1 ? '0': '16px'");
    background: v-bind("compList.length===1 ? 'transparent': '#ffffff'");
    color: #1a1d23;
    font-size: v-bind("compList.length===1 ? '18px': '14px'");
    font-weight: v-bind("compList.length===1 ? '600': '400'");
    cursor: v-bind("compList.length===1 ? 'default': 'pointer'");

    .ant-tabs-tab-btn {
      color: #1a1d23;
    }
  }

  :deep(.dashboard-tab > .ant-tabs-nav > .ant-tabs-nav-wrap) {
    padding-left: 16px;
  }
  // :deep(.dashboard-tab > .ant-tabs-nav .ant-tabs-nav-more) {
  //   padding: 0 0 0 90px;
  // }

  :deep(.vue-grid-item) {
    border-radius: 8px;
    background-color: #fff;
  }

  .dashboard-tab {
    height: 100%;
  }

  :deep(.dashboard-tab .ant-tabs-tabpane) {
    height: 100%;
    overflow: auto;
  }

  :deep(.dashboard-tab .ant-tabs-content) {
    height: 100%;
  }

  .vgl-item {
    transition: none !important;
  }

  .vgl-item:not(.vue-grid-placeholder) {
    border-radius: 8px;
    background-color: #fff;
  }

  .more-icon {
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background: #e5e9f0;
    }
  }

  .action-icon {
    border-radius: 50%;
    background: #fff;
    cursor: pointer;

    .action-img {
      &:hover {
        background: #e5e9f0;
      }
    }

    &:hover {
      background: #e5e9f0;
    }
  }

  :deep(.ant-empty-image) {
    height: 66px;
  }

  :deep(.ant-empty-description) {
    color: rgb(0 0 0 / 25%);
  }

  .tab-name {
    max-width: 220px;
    user-select: none;
  }

  :deep(.ant-tabs-tab) {
    color: #5a5f6b;

    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
