<template>
  <div class="print-designer-new-wrap">
    <basic-page-render class="print-designer-wrap">
      <div class="print-design overflow-hidden">
        <!-- <div class="tabs">
          <div
            class="tab"
            :class="{
              'tab-active': n.code === currrentTab,
            }"
            v-for="n in PrintTypeOptions"
            :key="n.code"
            @click="handleTabClick(n)"
          >
            <i :class="['iconfont', n.icon]" style="font-size: 24px"></i>
            <div>{{ n.label }}</div>
          </div>
        </div> -->
        <PrintDesign :moduleType="currrentTab" :key="searchKey" :categoryId="categoryValue" />
      </div>
    </basic-page-render>
  </div>
</template>

<script setup lang="ts" name="print-designer">
  import { ref } from 'vue';
  import { PrintTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import PrintDesign from './component/index.vue';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useQuickNext } from '/@/hooks/web/useQuickSearch';

  const props = defineProps<{
    moduleType: PrintTypeEnum;
  }>();
  const searchKey = ref();
  const currrentTab = ref<PrintTypeEnum>();
  const categoryValue = ref();
  const handleTabClick = (tab) => {
    if (currrentTab.value === tab.code) {
      return;
    }
    categoryValue.value = '';
    currrentTab.value = tab.code;
  };
  useQuickNext(
    async ({ module, key, categoryId }) => {
      currrentTab.value = module;
      categoryValue.value = categoryId;
      /**重新查询的时候需要刷新 */
      searchKey.value = Math.random();
    },
    () => {
      currrentTab.value = props.moduleType || PrintTypeOptions[0].code;
    },
  );
</script>
<style lang="less" scoped>
  @primary-theme-color: var(--ant-primary-color);

  .print-designer-new-wrap {
    width: 100%;
    height: 100%;
  }

  .print-designer-wrap {
    padding-top: 16px !important;
  }

  .print-design {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }

  .tabs {
    flex: none;
    width: 56px;
    border: 1px solid #e0e3ea;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    background: #fff;

    .tab {
      display: flex;
      flex-flow: column wrap;
      align-items: center;
      justify-content: center;
      margin: 1px;
      height: 76px;
      transition: all 0.3s;
      color: #5a5f6b;
      font-size: 12px;
      cursor: pointer;

      &:first-child {
        border-top-left-radius: 7px;
      }

      .iconfont {
        margin-bottom: 4px;
        font-size: var(--tab-icon-size, 20px);
        line-height: 1em;
      }

      &:hover {
        background-color: #f2f5f8;
      }

      &-active,
      &-active:hover {
        background: rgba(from var(--ant-primary-color) r g b / 8%);
        color: var(--ant-primary-color);
      }
    }
  }
</style>
