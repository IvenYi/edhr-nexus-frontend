<template>
  <div class="swapper">
    <div class="swapper-list">
      <div class="item-box">
        <div
          v-for="item in data"
          :key="item.key"
          class="swapper-item"
          :class="[activeSheet === item.key && 'active']"
          @click="activeSheet = item.key"
        >
          {{ item.title }}
        </div>
      </div>
    </div>
    <div v-if="showMoreBtn" class="swapper-btn">
      <i
        class="iconfont icon-arrow_left_more"
        :class="[curPage === 1 && 'disabled-btn']"
        @click="onMove(1)"
      ></i>
      <i
        class="iconfont icon-arrow_right_more"
        :class="[curPage === totalPage && 'disabled-btn']"
        @click="onMove(0)"
      ></i>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue';

  const props = defineProps<{
    active: string;
    data: Array<{
      key: string;
      title: string;
    }>;
  }>();

  const emit = defineEmits(['update:active']);
  const showMoreBtn = ref(false);
  const totalPage = ref(0);
  const curPage = ref(1);
  const pageWidth = ref(0);
  const swapperList = ref();

  const activeSheet = computed({
    get() {
      return props.active;
    },
    set(val) {
      emit('update:active', val);
    },
  });

  const onMove = (isLeft: number) => {
    if ((isLeft && curPage.value <= 1) || (!isLeft && curPage.value >= totalPage.value)) return;
    curPage.value = isLeft ? curPage.value - 1 : curPage.value + 1;
    swapperList.value?.scrollBy({
      left: isLeft ? 0 - pageWidth.value : pageWidth.value,
      behavior: 'smooth',
    });
  };

  function calculateWidth() {
    swapperList.value = document.querySelector('.swapper-list');
    pageWidth.value = swapperList.value?.clientWidth || 0;
    const itemWidth = document.querySelector('.item-box')?.clientWidth || 0;
    showMoreBtn.value = pageWidth.value < itemWidth;
    totalPage.value = Math.ceil(itemWidth / pageWidth.value);
    if (curPage.value > totalPage.value) curPage.value = totalPage.value;
  }

  onMounted(() => {
    nextTick(() => {
      calculateWidth();
    });
  });

  window.addEventListener('resize', () => {
    calculateWidth();
  });
</script>
<style lang="less" scoped>
  .swapper {
    display: flex;
    width: 100%;

    &-list {
      flex: 1;
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
    }

    &-item {
      line-height: 24px;
      padding: 0 12px;
      cursor: pointer;
      border-radius: 4px;
      position: relative;
      display: inline-block;

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
      padding: 2px 8px;
      background-color: #f3f4f7;
      box-shadow: -2px 0px 6px 0px rgba(0, 0, 0, 0.2);
      border-left: 1px solid #e1e3eb;

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
