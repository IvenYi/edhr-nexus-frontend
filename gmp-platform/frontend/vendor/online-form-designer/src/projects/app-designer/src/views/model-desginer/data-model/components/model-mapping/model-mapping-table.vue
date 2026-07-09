<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    class="model-designer-basic-table"
    :columns="dataModelColumns"
    :dataSource="showTableData"
    :pagination="false"
  >
    <template #headerTop>
      <a-row justify="end" type="flex">
        <a-col style="display: flex">
          <a-button type="primary" @click="handleAddModel">
            <template #icon><plus-outlined /></template>
            {{ t('sys.new') }}
          </a-button>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'&& ![CreateType.SYSTEM].includes(record.createType!)">
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
                title: record.initCommitId
                  ? t('sys.model.fieldDeleteMessage')
                  : t('sys.model.fieldDraftDeleteMessage'),
                confirm: handleRowDelete.bind(null, record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
  <check-model-modal @register="register" @ok="handleModelOk" />
</template>

<script setup lang="ts">
  import { ref, watch, computed, reactive } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { dataModelColumns } from '../../constant/columns';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DataModelResponse, DataModelRequest } from '/@/apis/gct-apaas/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CreateType } from '/@/enums/appEnum';
  import { omit, cloneDeep } from 'lodash-es';
  import { putDataModelById } from '/@/apis/gct-apaas/DataModelController';
  import CheckModelModal from './modal/check-model-modal.vue';

  // type FormState = Pick<
  //   DataModelRequest,
  //   'categoryId' | 'name' | 'key' | 'description' | 'id' | 'fieldConfig' | 'fieldMapping'
  // >;

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

  const { t } = useI18n();
  const emit = defineEmits(['update']);
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
  const tableData = ref<any[]>([]);
  const isEdit = ref<boolean>(false);

  const getTableData = async (reload?) => {
    if (!props.model.key) return;
    // tableData.value = (await getDataModelList({ modelKey: props.model.key! })) || [];
    const fieldMapping = cloneDeep(props.model?.fieldMapping) || [];
    const modelMapping: any = [];
    for (const fieldItem of fieldMapping) {
      const modelKeys = modelMapping.map((i) => i.originModelKey) || [];
      if (!modelKeys.includes(fieldItem?.originModelKey)) {
        modelMapping.push({
          originModelKey: fieldItem?.originModelKey,
          originModelName: fieldItem?.originModelName,
          modifyUserName: fieldItem?.modifyUserName,
          modifyTime: fieldItem?.modifyTime,
          mapping: [fieldItem],
        });
      } else {
        modelMapping.forEach((item) => {
          if (item.originModelKey === fieldItem.originModelKey) {
            const oldTime = item.modifyTime ? new Date(item.modifyTime).getTime() : 0;
            const newTime = fieldItem.modifyTime ? new Date(fieldItem.modifyTime).getTime() : 0;
            if (newTime > oldTime) {
              item.modifyTime = fieldItem.modifyTime;
              item.modifyUserName = fieldItem.modifyUserName;
            }
            item.mapping.push(fieldItem);
          }
        });
      }
    }
    tableData.value = modelMapping;
  };

  watch(
    () => props.model,
    () => {
      getTableData();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  //modal框
  const [register, { openModal: openModelModal, closeModal }] = useModal();

  const showTableData = computed(() => {
    // return isShowSysField.value
    //   ? tableData.value
    //   : tableData.value.filter((d) => {
    //       return ![CreateType.SYSTEM, CreateType.BUILTIN].includes(d.createType!);
    //     });
    return tableData.value;
  });

  /**模型编辑 */
  const handleRowEdit = (record) => {
    isEdit.value = true;
    openModelModal(true, {
      ...record,
      isEdit: true,
      modelKey: props.model.key,
      fieldConfig: props.model?.fieldConfig,
    });
  };

  /**模型删除 */
  const handleRowDelete = async (record) => {
    const fieldMapping =
      props.model?.fieldMapping?.filter(
        (item) => !(item.originModelKey === record.originModelKey),
      ) || [];
    handleFormState();
    formState.fieldMapping = fieldMapping;
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
      ]),
      categoryId: props.category,
    });
  };

  const handleModelOk = async (data) => {
    const { checkItems, isEdit, modelKey } = data;
    handleFormState();
    const fieldMapping = props.model?.fieldMapping || [];
    if (isEdit) {
      const list = fieldMapping.filter((item) => item.originModelKey !== modelKey);
      formState.fieldMapping = [...list, ...checkItems];
    } else {
      formState.fieldMapping = [...fieldMapping, ...checkItems];
    }
    await putDataModelById({ id: formState.id }, formState, {
      transferToConfig: { headers: { operateType: isEdit ? 'UPDATE' : 'INSERT' } },
    });
    closeModal();
    emit('update', props.model.key);
  };

  //模型弹框打开
  const handleAddModel = (e) => {
    isEdit.value = false;
    openModelModal(true, {
      isEdit: false,
      modelKey: props.model.key,
      fieldConfig: props.model?.fieldConfig,
      filterModelKeys: showTableData.value.map((item) => item.originModelKey),
    });
  };

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less" scoped></style>
