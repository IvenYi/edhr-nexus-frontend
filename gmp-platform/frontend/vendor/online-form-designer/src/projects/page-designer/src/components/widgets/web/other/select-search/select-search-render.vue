<template>
  <div v-if="searchResultFields.length < 3">
    <a-select
      v-model:value="selectedVal"
      :placeholder="placeholder"
      :filter-option="false"
      :options="selectOptions"
      :fieldNames="{ label: quickSearchFields[0], value: 'id_' }"
      :list-height="300"
      :defaultActiveFirstOption="false"
      dropdownClassName="gct-project-select-dropdown"
      allowClear
      showSearch
      showArrow
      labelInValue
      style="width: 100%"
      @inputKeyDown="handleKeyDown"
      @search="handleSearch"
      @select="handleSelect"
      @clear="handleClear"
      @popupScroll="popupScroll"
    >
      <template #option="option">
        <div style="min-height: 22px">
          {{ returnLabel(option, 0) }}
        </div>
        <div
          v-if="searchResultFields.length === 2"
          class="text-[#CCCCCC] text-12px mt2px"
          style="min-height: 22px"
        >
          {{ returnLabel(option, 1) }}
        </div>
      </template>
    </a-select>
  </div>
  <div v-else>
    <a-select
      ref="selectRef"
      v-model:value="selectedVal"
      :placeholder="placeholder"
      :options="dataSource"
      :filter-option="false"
      :open="open"
      :defaultActiveFirstOption="false"
      :fieldNames="{ label: quickSearchFields[0], value: 'id_' }"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      :dropdownStyle="{
        // maxWidth: '800px',
        // https://github.com/x-extends/vxe-table/issues/2272
        // 必须要给宽度，不然会vxe-table会计算宽度
        minWidth: '640px',
        width: '640px',
        zIndex: 999,
      }"
      dropdownClassName="gct-project-select-dropdown"
      allowClear
      showSearch
      showArrow
      style="width: 100%"
      :dropdownMatchSelectWidth="extra?.dropdownMatchSelectWidth || false"
      @inputKeyDown="handleKeyDown"
      @search="handleSearch"
      @click="openModel"
      @clear="handleClear"
    >
      <template #dropdownRender>
        <div @click.stop class="relative">
          <vxeRenderTable
            :loading="loading"
            v-model="tableData"
            :tableColumns="tableColumns"
            :border="false"
            :row-class-name="rowClassName"
            :serial-number="true"
            :maxHeight="extra?.maxHeight || 300"
            :seqMethod="seqMethod"
            @getDataSource="getDataSource"
            @cellClickEvent="cellClickEvent"
          />
          <div class="mt16px">
            <a-pagination
              v-model:current="current"
              v-model:page-size="pageSize"
              :page-size-options="pageSizeOptions"
              :total="total"
              :show-total="(total) => t('sys.component.table.total', { total })"
              show-size-changer
              @change="handPageChange"
              @showSizeChange="onShowSizeChange"
              class="pagination-total-left"
              style="text-align: right"
            >
              <template #buildOptionText="props">
                <span>{{ props.value }}{{ t('sys.pageDesigner.limitpage') }}</span>
              </template>
            </a-pagination>
          </div>
        </div>
      </template>
    </a-select>
  </div>
</template>
<script setup lang="ts" name="select-search-render">
  import { ref, toRefs, onMounted, computed, nextTick } from 'vue';
  import { SelectSearch } from '/@page-designer/types/web';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { FieldMeta, FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onClickOutside } from '@vueuse/core';
  import vxeRenderTable from '../../data/data-table/component/vxeRenderTable/index.vue';
  import { ISelectSearchComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const { t } = useI18n();
  const Event = getPageEvent();
  const defProps = defineProps<{ widget: SelectSearch; extra: any }>();
  const emits = defineEmits<{
    (e: 'selected', data: any): void;
    (e: 'clear'): void;
    (e: 'afterQuery', dataSource: Array<any>, query: string): void;
  }>();

  const selectedVal = ref();
  const searchValue = ref();
  const allFields = ref<FieldMeta[]>([]);
  const { model, modeldata, placeholder, quickSearchFields, searchResultFields } = toRefs(
    defProps.widget.props,
  );
  const selectRef = ref();
  const open = ref(false);
  const dataSource = ref<Array<FieldMetaDTO>>([]);
  const selectOptions = ref<Array<FieldMetaDTO>>([]);
  const current = ref(1);
  const total = ref(0);
  const loading = ref(false);
  const pageSize = ref(20);
  const pageSizeOptions = ref<string[]>(['10', '20', '30']);
  const showTable = ref(false);
  const tableData = computed(() => {
    return showTable.value ? dataSource.value : [];
  });
  const tableColumns = computed(() => {
    const children = defProps.widget.children;
    return children;
  });

  onMounted(() => {
    getFiledData();
    getDataSource();
  });

  async function dropdownVisibleChange(show) {
    if (show) {
      loading.value = true;
      setTimeout(async () => {
        showTable.value = true;
        await nextTick();
        loading.value = false;
      }, 200);
    } else {
      setTimeout(async () => {
        showTable.value = false;
      }, 150);
    }
  }
  async function openModel() {
    open.value = true;
    dropdownVisibleChange(true);
  }
  // select回车查询
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      current.value = 1;
      getDataSource();
      e.stopPropagation();
    }
  };
  // select搜索
  const handleSearch = (val) => {
    searchValue.value = val;
  };

  // select选中事件
  const handleSelect = (val, option) => {
    Event.runEventByName('beforeSearch', defProps.widget.events);
    Event.runEventByName('afterSearch', defProps.widget.events, val, option);
  };

  // select清除事件
  const handleClear = () => {
    Event.runEventByName('afterClear', defProps.widget.events);
    emits('clear');
  };

  //select popupScroll
  const popupScroll = async (e) => {
    const st = e.target.scrollTop;
    const ost = e.target.offsetHeight;
    const sh = e.target.scrollHeight;
    if (st + ost >= sh && current.value * pageSize.value < total.value) {
      // 滚动到底部，加载下一页的数据
      current.value++;
      await getDataSource();
      selectOptions.value = [...selectOptions.value, ...dataSource.value];
    }
  };

  const handPageChange = (page) => {
    current.value = page;
    getDataSource();
  };

  // 表格的分页change
  const onShowSizeChange = () => {
    getDataSource();
  };

  /**
   * 远程请求 数据
   * @param queryData
   */
  async function getDataSource() {
    loading.value = true;
    try {
      let { exp, query } = await getBodyBySearch(searchValue.value);
      let data = [];
      // 批次查询组件透传过来
      if (defProps.extra) {
        if (defProps.extra?.props?.inclueBad) {
          query['not_good_'] = true;
        }
        if (defProps.extra?.props?.isQueryContainer) {
          data = await Event.context.$httpBizService(
            {
              action: 'listByPage',
              key: model.value,
              modelCategory: modeldata.value?.modelCategory,
            },
            { query, exp, pageNo: current.value, pageSize: pageSize.value },
          );
        } else {
          data = await Event.context.$httpBizService(
            {
              action: 'biz_search',
              key: model.value,
              modelCategory: modeldata.value?.modelCategory,
            },
            {
              query,
              exp,
              pageNo: current.value,
              pageSize: pageSize.value,
            },
          );
        }
      } else {
        data = await Event.context.$httpBizService(
          { action: 'listByPage', key: model.value, modelCategory: modeldata.value?.modelCategory },
          { query, exp, pageNo: current.value, pageSize: pageSize.value },
        );
      }

      loading.value = false;
      total.value = data.totalCount;
      dataSource.value = transformSourceData(data.data, data.dict);
      emits('afterQuery', dataSource.value, searchValue.value);
      // 只有第一页的数据才赋值给selectOptions
      if (current.value === 1) selectOptions.value = [...dataSource.value];
    } catch (error) {
      loading.value = false;
    }
  }

  function getBodyBySearch(value) {
    const { exp, query } = transformToBody(value);
    return { exp, query };
  }

  /**
   * 转化为post请求的格式
   * @param fieldWidget
   * @param state
   */
  function transformToBody(value: FieldMeta) {
    const body = {};
    const ex: any = [];
    const opeLsit = [FIELD_TYPE.LONG, FIELD_TYPE.INTEGER, FIELD_TYPE.DOUBLE, FIELD_TYPE.DECIMAL];
    let qsFields = allFields.value.filter((e) => quickSearchFields.value.some((f) => f === e.key));
    // 转Number失败，丢弃该条件
    // if (!Number(searchValue.value)) {
    //   qsFields = qsFields.filter((e) => {
    //     return !opeLsit.some((f) => f === e.type);
    //   });
    // }
    qsFields.forEach((i) => {
      const field = i.key;
      const fieldType: any = i.type;
      const ope = opeLsit.includes(fieldType) ? 'eq' : 'like';
      if (value !== null && value !== undefined && value.trim()) {
        const key = `${field}.${ope}`;
        body[key] = value;
        ex.push(`${field}.${ope}`);
      }
    });
    const exp =
      value !== null && value !== undefined && value.trim() && quickSearchFields.value?.length
        ? `OR(${ex})`
        : undefined;
    return { exp, query: body };
  }

  // 获取所有的字段信息
  const getFiledData = async () => {
    allFields.value =
      (await getFieldMetaList({
        modelKey: defProps.extra?.props?.defaultModelKey || model.value,
      })) || [];
  };

  // 表格事件
  const cellClickEvent = (record) => {
    Event.runEventByName('beforeSearch', defProps.widget.events);
    selectedVal.value = record.id_;
    open.value = false;
    emits('selected', record);
    Event.runEventByName('afterSearch', defProps.widget.events, selectedVal.value);
    dropdownVisibleChange(false);
  };

  //表格选中行的样式
  const rowClassName = (record) => {
    if (record.row.id_ === selectedVal.value) return 'gct-current-row';
    else return '';
  };

  /**序号计算逻辑 */
  function seqMethod({ rowIndex }) {
    const start = rowIndex + 1;
    return (current.value - 1) * pageSize.value + start;
  }
  onClickOutside(selectRef, () => {
    open.value = false;
    dropdownVisibleChange(false);
  });

  function returnLabel(option, idx) {
    const key = searchResultFields.value[idx];
    const val = option[key];
    const dictVal = option._DICT[key];
    if (!dictVal) return val;
    return Array.isArray(dictVal[val]) ? dictVal[val].join(',') : dictVal[val];
  }

  defineExpose<ISelectSearchComponentExpose>({
    selectRow: (record) => {
      if (searchResultFields.value.length < 3) {
        return handleSelect(selectedVal.value, record);
      }
      return cellClickEvent(record);
    },
    reload: () => {
      searchValue.value = '';
      selectedVal.value = undefined;
      getDataSource();
    },
  });
</script>
<style lang="less" scoped></style>
