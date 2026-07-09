<template>
  <div class="data-statistics" :class="[isCollapse && 'collapse']">
    <div class="data-content ks-row">
      <div
        v-for="(item, i) in dataStatisticsList"
        :key="i"
        class="data-item ks-row overflow-hidden"
        :class="[item.type === curStatistics.type && 'selected']"
        @click="setCurrentStatistic(item)"
      >
        <div class="data-icon" :style="{ backgroundColor: item.bgColor }">
          <i class="iconfont" :class="[item.icon]"></i>
        </div>
        <a-tooltip v-if="item.tips" placement="topLeft">
          <template #title>
            {{ item.tips }}
          </template>
          <div class="data-item-main">
            <div class="data-item-num">{{ item.total }}</div>
            <div class="ell">{{ item.title }}</div>
          </div>
        </a-tooltip>
        <div v-else class="data-item-main">
          <div class="data-item-num">{{ item.total }}</div>
          <div class="ell">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div class="collapse-btn" @click="isCollapse = !isCollapse">
      <i class="iconfont icon-pad_arrow_up"></i>
    </div>
  </div>
  <div v-if="isCollapse" class="collapse-btn collapse" @click="isCollapse = !isCollapse">
    <i class="iconfont icon-pad_arrow_down"></i>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useEdhrSummary } from '../hook/useEdhrSummary';

  const { dataStatisticsList, curStatistics, setCurrentStatistic } = useEdhrSummary();
  const isCollapse = ref(false);
</script>
<style lang="scss" scoped>
  .data-statistics {
    display: flex;
    margin-left: 16px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    height: 64px;
    overflow: hidden;

    .data-content {
      column-gap: 16px;
      flex: 1;
      .data-item {
        flex: 1;
        border: 1px solid #e0e3eb;
        border-radius: 8px;
        color: #1a1d23;
        padding: 13px 16px;
        cursor: pointer;

        &.selected {
          border-color: #0099ff;
          background-color: rgba(0, 153, 255, 0.08);
        }

        .data-icon {
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          // background-color: #6B75FF;
          margin-right: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex: none;

          .iconfont {
            font-size: 18px;
          }
        }

        &-num {
          font-size: 20px;
          padding-right: 8px;
        }

        &-main {
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        &:hover {
          box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.1);
        }
      }
    }

    &.collapse {
      height: 0;
      margin: 0;
    }
  }
  .collapse-btn {
    border-radius: 8px;
    border: 1px solid #e0e3eb;
    background-color: #fff;
    height: 40px;
    width: 40px;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    margin: 12px 20px;
    cursor: pointer;

    .iconfont {
      height: auto;
      line-height: 1;
      height: 16px;
    }

    &.collapse {
      position: fixed;
      right: 0px;
      top: 64px;
      z-index: 5;
    }
  }
</style>
