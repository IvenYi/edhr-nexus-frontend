<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="t('sys.portal.addReport')"
    centered
    width="800px"
    :outHeight="640"
    :maskClosable="false"
    wrapClassName="report-modal"
    :afterClose="handleModalClose"
  >
    <div class="flex w100% report-container py8px h100%">
      <div class="left w264px">
        <div class="pl8px pr24px mb24px" v-if="getCurrentProject === ProjectName.PORTAL">
          <div class="mb8px font-600">{{ $t('sys.portal.selectApp') }}</div>
          <div>
            <a-select
              v-model:value="selectApp"
              show-search
              style="width: 100%"
              :placeholder="$t('sys.pleaseSelectSth', {sth: $t('sys.portal.selectApp')})"
              :options="mineAppData"
              :filter-option="filterOption"
              :field-names="{ label: 'name', value: 'id' }"
            />
          </div>
        </div>
        <div class="pl8px pr24px">
          <div class="mb8px font-600">{{ $t('sys.portal.selectReport') }}</div>
          <div>
            <a-input
              v-model:value="selectName"
              style="width: 100%"
              :placeholder="t('sys.searchText') + t('sys.report.reportName')"
              @pressEnter="searchReport"
            >
              <template #prefix>
                <i class="iconfont icon-sousuo1"></i>
              </template>
            </a-input>
          </div>
        </div>
        <div class="px8px pr24px flex py16px items-center">
          <div
            class="text-[#5A5F6B] cursor-pointer"
            :class="{ 'type-selected': !type }"
            @click="toggleType(false)"
          >
            {{ $t('sys.portal.byCategory') }}
          </div>
          <a-divider type="vertical" style="height: 16px; background-color: #e0e3eb" />

          <div
            class="text-[#5A5F6B] cursor-pointer"
            :class="{ 'type-selected': type }"
            @click="toggleType(true)"
          >
            {{ $t('sys.portal.byDataSource') }}
          </div>
        </div>
        <div
          class="tree pl8px"
          :class="{ 'tree-render': getCurrentProject !== ProjectName.PORTAL }"
        >
          <a-checkbox-group v-model:value="selectkeys" class="h100% w100%">
            <Scrollbar ref="scrollbarRef" class="scroll-container">
              <a-tree
                v-if="treeList.length"
                defaultExpandAll
                :tree-data="filterTreeList"
                :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
                :expanded-keys="expandedKeys"
                @expand="handleExpand"
              >
                <template #title="data">
                  <a-popover
                    placement="right"
                    v-if="!data.isParent"
                    overlayClassName="report-pop"
                    :getPopupContainer="getPopupContainer"
                  >
                    <template #content>
                      <div class="card-img">
                        <img v-if="data.screenShoot" :src="data.screenShoot" class="report-img" />
                      </div>
                    </template>

                    <div
                      class="flex justify-between py3px pl12px pr14px radius-4"
                      @click="changeSelect(data)"
                      :class="{ selected: selectkeys.includes(data.id) }"
                    >
                      <div class="w178px ell">
                        <div class="w166px ell text-[#1A1D23]"> {{ data.name }}</div>
                      </div>
                      <a-checkbox :value="data.id" />
                    </div>
                  </a-popover>

                  <span v-else class="cate-node" @click="toggleExpand(data.id)">{{
                    data.name
                  }}</span>
                </template>
              </a-tree>
            </Scrollbar>
          </a-checkbox-group>
        </div>
      </div>
      <div class="position-absolute w520px h100% bg-[#F9FAFB] divide"></div>
      <div class="pl24px flex-1 flex flex-col position-reslative select-container">
        <div class="pb16px">
          {{ $t('sys.portal.selected') }}
          <div v-if="selectItems.length" class="float-right cursor-pointer" @click="deleteAll"
            >{{ $t('sys.allDelete') }}</div
          >
        </div>

        <div v-if="selectItems.length" class="flex flex-1 mt8px flex-wrap tag-container">
          <div v-for="item in selectItems" :key="item.id" class="mb12px px8px py4px tag mr12px">
            <div class="flex justify-center items-center">
              <div class="ell tag-content mr-8px" v-ellipsis-title="item.name">
                {{ item.name }}
              </div>
              <close-outlined class="text-12px" @click="handleClose(item)" />
            </div>
            <!-- <ToolTipDisplay :item="item" @delete="handleClose" /> -->
            <!-- <a-tooltip placement="bottom" :visible="visible">
              <template #title>
                {{ item.name }}
              </template>
              <div class="flex justify-center items-center">
                <div class="ell tag-content mr-8px">
                  <span @mouseenter="onMouseenter" @mouseleave="onMouseleave">
                    {{ item.name }}
                  </span>
                </div>
                <close-outlined class="text-12px" @click="handleClose(item)" />
              </div>
            </a-tooltip> -->
          </div>
        </div>
        <div v-else class="flex flex-col flex-1 justify-center items-center">
          <img :src="reportEmpty" />
          <div class="color-[#5A5F6B]"> {{ $t('sys.portal.pleaseSelectReport') }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <a-button @click="close">{{ t('sys.cancelText') }}</a-button>
      <a-button
        type="primary"
        :class="{ 'btn-disabled': !selectkeys.length }"
        @click="handleOk"
        :disabled="!selectkeys.length"
      >
        {{ t('sys.okText') }}
      </a-button>
    </template>
  </basic-modal>
</template>
<script setup lang="ts">
  import { reactive, ref, watch, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import {
    getAppPageGetListReleasedApp,
    getAppReportInfos,
  } from '/@/apis/gct-platform/AppController';
  import { AppResponse } from '/@/apis/gct-platform/model';
  import reportEmpty from '/@/assets/svg/pic_nobaobiao.svg';
  import { useDesigner, useUndoRedo } from '../hook';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { getReportInfos } from '/@/apis/gct-apaas/ReportController';
  import { Scrollbar } from '/@/components/Scrollbar';
  import ToolTipDisplay from './tooltip.vue';

  const { getEnv } = useEnv();

  const usePathQuery = usePathQueryStore();
  const { t } = useI18n();
  const { layout, isChange, getBottomMostItem } = useDesigner();
  const { pushState } = useUndoRedo();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (getCurrentProject === ProjectName.PORTAL) {
      getMineAppData();
    } else {
      selectApp.value = usePathQuery.getAid();
    }
  });

  const type = ref(false);

  const selectApp = ref();

  const selectName = ref('');

  const treeList = ref<any>([]);

  const mineAppData = ref<AppResponse[]>([]);

  const selectItems = ref<any>([]);

  const selectkeys = ref([]);

  const visible = ref(false);

  const expandedKeys = ref([]);

  const toggleExpand = (key) => {
    if (expandedKeys.value.includes(key)) {
      expandedKeys.value = expandedKeys.value.filter((k) => k !== key);
    } else {
      expandedKeys.value.push(key);
    }
  };

  const handleExpand = (keys) => {
    expandedKeys.value = keys;
  };

  const filterTreeList = computed(() => {
    return filterTree(treeList.value, selectName.value.trim().toLowerCase());
  });
  const filterTree = (tree, searchText) => {
    if (!searchText) {
      return tree;
    }
    const filterFn = (node) => {
      // 如果当前节点名称包含搜索词，保留整个节点
      if (node.name.toLowerCase().includes(searchText)) {
        return true;
      }

      // 如果有子节点，递归过滤子节点
      if (node.children && node.children.length) {
        const filteredChildren = node.children.filter(filterFn);
        if (filteredChildren.length) {
          // 如果子节点有匹配的，保留当前节点但只保留匹配的子节点
          node.children = filteredChildren;
          return true;
        }
      }

      return false;
    };

    // 深拷贝树结构避免修改原数据
    const treeCopy = JSON.parse(JSON.stringify(tree));
    return treeCopy.filter(filterFn);
  };

  /** 获取已发布应用 */
  const getMineAppData = async () => {
    const result = await getAppPageGetListReleasedApp();
    mineAppData.value = result?.filter((i) => i.state === 'HEALTHY') ?? [];
    if (mineAppData.value.length) {
      selectApp.value = mineAppData.value[0]?.id;
    }
  };

  watch(
    () => selectApp.value,
    (val) => {
      if (val) {
        getTreeList();
      }
    },
  );

  const getTreeList = () => {
    treeList.value = [];
    expandedKeys.value = [];

    if (getCurrentProject === ProjectName.PORTAL) {
      getAppReportInfos({
        appId: selectApp.value,
        type: !type.value,
        env: 'prod',
      }).then((res) => {
        if (res) {
          for (let variable in res) {
            const cate = variable.split('||');
            treeList.value.push({
              id: cate[0],
              name: cate[1],
              isParent: true,
              children: res[variable],
            });
            expandedKeys.value.push(cate[0]);
          }
        }
      });
    } else {
      getReportInfos({
        appId: selectApp.value,
        env: getEnv(),
        type: !type.value,
      }).then((res) => {
        if (res) {
          for (let variable in res) {
            const cate = variable.split('||');
            treeList.value.push({
              id: cate[0],
              name: cate[1],
              isParent: true,
              children: res[variable],
            });
            expandedKeys.value.push(cate[0]);
          }
        }
      });
    }
  };

  const changeSelect = (item) => {
    if (selectkeys.value.includes(item.id)) {
      selectkeys.value = selectkeys.value.filter((i) => i !== item.id);
      selectItems.value = selectItems.value.filter((i) => i.id !== item.id);
    } else {
      selectkeys.value.push(item.id);
      selectItems.value.push({ ...item, appId: selectApp.value });
    }
  };
  const filterOption = (input: string, option: any) => {
    return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  /** 搜索报表 */
  const searchReport = () => {};
  const close = () => {
    deleteAll();
    closeModal();
  };

  const handleClose = (item) => {
    selectkeys.value = selectkeys.value.filter((i) => i !== item.id);
    selectItems.value = selectItems.value.filter((i) => i.id !== item.id);
  };

  const toggleType = (bool) => {
    type.value = bool;
    getTreeList();
  };

  const deleteAll = () => {
    selectkeys.value = [];
    selectItems.value = [];
  };

  const getPopupContainer = () => {
    console.log(document.body.querySelector('.report-modal'));
    return document.body.querySelector('.report-modal') || document.body;
  };

  const addItem = (item) => {
    // 计算新位置（自动换行逻辑）
    const cols = 24; // 总列数

    // 1. 找出所有可能重叠的位置
    const findAvailableSpot = () => {
      // 先尝试在已有行中找空隙
      for (let y = 0; y <= getMaxY() + 1; y++) {
        const availableX = findAvailableXInRow(y, 12);
        if (availableX !== null) {
          return { x: availableX, y };
        }
      }

      // 如果所有行都放不下，就放到新行
      return { x: 0, y: getMaxY() + 1 };
    };

    // 2. 辅助函数：获取当前最大Y值
    const getMaxY = () => {
      return layout.value.reduce((max, item) => Math.max(max, item.y + item.h - 1), 0);
    };

    // 3. 辅助函数：在指定行中找可用X位置
    const findAvailableXInRow = (targetY, widthNeeded) => {
      // 获取会影响目标行的所有元素
      const affectingItems = layout.value
        .filter((item) => item.y <= targetY && item.y + item.h > targetY)
        .sort((a, b) => a.x - b.x);

      let currentX = 0;

      for (const item of affectingItems) {
        if (currentX + widthNeeded <= item.x) {
          return currentX; // 找到可用空隙
        }
        currentX = Math.max(currentX, item.x + item.w);
        if (currentX >= cols) break;
      }

      // 检查行末的空间
      if (currentX + widthNeeded <= cols) {
        return currentX;
      }

      return null; // 这行放不下
    };
    // 4. 找到最佳位置
    const { x, y } = findAvailableSpot();

    layout.value.push({
      i: item.id + Date.now(),
      x,
      y, // puts it at the bottom
      w: 12,
      h: 18,
      minW: 8,
      minH: 12,
      workbenchComponentId: 'report',
      appId: item.appId,
      reportId: item.id,
    });
    isChange.value = true;
  };
  const handleOk = async () => {
    selectItems.value.forEach((i) => {
      addItem(i);
    });
    setTimeout(() => {
      pushState(layout.value);
      close();
    }, 50);
  };

  const handleModalClose = () => {
    selectkeys.value = [];
    selectItems.value = [];
    selectName.value = '';
  };
</script>
<style lang="less" scoped>
  .left {
    // border-right: 1px solid #e0e3ea;
  }

  .type-selected {
    color: var(--ant-primary-color);
  }

  :deep(.ant-tree-indent-unit) {
    width: 0;
  }

  .selected {
    background-color: hsl(from var(--ant-primary-color) h s 98%);
  }

  .card-img {
    width: 288px;
    padding: 13px 0;
    overflow: hidden;
    border-bottom: 1px solid #f3f3f3;
    border-radius: 2px;
    background: #fff;
    aspect-ratio: 16 / 9;

    .report-img {
      width: 100%;
      height: 100%;
    }
  }

  :deep(.ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected) {
    background-color: transparent;
  }

  :deep(.ant-btn[disabled]) {
    cursor: default;
  }

  .tree {
    height: calc(100% - 204px);
  }

  :deep(.ant-tree-treenode) {
    width: 100%;
  }

  :deep(.ant-tree-title) {
    display: inline-block;
    line-height: 24px;
  }

  .tree-render {
    height: calc(100% - 105px);
  }

  .tag-container {
    place-content: flex-start flex-start;
    overflow-y: auto;

    .tag {
      height: 30px;
      border: 1px solid #e0e3eb;
      border-radius: 4px;
      background: #ebedf3;
      color: #5a5f6b;

      .tag-content {
        display: inline-block;
        max-width: 184px;
        line-height: 20px;
      }
    }
  }

  :deep(.ant-divider-vertical) {
    height: 12px;
    margin: 5px 16px 0;
    background: #e0e3eb;
  }

  .cate-node {
    display: inline-block;
    line-height: 24px;

    &:hover {
      background: #fff;
    }
  }

  :deep(.ant-tree .ant-tree-node-content-wrapper) {
    padding: 0;
    border-radius: 4px;

    &:hover {
      background: #f2f5f8;
    }
  }

  .radius-4 {
    border-radius: 4px;
  }

  .report-container {
    // max-height: 488px;
    // min-height: 280px;
  }

  .btn-disabled {
    opacity: 0.3;
    background-color: var(--ant-primary-color) !important;
    color: #fff;

    &:hover {
      color: #fff;
    }
  }

  .divide {
    top: 0;
    right: 0;
    border-left: 1px solid #e0e3ea;
  }

  .select-container {
    z-index: 1;
  }
</style>
<style lang="less">
  .report-modal {
    overflow: hidden;
  }
  // .report-modal .ant-modal .ant-modal-body > .scrollbar {
  //   padding: 0;
  //   .scrollbar__view {
  //     height: 100%;
  //   }
  // }
  .report-pop {
    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner {
      border-radius: 4px;
      box-shadow: 0 4px 16px 0 rgb(0 0 0 / 10%);
    }
  }
</style>
