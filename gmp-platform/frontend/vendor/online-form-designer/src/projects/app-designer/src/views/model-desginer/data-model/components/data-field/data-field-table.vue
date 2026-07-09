<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    class="model-designer-basic-table"
    :columns="dataFieldColumns"
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
            @pressEnter="handleSearch"
            style="margin-right: 20px"
          >
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>
        </a-col>
        <a-col>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleAddField">
                <a-menu-item v-for="item in UserFieldTypeOptions" :key="item.value">{{
                  t(item.label)
                }}</a-menu-item>
              </a-menu>
            </template>
            <a-button type="primary">{{ t('sys.new') }}<DownOutlined /></a-button>
          </a-dropdown>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ index, column, record }">
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
      <template v-if="column.key === 'type'">
        <span>{{
          record.primaryKey
            ? t('sys.model.primaryKey')
            : t(`sys.model.${record.type === FIELD_TYPE.ENUM ? 'ref_enum' : record.type}`)
        }}</span>
      </template>
      <template v-if="column.key === 'required'">
        <span>{{ record.required ? t('sys.pageDesigner.required') : '' }}</span>
      </template>
      <!-- <template v-if="column.key === 'required'">
        <span>{{ record.required ? t('sys.true') : t('sys.false') }}</span>
      </template> -->
      <template v-if="column.key === 'action' && ![CreateType.SYSTEM].includes(record.createType!)">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              placement: 'topRight',
              popConfirm: {
                title: t('sys.sureToDo'),
                confirm: handleRowDelete.bind(null, record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>

  <FieldTypeModal
    ref="FieldTypeModalRef"
    :isDataModel="true"
    :isSubModel="!!model.subModel"
    @next="handleNext"
  />
  <field-modal
    :isDataModel="true"
    :dataModelConfirm="dataModelConfirm"
    :keyList="keyList"
    :maxSubLevel="model.maxSubLevel"
    @register="register"
    @ok="handleFieldModalOk"
    @refresh="getTableData"
    @prev="handlePrev"
  />
  <check-field-modal @register="checkregister" @ok="handleCheckFieldOk" />
</template>

<script setup lang="ts">
  import { ref, watch, computed, reactive, onMounted, nextTick } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { dataFieldColumns } from '../../constant/columns';
  import { useModal } from '/@/components/Modal';
  import FieldModal from '../../../entity/components/data-field/modal/field-modal.vue';
  import FieldTypeModal from '../../../entity/components/data-field/modal/field-type-modal.vue';
  import CheckFieldModal from './modal/check-field-modal.vue';
  import { FieldAttribute, DataModelResponse, DataModelRequest } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
  import { get, omit, cloneDeep } from 'lodash-es';
  import { putDataModelById } from '/@/apis/gct-apaas/DataModelController';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeOptions } from '/@/layouts/tree-sider-page/constant';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { message } from 'ant-design-vue';

  interface FormState extends DataModelRequest {
    id?: string;
  }

  const formState = reactive<FormState>({
    categoryId: undefined,
    name: undefined,
    key: undefined,
    description: undefined,
    fieldConfig: undefined,
    fieldMapping: undefined,
    id: undefined,
  });

  const fieldItem = reactive<FieldAttribute>({
    createType: undefined,
    defaultValue: undefined,
    description: undefined,
    i18nConfig: undefined,
    key: undefined,
    mappingType: undefined,
    name: undefined,
    required: undefined,
    specificConfig: undefined,
    type: undefined,
    defaultValueTips: undefined,
    bindInfo: undefined,
  });

  const fieldDataTable = ref<FieldAttribute[]>([]);
  const UserFieldTypeOptions = [
    {
      value: 'create',
      label: 'sys.appDesigner.create',
    },
    {
      value: 'add',
      label: 'sys.pageDesigner.add',
    },
  ];

  const emit = defineEmits(['update', 'node-change', 'handle-expand', 'handle-tab-click']);
  const { t } = useI18n();
  const tableRef = ref();
  const { createMessage } = useMessage();
  //props
  const props = defineProps({
    model: {
      type: Object as PropType<DataModelResponse>,
      default: () => {},
    },
    category: {
      type: String,
      default: '',
    },
  });

  //table search
  const FieldTypeModalRef = ref();
  const isShowSysField = ref(true);
  const searchKey = ref('');
  const tableData = ref<FieldAttribute[]>([]);
  const filterTableData = ref<Array<FieldAttribute>>([]);

  const isEdit = ref<boolean>(false);
  const { setTreeSelected, moduleData } = useTreeSiderPage('ModelDesigner');
  const enumModules = ref<any[]>([]);
  const entityModules = ref<any[]>([]);

  const getTableData = async (reload?) => {
    if (!props.model.key) return;
    // const res = await getFieldMetaList({ keyword: searchKey.value, modelKey: props.model.key! });
    tableData.value =
      props.model?.fieldConfig
        ?.map((i, index) => ({
          ...i,
          sortNum: index,
        }))
        ?.filter((i: any) => {
          return i.name?.indexOf(searchKey.value) > -1 || i.key?.indexOf(searchKey.value) > -1;
        }) || [];
    filterTableData.value = showTableData.value

  };

  //modal框
  const [register, { openModal: openFieldModal, closeModal }] = useModal();
  const [checkregister, { openModal: openCkeckFieldModal, closeModal: closeCheckModal }] =
    useModal();

  watch(
    () => props.model.fieldConfig,
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

  const setUserName = (name, type) => {
    return name == '__SYS__' || [CreateType.SYSTEM, CreateType.BUILTIN].includes(type)
      ? t('sys.system')
      : name;
  };

  const showTableData = computed(() => {
    const list = tableData.value.map((i) => ({
      ...i,
      createUserName: setUserName(i.createUserName, i.createType),
      modifyUserName: setUserName(i.modifyUserName, i.createType),
      createType: i.createType === CreateType.SYSTEM ? CreateType.SYSTEM : CreateType.USER_DEFINED,
    }));
    return isShowSysField.value
      ? list
      : list.filter((d: any) => {
          return ![CreateType.SYSTEM, CreateType.BUILTIN].includes(d.createType!);
        });
  });

  const keyList = computed(() => {
    return showTableData.value.map((i) => i.key);
  });

  //字段弹框打开
  const handleAddField = (e) => {
    if (e.key === 'create') {
      FieldTypeModalRef.value?.open();
    } else if (e.key === 'add') {
      openCkeckFieldModal(true, {
        isEdit: false,
        modelKey: props.model.key,
        fieldConfig: props.model?.fieldConfig,
      });
    }
    isEdit.value = false;
    // openFieldModal(true, {
    //   isEdit: false,
    //   modelKey: props.model.key,
    //   boolSupportTree: Boolean(props.model.supportTree),
    // });
  };

  const handleSearch = (e)=>{
    filterTableData.value = showTableData.value.filter((ele) => ele.name.toLowerCase().includes(searchKey.value.toLowerCase())||ele.key.toLowerCase().includes(searchKey.value.toLowerCase()));
   }

  const handleFieldData = (data) => {
    Object.assign(fieldItem, omit(data, ['uniqueConstraint']));
    !fieldItem.createType && (fieldItem.createType = 'USER_DEFINED');
    if (props.model?.fieldConfig?.map((item) => item.key).includes(fieldItem.key)) {
      if (isEdit.value) {
        props.model?.fieldConfig.forEach((i) => {
          if (i.key == fieldItem.key) {
            for (let key in i) {
              i[key] = fieldItem[key];
            }
          }
        });
        fieldDataTable.value = props.model?.fieldConfig;
      } else {
        createMessage.error(t('sys.model.uniqueField'));
        return;
      }
    } else {
      fieldDataTable.value = [fieldItem, ...props.model.fieldConfig!];
    }
    handleFormState();
  };

  /**新增&编辑数据处理 */
  const handleFieldModalOk = async (data) => {
    handleFieldData(data);
    await putDataModelById({ id: formState.id }, formState, {
      transferToConfig: { headers: { operateType: data.isEdit ? 'UPDATE' : 'INSERT' } },
    });
    message.success(t(data.isEdit ? 'sys.editSuccess' : 'sys.createSuccess'));
    closeModal();
    emit('update', props.model.key);
  };

  /**确认数据处理 */
  const dataModelConfirm = async (data) => {
    handleFieldData(data);
    await putDataModelById({ id: formState.id }, formState);
    emit('update', props.model.key);
  };

  /**编辑 */
  const handleRowEdit = (record) => {
    isEdit.value = true;
    openFieldModal(true, {
      ...record,
      isEdit: true,
      modelKey: props.model.key,
      boolSupportTree: Boolean(props.model.supportTree!),
      isDataModelBiz: record.initCommitId === '__0000__',
    });
  };

  /**删除 */
  const handleRowDelete = async (record) => {
    fieldDataTable.value =
      props.model?.fieldConfig?.filter((item) => item.key !== record.key) || [];
    handleFormState();
    await putDataModelById({ id: formState.id }, formState, {
      transferToConfig: { headers: { operateType: 'DELETE' } },
    });
    createMessage.success(t('sys.delSuccess'));
    emit('update', props.model.key);
  };

  /**处理formState */
  const handleFormState = () => {
    Object.assign(formState, {
      ...omit(props.model, [
        'modifyTime',
        'modifyUserId',
        'modifyUserName',
        'createUserName',
        'createUserId',
        'createTime',
        'categoryResponse',
        'fieldConfig',
      ]),
      categoryId: props.category,
      fieldConfig: fieldDataTable.value,
    });
  };

  /**选择字段处理 */
  const handleCheckFieldOk = async (data) => {
    if (!data.length) {
      createMessage.error('请选择字段后再进行确认操作');
      return;
    }
    let errorfields = [];
    for (const i of data) {
      if (props.model?.fieldConfig?.map((item) => item.key).includes(i.key)) {
        errorfields.push(i.key);
      }
    }
    if (errorfields.length) {
      createMessage.error(`字段表格中已存在相同的字段${errorfields.join('，')}，请重新选择`);
      return;
    }
    const newData = data.map((item) => {
      return {
        ...omit(item, [
          'modifyTime',
          'modifyUserId',
          'modifyUserName',
          'createUserName',
          'createUserId',
          'createTime',
        ]),
        /**之前的业务字段*/
        createType: CreateType.USER_DEFINED,
      };
    });
    fieldDataTable.value = [...newData, ...props.model.fieldConfig!];
    handleFormState();
    await putDataModelById({ id: formState.id }, formState, {
      transferToConfig: { headers: { operateType: 'INSERT' } },
    });
    closeCheckModal();
    emit('update', props.model.key);
  };

  const getDefaultValue = (record) => {
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

  // 下一步
  const handleNext = (type, history) => {
    openFieldModal(true, {
      isEdit: false,
      modelKey: props.model.key,
      boolSupportTree: Boolean(props.model.supportTree!),
      type,
      history,
    });
  };

  // 上一步
  const handlePrev = (data, history) => {
    FieldTypeModalRef.value?.open(data, history);
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

  const getFieldSource = (record) => {
    // 流程字段
    if (record.createType === CreateType.BUILTIN && record.fieldCategory === 'process') {
      return t(`sys.pageDesigner.fieldCmp.PROCESS`);
    }
    // 业务字段
    // if (record.createType === CreateType.BUILTIN && record.initCommitId === '__0000__') {
    //   return t(`sys.pageDesigner.fieldCmp.BUSINESS`);
    // }
    return t(`sys.pageDesigner.fieldCmp.${record.createType}`);
  };

  const fieldMetaMove = async (e) => {
    let toIndex = e.targetSortNum;
    const cloneInfo = cloneDeep(props.model);
    const fromIndex = cloneInfo?.fieldConfig?.findIndex((i) => i.id === e.id);
    // console.log('fieldMetaMove', e, fromIndex);
    // 从第二行拖到第一行
    if (e.targetSortNum && fromIndex && fromIndex >= e.targetSortNum) {
      toIndex = e.targetSortNum - 1;
    }
    const list = moveArrayElement(cloneInfo?.fieldConfig, fromIndex, toIndex);
    fieldDataTable.value = [...list];
    handleFormState();
    await putDataModelById({ id: formState.id }, formState);
    emit('update', props.model.key);
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
