<template>
  <div class="web-workbench-grid-layout" ref="wrapper">
    <!-- 背景 -->
    <div class="position-absolute flex p12px pr0 w100% h100%" v-if="gridDisplay">
      <div
        v-for="i in 24"
        :key="i"
        class="mr12px h100% bg-item"
        style="width: calc(100% / 24 - 12px)"
      ></div>
    </div>
    <Scrollbar v-if="layout.length || isDrag" ref="scrollbarRef" class="scroll-container">
      <grid-layout
        ref="gridlayout"
        v-model:layout="layout"
        :col-num="24"
        :row-height="16"
        :margin="[12, 12]"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="item in layout"
          :key="item.id"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :minW="item.minW"
          :minH="item.minH"
          :id="item.i"
          @moved="movedEvent"
          @resized="resizedEvent"
          @move="move"
          @resize="resize"
        >
          <div class="content position-relative overflow-hidden">
            <div class="position-absolute remove-container" @click="removeItem(item.i)">
              <div class="remove position-absolute"></div>
            </div>

            <div class="position-absolute w100% h100% mask"></div>
            <component
              :is="componentPart[item.workbenchComponentId ?? '']"
              :compTitle="item.workbenchComponentName"
              :isDesign="true"
              :info="item"
            />
          </div>
        </grid-item>
      </grid-layout>
    </Scrollbar>

    <div v-else class="w100% h100% flex flex-col justify-center items-center">
      <img :src="emptyPng" alt="" class="w240px h180px" />
      <div v-if="getCurrentProject === ProjectName.PORTAL" class="mt16px text-[#5A5F6B]">
        {{ $t('sys.portal.addCompOrReportHere') }}
      </div>
      <div v-else class="mt16px text-[#5A5F6B]"> {{ $t('sys.portal.addReportHere') }} </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="web-workbench-grid-layout">
  import { watch, ref, onMounted, onBeforeUnmount, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { GridLayout, GridItem } from 'grid-layout-plus';
  import {
    MineAppEntry,
    QuickAccess,
    TestAppEntry,
    Message,
    Process,
    Report,
  } from '../../main-page/components/portal-container-box';
  import { useDesigner, useUndoRedo } from './dashboard/hook';
  import emptyPng from '/@/assets/svg/pic_addzujian.svg';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import { Scrollbar } from '/@/components/Scrollbar';

  const { getCurrentProject } = usePermissionStoreWithOut();

  const { layout, isChange, isDrag, gridDisplay } = useDesigner();
  const { pushState } = useUndoRedo();

  const componentPart = {
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
  const { t } = useI18n();
  const gridlayout = ref();
  const wrapper = ref();
  const scrollbarRef = ref();
  const isDragging = ref(false);
  const selectedItem = reactive({
    x: 0,
    y: 0,
  });
  const isResizing = ref(false);
  /** 移动后的事件 */
  const movedEvent = async () => {
    isChange.value = true;
    gridDisplay.value = false;
    pushState(layout.value);
    handleDragEnd();
  };
  const move = async (...arg) => {
    gridDisplay.value = true;
    handleDragStart();
  };
  /** 调整大小后的事件 */
  const resizedEvent = (i: number | string) => {
    isResizing.value = false;
    gridDisplay.value = false;
    isChange.value = true;
    pushState(layout.value);
    const filter = layout.value.filter((p) => p.i === i);
    if (!filter.length) return;
    const element = document.getElementById(filter[0].i).children[1];
    // element.style.cursor = 'nw-resize';
  };

  /** 调整大小后的事件 */
  const resize = (i: number | string, newH: number, newW: number) => {
    gridDisplay.value = true;
    // const filter = layout.value.filter((p) => p.i === i);

    // if (!filter.length) return;

    // if (!isResizing.value) {
    //   selectedItem.w = filter[0].w;
    //   selectedItem.h = filter[0].h;

    //   isResizing.value = true;
    // }
    // console.log(filter, 'filter', selectedItem.h, newH, selectedItem.w, newW);
    // const element = document.getElementById(filter[0].i).children[1];
    // // console.log('element', element.children);
    // if (selectedItem.h > newH) {
    //   if (selectedItem.w > newW) {
    //     element.style.cursor = 'nw-resize';
    //   } else if (selectedItem.w < newW) {
    //     element.style.cursor = 'ne-resize';
    //   } else {
    //     element.style.cursor = 'n-resize';
    //   }
    // } else if (selectedItem.h < newH) {
    //   if (selectedItem.w > newW) {
    //     element.style.cursor = 'sw-resize';
    //   } else if (selectedItem.w < newW) {
    //     element.style.cursor = 'se-resize';
    //   } else {
    //     element.style.cursor = 's-resize';
    //   }
    // } else {
    //   if (selectedItem.w > newW) {
    //     element.style.cursor = 'w-resize';
    //   } else if (selectedItem.w < newW) {
    //     element.style.cursor = 'e-resize';
    //   }
    // }
  };

  function removeItem(id: string) {
    const index = layout.value.findIndex((item) => item.i === id);

    if (index > -1) {
      layout.value.splice(index, 1);
      isChange.value = true;
      pushState(layout.value);
    }
  }

  function handleDragStart() {
    isDragging.value = true;
  }

  function handleDragEnd() {
    isDragging.value = false;
  }
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value || !scrollbarRef.value) return;
    const container = scrollbarRef.value.wrap as HTMLElement;
    const rect = container.getBoundingClientRect();
    const threshold = 50; // 离边缘多少像素开始触发滚动
    const scrollSpeed = 50; // 每次滚动的像素值
    // 向上滚动
    if (e.clientY < rect.top + threshold) {
      container.scrollBy({ top: -scrollSpeed });
    }
    // 向下滚动
    else if (e.clientY > rect.bottom - threshold) {
      container.scrollBy({ top: scrollSpeed });
    }
  };
  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove);
  });
  defineExpose({ gridlayout, wrapper });
</script>

<style lang="less">
  .web-workbench-grid-layout {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #f3f5f8;

    .vue-grid-layout {
      background: #f3f5f8;
    }

    .vgl-item {
      background-color: #fff !important;
    }

    .vgl-item--placeholder {
      background-color: #cacfd8 !important;
    }

    .vgl-item:not(.vue-grid-placeholder) {
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #cacfd8;
    }

    .vgl-item.vue-grid-placeholder {
      border-radius: 8px;
      background: green !important;
    }

    .vgl-item .resizing {
      opacity: 0.3;
    }

    .vgl-item__resizer {
      z-index: 11;
      width: 40px;
      height: 40px;

      &::before {
        top: auto;
        left: auto;
        width: 16px;
        height: 16px;
        border: none;
        background-image: url('/@/assets/svg/icon_tiaozheng.svg');
      }
    }

    .vgl-item .static {
      background: #cce;
    }

    .vgl-item {
      user-select: none; /* 禁止文本选中 */
      .content {
        display: flex;
        position: relative;
        flex-direction: column;
        width: 100%;
        height: 100%;
        // .title {
        //   padding-top: 16px;
        //   padding-left: 18px;
        //   font-size: 16px;
        //   color: #333;
        //   font-weight: 500;
        //   line-height: 22px;
        // }
        .tips {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #bfbfbf;
        }
      }
    }

    .vgl-layout {
      min-height: calc(100% - 1px);
      // background-color: #eee;
    }

    .vgl-layout::before {
      content: '';
      position: absolute;
      width: calc(100% - 6px);
      height: calc(100% - 5px);
      margin: 6px;
      background-color: transparent;
      // /* 蓝白竖向条纹（24栅格） */
      // cr: rgb(2 108 200 / 2%);
      // background-image: linear-gradient(
      //   to right,
      //   #eff3f9 0,
      //   #eff3f9 12px,
      //   transparent 12px,
      //   transparent 100%
      // );
      // // background-repeat: repeat;
      // background-size: calc(calc(100% - 18px) / 24) 40px;
      // /* 条纹重复 & 24栅格布局 */
      // // background-repeat: repeat-x;

      // /* 1px 浅蓝色边框 */
      // border: 1px solid rgba(2, 106, 200, 0.1);
      // border-radius: 0;

      // /* 确保背景和边框正确计算 */
      // box-sizing: border-box;
      // background-origin: border-box;
    }
  }

  .mask {
    // cursor: default;
    z-index: 8;
    border-radius: 8px;

    &:hover {
      border: 1px solid var(--ant-primary-color);
    }
  }
</style>
<style lang="less" scoped>
  :deep(.vgl-item--resizing) {
    opacity: 0.9;
  }

  :deep(.vgl-item--static) {
    background-color: #cce;
  }

  .text {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: auto;
    font-size: 24px;
    text-align: center;
  }

  :deep(.ant-card) {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
  }

  :deep(.ant-card-body) {
    flex: 1;
    height: 100%;
    // height: calc(100% - 65px);
    // padding: 0;
    margin-top: 8px;
    overflow: hidden;
  }

  :deep(.ant-card-head-title),
  :deep(.ant-card-extra) {
    padding: 13px 0 4px;
  }

  :deep(.ant-card-head) {
    min-height: 22px;
    border: none;
    font-weight: 500;
  }

  :deep(.ant-spin-nested-loading) {
    height: 100%;
    overflow: hidden;
  }

  // :deep(.ant-card-head-title) {
  //   padding-bottom: 0;
  // }
  .remove-container {
    display: flex;
    z-index: 10;
    top: 9px;
    right: 9px;
    align-items: flex-start;
    justify-content: flex-end;
    width: 40px;
    height: 40px;
    cursor: pointer;

    .remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background-image: url('/@/assets/svg/btn_del_rest.svg');
      color: #a6a6a6;
    }

    &:hover {
      .remove {
        background-image: url('/@/assets/svg/btn_del_hover.svg');
      }
    }
  }

  :deep(.ant-empty-image) {
    height: 66px;
  }

  :deep(.ant-empty-description) {
    color: rgb(0 0 0 / 25%);
  }

  .bg-item {
    border: 1px solid rgb(2 106 200 / 10%);
    background: rgb(2 106 200 / 2%);
  }

  :deep(.ant-tabs-tab) {
    color: #5a5f6b;
  }
</style>
