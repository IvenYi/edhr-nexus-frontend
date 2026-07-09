<template>
  <a-row :gutter="[12, 0]" class="mt16px">
    <a-col :span="widget.props.txnType === 'em_txn_container_combine' ? 8 : 12">
      <div class="to-selected-box">
        <div class="table-wrap">
          <div class="search-box">
            <a-form-item :label="t('sys.kit.containerName')">
              <a-input
                v-model:value="searchName"
                @pressEnter="getDataSource({ searchName, container: containerInfo })"
                style="width: 100%"
              >
                <template #suffix>
                  <!-- <search-outlined /> -->
                  <i class="iconfont icon-sousuo1"></i>
                </template> </a-input
            ></a-form-item>
          </div>
          <div class="text-[#212528] text-14px mb8px">
            {{ t('sys.pageDesigner.ToBeSelect') }}
          </div>
          <a-table
            rowKey="id_"
            size="middle"
            :data-source="dataSource"
            :columns="leftCols"
            :pagination="pagination"
            :row-selection="{
              onSelect: onSelectChange,
              onSelectAll: onSelectAllChange,
              selectedRowKeys: selectedRowKeys,
            }"
            bordered
            :scroll="{ y: 350 }"
            @change="(paginationInfo) => handleTableChange(paginationInfo)"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.key == 'container_modality_id_'">
                {{ text ? record._DICT?.[column.key][text].join('') || text : text }}
              </template>
              <template v-if="column.key == 'product_id_'">
                {{ text ? record._DICT?.[column.key][text].join('') || text : text }}
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-col>
    <a-col
      :span="widget.props.txnType === 'em_txn_container_combine' ? 16 : 12"
      class="be-selected-box-col"
    >
      <div>
        <div class="table-wrap">
          <div class="text-[#212528] text-14px mb8px mt55px">
            {{ t('sys.pageDesigner.beSelected') }}
            <a-button danger @click="deleteAll" style="bottom: 7px; float: right">{{
              t('sys.kit.delAll')
            }}</a-button>
          </div>
          <a-table
            rowKey="id_"
            bordered
            size="middle"
            :data-source="selectedDataSource"
            :columns="[
              ...rightCols,
              { key: 'action', title: t('sys.operation'), align: 'center', width: 80 },
            ]"
            :pagination="false"
            :scroll="{ y: 350 }"
          >
            <template #bodyCell="{ column, record, index }">
              <template
                v-if="
                  column.key === 'combine_qty_' &&
                  widget.props.txnType === 'em_txn_container_combine'
                "
              >
                <a-input-number
                  v-model:value="record.combine_qty_"
                  :min="0"
                  :max="record.qty_"
                  @change="Event.runEventByName('onChange', widget.events, selectedDataSource)"
                />
              </template>
              <template
                v-else-if="
                  column.key === 'close_when_empty_' &&
                  widget.props.txnType === 'em_txn_container_combine'
                "
              >
                <a-switch
                  v-model:checked="record.close_when_empty_"
                  @change="Event.runEventByName('onChange', widget.events, selectedDataSource)"
                />
              </template>
              <template v-else-if="column.key === 'action'">
                <a danger @click="deleteSelectedRow(record)">{{ t('sys.delete') }}</a>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts" name="gct-container-select">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { leftSimpleCols, containerCols, rightSimpleCols, editorRighCols } from './columns';
  import { IContainerSelect } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { TablePaginationConfig } from 'ant-design-vue';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  /**组件固定访问的业务服务 */
  const BIZ_MAP = {
    em_txn_container_combine: 'biz_to_combine_search',
    em_txn_container_association: 'biz_to_association_search',
    em_txn_container_disassociation: 'listByPage',
  };
  const { t } = useI18n();
  const Event = getPageEvent();
  const props = defineProps<{
    widget: IContainerSelect;
  }>();
  onMounted(() => {
    getBodyBySearchComponent(props.widget.props.refSearch);
  });
  const leftCols = computed(() => {
    if (
      props.widget.props.txnType === 'em_txn_container_association' ||
      props.widget.props.txnType === 'em_txn_container_disassociation'
    ) {
      return containerCols;
    }
    return leftSimpleCols;
  });
  const rightCols = computed(() => {
    if (
      props.widget.props.txnType === 'em_txn_container_association' ||
      props.widget.props.txnType === 'em_txn_container_disassociation'
    ) {
      return rightSimpleCols;
    }
    return editorRighCols;
  });

  const selectedDataSource = ref<any[]>([]);
  const selectedRowKeys = computed(() => {
    return selectedDataSource.value.map((d) => d.id_);
  });
  const onSelectChange = (record, selected) => {
    if (selected) {
      selectedDataSource.value.unshift(record);
    } else {
      selectedDataSource.value = selectedDataSource.value.filter((d) => {
        return d.id_ !== record.id_;
      });
    }
    Event.runEventByName('onChange', props.widget.events, selectedDataSource.value);
  };

  const onSelectAllChange = (selected) => {
    if (selected) {
      dataSource.value.forEach((d) => {
        const find = selectedDataSource.value.find((row) => {
          return row.id_ === d.id_;
        });
        if (!find) {
          selectedDataSource.value.push(d);
        }
      });
    } else {
      dataSource.value.forEach((d) => {
        const index = selectedDataSource.value.findIndex((row) => {
          return row.id_ === d.id_;
        });
        if (index > -1) {
          selectedDataSource.value.splice(index, 1);
        }
      });
    }
    Event.runEventByName('onChange', props.widget.events, selectedDataSource.value);
  };
  const deleteSelectedRow = (record) => {
    selectedDataSource.value = selectedDataSource.value.filter((d) => {
      return d.id_ !== record.id_;
    });
    Event.runEventByName('onChange', props.widget.events, selectedDataSource.value);
  };
  const deleteAll = () => {
    selectedDataSource.value = [];
    Event.runEventByName('onChange', props.widget.events, selectedDataSource.value);
  };
  const pagination = ref<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });
  const searchName = ref();
  const containerInfo = ref();
  const getDataSource = async (queryData?) => {
    const {
      container = {},
      pageSize,
      current,
      searchName: name,
    } = Object.assign({}, pagination.value, queryData);
    let res;
    if (props.widget.props.txnType === 'em_txn_container_disassociation') {
      res = await Event.context.$httpBizService(
        {
          action: BIZ_MAP[props.widget.props.txnType!],
          key: 'em_container',
        },
        {
          query: {
            'parent_container_id_.eq': container?.id_,
            'name_.eq': name,
          },
          pageNo: current,
          pageSize: pageSize,
        },
      );
    } else {
      res = await Event.context.$customBizService.get(
        {
          action: BIZ_MAP[props.widget.props.txnType!],
          key: props.widget.props.txnType!,
        },
        {
          name_: name,
          txn_subject_id_: container?.id_,
          pageNo: current,
          pageSize: pageSize,
        },
      );
    }
    dataSource.value = transformSourceData(res.data, res.dict);
    pagination.value.current = res.pageNo;
    pagination.value.pageSize = res.pageSize;
    pagination.value.total = res.totalCount;
    containerInfo.value = container;
  };
  const handleTableChange = (paginationInfo) => {
    getDataSource({ ...paginationInfo, container: containerInfo.value });
  };
  const search = async (container) => {
    getDataSource({ container });
    selectedDataSource.value = [];
  };
  async function getBodyBySearchComponent(key: string) {
    /**注册事件到批次搜索组件 */
    Event.initSearchs(key, search, props.widget.id);
  }
  const dataSource = ref<any[]>([]);

  defineExpose({
    reset() {
      dataSource.value = [];
      selectedDataSource.value = [];
      containerInfo.value = {};
      searchName.value = undefined;
    },
    reload(queryData) {
      getDataSource(queryData);
    },
    getValue() {
      return selectedDataSource.value;
    },
  });
</script>

<style lang="less" scoped>
  .tag {
    margin: 0;
    margin-bottom: 12px;
    border-radius: 0;
  }

  .is-selected {
    outline: var(--ant-primary-color) solid 1px;
  }

  :deep(.active) {
    background-color: rgb(13 170 156 / 10%);
  }

  :deep(.ant-pagination) {
    margin: 10px 0 0;
  }

  .table-wrap {
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 6%);
  }

  .title-icon {
    display: inline-block;
    position: relative;
    top: 1px;
    width: 2px;
    height: 12px;
    background-color: var(--ant-primary-color);
  }
</style>
