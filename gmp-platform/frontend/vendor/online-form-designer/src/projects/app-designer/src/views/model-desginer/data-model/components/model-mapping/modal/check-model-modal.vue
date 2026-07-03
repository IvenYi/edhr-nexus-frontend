<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.pageDesigner.checkModelFields')"
    centered
    width="700px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="model-wrapper w-full">
      <div class="model-wrapper__header flex items-center mb-16px">
        <span>{{ t('sys.modelSelect') + '：' }}</span>
        <a-select
          v-model:value="checkModelKey"
          @change="handleCheckChange"
          :disabled="isEdit"
          :placeholder="t('sys.chooseText')"
          style="width: 220px"
        >
          <a-select-opt-group v-for="models in modelsOptions" :key="models.id">
            <template #label>
              <span>
                {{ models.name }}
              </span>
            </template>
            <a-select-option
              :key="model.id"
              v-for="model in models.children"
              :value="model.id"
              :name="model.name"
              >{{ model.name }}</a-select-option
            >
          </a-select-opt-group>
          <!-- <a-select-option v-for="item in categoryModels" :value="item.id" :key="item.id">{{
              item.name
            }}</a-select-option> -->
        </a-select>
        <div class="ml-30px add-field-icon" @click.stop="handleAddField">
          <plus-circle-outlined />
          {{ t('sys.pageDesigner.addField') }}
        </div>
      </div>
      <div class="model-wrapper__box w-full">
        <basic-table
          ref="tableRef"
          :striped="false"
          :bordered="true"
          :showIndexColumn="false"
          :ellipsis="true"
          :canResize="false"
          row-key="id"
          :columns="checkModelColumns"
          :dataSource="showTableData"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'assignMethod'">
              <a-radio-group v-model:value="record[column.dataIndex]" :options="plainOptions" />
            </template>
            <template v-if="column.key === 'assignment'">
              <a-select
                :allowClear="true"
                v-model:value="record[column.dataIndex]"
                style="width: 100%"
                :placeholder="t('sys.chooseText')"
                @change="handleChange(record)"
                @focus="handleFocus(record)"
              >
                <a-select-option
                  v-for="item in getFieldMappingType(fieldOptions, record)"
                  :disabled="item.disabled"
                  :value="item.key"
                  :key="item.key"
                  >{{ item.name }}</a-select-option
                >
              </a-select>
            </template>
            <template
              v-if="column.key === 'action'&& ![CreateType.SYSTEM].includes(record.createType!)"
            >
              <table-action-auto
                :actions="[
                  {
                    label: t('sys.delete'),
                    color: 'error',
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
      </div>
    </div>
  </basic-modal>
  <check-field-modal @register="checkregister" @ok="handleCheckFieldOk" />
</template>

<script setup lang="ts" name="check-model-modal">
  import { onMounted, ref, computed } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { CategoryCompleteResponse, FieldMetaDTO, SingleField } from '/@/apis/gct-apaas/model';
  import { checkModelColumns } from '../../../constant/columns';
  import { useMessage } from '/@/hooks/web/useMessage';
  import CheckFieldModal from '../../data-field/modal/check-field-modal.vue';
  import { omit, cloneDeep } from 'lodash-es';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { transformMappingField } from '/@page-designer/schema/field/form/utils';

  const { createMessage } = useMessage();
  const { t } = useI18n();

  interface Props {
    /** 模型定义表key */
    modelKey?: string;
  }
  const tableRef = ref();
  const checkModelKey = ref();
  const emit = defineEmits(['register', 'ok']);
  const props = defineProps<Props>();
  const categoryModels = ref<CategoryCompleteResponse[]>([]);
  const checkItems = ref<SingleField[]>([]);
  const plainOptions = [{ label: t('sys.appDesigner.field'), value: 'field' }];
  const fieldOptions = ref<any[]>([]);
  const modelName = ref();
  const tableData = ref<any[]>([]);
  const isEdit = ref<boolean>(false);
  const modelsOptions = ref<CategoryCompleteResponse[]>([]);
  const asyncFieldOptions = ref<any[]>([]);

  const [checkregister, { openModal: openCkeckFieldModal, closeModal: closeCheckModal }] =
    useModal();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;
      fieldOptions.value = data.fieldConfig;
      if (data.isEdit) {
        checkModelKey.value = data.originModelKey;
        modelName.value = data.originModelName;
        getChecklist(data.originModelKey, data.mapping);
        modelsOptions.value = cloneDeep(categoryModels.value);
      } else {
        checkModelKey.value = null;
        modelName.value = null;
        getModelsOptions(data.filterModelKeys);
      }
    }
  });

  onMounted(() => {
    useModelFields();
  });

  const getModelsOptions = (filterModelKeys) => {
    modelsOptions.value = cloneDeep(categoryModels.value);
    filterModelKeys &&
      modelsOptions.value.forEach((item) => {
        if (item.children?.length) {
          item.children = item.children.filter((i) => !filterModelKeys.includes(i.key));
        }
      });
    modelsOptions.value = modelsOptions.value?.filter((c) => c.children && c.children.length > 0);
  };

  //编辑 页面数据重填
  const getChecklist = async (val, mapping) => {
    const res =
      (await getFieldMetaList({
        modelKey: val,
        sys: true,
      })) || [];
    const metaMap: Record<string, FieldMetaDTO> = {};
    res
      .filter((v) => [CreateType.BUILTIN, CreateType.USER_DEFINED].includes(v.createType))
      .forEach((item) => {
        metaMap[item.key!] = item;
      });
    const data: any[] = [];
    mapping.forEach((item) => {
      const fieldMeta = metaMap[item.originFieldKey];
      if (fieldMeta) {
        data.push({
          ...fieldMeta,
          assignment: item.key,
          assignmentId: item.id,
        });
      }
    });

    tableData.value = data;
  };

  const useModelFields = async () => {
    const res =
      (await getCategoryListComplete({
        module: ModelTypeEnum.ENTITY as string,
      })) || [];
    categoryModels.value = res?.filter((c) => c.children && c.children.length > 0);
  };

  const showTableData = computed(() => {
    // return isShowSysField.value
    //   ? tableData.value
    //   : tableData.value.filter((d) => {
    //       return ![CreateType.SYSTEM, CreateType.BUILTIN].includes(d.createType!);
    //     });
    return tableData.value.map((item) => ({
      ...item,
      assignMethod: 'field',
      assignment: item.assignment ?? null,
      assignmentId: item.assignmentId ?? null,
    }));
  });

  const handleAddField = () => {
    if (!checkModelKey.value) {
      createMessage.error(t('sys.pageDesigner.pleaseSelectModel'));
      return;
    }
    openCkeckFieldModal(true, {
      isEdit: false,
      modelKey: checkModelKey.value,
      isModelCheck: true,
      checkKeys: showTableData.value.map((item) => item.key) || [],
    });
  };

  const handleClose = () => {
    tableData.value = [];
  };

  const handleCheckChange = async (val) => {
    const models: any = categoryModels.value.map((item) => item.children).flat() || [];
    modelName.value = models.find((i) => i.key === checkModelKey.value)['name'];
    tableData.value = [];
  };

  const handleRowDelete = (record) => {
    const list = showTableData.value.filter((item) => item.id !== record.id);
    tableData.value = [...list];
  };

  const handleOk = async () => {
    if (!showTableData.value.length) {
      createMessage.error(t('请选择字段赋值后再进行确认操作'));
      return;
    }
    const allAssign = showTableData.value.every((item) => item.assignment);
    if (!allAssign) {
      createMessage.error(t('字段表格中存在字段没赋值，请先赋值'));
      return;
    }
    const fieldList: any = JSON.parse(JSON.stringify(fieldOptions.value));
    checkItems.value = showTableData.value
      .filter((item) => !!item.assignment)
      .map((i) => {
        const findItem: any = fieldList.find((val) => val.key === i.assignment);
        return {
          ...omit(findItem, [
            'createType',
            'defaultValue',
            'i18nConfig',
            'mappingType',
            'required',
            'specificConfig',
            'id',
          ]),
          id: i.assignmentId,
          originFieldKey: i.key,
          originFieldName: i.name,
          originModelKey: i.modelKey,
          originModelName: modelName.value,
        };
      });
    emit('ok', {
      checkItems: checkItems.value,
      isEdit: isEdit.value,
      modelKey: checkModelKey.value,
    });
  };

  /**选择字段处理 */
  const handleCheckFieldOk = async (data) => {
    const oldMap: Record<string, any> = {};
    tableData.value.forEach((item) => {
      oldMap[item.key] = item;
    });
    tableData.value = data.map((item) => {
      return oldMap[item.key] || item;
    });
    closeCheckModal();
  };

  const handleFocus = (record) => {
    asyncFieldOptions.value = fieldOptions.value.filter((item) => item.type === record.type);
    // const assignKeys: any = showTableData.value.map((item) => item.assignment).filter(Boolean);
    // fieldOptions.value.forEach((item) => {
    //   item['disabled'] = assignKeys.includes(item.key);
    // });
  };

  const excludeFieldType = [
    FIELD_TYPE.EXPRESSION,
    FIELD_TYPE.AGG,
    FIELD_TYPE.LABEL_TEMPLATE,
    FIELD_TYPE.SERIAL,
    FIELD_TYPE.EXPRESSION_CONDITION,
  ];

  interface fieldEnum {
    filterArr: FIELD_TYPE[];
    equal?: Boolean;
  }

  const getFieldMappingType = (fieldOpts, record) => {
    const fieldConfig: fieldEnum = transformMappingField(record?.type);
    let list = fieldOpts
      .filter((i) => !excludeFieldType.includes(i.type))
      .filter((v) => fieldConfig?.filterArr?.includes(v.type));
    if (fieldConfig?.equal !== undefined && fieldConfig?.equal) {
      list = list.filter((i) => i.bindInfo === record?.bindInfo);
    }
    /**
     * 枚举特殊处理（自定义枚举值一致）
     */
    if (
      [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(record?.type) &&
      record.specificConfig?.customEnumConfig?.enabled
    ) {
      list = list.filter((i) => {
        if (!i.specificConfig?.customEnumConfig?.enabled) {
          return false;
        }
        const arr1 = record.specificConfig?.customEnumConfig?.values;
        const arr2 = i.specificConfig?.customEnumConfig?.values;
        return compareArrays(arr1, arr2);
      });
    }
    return list;
  };

  function compareArrays(arr1, arr2) {
    return arr1.toString() === arr2.toString();
  }

  const handleChange = (record) => {
    console.log(record);
  };
</script>

<style lang="less" scoped>
  .model-wrapper {
    &__header {
    }
    &__box {
      // height: 300px;
    }
  }
  .add-field-icon {
    cursor: pointer;
    line-height: 22px;
    &:hover {
      color: var(--ant-primary-color);
    }
  }
</style>
