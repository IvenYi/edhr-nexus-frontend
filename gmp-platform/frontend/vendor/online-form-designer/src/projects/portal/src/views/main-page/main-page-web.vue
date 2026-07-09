<template>
  <basic-page-render>
    <div class="flex justify-between items-center pl16px pt8px" v-if="compList.length">
      <div class="text-18px font700">{{ compList[0].name }}</div>
      <div class="flex items-center px16px">
        <a-tooltip>
          <template #title> {{ $t('sys.edit') }} </template>
          <div
            class="mr8px w32px h32px flex items-center justify-center action-icon"
            @click="editDashboard(compList[0].id)"
          >
            <i class="gct-iconfont icon-icon_edit_name"></i>
          </div>
        </a-tooltip>

        <a-tooltip>
          <template #title> {{ $t('sys.redo') }} </template>
          <div class="w32px h32px flex items-center justify-center action-icon" @click="refresh">
            <i class="gct-iconfont icon-a-shuaxin1"></i>
          </div>
        </a-tooltip>
      </div>
    </div>

    <Scrollbar ref="scrollbarRef" class="scroll-container" v-if="compList.length">
      <div
        v-if="!compList[0].config?.length"
        class="flex justify-center items-center absolute z-0 top-3 right-3 bottom-2 left-3 bg-white rounded-lg select-none"
      >
        <div class="text-center">
          <img :src="svgEmpty" class="h-[188px] pointer-events-none" />
          <div class="mt-1 text-lg text-[#1A1D23]">{{ $t('sys.portal.dashboardNoContent') }}</div>
          <a-button type="link" class="mt-1" @click="editDashboard(compList[0].id)">
            <div class="flex items-center">
              <i class="gct-iconfont icon-a-btn_add mr-1 text-base"></i>
              <span>{{ $t('sys.portal.addCard') }}</span>
            </div>
          </a-button>
        </div>
      </div>
      <grid-layout
        v-else
        v-model:layout="compList[0].config"
        :col-num="24"
        :row-height="16"
        :margin="[12, 12]"
        :is-draggable="false"
        :is-resizable="false"
        :is-bounded="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="i in compList[0].config"
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
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { pick, isEmpty } from 'lodash-es';
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
  import { useRoute } from 'vue-router';
  import { getDashboardInfo } from '/@/apis/gct-apaas/DashboardController';
  import dashboardDesignerNew from '../user-center/component/dashboard/index.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import svgEmpty from '/@/assets/svg/empty-workbench-component.svg';

  const { createMessage } = useMessage();

  const route = useRoute();

  const tabStore = useMultipleTabStore();

  const routeQuery = computed(() => {
    return route?.params || {};
  });
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

  /** 初始宽度 */
  const INIT_WIDTH = 4;
  /** 初始高度 */
  const INIT_HEIGHT = 4;
  /** 一行3个 */
  const GRID_ITEM = 3;
  /** 初始化position信息 */
  const INIT_POSITION = [
    // 消息
    {
      workbenchComponentId: 'ucr4l6P7EpvHVzHq',
      positionJson: { x: 16, y: 4, w: 8, h: 12 },
    },
    // 流程
    {
      workbenchComponentId: '38GlalT6NPCzUo9Z',
      positionJson: { x: 0, y: 8, w: 16, h: 8 },
    },
    // 我的测试应用
    {
      workbenchComponentId: '3f0ab4c6-fa4d-4e3d-9cbc-b55d8e5b2776',
      positionJson: { x: 16, y: 0, w: 8, h: 4 },
    },
    // 快捷访问
    {
      workbenchComponentId: '276a84c4-f39b-4e1d-a8e9-9fb00ef9e91c',
      positionJson: { x: 0, y: 4, w: 16, h: 4 },
    },
    // 我的应用
    {
      workbenchComponentId: '564d4dc4-e78a-41d0-b4e2-8e9f8361077f',
      positionJson: { x: 0, y: 0, w: 16, h: 4 },
    },
  ];

  const compList = ref<Array<any>>([]);

  onMounted(getWorkBenchCompData);

  async function getWorkBenchCompData() {
    const res = await getDashboardInfo({ id: routeQuery.value.id });

    if (res) {
      compList.value = ([res] ?? []).map((item) => {
        let config = [] as any;
        if (item.config) {
          config = JSON.parse(item.config);
        }
        return {
          ...item,
          config: handleLayoutdata(config),
        };
      });
    }
  }

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
  /** 编辑 */
  const editDashboard = async (id) => {
    const res = await gct.openUtil.fullScreen(dashboardDesignerNew, {
      id,
    });
    if (res.ok && res.params?.refresh) {
      getWorkBenchCompData();
      tabStore.updateDashboard();
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
      padding-top: 24px;
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

  :deep(.vue-grid-item) {
    border-radius: 8px;
    background-color: #fff;
  }

  .scroll-container {
    height: calc(100% - 40px);
  }

  .vgl-item:not(.vue-grid-placeholder) {
    border-radius: 8px;
    background-color: #fff;
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

  :deep(.basic-page-render__body) {
    background-color: transparent;
  }

  .vgl-item {
    transition: none !important;
  }
</style>
