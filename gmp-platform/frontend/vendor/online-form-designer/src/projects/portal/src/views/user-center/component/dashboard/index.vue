<template>
  <div class="template-designer-new bg-[#ffffff] ks-column h100%">
    <div class="dashboard-designer-new-heander h70px relative">
      <div class="left ks-row-middle px8px ml8px h100%">
        <i class="iconfont icon-a-Leftarrow cursor-pointer" @click="onBack"></i>
        <div class="left-title ml16px">
          <div class="lh18px text-[#5A5F6B] text-[12px]">
            {{ t('sys.portal.dashboard') }}
          </div>
          <div v-if="!isEdit" class="ks-row w165px" @click="onEditName">
            <div class="ell max140px font500">{{ formState?.name || $t('sys.portal.unnamedDashboard') }}</div>
            <i
              class="gct-iconfont icon-icon_edit_name text-[#A6A6A6] ml8px cursor-pointer h22px edit-icon"
            ></i>
          </div>
          <div v-else class="relative h22px">
            <a-input
              ref="inputRef"
              v-model:value="formState.name"
              style="width: 165px; height: 22px"
            />
            <div
              v-if="formState.name?.trim().length > 100"
              class="error-gct error-tip px10px bg-[#FEECEC]"
              >{{ t('sys.designView.title.errorMsg') }}</div
            >
          </div>
        </div>
      </div>
      <div class="right mr16px w100px ks-row-middle h100%" style="justify-content: flex-end">
        <div @click="onUpdatePositionJson">
          <a-button type="primary" :loading="loadingBtn">
            <i class="gct-iconfont icon-icon_baocun_btn mr4px" style="font-size: 14px"></i>
            {{ t('sys.saveText') }}
          </a-button>
        </div>
      </div>
      <div class="center ks-row-center-middle ks-col h100% w100%">
        <a-popover
          v-if="getCurrentProject === ProjectName.PORTAL"
          trigger="click"
          v-model:visible="visible"
        >
          <template #content>
            <div class="title pl12px font-600 text-[#1A1D23] mb8px">{{ $t('sys.portal.comp') }}</div>
            <div
              class="compoent-item droppable-element"
              v-for="(item, idx) in INIT_POSITION"
              :key="idx"
              draggable="true"
              unselectable="on"
              @drag="(e) => drag(e, item)"
              @dragend="(e) => dragEnd(e, item)"
              @click="addItem(item)"
              @dragstart="dragstart"
            >
              <img :src="item.icon" :alt="item.name" />
              <span class="ml12px">{{ $t(item.name) }}</span>
            </div>
          </template>
          <div class="cursor-pointer add flex items-center" :class="{ selected: visible }">
            <i class="gct-iconfont icon-tianjiabaobiao mr6px"></i>

            <span class="font-600 mr16px">{{ $t('sys.portal.addComponent') }}</span>
            <img v-if="!visible" :src="Down" class="w16px h16px" />
            <img v-else :src="Up" class="w16px h16px" />
          </div>
        </a-popover>
        <a-divider
          v-if="getCurrentProject === ProjectName.PORTAL"
          type="vertical"
          class="mx16px"
          style="height: 16px; background-color: #e0e3eb"
        />
        <div class="cursor-pointer add flex items-center" @click="addReport">
          <i class="gct-iconfont icon-tianjiazujian mr6px"></i>
          <span class="font-600 mr16px">{{ $t('sys.portal.addReport') }}</span>

          <img :src="Down" class="w16px h16px" />
        </div>

        <a-divider type="vertical" class="mx16px" style="height: 16px; background-color: #e0e3eb" />
        <a-tooltip>
          <template #title>{{ $t('sys.designView.undo') }}</template>

          <div
            class="w32px h32px flex justify-center items-center caozuo mr8px"
            :class="{ disabled: !canUndo }"
          >
            <i
              class="gct-iconfont icon-icon_chexiao"
              :class="{ disabled: !canUndo }"
              @click="undo"
            ></i>
          </div>
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ $t('sys.designView.redo') }}</template>
          <div
            class="w32px h32px flex justify-center items-center caozuo"
            :class="{ disabled: !canRedo }"
          >
            <i
              class="gct-iconfont icon-icon_zhongzuo"
              :class="{ disabled: !canRedo }"
              @click="redo"
            ></i>
          </div>
        </a-tooltip>
      </div>
    </div>

    <div class="template-designer-new-main ks-col overflow-hidden m8px">
      <web-workbench-grid-layout
        ref="gridRef"
        :dataSource="compList"
        :deviceSource="501"
        @refresh="onRefresh"
      />
    </div>
  </div>
  <AddReport @register="register" />
</template>
<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, onBeforeUnmount, watch, createVNode, h } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onClickOutside } from '@vueuse/core';
  import WebWorkbenchGridLayout from '../web-workbench-grid-layout.vue';
  import type { WorkbenchComponentRelationResponse } from '/@/apis/gct-platform/model';
  import { IModal } from '@gct-paas/core';
  import { throttle } from 'lodash-es';
  import { INIT_POSITION, useDesigner, useUndoRedo } from './hook';
  import { Button, message, Modal } from 'ant-design-vue';
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';
  import AddReport from './components/add-report.vue';
  import { useModal } from '/@/components/Modal';
  import {
    postDashboard,
    putDashboardById,
    getDashboardInfo,
  } from '/@/apis/gct-platform/DashboardController';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import {
    putDashboardById as apaasPutDashboardById,
    postDashboard as apaasPostDashboard,
    getDashboardInfo as apaasGetDashboardInfo,
  } from '/@/apis/gct-apaas/DashboardController';
  import Up from '/@/assets/svg/arrow_up.svg';
  import Down from '/@/assets/svg/arrow_down.svg';

  const { initLayout, layout, isChange, isDrag, getBottomMostItem, gridDisplay } = useDesigner();
  const { undo, redo, canUndo, canRedo, pushState, currentIndex } = useUndoRedo();
  const [register, { openModal }] = useModal();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const cloneDropElement = ref();
  const { t } = useI18n();
  const { getEnv } = useEnv();
  const compList = ref<Array<WorkbenchComponentRelationResponse>>([]);
  const props = defineProps<{
    modal: IModal;
    id?: string;
  }>();

  const inputRef = ref();
  const cloneName = ref();
  const isEdit = ref(false);
  const loadingBtn = ref(false);
  const gridRef = ref();
  const visible = ref(false);
  const formState = ref({
    name: '',
  });
  const onEditName = () => {
    isEdit.value = true;
    cloneName.value = formState.value?.name;
    nextTick(() => {
      inputRef.value?.select();
    });
  };
  const dashboardDetail = async (id) => {
    if (getCurrentProject === ProjectName.PORTAL) {
      const res = await getDashboardInfo({ id });
      if (res) {
        initLayout(JSON.parse(res?.config));
        formState.value = Object.assign(formState.value, res);
      }
    } else {
      const res = await apaasGetDashboardInfo({ id });
      if (res) {
        initLayout(JSON.parse(res?.config));
        formState.value = Object.assign(formState.value, res);
      }
    }
  };

  watch(
    () => props.id,
    (val) => {
      if (val) {
        dashboardDetail(val);
        // initLayout(JSON.parse(val?.config));
      } else {
        formState.value.name = t('sys.portal.unnamedDashboard');
        initLayout([]);
      }
    },
    { deep: true, immediate: true },
  );

  // formState.value = Object.assign(formState.value, props.data);

  onClickOutside(inputRef, () => {
    if (formState.value?.name?.trim().length > 100) {
      inputRef.value?.select();
      return;
    }
    isEdit.value = false;
    const val = formState.value.name ? formState.value.name.trim() : '';

    formState.value.name = val ? val : cloneName.value;
    if (val && val !== cloneName.value) {
      isChange.value = true;
    }
  });

  /** 保存 */
  const onUpdatePositionJson = () => {
    loadingBtn.value = true;
    const batchPosition = layout.value.map((item) => {
      return {
        workbenchComponentId: item.workbenchComponentId,
        id: item.i,
        appId: item.appId,
        reportId: item.reportId,
        positionJson: {
          x: item.x,
          y: item.y,
          h: item.h,
          w: item.w,
        },
      };
    });
    if (props?.id) {
      if (getCurrentProject === ProjectName.PORTAL) {
        putDashboardById(
          {
            id: props?.id,
          },
          {
            ...formState.value,
            config: JSON.stringify(batchPosition),
          },
          // {
          //   transferToConfig: { headers: { env: getEnv() } },
          // },
        ).then(() => {
          message.success($t('sys.saveSuccess'));
          closeModal();
        });
      } else {
        apaasPutDashboardById(
          {
            id: props?.id,
          },
          {
            ...formState.value,
            config: JSON.stringify(batchPosition),
          },
        ).then(() => {
          message.success($t('sys.saveSuccess'));
          closeModal();
        });
      }
    } else {
      if (getCurrentProject === ProjectName.PORTAL) {
        postDashboard(
          {
            ...formState.value,
            source: 1,
            config: JSON.stringify(batchPosition),
            status: 1,
          },
          // {
          //   transferToConfig: { headers: { env: getEnv() } },
          // },
        )
          .then(() => {
            closeModal();
          })
          .finally(() => {
            message.success($t('sys.saveSuccess'));
            loadingBtn.value = false;
          });
      } else {
        apaasPostDashboard({
          ...formState.value,
          source: 1,
          config: JSON.stringify(batchPosition),
          status: 1,
        })
          .then(() => {
            closeModal();
          })
          .finally(() => {
            message.success($t('sys.saveSuccess'));
            loadingBtn.value = false;
          });
      }
    }
  };

  const onBack = () => {
    if (isChange.value) {
      const cfg = Modal.confirm({
        title: t('sys.designView.saveConfirm.title'),
        icon: createVNode(ExclamationCircleFilled),
        mask: false,
        getContainer: () => document.querySelector('.dashboard-designer-new-heander'),
        content: h('div', {}, [
          h('span', {}, t('sys.designView.saveConfirm.content')),
          h(
            Button,
            { type: 'link', class: 'continue-btn', onClick: () => cfg.destroy() },
            t('sys.app.continueEdit'),
          ),
        ]),
        cancelText: t('sys.designView.saveConfirm.cancel'),
        okText: t('sys.designView.saveConfirm.confirm'),
        wrapClassName: 'comfirm-dialog',
        onCancel: () => {
          closeModal();
        },
        onOk: async () => {
          try {
            /** 保存接口 */
            onUpdatePositionJson();
            // closeModal();
          } catch (error) {
            cfg.destroy();
          }
        },
      });
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    initLayout([]);
    props.modal.dismiss({ ok: true, params: { refresh: true } });
    isChange.value = false;
  };

  /** 拖拽进入仪表盘 */
  const mouseAt = { x: -1, y: -1 };
  let uid = 0;
  const generateId = () => `comp_${Date.now()}_${uid++}`;

  let idUUid = generateId();

  async function dragstart(e) {
    cloneDropElement.value = e.target.cloneNode(true);
    cloneDropElement.value.style.visibility = 'hidden';
    cloneDropElement.value.classList.add('gct-drag-box');
    document.body.appendChild(cloneDropElement.value);
    cloneDropElement.value.offsetHeight; // 强制重绘，确保 setDragImage 生效
    e.dataTransfer.setDragImage(cloneDropElement.value, 0, 0);
    // 显示自定义拖拽图像
    setTimeout(() => {
      cloneDropElement.value.style.visibility = 'visible';
      cloneDropElement.value.style.top = `${e.clientY}px`;
      cloneDropElement.value.style.left = `${e.clientX}px`;
    }, 0);
  }
  /** 拖拽 */
  const drag = throttle((e, record) => {
    isDrag.value = true;
    gridDisplay.value = true;
    const parentRect = gridRef.value.wrapper?.getBoundingClientRect();

    if (!parentRect || !gridRef.value.gridlayout) return;

    const mouseInGrid =
      mouseAt.x > parentRect.left &&
      mouseAt.x < parentRect.right &&
      mouseAt.y > parentRect.top &&
      mouseAt.y < parentRect.bottom;

    if (mouseInGrid && !layout.value.find((item) => item.i === idUUid)) {
      layout.value.push({
        x: (layout.value.length * 2) % 12,
        y: layout.value.length + 12, // puts it at the bottom
        w: record.positionJson.w,
        h: record.positionJson.h,
        minW: record.positionJson.minW,
        minH: record.positionJson.minH,
        workbenchComponentId: record.workbenchComponentId,
        i: idUUid,
      });
      isChange.value = true;
    }

    const index = layout.value.findIndex((item) => item.i === idUUid);

    if (index !== -1) {
      const item = gridRef.value.gridlayout.getItem(idUUid);

      if (!item) return;

      try {
        item.wrapper.style.display = 'none';
      } catch (e) {}

      Object.assign(item.state, {
        top: mouseAt.y - parentRect.top,
        left: mouseAt.x - parentRect.left,
      });
      const newPos = item.calcXY(mouseAt.y - parentRect.top, mouseAt.x - parentRect.left);
      if (mouseInGrid) {
        gridRef.value.gridlayout.dragEvent(
          'dragstart',
          idUUid,
          newPos.x,
          newPos.y,
          record.positionJson.h,
          record.positionJson.w,
        );
        record.positionJson.i = String(index);
        record.positionJson.x = layout.value[index].x;
        record.positionJson.y = layout.value[index].y;
      } else {
        gridRef.value.gridlayout.dragEvent(
          'dragend',
          idUUid,
          newPos.x,
          newPos.y,
          record.positionJson.h,
          record.positionJson.w,
        );
        // compList.value = compList.value.filter((item) => item.i !== idUUid);
      }
    }
    // 更新自定义拖拽图像位置 e.clientY 必须有值 0 可能结束拖拽
    if (cloneDropElement.value && e.clientY) {
      cloneDropElement.value.style.top = `${e.clientY}px`;
      cloneDropElement.value.style.left = `${e.clientX}px`;
    }
  });
  function dragEnd(e, record) {
    if (cloneDropElement.value) {
      document.body.removeChild(cloneDropElement.value);
      cloneDropElement.value = null;
    }
    const parentRect = gridRef.value.wrapper?.getBoundingClientRect();

    if (!parentRect || !gridRef.value.gridlayout) return;

    const mouseInGrid =
      mouseAt.x > parentRect.left &&
      mouseAt.x < parentRect.right &&
      mouseAt.y > parentRect.top &&
      mouseAt.y < parentRect.bottom;
    if (mouseInGrid) {
      gridRef.value.gridlayout.dragEvent(
        'dragend',
        idUUid,
        record.positionJson.x,
        record.positionJson.y,
        record.positionJson.h,
        record.positionJson.w,
      );
      // compList.value = compList.value.filter((item) => item.i !== dropId);
    } else {
      return;
    }

    // layout.value.push({
    //   x: dragItem.x,
    //   y: dragItem.y,
    //   w: dragItem.w,
    //   h: dragItem.h,
    //   i: dragItem.i,
    // });
    gridRef.value.gridlayout.dragEvent(
      'dragend',
      record.positionJson.i,
      record.positionJson.x,
      record.positionJson.y,
      record.positionJson.h,
      record.positionJson.w,
    );

    const item = gridRef.value.gridlayout.getItem(idUUid);

    if (!item) return;

    try {
      item.wrapper.style.display = '';
    } catch (e) {}
    idUUid = generateId();
    pushState(layout.value);
    isDrag.value = false;
    gridDisplay.value = false;
  }

  /** 点击添加组件 */
  const addItem = (item) => {
    if (!gridRef.value) return;

    const cols = 24; // 总列数
    const newWidth = item.positionJson.w;
    const newHeight = item.positionJson.h;

    // 1. 找出所有可能重叠的位置
    const findAvailableSpot = () => {
      // 先尝试在已有行中找空隙
      for (let y = 0; y <= getMaxY() + 1; y++) {
        const availableX = findAvailableXInRow(y, newWidth);
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

    // 5. 添加新元素
    layout.value.push({
      i: generateId(),
      x,
      y,
      w: newWidth,
      h: newHeight,
      minW: item.positionJson.minW,
      minH: item.positionJson.minH,
      workbenchComponentId: item.workbenchComponentId,
    });

    isChange.value = true;
    pushState(layout.value);
  };

  const addReport = () => {
    openModal();
  };
  onMounted(() => {
    console.log(props?.data);
    document.addEventListener('dragover', syncMousePosition);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('dragover', syncMousePosition);
  });
  function syncMousePosition(event: MouseEvent) {
    mouseAt.x = event.clientX;
    mouseAt.y = event.clientY;
  }
</script>
<style lang="less" scoped>
  .dashboard-designer-new {
    &-heander {
      .left {
        position: absolute;
        top: 0;
        left: 0;

        .error-tip {
          position: absolute;
          bottom: -26px;
          left: 0;
          border-radius: 4px;
        }

        .edit-icon {
          line-height: 1.5715;

          &:hover {
            color: var(--ant-primary-color);
          }
        }
      }

      .right {
        position: absolute;
        top: 0;
        right: 0;

        :deep(.ant-btn) {
          padding: 3px 12px;
        }
      }

      .step-item {
        width: fit-content;
        padding: 5px 12px;
        border-radius: 4px;
        color: rgb(255 255 255 / 64%);
        cursor: pointer;

        &.active {
          background-color: var(--ant-primary-color);
          color: #fff;
        }
      }
    }
  }

  .compoent-item {
    width: 208px;
    padding: 8px 16px;
    border-radius: 4px;

    &:hover {
      background: #f2f5f8;
    }
  }

  .selected {
    background: #f2f5f8;
  }

  .add {
    padding: 6px 8px;
    border-radius: 4px;

    &:hover {
      background: #f2f5f8;
    }
  }

  :deep(.comfirm-dialog.ant-modal-wrap) {
    .ant-modal-confirm {
      position: absolute;
      top: 62px;
      left: 17px;
      width: 316px !important;
      border-radius: 4px;
    }
  }

  .continue-btn {
    :deep(&.ant-btn) {
      position: absolute;
      bottom: 16px;
      left: 38px;
      height: 24px;
      padding: 0;
    }
  }

  .template-designer-new-main {
    border: 1px solid #c2cbd8;
    border-radius: 24px;
    background: #eff3f9;
  }

  .caozuo {
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #f2f5f8;
    }
  }

  .disabled {
    // opacity: 0.5;
    color: #d2d3d4;
    cursor: default;
  }

  :deep(.ant-input-affix-wrapper) {
    padding: 3px 4px;
    border: 1px solid var(--ant-primary-color);
    border-radius: 4px;
    box-shadow: 0 0 0 2px rgb(var(--ant-primary-rgb) 0.1);

    .ant-input {
      line-height: 1;

      &::selection {
        background-color: hsl(from var(--ant-primary-color) h s 94%);
        color: #1a1d23;
      }
    }
  }
</style>
<style>
  .gct-drag-box {
    position: fixed;
    z-index: 99999 !important;
    transform: translate(0, -50%);
    border: 1px solid var(--ant-primary-color);
    opacity: 1 !important;
    background-color: #fff !important;
  }
</style>
