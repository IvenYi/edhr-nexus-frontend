<template>
  <div class="online-form-model-design">
    <a-collapse v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="t('sys.basicInfo')">
        <a-descriptions :column="5" class="basic-info-container">
          <a-descriptions-item :label="t('sys.model.modelName')">{{
            modelDetail.name
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.keyOfSth', { sth: t('sys.appDesigner.model') })">
            <copy-module-key :moduleKey="modelDetail.key" />
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.model.modelType')">
            <span class="model-type">
              {{ t('sys.model.' + modelDetail.type) }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.updatePerson')">{{
            modelDetail.modifyUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.updateTime')">{{
            modelDetail.modifyTime
          }}</a-descriptions-item>
        </a-descriptions>
      </a-collapse-panel>
      <a-collapse-panel v-if="hasRemoteModel" key="2" :header="t('sys.model.dataField')">
        <data-field-table
          ref="DataFieldTableRef"
          :model="modelDetail"
          @update="getFieldData"
          showAllFields
        >
          <template #status="{ column, index, record }">
            <a-switch
              :checked="!disabledFieldKeys.includes(record.key)"
              @update:checked="(v) => setFieldStatus(record.key, v)"
              :disabled="getFieldStatusDisabled(record)"
            />
          </template>
        </data-field-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts" name="ModelDesign">
  import { provide, ref, reactive, watch, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { OnlineFormTmplResponse, ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { getModelMetaInfo, getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import DataFieldTable from '/@/projects/app-designer/src/views/model-desginer/entity/components/data-field/data-field-table.vue';
  import { OnlineFOrmDataFieldColumns } from '../constants';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { DesignMode } from '/@online-form/views/designer/enums';
  import { cloneDeep } from 'lodash-es';
  import { putOnlineFormTmplUpdateVersionByIdById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import {
    getLocalDesignerFieldList,
    getLocalDesignerModelInfo,
    isLocalDesignerId,
  } from '/@online-form/views/designer/hooks/local-designer-cache';

  provide('isInOnlineForm', true);
  provide('OnlineFOrmDataFieldColumns', OnlineFOrmDataFieldColumns);

  const { t } = useI18n();

  const props = defineProps<{
    templateInfo: OnlineFormTmplResponse;
    designMode?: DesignMode;
  }>();

  provide('modelReadonly', props.designMode === DesignMode.Refer);

  const modelDetail = reactive<ModelMetaResponse>({});
  const isLocalDesigner = computed(() => isLocalDesignerId(props.templateInfo.id));
  const hasRemoteModel = computed(() => !!props.templateInfo.modelKey && !isLocalDesigner.value);

  const activeKey = ref(['1', '2']);
  const fieldData = ref([]);

  watch(
    () => props.templateInfo.modelKey,
    async (val) => {
      console.log('val changed', props.templateInfo);

      if (val) {
        const res = isLocalDesignerId(props.templateInfo.id)
          ? getLocalDesignerModelInfo()
          : await getModelMetaInfo({ id: val });
        Object.assign(modelDetail, res);
      }
    },
    { immediate: true },
  );

  async function getFieldData() {
    const res: any = isLocalDesignerId(props.templateInfo.id)
      ? { fieldMetaList: getLocalDesignerFieldList(modelDetail.key) }
      : await getModelMetaDetail({ modelKey: modelDetail.key! });
    fieldData.value = res?.fieldMetaList || [];
  }

  const fieldStatus = computed(() => {
    let extFieldStatus: any[] = [];
    try {
      extFieldStatus = JSON.parse(props.templateInfo.extFieldStatus || '[]');
    } catch (error) {
      console.log(error);
    }
    return extFieldStatus;
  });

  const disabledFieldKeys = computed(() => {
    return fieldStatus.value.filter((item) => item.status === false).map((item) => item.key);
  });

  const getFieldStatusDisabled = (record) => {
    return (
      props.designMode === DesignMode.Refer ||
      [CreateType.SYSTEM, CreateType.BUILTIN].includes(record.createType) ||
      [FIELD_TYPE.MASTERSLAVE].includes(record.type)
    );
  };

  const setFieldStatus = async (fieldKey: string, status: boolean) => {
    const updateArr = cloneDeep(fieldStatus.value);
    const find = updateArr.find((item) => item.key === fieldKey);
    if (find) {
      find.status = status;
    } else {
      updateArr.push({ key: fieldKey, status: status });
    }
    const cloneFormData = cloneDeep(props.templateInfo);
    cloneFormData.extFieldStatus = JSON.stringify(updateArr);
    // 调用接口
    if (!isLocalDesignerId(props.templateInfo.id)) {
      await putOnlineFormTmplUpdateVersionByIdById(
        { id: props.templateInfo.id! },
        cloneFormData as any,
      );
    }
    // 本地更新数据
    props.templateInfo.extFieldStatus = JSON.stringify(updateArr);
  };
</script>
<style lang="less" scoped>
  .online-form-model-design {
    margin: 16px;
    background: #ffffff;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #e0e3ea;

    .basic-info-container {
      background: #f7f8fa;
      border-radius: 4px;
      padding: 20px;
      :deep(.ant-descriptions-item) {
        padding-bottom: 0 !important;
      }
    }

    :deep(.ant-descriptions-item-label) {
      color: #797a7d;
    }

    :deep(.model-type) {
      display: inline-block;
      padding: 0 8px;
      color: #3168ec;
      background: #d5e0fb;
      border-radius: 4px 4px 4px 4px;
    }
  }
</style>
