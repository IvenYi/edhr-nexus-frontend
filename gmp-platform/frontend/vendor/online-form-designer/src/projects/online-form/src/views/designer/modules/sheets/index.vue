<template>
  <div class="sheets">
    <div class="sheets-btns">
      <i v-show="!readonly" class="iconfont icon-icon_xinjianbiao" @click="addSheet()"></i>
      <a-popover
        placement="topLeft"
        trigger="click"
        overlay-class-name="sheets-popover"
        :overlay-style="{
          width: '208px',
        }"
      >
        <template #content>
          <div
            v-for="item in sheetsData"
            :key="item.sheetId"
            class="sheet-item ell"
            :class="[activeSheetId === item.sheetId && 'active']"
            :title="item.title"
            @click="changeActiveSheet(item)"
          >
            {{ item.title }}
          </div>
        </template>
        <i class="iconfont icon-icon_zhankaibiao"></i>
      </a-popover>
    </div>
    <SheetsSwapper :data="sheetsData" :readonly="readonly" class="ks-col overflow-hidden" />
  </div>
</template>
<script setup lang="ts">
  import SheetsSwapper from './sheets-swapper.vue';
  import { useAllSpreadSheets } from '../../hooks/useAllSpreadSheets';

  defineProps<{
    readonly?: boolean;
  }>();

  const { sheetsData, activeSheetId, changeActiveSheet, addSheet } = useAllSpreadSheets();
</script>
<style lang="less" scoped>
  .sheets {
    width: 100%;
    height: 29px;
    border-top: 1px solid #e1e3eb;
    background-color: #f3f4f7;
    overflow: hidden;
    display: flex;

    &-btns {
      padding: 2px 3px;
      .iconfont {
        font-size: 14px;
        color: #1a1d23;
        cursor: pointer;
        padding: 5px;
        border-radius: 6px;

        &:hover {
          background-color: #e2e2e4;
        }

        & + .iconfont {
          margin-left: 2px;
        }
      }
    }
  }
</style>
<style lang="less">
  .sheets-popover {
    .ant-popover-inner-content {
      padding: 10px 8px;
      max-height: 300px;
      overflow: auto;

      .sheet-item {
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background-color: #f2f5f8;
        }

        &.active {
          color: var(--ant-primary-color);
          background-color: hsl(from var(--ant-primary-color) h s 96%);
        }
      }
    }
  }
</style>
