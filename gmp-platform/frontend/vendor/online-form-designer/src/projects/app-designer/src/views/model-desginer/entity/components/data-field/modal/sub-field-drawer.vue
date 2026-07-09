<template>
  <a-drawer
    v-model:visible="visible"
    :title="t('sys.pageDesigner.subTableField')"
    placement="right"
    width="80%"
  >
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
            {{ t('sys.model.' + modelDetail.type) }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.updatePerson')">{{
            modelDetail.modifyUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.updateTime')">{{
            modelDetail.modifyTime
          }}</a-descriptions-item>
        </a-descriptions>
      </a-collapse-panel>
      <a-collapse-panel key="2" :header="t('sys.model.dataField')">
        <data-field-table
          ref="DataFieldTableRef"
          :model="modelDetail"
          @update="getFieldData"
          showAllFields
        />
      </a-collapse-panel>
    </a-collapse>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import { getModelMetaInfo, getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import DataFieldTable from '/@/projects/app-designer/src/views/model-desginer/entity/components/data-field/data-field-table.vue';

  provide('isInOnlineForm', true);

  const { t } = useI18n();

  const visible = ref<boolean>(false);

  const modelDetail = reactive<ModelMetaResponse>({});

  const activeKey = ref(['1', '2']);
  const fieldData = ref([]);

  const onOpen = async (id) => {
    visible.value = true;
    if (id) {
      const res = await getModelMetaInfo({ id });
      Object.assign(modelDetail, res);
    }
  };

  const onClose = () => {
    visible.value = false;
  };

  async function getFieldData() {
    const res: any = await getModelMetaDetail({ modelKey: modelDetail.key! });
    fieldData.value = res?.fieldMetaList || [];
  }

  defineExpose({ onOpen, onClose });
</script>
<style lang="scss" scoped></style>
