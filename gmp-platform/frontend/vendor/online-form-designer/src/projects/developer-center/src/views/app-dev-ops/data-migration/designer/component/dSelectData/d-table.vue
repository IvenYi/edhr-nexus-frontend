<template>
  <span class="custom-filter-icon filter-icon ml-6px" v-if="cacheColumns && cacheColumns.length">
    <fieldFilter
      class="text-20px"
      :columns="cacheColumns"
      :cacheKey="cacheKey"
      :type="SysPage.name"
      @changeColumsByIds="changeColumns"
    />
  </span>
  <a-table
    :loading="loading"
    class="w100% h100%"
    ref="tableContainerRef"
    :row-key="pageInfo.key || 'id'"
    :columns="columns"
    :data-source="tableData"
    bordered
    :key="defProps.formRefHeight"
    :pagination="pagination"
    size="middle"
    @change="pageList"
    v-model:expandedRowKeys="treeConfig.defaultExpandedRowKeys"
    :childrenColumnName="treeConfig.childrenColumnName"
    :scroll="{
      y: scrollHeight - defProps.formRefHeight,
    }"
    :row-selection="{
      selectedRowKeys: rowSelectionData.selectedRowKeys,
      onSelect,
      onSelectAll,
      fixed: true,
      columnWidth: '60px',
      getCheckboxProps: (record: DataType) => ({
        disabled: record.base_id_,
      }),
    }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.details">
        <a @click="openModel(record)">
          {{ record[column.dataIndex] }}
        </a>
      </template>
      <template v-if="column.isConvert === 'single'">
        {{ column.options[record[column.dataIndex]] }}
      </template>
      <template v-if="column.isConvert === 'multiple'">
        {{ getPushTypeList(record[column.dataIndex], column.options) }}
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, computed, reactive, watch } from 'vue';
  import { sysPageInfo, dfsNonRecursive } from '../../setting';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import { DataTabEnum, CheckedData } from '../../const';
  import detailsTemplate from './detailsModel/index.vue';
  import fieldFilter from './query/component/field_filter_button.vue';

  const defProps = defineProps<{
    SysPage: CheckedData;
    appId: string;
    configByHeaders: object;
    formRefHeight: Number;
  }>();
  const emit = defineEmits(['countSum']);
  const loading = ref(false);
  const rowSelectionData = reactive({
    selectedRowKeys: [],
  });
  const treeConfig = reactive({
    defaultExpandedRowKeys: [],
    childrenColumnName: 'children',
  });
  const cacheColumns = ref<any>();
  const columns = ref([]);
  const cacheKey = defProps.appId + defProps.SysPage.key;
  /**合计可选择数量 用于关联正向还是反向逻辑 in字段 */
  const allTotalSize = ref(0);
  const tableContainerRef = ref();
  const { scrollHeight = 200 } = useAntTableScrollHeight(tableContainerRef);
  const pageInfo = computed(() => {
    const data = sysPageInfo[defProps.SysPage.name];
    if (defProps.SysPage.type === DataTabEnum.APP_MODULAR) {
      data.tableColumns = defProps.SysPage.fieldMetaList!;
      data.search = defProps.SysPage.fieldMetaList!;
      data.http = data.api.bind(null, defProps.SysPage.modelKey);
    }
    return { ...data };
  });

  const pagination: any = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => $t('sys.component.table.total', { total }),
  });
  const tableData = ref([]);
  if (pageInfo.value.tableColumns) {
    // columns.value = pageInfo.value.tableColumns.map((i) => {
    //   const customRender = i.render;
    //   const width = i.width || i.name.length * 20;
    //   return {
    //     dataIndex: i.key,
    //     title: i.name,
    //     // width: width < 80 ? 80 : width,
    //     ellipsis: true,
    //     key: i.key,
    //     name: i.name,
    //     details: !!i.details,
    //     isConvert: i.isConvert,
    //     options: i.options,
    //   };
    // });
    cacheColumns.value = pageInfo.value.tableColumns.map((i) => {
      const customRender = i.render;
      const width = i.width || i.name.length * 20;
      return {
        dataIndex: i.key,
        title: i.name,
        // width: width < 80 ? 80 : width,
        ellipsis: true,
        key: i.key,
        name: i.name,
        details: !!i.details,
        isConvert: i.isConvert,
        options: i.options,
        rdoUniqueFieldKey: i.rdoUniqueFieldKey,
      };
    });
  }

  const getPushTypeList = (val, options) => {
    let arr = val?.split(',') || [];
    arr = arr.map((item) => {
      return options[item];
    });
    return arr.join(' / ');
  };

  async function pageList(query = {}) {
    loading.value = true;
    pagination.pageSize = query?.pageSize ?? pagination.pageSize;
    pagination.current = query?.current ?? pagination.current;

    const { data, totalCount, dict, treeData, allCount } = await pageInfo.value.http(
      {
        pageSize: pagination.pageSize,
        pageNo: pagination.current,
        ...query,
      },
      defProps.configByHeaders,
    );
    if (treeData) {
      treeConfig.defaultExpandedRowKeys = treeData.defaultExpandedRowKeys;
      treeConfig.childrenColumnName = treeData.key;
    }
    pagination.total = totalCount;

    const transformData = data
      ? data.map((i) => {
          return {
            ...i,
            children: defProps.SysPage.name !== 'rdo_model' ? i?.children : i?.__CHILDREN__,
          };
        })
      : data;
    const ids = getIdsByData(transformData);
    allTotalSize.value = totalCount || allCount;
    // 将总条数传到外面计算已选中条数
    emit('countSum', allTotalSize.value);
    tableData.value = transformSourceData(transformData, dict);
    if (defProps.SysPage.checked) {
      if (!defProps.SysPage.in) {
        rowSelectionData.selectedRowKeys = ids.filter(
          (i) => !defProps.SysPage.moveDataIds.includes(i),
        );
      } else {
        rowSelectionData.selectedRowKeys = [...defProps.SysPage.moveDataIds];
      }
    }

    await nextTick();
    loading.value = false;
  }

  /**同步字段 */
  function changeColumns(ids: string[]) {
    columns.value = ids
      .map((id) => {
        const info = pageInfo.value.tableColumns.find((item) => item.key === id);
        return info;
      })
      .map((i: any) => {
        const customRender = i?.render;
        const width = i.width || i.name.length * 20;
        return {
          dataIndex: i.key,
          title: i.name,
          width: ids.length > 8 ? (width < 80 ? 80 : width) : undefined,
          ellipsis: true,
          key: i.key,
          name: i.name,
          details: !!i.details,
          isConvert: i.isConvert,
          options: i.options,
        };
      })
      .filter((i) => i);
  }
  function transformSourceData(data, dict) {
    if (dict && data) {
      return data.map((row) => {
        return Object.keys(row).reduce((total, curr) => {
          const map = dict[curr],
            value = row[curr];
          if (map && value) {
            try {
              const label = value.split(',').map((k) => map[k]) + '';
              total[curr] = label;
            } catch (error) {}
          } else {
            total[curr] = row[curr];
          }
          return total;
        }, {});
      });
    }
    return data || [];
  }

  /**更新本地选中项 考虑tree 场景 */
  function onSelectChange(checked, ids) {
    if (checked) {
      ids.forEach((id) => {
        rowSelectionData.selectedRowKeys.includes(id) || rowSelectionData.selectedRowKeys.push(id);
      });
    } else {
      rowSelectionData.selectedRowKeys = rowSelectionData.selectedRowKeys.filter(
        (id) => !ids.includes(id),
      );
    }
  }
  function onSelect(node, checked) {
    const ids = getIdsByData([node]);
    // rdo子版本单独处理
    const rdoVersionIds = defProps.SysPage.name === 'rdo_model' ? getVersionIds([node]) : [];
    defProps.SysPage.changeNode(checked, ids, allTotalSize.value, rdoVersionIds);
    onSelectChange(checked, ids);
    // 将总条数传到外面计算已选中条数
    emit('countSum', allTotalSize.value);
  }
  function onSelectAll(checked, list) {
    const ids = getIdsByData(tableData.value);
    // rdo子版本单独处理
    const rdoVersionIds =
      defProps.SysPage.name === 'rdo_model' ? getVersionIds(tableData.value) : [];

    defProps.SysPage.changeNode(checked, ids, allTotalSize.value, rdoVersionIds);
    onSelectChange(checked, ids);
    // 将总条数传到外面计算已选中条数
    emit('countSum', allTotalSize.value);
  }

  /** 获取rdo子版本id的集合 */
  function getVersionIds(tree) {
    return tree.reduce((accumulator, current) => {
      // 将当前元素的children数组中的每个id添加到accumulator中
      accumulator.push(...current.children.map((child) => child.id_));
      return accumulator;
    }, []); // 初始值为空数组
  }
  function getIdsByData(data = []) {
    const ids = [];
    dfsNonRecursive(data, treeConfig.childrenColumnName, (i) => {
      ids.push(i.id_ || i.id);
    });
    return ids;
  }
  onMounted(() => {
    pageList();
  });

  function checkedAll(checked) {
    if (checked) {
      rowSelectionData.selectedRowKeys = getIdsByData(tableData.value);
    } else {
      rowSelectionData.selectedRowKeys = [];
    }
  }
  async function openModel(row) {
    await gct.openUtil.drawer(
      detailsTemplate,
      { nameKey: defProps.SysPage.name, id: row.id, configByHeaders: defProps.configByHeaders },
      { title: row.name, width: 1000 },
    );
  }
  defineExpose({
    checkedAll,
    reload(query) {
      pageList(query);
    },
  });
</script>
<style scoped lang="less">
  .custom-filter-icon {
    display: inline-flex;
    position: relative;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    > .iconfont {
      line-height: 1;
    }
  }

  .filter-icon {
    position: absolute;
    top: -30px;
    right: 5px;
  }
</style>
