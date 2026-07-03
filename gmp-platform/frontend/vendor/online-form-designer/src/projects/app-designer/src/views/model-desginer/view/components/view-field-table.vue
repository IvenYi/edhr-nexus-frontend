<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    class="model-designer-basic-table"
    :columns="viewFieldColumns"
    :dataSource="filterTableData"
    :pagination="false"
    row-draggable
    :row-drag-api="fieldMetaMove"
    @row-drag-end="
      () => {
        createMessage.success(t('sys.operationSuccess'));
        getTableData();
      }
    "
  >
    <template #headerTop>
      <a-row justify="space-between" type="flex">
        <a-col style="display: flex">
          <a-input
            v-model:value="searchKey"
            :placeholder="t('sys.searchFieldKey')"
            alowClear
            @pressEnter="getTableData"
          >
            <template #prefix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
        </a-col>
        <a-col>
          <a-button @click="handlePreview" class="mr-16px">
            <!-- <template #icon><plus-outlined /></template> -->
            {{ t('sys.dataPreview') }}
          </a-button>
          <a-button type="primary" @click="handleAddField">
            <template #icon><plus-outlined /></template>
            {{ t('sys.new') }}
          </a-button>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ index, column, record }">
      <template v-if="column.key === 'index'">
        <span>{{ index + 1 }}</span>
      </template>
      <template v-if="column.key === 'key'">
        <key-outlined v-if="record.primaryKey" class="primary-gct" />
        {{ record.key }}
      </template>
      <template v-if="column.key === 'type'">
        <span>{{ t(`sys.pageDesigner.fieldCmp.${record.type}`) }}</span>
      </template>
      <template v-if="column.key === 'bindInfo'">
        <span
          class="ref-model-name"
          :title="refModelName(record.bindInfo)"
          @click="goToTabs(record.bindInfo, record)"
          >{{ refModelName(record.bindInfo) }}</span
        >
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record, index),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              placement: 'topRight',
              popConfirm: {
                title: t('sys.sureToDo'),
                confirm: handleRowDelete.bind(null, record, index),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>

  <view-filed-modal :modelKeys="modelKeys" @register="register" @refresh="onRefresh" />
  <view-preview-modal @register="registerPreview" />
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, nextTick } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { viewFieldColumns } from '../constant/columns';
  import { useModal } from '/@/components/Modal';
  import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { putViewModelById, getViewModelInfo } from '/@/apis/gct-apaas/ViewModelController';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ViewFiledModal from '../modal/view-filed-modal.vue';
  import { cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ViewFieldSelect } from './view-field-select/view-field-select';
  import { message } from 'ant-design-vue';
  import ViewPreviewModal from '../modal/view-preview-modal.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { ModelTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const { t } = useI18n();

  const { createMessage } = useMessage();

  interface IProps {
    model: any;
  }

  const props = defineProps<IProps>();
  const emit = defineEmits(['update', 'node-change', 'handle-expand', 'handle-tab-click']);
  // modal框
  const [register, { openModal }] = useModal();
  const [registerPreview, { openModal: openModalPreview }] = useModal();
  const tableRef = ref();
  const searchKey = ref('');
  const filterTableData = ref();
  const { setTreeSelected, moduleData } = useTreeSiderPage('ModelDesigner');
  const enumModules = ref<any[]>([]);
  const entityModules = ref<any[]>([]);

  const tableData = computed(() => {
    return (
      props.model?.fieldConfig?.fields.map((i, index) => ({
        ...i,
        sortNum: index,
      })) ?? []
    );
  });

  watch(
    () => tableData.value,
    () => {
      getTableData();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
    {
      immediate: true,
    },
  );

  onMounted(async () => {
    if (!moduleData.value.enum_module?.length) {
      const res = (await getCategoryListComplete({ module: 'enum_module' })) || [];
      enumModules.value = res!.map((i) => i.children!).flat();
    }
    if (!moduleData.value.entity_module?.length) {
      const res = (await getCategoryListComplete({ module: 'entity_module' })) || [];
      entityModules.value = res!.map((i) => i.children!).flat();
    }
  });

  const categoryList = computed(() => {
    const enumModuleList = moduleData.value.enum_module?.length
      ? moduleData.value.enum_module.map((i) => i.children!).flat()
      : enumModules.value;
    const entityModuleList = moduleData.value.entity_module?.length
      ? moduleData.value.entity_module.map((i) => i.children!).flat()
      : enumModules.value;
    return [...enumModuleList, ...entityModuleList];
  });

  function getTableData() {
    filterTableData.value = tableData.value.filter((item) => {
      return item.key.toLowerCase().includes(searchKey.value.toLowerCase()) || item.name.toLowerCase().includes(searchKey.value.toLowerCase());
    });
  }

  const modelKeys = computed(() => {
    return [props.model?.joinConfig?.mainModelKey]
      .concat(...(props.model?.joinConfig?.joins ?? []).map((item) => item.modelKey))
      .filter((i) => i);
  });

  //字段弹框打开
  const handleAddField = async () => {
    const keys = filterTableData.value.map((i) => i.key);
    const result = await gct.openUtil.modal(
      ViewFieldSelect,
      {
        sourceFields: tableData.value,
        joinConfig: props.model?.joinConfig,
        id: props.model.id,
        hasKeys: keys,
      },
      { title: `${t('sys.new')}${t('sys.field')}`, width: 1040, height: 745 },
    );
    if (result.ok) {
      onRefresh(props.model.id);
      message.success(t('sys.model.viewCreateFieldSuccess'));
    }
  };

  const handlePreview = () => {
    if (tableData.value.length) {
      openModalPreview(true, { model: props.model?.id });
    } else {
      message.warning(t('sys.previewNoDataTip') + '！');
    }
  };

  const onRefresh = async (key) => {
    emit('update', key);
  };

  const handleRowEdit = (record, index) => {
    openModal(true, {
      ...record,
      isEdit: true,
      recordIndex: index,
      viewId: props.model.id,
    });
  };

  const handleRowDelete = async (record, index) => {
    const info = await getViewModelInfo({ id: props.model.id });
    const cloneInfo = cloneDeep(info);
    if (cloneInfo && cloneInfo.fieldConfig?.fields) {
      const i = cloneInfo.fieldConfig.fields.findIndex((i) => i.id == record.id);
      cloneInfo.fieldConfig.fields.splice(i, 1);

      await putViewModelById(
        {
          id: props.model.id,
        },
        cloneInfo,
        {
          transferToConfig: { headers: { operateType: 'DELETE' } },
        },
      );
      createMessage.success(t('sys.delSuccess'));
      onRefresh(props.model.id);
    }
  };

  const refModelName = computed(() => {
    return (bindInfo) => {
      return bindInfo ? categoryList.value.find((i) => i.id === bindInfo)?.name : '';
    };
  });

  const goToTabs = async (bindInfo, record) => {
    const item = categoryList.value.find((i) => i.id === bindInfo);
    const node = {
      id: bindInfo,
      name: item?.name,
    };
    const node2 = {
      id: item?.categoryId,
    };
    let tab = ModelTypeOptions.find((i) => i.code === ModelTypeEnum.ENTITY);
    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(record.type)) {
      tab = ModelTypeOptions.find((i) => i.code === ModelTypeEnum.ENUM);
    }
    emit('handle-tab-click', tab);
    await nextTick();
    setTreeSelected(bindInfo);
    emit('node-change', node);
    emit('handle-expand', node2);
  };

  const fieldMetaMove = async (e) => {
    let toIndex = e.targetSortNum;
    const info = await getViewModelInfo({ id: props.model.id });
    const cloneInfo = cloneDeep(info);
    if (cloneInfo && cloneInfo.fieldConfig?.fields) {
      const fromIndex = cloneInfo.fieldConfig.fields.findIndex((i) => i.id === e.id);
      // console.log('fieldMetaMove', e, fromIndex);
      // 从第二行拖到第一行
      if (e.targetSortNum && fromIndex && fromIndex >= e.targetSortNum) {
        toIndex = e.targetSortNum - 1;
      }
      moveArrayElement(cloneInfo.fieldConfig.fields, fromIndex, toIndex);
      await putViewModelById(
        {
          id: props.model.id,
        },
        cloneInfo,
        {
          transferToConfig: { headers: { operateType: 'UPDATE' } },
        },
      );
      onRefresh(props.model.id);
    }
  };

  function moveArrayElement(arr, fromIndex, toIndex) {
    // 检查索引是否有效
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) {
      throw new Error('Invalid index');
    }
    // 提取目标元素
    const element = arr.splice(fromIndex, 1)[0];
    // 在目标位置插入提取出的元素
    arr.splice(toIndex, 0, element);
    return arr;
  }

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less" scoped>
  .ref-model-name {
    color: var(--ant-primary-color);
    cursor: pointer;
  }
</style>
