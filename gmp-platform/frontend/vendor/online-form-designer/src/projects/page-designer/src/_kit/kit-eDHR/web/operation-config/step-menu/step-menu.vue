<template>
  <div class="menu-config-container">
    <div class="menu-tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.entryKey"
        class="menu-tab"
        :class="{
          configured: tab.configured,
          selected: activeTab === index,
        }"
        @click="selectTab(tab, index)"
      >
        <span> {{ index + 1 }}. </span>
        <span>{{ tab.description }}</span>

        <!-- <div class="menu-tab-arrow" v-if="index < tabs.length - 1">
          <div class="menu-tab-arrow--line"></div>
          <div class="menu-tab-arrow--icon"></div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const defProps = defineProps<{
    tabs: Array<{
      title: string;
      description: string;
      configured?: boolean;
      content: any;
      entryKey: any;
      status: string;
    }>;
    modelCurrent: number;
  }>();

  const emits = defineEmits<{
    (e: 'update:modelCurrent', current: number): void;
  }>();

  const activeTab = computed({
    get() {
      return defProps.modelCurrent;
    },
    set(val: number) {
      emits('update:modelCurrent', val);
    },
  });

  // 选择选项卡
  const selectTab = (tab, index) => {
    activeTab.value = index;
    tab.configured = true;
  };
</script>

<style lang="less" scoped>
  @white: #ffffff;
  @grey: #efefef;
  @hover-bg-color: rgba(0, 120, 215, 0.5);
  @configured-bg-color: rgba(0, 120, 215, 0.1);
  @selected-bg-color: var(--ant-primary-color);

  .menu-config-container {
    padding: 16px 0;
  }

  .menu-tabs {
    display: flex;
  }

  .menu-tab + .menu-tab {
    // margin-left: -15px;
  }

  .menu-tab {
    flex: 1;
    text-align: center;
    padding: 10px 20px;
    background-color: #efefef;
    color: #333;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:not(:last-of-type) {
      border-right: 1px solid @white;
    }

    // &::before,
    // &::after {
    //   position: absolute;
    //   content: '';
    //   width: 0;
    //   height: 0;
    // }

    // &::before {
    //   top: 0;
    //   right: 4px;
    //   border-top: 22px solid transparent;
    //   border-bottom: 22px solid transparent;
    //   border-left: 11px solid @selected-bg-color;
    //   z-index: 20;
    // }

    // &::after {
    //   top: -8px;
    //   right: 0px;
    //   border-top: 30px solid transparent;
    //   border-bottom: 30px solid transparent;
    //   border-left: 15px solid white;
    //   z-index: 10;
    // }
    // &:last-child {
    //   &::before,
    //   &::after {
    //     content: none;
    //   }
    // }

    // &-arrow {
    //   position: absolute;
    //   z-index: 2;
    //   right: -12px;
    //   top: 50%;
    //   transform: translateY(-50%);
    //   width: 20px;
    //   height: 100%;
    //   display: flex;
    //   &--line {
    //     flex: 1;
    //     width: 12px;
    //     background-color: red;
    //   }
    //   &--icon {
    //     position: relative;
    //     height: 100%;
    //     width: 100%;
    //     z-index: 2;
    //     &::before,
    //     &::after {
    //       content: '';
    //       position: absolute;
    //       left: 8px;
    //       width: 24px;
    //       // width: calc(100% * 1.125); /* 对角线长度，约为原长度的1.414倍 */
    //       height: 5px; /* 腰线宽度 */
    //       background-color: #ffffff;
    //       transform-origin: left center;
    //       z-index: 2;
    //     }
    //     &::before {
    //       top: -2px;
    //       transform: rotate(75deg) translateY(-50%);
    //     }
    //     &::after {
    //       bottom: -2px;
    //       transform: rotate(-75deg) translateY(50%);
    //     }
    //   }
    // }
  }

  /* 已配置状态 - 10%不透明度主重色 */
  .menu-tab.configured {
    color: var(--ant-primary-color);
    background-color: @configured-bg-color;
    &::before {
      border-left: 11px solid @configured-bg-color;
    }
  }

  /* Selected状态 - 纯主重色 */
  .menu-tab.selected,
  .menu-tab.configured.selected {
    color: white;
    background-color: @selected-bg-color;
    &::before {
      border-left: 11px solid @selected-bg-color;
    }
  }

  /* Hover状态 - 50%不透明度主重色 */
  .menu-tab:hover {
    // color: white;
    // background-color: @hover-bg-color;
    // &::before {
    //   border-left: 11px solid @hover-bg-color;
    // }
  }
</style>
