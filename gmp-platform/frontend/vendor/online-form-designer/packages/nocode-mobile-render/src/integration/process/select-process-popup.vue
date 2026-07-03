<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="popupProps"
    :title="title"
    :extra-style="{
      width: '480px',
    }"
  >
    <div class="flex flex-col h-full w-full select-process-popup">
      <van-tabs class="edhr-tabs select-process-popup__tabs" shrink v-model:active="activeKey">
        <van-tab title="我的常用" name="1">
          <vxe-grid
            :columns="columns"
            :data="tableData"
            :loading="loading"
            v-bind="{
              'column-config': {
                resizable: true,
              },
              'radio-config': {
                highlight: true,
              },
              'row-config': {
                isCurrent: false,
              },
            }"
            @radio-change="onRadioChange"
          />
        </van-tab>
        <van-tab title="全部" name="2">
          <van-search
            class="flex-grow-1 select-process-popup__search"
            shape="round"
            v-model:modelValue="searchVal"
            placeholder="请输入流程名称查询"
          />
          <div class="select-process-popup__grid">
            <vxe-grid
              height="auto"
              :columns="tableColumns"
              :data="showTableDataAll"
              :loading="loadingAll"
              v-bind="{
                'column-config': {
                  resizable: true,
                },
                'radio-config': {
                  highlight: true,
                  reserve: true,
                },
                'row-config': {
                  isCurrent: false,
                  keyField: 'id',
                },
              }"
              @radio-change="onRadioChange"
            />
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk"> 确认 </van-button>
      </div>
    </template>
  </BasicPopup>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted, computed } from 'vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getPmProcessDefinitionPageList } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import { showNotify } from 'vant';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      title: string;
      categoryId?: '__summary_process__' | '__change_process__';
      popupProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {
      categoryId: '__summary_process__',
    },
  );

  const show = ref(true);
  const activeKey = ref('1');
  const tableData = ref([]);
  const tableDataAll = ref<any[]>([]);
  const loading = ref(false);
  const loadingAll = ref(false);
  const columns = [
    { type: 'radio', width: 50 },
    {
      title: '流程名称',
      field: 'approve_tmpl_name_',
    },
    {
      title: '流程描述',
      field: 'approve_tmpl_description_',
      formatter: ({ cellValue }) => {
        return cellValue || '--';
      },
    },
  ];
  const tableColumns = [
    { type: 'radio', width: 50 },
    {
      title: '流程名称',
      field: 'name',
    },
    {
      title: '流程描述',
      field: 'description',
      formatter: ({ cellValue }) => {
        return cellValue || '--';
      },
    },
  ];
  const formState = reactive<any>({});
  /** 搜索条件 */
  const searchVal = ref('');
  const selectedRow = ref();
  const showTableDataAll = computed(() => {
    return tableDataAll.value.filter((item) => {
      if (!searchVal.value) {
        return true;
      }
      return item.name.includes(searchVal.value);
    });
  });

  const pagination = reactive({
    current: 1,
    pageSize: 99999,
    total: 0,
  });

  onMounted(() => {
    getCommonTableData();
    getTableDataAll();
  });

  async function getTableDataAll(pageNo?) {
    loadingAll.value = true;
    try {
      const res: any = await getPmProcessDefinitionPageList({
        query: formState.name,
        pageNo: pageNo || pagination.current,
        pageSize: pagination.pageSize,
        categoryId: props.categoryId,
      });
      tableDataAll.value = res.data || [];
      pagination.total = res.totalCount;
      loadingAll.value = false;
    } catch (error) {
      loadingAll.value = false;
    }
  }

  async function getCommonTableData() {
    loading.value = true;
    try {
      const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_edhr_summary_approve_common_use',
          bsKey: 'biz_search',
        },
        {
          type_: props.categoryId === '__change_process__' ? 'CHANGE' : 'SUMMARY',
        },
      );
      tableData.value = (res || []).map((item) => {
        return {
          ...item,
          ...item.doc_info_,
        };
      });
      if (!tableData.value.length) {
        activeKey.value = '2';
      }
      loading.value = false;
    } catch (error) {
      loading.value = false;
    }
  }

  const onRadioChange = ({ row }) => {
    console.log('change', row);
    selectedRow.value = row;
  };

  /** 执行关闭操作 */
  const doClose = (data?: any) => {
    const isClosed = props.beforeClose(data);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    if (!selectedRow.value) {
      showNotify({ type: 'warning', message: '请选择流程' });
      return;
    }
    const { approve_tmpl_id_, id } = selectedRow.value;
    return doClose({
      id: activeKey.value === '1' ? approve_tmpl_id_ : id,
    });
  };
</script>
<style lang="less" scoped>
  .select-process-popup {
    padding: 16px;
    background: #f7f8fa;
    :deep(.van-tabs) {
      .van-tabs__content {
        height: calc(100% - 44px);
      }
      .van-tab__panel {
        height: 100%;
      }
    }

    &__tabs {
      height: 100%;
      background: #fff;
      border-radius: 0px 0px 0px 0px;
      :deep(.van-tab__panel) {
        padding: 16px;
      }
    }

    &__search {
      padding: 0 0 16px 0;
    }

    &__grid {
      height: calc(100% - 44px);
    }
  }
</style>
