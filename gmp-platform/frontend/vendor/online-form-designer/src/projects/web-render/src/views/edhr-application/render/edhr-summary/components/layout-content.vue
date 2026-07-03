<template>
  <div class="ks-row h-full w-full content">
    <div
      class="relative"
      :style="{
        width: treeVisible ? leftWidth + 'px' : '44px',
        transition: !treeVisible ? 'width 0.3s' : 'none',
        minWidth: treeVisible ? '280px' : 'auto',
      }"
    >
      <div class="left-title-wrap wiki" :class="treeVisible ? 'unfold' : 'fold'">
        <!-- <div class="title" :title="edhrInfo?.tmplName || '--'">
          {{ edhrInfo?.tmplName || '--' }}
        </div> -->
        <span class="menu-icon" @click="changeTreeVisible(!treeVisible)">
          <i class="iconfont icon-caidanshouqi1 lh-22px" v-if="treeVisible"></i>
          <i class="iconfont icon-caidanzhankai" v-else></i>
        </span>
      </div>
      <slot v-if="treeVisible" name="left"></slot>
    </div>
    <a-divider
      type="vertical"
      style="border-color: #e0e3eb; height: 100%; margin: 0"
      :class="[treeVisible && 'cursor-col-resize']"
      @mousedown="leftMousedown"
    />
    <div
      class="ks-column middle-wrap"
      :style="{
        width: instanceVisible ? rightWidth + 'px' : '0',
        transition: 'width 0.3s',
        // minWidth: instanceVisible ? '240px' : 'auto',
      }"
    >
      <div v-show="notAllowToList" class="shade">
        <img src="../imgs/not-allow.png" class="mx-auto" alt="" width="60" height="60" />
        <div class="text-[#5A5F6B] mt16px"> {{ $t('sys.edhr.draggedFormNotAllowed') }} </div>
      </div>
      <div v-show="instanceVisible" class="left-title-wrap unfold">
        <div class="title" :title="$t('sys.edhr.formInstList')">
          {{ $t('sys.edhr.formInstList') }} ({{ formInstData.length }})
        </div>
        <span class="menu-icon" @click="changeInstanceVisible(!instanceVisible)">
          <close-outlined class="text-14px" />
          <!-- <i class="iconfont icon-caidanshouqi1" v-if="instanceVisible"></i>
          <i class="iconfont icon-caidanzhankai" v-else></i> -->
        </span>
      </div>
      <slot v-if="instanceVisible" name="middle"></slot>
    </div>
    <a-divider
      v-show="instanceVisible"
      type="vertical"
      :class="[instanceVisible && 'cursor-col-resize']"
      style="border-color: #e0e3eb; height: 100%; margin: 0 0 0 1px"
      @mousedown="rightMousedown"
    />
    <div class="bg-[#E6E7EA] ks-col overflow-hidden">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { UseDragByLine } from '/@/projects/page-designer/src/components/widgets/hooks/useDragLine';
  import { COLUMNS_TYPE } from '@gct/runtime';
  import { useEdhrSummary } from '../hook/useEdhrSummary';

  const props = defineProps<{
    parentRef?: HTMLElement;
    edhrInstance?: any;
  }>();

  const { formInstData, notAllowToList, changeInstanceVisible, instanceVisible } = useEdhrSummary();

  const { start: leftStart, moveDomDown: leftMoveDomDown } = UseDragByLine(240, COLUMNS_TYPE.LEFT);
  const { start: rightStart, moveDomDown: rightMoveDomDown } = UseDragByLine(
    180,
    COLUMNS_TYPE.LEFT,
  );

  // const instanceVisible = ref(true);
  const treeVisible = ref(true);

  const leftWidth = computed(() => (leftStart.value < 320 ? 320 : leftStart.value));

  const rightWidth = computed(() => (rightStart.value < 240 ? 240 : rightStart.value));

  const leftMousedown = (e) => leftMoveDomDown(e, props.parentRef);

  const rightMousedown = (e) => rightMoveDomDown(e, props.parentRef);
  // const changeInstanceVisible = (visible) => {
  //   instanceVisible.value = visible;
  // };

  const changeTreeVisible = (visible) => {
    treeVisible.value = visible;
  };
</script>
<style lang="less" scoped>
  .menu-icon {
    font-size: 16px;
    color: #5d6474;
    line-height: 1;
    cursor: pointer;
  }

  .left-title-wrap {
    display: flex;
    .title {
      font-weight: 500;
      color: #1a1d23;
      flex: 1;
    }
    &.unfold {
      flex-direction: row;
      padding: 12px 16px;
      column-gap: 12px;
      align-items: center;
    }
    &.wiki.unfold {
      position: absolute;
      top: 12px;
      right: 16px;
      padding: 0;
    }
    &.fold {
      flex-direction: column-reverse;
      row-gap: 12px;
      padding-left: 14px;
      padding-top: 15px;
      .title {
        letter-spacing: 1000px;
        word-break: break-all;
      }
    }
  }
  .iconfont {
    color: #8b8b8b;
  }

  .middle-wrap {
    position: relative;
    .shade {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100%;
      width: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9;
      backdrop-filter: blur(10px);
    }
  }
  .content {
    border-top: 1px solid #e0e3eb;
  }
</style>
<style>
  .ant-table-row.inst-list-ghost,
  .ant-tree-treenode.inst-list-ghost {
    width: 100%;
    height: 2px;
    background-color: var(--ant-primary-color) !important;
    overflow: hidden;
    padding: 0 !important;
    border: 0 !important;
  }
  .ant-tree-treenode.inst-list-ghost.not-put {
    background-color: red !important;
  }
  .ant-table-row.inst-list-dragged,
  .ant-tree-treenode.inst-list-dragged {
    /* width: 100%;
    border-radius: 4px;
    opacity: 1; */
  }
</style>
