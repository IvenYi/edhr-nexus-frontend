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
          <a-tag v-if="isPackage(option)" color="#2db7f5"> 包装 </a-tag>
          {{ returnLabel(option, 0, null) }}
        </div>
        <div
          v-if="searchResultFields.length === 2"
          class="text-[#CCCCCC] text-12px mt2px"
          style="min-height: 22px"
        >
          {{ returnLabel(option, 1, null) }}
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
      :getPopupContainer="getPopupContainer"
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
      @click="open = true"
      @clear="handleClear"
    >
      <template #dropdownRender>
        <div @click.stop class="relative">
          <vxeRenderTable
            :loading="loading"
            v-model="dataSource"
            :tableColumns="tableColumns"
            :border="false"
            :row-class-name="rowClassName"
            :serial-number="true"
            :maxHeight="extra?.maxHeight || 300"
            :seqMethod="seqMethod"
            :autoResize="true"
            @getDataSource="getDataSource"
            @cellClickEvent="cellClickEvent"
          >
            <template #field="{ widget: i, row, rowIndex }">
              <span v-if="isPackage(row) && isFirstColumn(i)">
                <a-tag color="#2db7f5"> 包装 </a-tag>
                {{ returnLabel(row, null, i.props.field) }}
              </span>
              <table-cell
                v-else
                class="ell w100%"
                :widget="i"
                :rowValue="row"
                :index="rowIndex"
                :rowReadonly="i.props.readonly"
              />
            </template>
          </vxeRenderTable>
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
  import { ref, toRefs, onMounted, computed } from 'vue';
  import { onClickOutside } from '@vueuse/core';
  // @ts-ignore
  import { SelectSearch } from '/@page-designer/types/web';
  // @ts-ignore
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  // @ts-ignore
  import { FIELD_TYPE } from '@/enums/appEnum';
  // @ts-ignore
  import { FieldMeta, FieldMetaDTO } from '/@/apis/gct-apaas/model';
  // @ts-ignore
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  // @ts-ignore
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';
  // @ts-ignore
  import vxeRenderTable from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable/index.vue';
  import { IContainerSearch } from '../schema';
  import { tableCell } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';

  const getPopupContainer = () => {
    return document.body;
  };
  const { t } = useI18n();
  const Event = getPageEvent();
  const defProps = defineProps<{ widget: IContainerSearch; extra: any; modelValue?: string }>();
  const emits = defineEmits<{
    (e: 'selected', data: any): void;
    (e: 'clear'): void;
    (e: 'afterQuery', dataSource: Array<any>, query: string): void;
    (e: 'beforeQuery', data: any): void;
    (e: 'update:modelValue', value: string | undefined): void;
  }>();

  const {
    modelData,
    defaultModelKey,
    placeholder,
    quickSearchFields,
    searchResultFields,
    notGoodContainer,
    showPackagingContainer,
    searchModify,
  } = toRefs(defProps.widget.props);

  const searchValue = ref();
  const allFields = ref<FieldMeta[]>([]);
  const selectRef = ref();
  const open = ref(false);
  const dataSource = ref<Array<FieldMetaDTO>>([]);
  const selectOptions = ref<Array<FieldMetaDTO>>([]);
  const current = ref(1);
  const total = ref(0);
  const loading = ref(false);
  const pageSize = ref(20);
  const pageSizeOptions = ref<string[]>(['10', '20', '30']);

  const tableColumns = computed(() => {
    const children = defProps.widget.children[0];
    return children;
  });

  onMounted(() => {
    getFiledData();
    getDataSource();
  });

  const selectedVal = computed({
    get() {
      return defProps.modelValue || undefined;
    },
    set(value) {
      if (value) {
        emits('update:modelValue', value);
      } else {
        emits('update:modelValue', undefined);
      }
    },
  });

  // select查询(默认回车)
  const handleKeyDown = (e) => {
    if (e.keyCode === searchModify.value) {
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
    emits('selected', option);
  };

  // select清除事件
  const handleClear = () => {
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
      let { exp = '', query } = await getBodyBySearch(searchValue.value);
      let data: any = {};
      if (notGoodContainer.value) {
        query['not_good_'] = true;
      }
      // 不展示包装批次 - query参数增加package_: false
      if (!showPackagingContainer?.value) {
        query['package_'] = false;
      }
      // query['package_'] = !!showPackagingContainer?.value;
      emits('beforeQuery', { query, exp, pageNo: current.value, pageSize: pageSize.value });
      data = await Event.context.$httpBizService(
        {
          action: defProps.widget.props.txnType ? 'biz_search' : 'listByPage',
          key: defProps.widget.props.txnType || defaultModelKey.value,
          modelCategory: modelData.value!.modelCategory,
        },
        { query, exp, pageNo: current.value, pageSize: pageSize.value },
      );

      loading.value = false;
      total.value = data?.totalCount;
      // data.data.map((d, i) => (d.package_ = i % 3 === 0)); // 测试数据，模拟包装箱数据
      dataSource.value = transformSourceData(data.data, data.dict) as any;
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
        modelKey: defaultModelKey.value || defProps.widget.props.model,
      })) || [];
  };

  // 表格事件
  const cellClickEvent = (record) => {
    selectedVal.value = record.id_;
    open.value = false;
    emits('selected', record);
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

  function returnLabel(option, idx, key_) {
    const key = key_ ? key_ : tableColumns.value[idx].props.field;
    const val = option[key];
    const dictVal = option._DICT[key];
    if (!dictVal) return val;
    return Array.isArray(dictVal[val]) ? dictVal[val].join(',') : dictVal[val];
  }

  function isPackage(option) {
    return !!option.package_;
  }

  function isFirstColumn(widget) {
    const index = tableColumns.value.findIndex((d) => d.id === widget.id);
    return index === 0;
  }

  onClickOutside(selectRef, () => {
    open.value = false;
  });

  defineExpose({
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
<style lang="less" scoped>
  .ant-tag {
    border: 0;
  }
</style>
