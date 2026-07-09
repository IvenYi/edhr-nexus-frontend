<template>
  <div class="device-table" :style="{ '--height': height ? `${height}px` : '100%' }">
    <a-input
      class="device-table__search"
      v-model:value="searchKey"
      style="width: 300px"
      :placeholder="$t('sys.onlineForm.selectDevice')"
      @pressEnter="getTableData()"
      @click.stop="() => {}"
    >
      <template #prefix>
        <i class="gct-iconfont icon-search1"></i>
      </template>
    </a-input>
    <div class="grid-wrap">
      <vxe-grid
        class="device-table__grid default vxetable"
        height="auto"
        :data="tableData"
        v-bind="gridOptions"
        v-on="gridEvents"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="device-table">
  import { onMounted, reactive, ref, watch } from 'vue';
  import { VxeGridListeners, VxeGridProps, VxeGridInstance } from 'vxe-table';
  import { getDeviceInterconnectionPageList } from '/@/apis/gct-platform/DeviceInterconnectionController';
  import { DeviceInterconnectionResponse } from '/@/apis/gct-platform/model';
  import { DeviceLink } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      selectedId?: string;
      showColumns?: Array<keyof DeviceLink.IDeviceLinkParams>;
      height?: number;
      pagerCount?: number;
    }>(),
    {
      showColumns: () => ['key', 'name', 'type', 'remark'],
    },
  );

  const emit = defineEmits<{
    (e: 'selectedChange', value: DeviceInterconnectionResponse): void;
  }>();

  const type2Title = {
    ['IPAAS']: $t('sys.developer.devive.interface'),
    ['MQTT']: 'MQTT',
  };

  const searchKey = ref();
  const selectedRow = ref<DeviceInterconnectionResponse>();
  const tableData = ref<Array<any>>([]);
  // 分页
  const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0,
    pagerCount: props.pagerCount || 7,
    className: 'ant-style-pager',
    layouts: ['PrevPage', 'JumpNumber', 'NextPage', 'Sizes', 'Total'],
  });

  const xGrid = ref<VxeGridInstance>();

  const gridOptions = reactive<VxeGridProps<DeviceInterconnectionResponse>>({
    showOverflow: true,
    loading: false,
    pagerConfig: pagination,
    editConfig: { trigger: 'manual', mode: 'row' },
    round: true,
    rowConfig: {
      isHover: true,
      keyField: 'key',
    },
    radioConfig: {
      // labelField: 'name',
      trigger: 'row',
      reserve: true,
    },
    columnConfig: {
      resizable: true,
    },
    columns: [
      { type: 'radio', width: 45 },
      { field: 'name', title: $t('sys.developer.devive.name') },
      { field: 'key', title: $t('sys.developer.devive.code') },
      {
        field: 'type',
        title: $t('sys.bi.connectionMode'),
        width: 150,
        formatter: ({ cellValue }) => type2Title[cellValue],
      },
      { field: 'remark', title: $t('sys.notes'), width: 150 },
    ].filter((item) => props.showColumns.includes(item.field as any) || item.type === 'radio'),
  });

  const gridEvents: VxeGridListeners = {
    pageChange({ pageSize, currentPage }) {
      pagination.currentPage = currentPage;
      pagination.pageSize = pageSize;
      getTableData();
    },
    radioChange({ row }) {
      emit('selectedChange', row);
      selectedRow.value = row;
    },
  };

  const getTableData = async () => {
    const res = await getDeviceInterconnectionPageList({
      pageNo: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchKey.value,
    });
    tableData.value = res?.data || [];
    pagination.current = res?.pageNo;
    pagination.total = res!.totalCount;
  };

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
  );

  onMounted(async () => {
    await getTableData();

    // 初始的时候回显用
    if (props.selectedId) {
      xGrid.value?.setRadioRow(props.selectedId);
    }
  });
</script>

<style lang="less" scoped>
  .device-table {
    height: var(--height);

    &__search {
      margin-bottom: 12px;
    }

    &__grid {
      border-radius: 4px;
    }
  }

  .grid-wrap {
    height: calc(100% - 44px);
  }
</style>
