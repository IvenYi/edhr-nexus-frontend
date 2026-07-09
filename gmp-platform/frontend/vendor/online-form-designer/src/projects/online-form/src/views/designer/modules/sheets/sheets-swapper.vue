<template>
  <div class="swapper">
    <div ref="swapperListRef" class="swapper-list">
      <div class="item-box">
        <div
          v-for="item in sheetsData"
          :key="item.sheetId"
          class="swapper-item"
          :class="[activeSheetId === item.sheetId && 'active']"
          @click="changeActiveSheet(item)"
        >
          <a-popover
            placement="topLeft"
            overlay-class-name="sheets-popover"
            trigger="contextmenu"
            :overlay-style="{
              width: '96px',
            }"
            @visible-change="(v) => onVisibleChange(v, item)"
          >
            <template #content>
              <div class="sheet-item ell" @click="addSheet(item)">
                {{ $t('sys.component.dataConnection.rename') }}
              </div>
              <div v-if="sheetsData.length > 1" class="sheet-item ell" @click="deleteSheet(item)">
                {{ $t('sys.delText') }}
              </div>
            </template>
            <div
              class="swapper-item-title"
              :style="{
                'pointer-events': readonly ? 'none' : 'unset',
              }"
              >{{ item.title }}</div
            >
          </a-popover>
        </div>
      </div>
    </div>
    <div v-if="showMoreBtn" class="swapper-btn">
      <i
        class="iconfont icon-arrow_left_more"
        :class="[curPage <= 1 && 'disabled-btn']"
        @click="onMove(true)"
      ></i>
      <i
        class="iconfont icon-arrow_right_more"
        :class="[curPage === totalPage && 'disabled-btn']"
        @click="onMove(false)"
      ></i>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { ISheet, useAllSpreadSheets } from '../../hooks/useAllSpreadSheets';

  defineProps<{
    data: Array<ISheet>;
    readonly?: boolean;
  }>();

  const showMoreBtn = ref(false);
  const totalPage = ref(1);
  const curPage = ref(1);
  const pageWidth = ref(0);
  // const swapperList = ref();
  const swapperListRef = ref();
  const resizeObserver = ref();
  const { sheetsData, activeSheetId, changeActiveSheet, addSheet, deleteSheet } =
    useAllSpreadSheets();

  watch(
    () => sheetsData.value.map((e) => e.title),
    () => {
      nextTick(() => {
        calculateWidth();
      });
    },
    {
      // immediate: true,
      deep: true,
    },
  );

  const onVisibleChange = (visible: boolean, sheet) => {
    if (visible) changeActiveSheet(sheet);
  };
  const onMove = (isLeft: boolean) => {
    if ((isLeft && curPage.value <= 1) || (!isLeft && curPage.value >= totalPage.value)) return;
    curPage.value = isLeft ? curPage.value - 1 : curPage.value + 1;
    swapperListRef.value?.scrollBy({
      left: isLeft ? 0 - pageWidth.value : pageWidth.value,
      behavior: 'smooth',
    });
  };

  function calculateWidth() {
    // console.log('calculateWidth', swapperListRef.value.clientWidth);
    // swapperList.value = document.querySelector('.swapper-list');
    pageWidth.value = swapperListRef.value?.clientWidth || 0;
    const itemWidth = document.querySelector('.item-box')?.clientWidth || 0;
    showMoreBtn.value = pageWidth.value < itemWidth;
    totalPage.value = Math.ceil(itemWidth / pageWidth.value);
    if (totalPage.value && curPage.value > totalPage.value) curPage.value = totalPage.value;
    if (totalPage.value === curPage.value) {
      swapperListRef.value?.scrollBy({
        left: itemWidth,
        behavior: 'smooth',
      });
    }
  }

  // window.addEventListener('resize', () => {
  //   calculateWidth();
  // });

  onMounted(() => {
    resizeObserver.value = new ResizeObserver(calculateWidth);
    if (swapperListRef.value) {
      resizeObserver.value.observe(swapperListRef.value);
    }
  });
  onBeforeUnmount(() => {
    resizeObserver.value.disconnect();
  });
</script>
<style lang="less" scoped>
  .swapper {
    // display: flex;
    width: 100%;
    position: relative;

    &-list {
      // flex: 1;
      width: 100%;
      overflow: auto;
      white-space: nowrap;
      padding: 2px 0;
      overflow-y: hidden;
      overflow-x: auto;

      &::-webkit-scrollbar {
        display: none;
      }
      &:hover {
        &::-webkit-scrollbar {
          display: block;
        }
      }

      .item-box {
        width: fit-content;
      }

      &:has(+ .swapper-btn) {
        width: calc(100% - 67px);
      }
    }

    &-item {
      line-height: 24px;
      cursor: pointer;
      border-radius: 4px;
      position: relative;
      display: inline-block;

      &-title {
        padding: 0 12px;
      }

      &::before {
        display: block;
        content: ' ';
        width: 1px;
        height: 20px;
        background-color: #dddddd;
        position: absolute;
        left: 0;
        top: 2px;
      }

      &:hover {
        background-color: #e2e2e4;
        &::before {
          background-color: transparent;
        }
      }

      &.active {
        background-color: #fff;
        color: var(--ant-primary-color);
        font-weight: 600;
        &::before {
          background-color: transparent;
        }
      }
    }

    &-btn {
      width: 67px;
      padding: 2px 8px;
      background-color: #f3f4f7;
      box-shadow: -2px 0px 6px 0px rgba(0, 0, 0, 0.2);
      border-left: 1px solid #e1e3eb;
      position: absolute;
      top: 0;
      right: 0;

      .iconfont {
        font-size: 14px;
        color: #5a5f6b;
        cursor: pointer;
        padding: 5px;
        border-radius: 6px;
        vertical-align: middle;

        &:hover {
          background-color: #e2e2e4;
        }

        & + .iconfont {
          margin-left: 2px;
        }

        &.disabled-btn {
          color: #d9d9d9;
          cursor: not-allowed;
          &:hover {
            background-color: transparent;
          }
        }
      }
    }
  }
</style>
