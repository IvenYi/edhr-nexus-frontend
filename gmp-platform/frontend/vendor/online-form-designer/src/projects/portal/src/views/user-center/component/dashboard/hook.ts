import Message from '/@/assets/svg/icon_tzzx.svg';
import Process from '/@/assets/svg/icon_spzx.svg';
import MyApp from '/@/assets/svg/icon_wdyy.svg';
import TestApp from '/@/assets/svg/icon_wdcsyy.svg';
import Quick from '/@/assets/svg/icon_kjfw.svg';
import { IGridLayoutCompItem } from '../../types/index.d';
import { computed, ref, watch } from 'vue';
import { isEmpty } from 'lodash-es';
import { LayoutOutlined } from '@ant-design/icons-vue';

/** 初始化position信息 */
export const INIT_POSITION = [
  // 通知中心
  {
    id: 1,
    workbenchComponentId: '38GlalT6NPCzUo9Z',
    positionJson: { x: 0, y: 14, w: 16, h: 13, minW: 8, minH: 8 },
    name: 'sys.menu.messageCenter',
    icon: Message,
  },
  // 审批中心
  {
    id: 2,
    workbenchComponentId: 'ucr4l6P7EpvHVzHq',
    positionJson: { x: 16, y: 7, w: 8, h: 20, minW: 8, minH: 9 },
    name: 'sys.menu.processCenter',
    icon: Process,
  },
  // 我的应用
  {
    id: 3,
    workbenchComponentId: '564d4dc4-e78a-41d0-b4e2-8e9f8361077f',
    positionJson: { x: 0, y: 0, w: 16, h: 7, minW: 8, minH: 7 },
    name: 'sys.portal.myApp',
    icon: MyApp,
  },
  // 我的测试应用
  {
    id: 4,
    workbenchComponentId: '3f0ab4c6-fa4d-4e3d-9cbc-b55d8e5b2776',
    positionJson: { x: 16, y: 0, w: 8, h: 7, minW: 8, minH: 7 },
    name: 'sys.portal.myTestApp',
    icon: TestApp,
  },
  // 快捷访问
  {
    id: 5,
    workbenchComponentId: '276a84c4-f39b-4e1d-a8e9-9fb00ef9e91c',
    positionJson: { x: 0, y: 7, w: 16, h: 7, minW: 8, minH: 7 },
    name: 'sys.portal.quickAccess',
    icon: Quick,
  },
];

const components = {
  // 我的测试应用
  '3f0ab4c6-fa4d-4e3d-9cbc-b55d8e5b2776': {
    minW: 8,
    minH: 7,
  },
  // 快捷访问
  '276a84c4-f39b-4e1d-a8e9-9fb00ef9e91c': {
    minW: 8,
    minH: 7,
  },
  // 我的应用
  '564d4dc4-e78a-41d0-b4e2-8e9f8361077f': {
    minW: 8,
    minH: 7,
  },
  // 消息
  ucr4l6P7EpvHVzHq: {
    minW: 8,
    minH: 8,
  },
  // 流程
  '38GlalT6NPCzUo9Z': {
    minW: 8,
    minH: 9,
  },
  report: {
    minW: 8,
    minH: 12,
  },
};

/** 初始宽度 */
const INIT_WIDTH = 4;
/** 初始高度 */
const INIT_HEIGHT = 4;
/** 一行3个 */
const GRID_ITEM = 3;
/** 是否有变化 */
const isChange = ref(false);
/** 是否要展示栅格线 */
const gridDisplay = ref(false);

// 历史记录栈
const history = ref([]);
// 当前状态指针
const currentIndex = ref(0);
// 最大历史记录数
const MAX_HISTORY = 50;

export const layout = ref<Array<IGridLayoutCompItem>>([]);

const isDrag = ref();

export function useDesigner() {
  function initLayout(dataSource) {
    history.value = [];
    currentIndex.value = 0;
    const list = dataSource.map((item) => {
      return {
        i: item.id,
        id: item.id,
        userId: item.userId,
        name: item.workbenchComponentName,
        positionJson: item.positionJson,
        workbenchComponentName: item.workbenchComponentName,
        workbenchComponentId: item.workbenchComponentId,
        minH: (item.workbenchComponentId && components?.[item.workbenchComponentId]?.minH) ?? 2,
        minW: (item.workbenchComponentId && components?.[item.workbenchComponentId]?.minW) ?? 2,
        appId: item.appId || '',
        reportId: item.reportId || '',
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
    layout.value = [...hasPosList, ...list2];
    history.value.push(JSON.parse(JSON.stringify([...hasPosList, ...list2])));
  }

  /** 获取最下面一个元素 */
  const getBottomMostItem = () => {
    if (!layout.value || layout.value.length === 0) return null;
    const lastLayout = layout.value[layout.value.length - 1];

    const yMax = layout.value.reduce((bottomMost, current) => {
      const currentBottom = current.y + current.h;
      const bottomMostBottom = bottomMost.y + bottomMost.h;
      return currentBottom > bottomMostBottom ? current : bottomMost;
    }, layout.value[0]);
    return lastLayout.y + lastLayout.h >= yMax.y + yMax.h ? lastLayout : yMax;
  };
  return {
    layout,
    initLayout,
    isChange,
    isDrag,
    getBottomMostItem,
    gridDisplay,
  };
}

export function useUndoRedo() {
  // 获取当前状态
  const state = ref([]);

  // 添加新状态到历史记录
  const pushState = (newState: any) => {
    // 如果当前指针不在栈顶，则丢弃后面的状态
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1);
    }

    // 添加新状态
    history.value.push(JSON.parse(JSON.stringify(newState)));

    currentIndex.value++;
    // 限制历史记录数量
    if (history.value.length > MAX_HISTORY) {
      history.value.shift();
      currentIndex.value--;
    }

    // 更新当前状态
    state.value = JSON.parse(JSON.stringify(newState));
  };

  // 撤销操作
  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--;
      state.value = JSON.parse(JSON.stringify(history.value[currentIndex.value]));
      layout.value = state.value;
      return true;
    }
    return false;
  };

  // 重做操作
  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++;

      state.value = JSON.parse(JSON.stringify(history.value[currentIndex.value]));
      layout.value = state.value;

      return true;
    }
    return false;
  };

  // 是否可以撤销
  const canUndo = computed(() => currentIndex.value > 0);

  // 是否可以重做
  const canRedo = computed(() => currentIndex.value < history.value.length - 1);

  return {
    state,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentIndex,
  };
}
