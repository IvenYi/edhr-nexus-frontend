<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    :columns="
      computedDataFieldColumns.map((e) => {
        e.title = t(e.title);
        return e;
      })
    "
    :dataSource="filterTableData"
    :pagination="false"
    row-draggable
    class="model-designer-basic-table"
    :row-drag-api="postFieldMetaMove"
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
            allowClear
            @pressEnter="handleSearch"
          >
            <template #prefix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1" style="height: 22px"></i>
            </template>
          </a-input>
          <!-- <a-button
            type="primary"
            v-if="!showAllFields"
            @click="handleAddField"
            style="margin-left: 20px"
          >
            <template #icon><plus-outlined /></template>
            {{ t('sys.new') }}
          </a-button> -->
        </a-col>
        <a-col>
          <a-button v-if="!modelReadonly" type="primary" @click="handleAddField">
            <template #icon><plus-outlined /></template>
            {{ t('sys.new') }}
          </a-button>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ column, index, record }">
      <template v-if="column.key === 'index'">
        <span>{{ index + 1 }}</span>
      </template>
      <template v-if="column.key === 'defaultValue'">
        <span>{{ getDefaultValue(record) }}</span>
      </template>
      <template v-if="column.key === 'key'">
        <key-outlined v-if="record.primaryKey" class="primary-gct" />
        {{ record.key }}
      </template>
      <template v-if="column.key === 'createType'">
        <span>{{ getFieldSource(record) }}</span>
      </template>
      <template v-if="column.key === 'bindInfo'">
        <span
          class="ref-model-name"
          :title="refModelName(record.bindInfo)"
          @click="goToTabs(record.bindInfo, record)"
          >{{ refModelName(record.bindInfo) }}</span
        >
      </template>
      <template v-if="column.key === 'description'">
        <span :title="record.description">{{ record.description }}</span>
      </template>
      <template v-if="column.key === 'type'">
        <span>{{
          t(
            `sys.pageDesigner.fieldCmp.${
              record?.refModelType === 'WAREHOUSE_IN_OUT'
                ? FIELD_TYPE.WAREHOUSE_IN_OUT
                : record.type
            }`,
          )
        }}</span>
      </template>
      <template v-if="column.key === 'required'">
        <span>{{ record.required ? t('sys.pageDesigner.required') : '' }}</span>
      </template>
      <template v-if="column.key === 'status'">
        <slot name="status" v-bind="{ column, index, record }"></slot>
      </template>
      <template v-if="column.key === 'uniqueConstraint'">
        <span>{{
          getChUniqueConstraint(record.uniqueConstraint, props.model.supportTree, record.type)
        }}</span>
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record),
              ifShow:
                !modelReadonly &&
                (record.createType === CreateType.USER_DEFINED ||
                  (record.createType === CreateType.BUILTIN &&
                    (record.initCommitId === '__0000__' || record.key === 'operating_state_'))),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              placement: 'topRight',
              popConfirm: {
                title: t('sys.sureToDo'),
                confirm: handleRowDelete.bind(null, record),
              },
              ifShow: record.createType === CreateType.USER_DEFINED && !modelReadonly,
            },
            {
              label: t('sys.pageDesigner.subTableField'),
              ifShow:
                record.createType === CreateType.USER_DEFINED &&
                isInOnlineForm &&
                record.type === 'master_slave',
              onClick: openSubFieldDrawer.bind(null, record),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>

  <sub-field-drawer ref="SubFieldDrawerRef" />
  <FieldTypeModal
    ref="FieldTypeModalRef"
    :isSubModel="!!model.subModel"
    :maxSubLevel="model.maxSubLevel"
    :keyList="keyList"
    @next="handleNext"
  />
  <field-modal
    :isSubModel="!!model.subModel"
    :hideUniqueKey="isRodOrWorkflow"
    :nameList="nameList"
    :keyList="keyList"
    :isRdoModel="isRdoModel"
    :maxSubLevel="model.maxSubLevel"
    @register="register"
    @ok="handleFieldModalOk"
    @refresh="handleFieldModalRefresh"
    @prev="handlePrev"
  />
</template>

<script setup lang="ts">
  import { ref, watch, computed, inject, onMounted, nextTick } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { dataFieldColumns } from '../../constant/columns';
  import { useModal } from '/@/components/Modal';
  import { SearchOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import FieldModal from './modal/field-modal.vue';
  import SubFieldDrawer from './modal/sub-field-drawer.vue';
  import FieldTypeModal from './modal/field-type-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getFieldMetaList,
    deleteFieldMeta,
    postFieldMetaSave,
    putFieldMetaById,
    postFieldMetaMove,
  } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO, ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getChUniqueConstraint } from '../../constant/index';
  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
  import { cloneDeep, get } from 'lodash-es';
  import { postOnlineFormTmplSaveField } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { message } from 'ant-design-vue';

  const emit = defineEmits(['update', 'node-change', 'handle-expand', 'handle-tab-click']);
  const { t } = useI18n();
  const tableRef = ref();
  const { createMessage } = useMessage();
  const isInOnlineForm = inject<boolean>('isInOnlineForm', false);
  const OnlineFOrmDataFieldColumns = inject<any>('OnlineFOrmDataFieldColumns', []);
  const modelReadonly = inject<boolean>('modelReadonly', false);
  //props
  const props = defineProps({
    model: {
      type: Object as PropType<ModelMetaResponse>,
      default: {},
    },
    showAllFields: Boolean,
  });
  //table search
  const FieldTypeModalRef = ref();
  const SubFieldDrawerRef = ref();
  const isShowSysField = ref(true);
  const searchKey = ref('');
  const tableData = ref<FieldMetaDTO[]>([]);
  const filterTableData = ref<Array<FieldMetaDTO>>([]);
  const { setTreeSelected, moduleData } = useTreeSiderPage('ModelDesigner');
  const enumModules = ref<any[]>([]);
  const entityModules = ref<any[]>([]);

  const getTableData = async (reload?) => {
    if (!props.model.key) return;
    const res = await getFieldMetaList({
      modelKey: props.model.key!,
      includeProcess: !!props.model.supportProcess,
    });
    tableData.value = res!.map((i) => ({
      ...i,
      undragable: i?.fieldCategory == 'process',
    }));
    if (searchKey.value) {
      handleSearch();
      return;
    }
    filterTableData.value = showTableData.value;
  };

  const handleSearch = () => {
    const keyword = searchKey.value.toLowerCase();
    filterTableData.value = showTableData.value.filter(
      (ele) => ele.name.toLowerCase().includes(keyword) || ele.key.toLowerCase().includes(keyword),
    );
  };

  const handleFieldModalRefresh = async ({ cb }) => {
    await getTableData();
    if (cb && typeof cb === 'function') {
      cb();
    }
  };

  watch(
    () => props.model.key,
    () => {
      getTableData();
    },
    {
      immediate: true,
    },
  );

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        filterTableData.value = showTableData.value;
      }
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

  const isRodOrWorkflow = computed(() => {
    return [EntityModelTypeEnum.RDO, EntityModelTypeEnum.WORKFLOW].includes(props.model.type);
  });

  const isRdoModel = computed(() => {
    return [EntityModelTypeEnum.RDO].includes(props.model.type);
  });

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
    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(record.type)) {
      const tab = ModelTypeOptions.find((i) => i.code === ModelTypeEnum.ENUM);
      emit('handle-tab-click', tab);
      await nextTick();
    }
    setTreeSelected(bindInfo);
    emit('node-change', node);
    emit('handle-expand', node2);
  };

  const computedDataFieldColumns = computed(() => {
    let columns = cloneDeep(dataFieldColumns);
    // if (!props.showAllFields) {
    //   columns = columns.filter((n) => n.dataIndex !== 'createType');
    // }
    if (isRodOrWorkflow.value) {
      columns = columns.filter((n) => n.dataIndex !== 'uniqueConstraint');
    }
    if (!isInOnlineForm) {
      return columns;
    } else {
      if (props.model.subModel) {
        return OnlineFOrmDataFieldColumns.filter((n) => n.dataIndex !== 'status');
      }
      return OnlineFOrmDataFieldColumns;
    }
  });

  const showTableData = computed(() => {
    const list = tableData.value.map((i) => ({
      ...i,
      createUserName: setUserName(i.createUserName, i.createType),
      modifyUserName: setUserName(i.modifyUserName, i.createType),
    }));
    return props.showAllFields || isShowSysField.value
      ? list
      : list.filter((d) => {
          return ![CreateType.SYSTEM, CreateType.BUILTIN].includes(d.createType!);
        });
  });

  const nameList = computed(() => {
    return showTableData.value.map((i) => i.name);
  });

  const keyList = computed(() => {
    return showTableData.value.map((i) => i.key);
  });

  const setUserName = (name, type) => {
    return name == '__SYS__' || [CreateType.SYSTEM, CreateType.BUILTIN].includes(type)
      ? name || t('sys.system')
      : name;
  };

  //字段弹框打开
  const handleAddField = () => {
    FieldTypeModalRef.value?.open();
    // openFieldModal(true, {
    //   isEdit: false,
    //   modelKey: props.model.key,
    //   boolSupportTree: Boolean(props.model.supportTree),
    // });
  };

  const handleFieldModalOk = async (data) => {
    if (data?.id) {
      await putFieldMetaById({ id: data.id }, data);
      message.success(t('sys.editSuccess'));
    } else {
      isInOnlineForm ? await postOnlineFormTmplSaveField(data) : await postFieldMetaSave(data);
      message.success(t('sys.createSuccess'));
    }
    closeModal();
    getTableData();
    emit('update');
  };

  const handleRowEdit = (record) => {
    openFieldModal(true, {
      ...record,
      isEdit: true,
      type: record.refModelType === 'WAREHOUSE_IN_OUT' ? FIELD_TYPE.WAREHOUSE_IN_OUT : record.type,
      modelKey: props.model.key,
      boolSupportTree: Boolean(props.model.supportTree),
    });
  };
  const handleRowDelete = async (record) => {
    await deleteFieldMeta(
      { id: record.id },
      {
        joinParamsToUrl: true,
      },
    );
    createMessage.success(t('sys.delSuccess'));
    getTableData();
    emit('update');
  };

  const openSubFieldDrawer = (record) => {
    SubFieldDrawerRef.value?.onOpen(record.bindInfo);
  };
  //modal框
  const [register, { openModal: openFieldModal, closeModal }] = useModal();

  const getDefaultValue = (record) => {
    // if (record.createType !== CreateType.USER_DEFINED) {
    //   return '-';
    // }
    const defaultArr = record.defaultValueTips || [];
    if (record.type === FIELD_TYPE.DECIMAL) {
      return defaultArr
        .map((d) => {
          if (d) {
            return parseFloat(d).toFixed(get(record, 'specificConfig.digits', 0));
          } else {
            return '';
          }
        })
        .join(',');
    }
    return record.defaultValueTips ? record.defaultValueTips.join(',') : '';
  };

  const getFieldSource = (record) => {
    // 流程字段
    if (record.createType === CreateType.BUILTIN && record.fieldCategory === 'process') {
      return t(`sys.pageDesigner.fieldCmp.PROCESS`);
    }
    // 业务字段
    if (record.createType === CreateType.BUILTIN && record.initCommitId === '__0000__') {
      return t(`sys.pageDesigner.fieldCmp.BUSINESS`);
    }
    return t(`sys.pageDesigner.fieldCmp.${record.createType}`);
  };

  // 下一步
  const handleNext = (type, history, extField) => {
    openFieldModal(true, {
      isEdit: false,
      modelKey: props.model.key,
      boolSupportTree: Boolean(props.model.supportTree),
      type,
      history,
      ...(extField || {}),
    });
  };

  // 上一步
  const handlePrev = (data, history) => {
    FieldTypeModalRef.value?.open(data, history);
  };

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
<style lang="less">
  .model-designer-basic-table .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td,
  .ant-table-row-hover,
  .ant-table-row-hover > td {
    // background-color: #edf5f5 !important;
    background: var(--vxe-table-row-hover-background-color) !important;
  }

  .model-designer-basic-table .ant-table-cell-row-hover {
    background-color: #fff !important;
  }
</style>
