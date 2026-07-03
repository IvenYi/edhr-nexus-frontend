<template>
  <div style="width: 100%" class="bg-[#fff]">
    <div
      class="table-header-container"
      v-if="fullScreen || currentReload || customHeader || headerBtnGroup"
    >
      <div class="table-header-right">
        <div v-if="headerBtnGroupItems" class="header-btn-group">
          <DesignTableButtons
            :visible-buttons="headerBtnGroup?.props?.visibleButtons"
            :buttons="headerBtnGroupItems"
            :reverse="true"
          >
            <template #renderActions="args">
              <slot v-bind="args"></slot>
            </template>
          </DesignTableButtons>
        </div>
        <div class="ks-row-middle p10px" v-if="fullScreen || currentReload || customHeader">
          <div class="ks-col"></div>
          <a-button v-show="fullScreen">
            <template #icon> <FullscreenOutlined /></template>
          </a-button>
          <a-button v-show="currentReload" class="ml10px">
            <template #icon> <reload-outlined class="text-20px" /></template>
          </a-button>
          <a-button v-show="customHeader" class="ml10px">
            <template #icon> <span class="iconfont icon-shezhi"></span></template>
          </a-button>
        </div>
      </div>
    </div>
    <vxeRefTable
      isTree
      :serialNumber="serialNumber"
      :tree-config="{
        transform: true,
        rowField: 'id_',
        parentField: 'parent_id_',
        expandAll: true,
      }"
      :datasource="datasource"
      :columns="tableColumns"
      :rowdraggable="rowdraggable"
      :operateColumn="operateColumn"
      :tableWidget="widget"
      showPagination
      v-if="tableColumns.length"
    >
      <template #operate="{ row }">
        <opeButtons
          v-if="!row.parent_id_"
          :showmore="false"
          :buttonOptions="parentdata!.children"
          :visibleButtons="parentdata!.props.visibleButtons"
        />
        <opeButtons
          v-else
          :showmore="false"
          :buttonOptions="childrendata!.children"
          :visibleButtons="childrendata!.props.visibleButtons"
        />
      </template>
    </vxeRefTable>
    <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc]" v-else-if="model">
      <span class="text-[#5d6474] text-14px"> {{ $t('sys.pageDesigner.selectModelFields') }}</span>
    </div>
    <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc]" v-else>
      <span class="text-[#5d6474] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { toRefs, toRef, computed } from 'vue';
  import { ITxnDataCollection } from './schema';
  import {
    vxeRefTable,
    opeButtons,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeDesignTable';
  import { DesignTableButtons } from '/@page-designer/components/widgets/web/data/data-table/component/design-table-buttons/design-table-buttons';

  const props = defineProps<{ widget: ITxnDataCollection }>();

  const { fullScreen, currentReload, customHeader, model, rowdraggable, serialNumber } = toRefs(
    props.widget.props,
  );
  if (!props.widget.children![2]) {
    props.widget.children[2] = {
      alias: '头部按钮',
      preLocation: props.widget.id,
      props: {
        visibleButtons: 5,
      },
      children: [],
    };
  }
  const tableColumns = toRef(() => {
    return props.widget?.children?.[1]?.children || [];
  });
  const operateColumn = toRef(() => {
    return props.widget.children[0];
  });
  const parentdata = toRef(() => {
    return operateColumn.value.children[0];
  });
  const childrendata = toRef(() => {
    return operateColumn.value.children[1];
  });
  const headerBtnGroup = toRef(() => {
    if (props.widget.children![2]?.children?.length) {
      return props.widget.children![2];
    }
  });
  const headerBtnGroupItems = computed(() => {
    if (props.widget.children![2]?.children?.length) {
      return [...props.widget.children![2].children];
    }
    return null;
  });
  //TODO目前只查实体模型 等有虚拟模型再改动
  // rowSelectionType.value
  const datasource = [
    { id_: 1, parent_id_: null, name: '1' },
    { id_: 2, parent_id_: 1, name: '1.1' },
    // { id_: 3, parent_id_: null, name: '2' },
    // { id_: 4, parent_id_: 3, name: '2.1' },
  ];
</script>
<style scoped lang="scss">
  .table-header-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
  }

  .header-btn-group {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 8px;
  }

  .pitch-on {
    display: inline-flex;
    align-items: center;
    height: 100%;
    float: left;
    font-size: 14px;
    cursor: pointer;
  }

  .table-header-right {
    display: inline-flex;
    align-items: center;
    height: 100%;
    float: right;
  }

  .pitch-on-count {
    color: #3168ec;
  }

  .pitch-on-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    transform: rotate(45deg);
    border-radius: 9px;
    background-color: #e6e9ef;

    .iconfont {
      color: #797a7d;
      font-size: 12px;
    }
  }
</style>
