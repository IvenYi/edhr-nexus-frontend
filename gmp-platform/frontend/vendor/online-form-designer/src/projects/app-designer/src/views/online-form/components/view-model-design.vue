<template>
  <div class="online-form-model-design">
    <a-collapse v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="t('sys.basicInfo')">
        <a-descriptions :column="5" class="basic-info-container">
          <a-descriptions-item :label="t('sys.model.viewName')">{{
            viewDetail.name
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.model.viewKey')">
            <copy-module-key :moduleKey="viewDetail.key" />
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.model.viewType')">
            <span class="model-type">
              {{ Ch_ViewType[templateInfo.viewType!] }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.updatePerson')">{{
            viewDetail.modifyUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.updateTime')">{{
            viewDetail.modifyTime
          }}</a-descriptions-item>
        </a-descriptions>
      </a-collapse-panel>
      <a-collapse-panel key="2" :header="t('sys.model.dataField')">
        <sql-field-table v-if="templateInfo.viewType === ViewTypeEnum.VIEW_SQL" :model="viewDetail">
          <template #status="{ column, index, record }">
            <a-switch
              :checked="!disabledFieldKeys.includes(record.key)"
              @update:checked="(v) => setFieldStatus(record.key, v)"
            />
          </template>
        </sql-field-table>
        <view-model-field-table
          v-else-if="templateInfo.viewType === ViewTypeEnum.VIEW_MODEL"
          :model="viewDetail"
        >
          <template #status="{ column, index, record }">
            <a-switch
              :checked="!disabledFieldKeys.includes(record.key)"
              @update:checked="(v) => setFieldStatus(record.key, v)"
            />
          </template>
        </view-model-field-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts" name="ViewModelDesign">
  import { ref, reactive, watch, computed } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';

  import SqlFieldTable from './view-field-panel/sql-field-table.vue';
  import ViewModelFieldTable from './view-field-panel/view-model-field-table.vue';

  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  import { ViewTypeEnum } from '@gct/nocode-base';

  import { putOnlineFormTmplUpdateVersionByIdById } from '/@/apis/gct-apaas/OnlineFormTmplController';

  import { getViewModelInfo } from '/@/apis/gct-apaas/ViewModelController';

  import { getSqlViewModelInfo } from '/@/apis/gct-apaas/SqlViewModelController';

  const { t } = useI18n();

  const Ch_ViewType = {
    [ViewTypeEnum.VIEW_MODEL]: t('sys.model.viewModel'),
    [ViewTypeEnum.VIEW_SQL]: t('sys.component.dataConnection.SQL2View'),
    [ViewTypeEnum.VIEW]: t('sys.model.sqlView'),
  };

  const props = defineProps<{
    templateInfo: OnlineFormTmplResponse;
  }>();

  const viewDetail = reactive<any>({});
  const activeKey = ref(['1', '2']);

  watch(
    () => props.templateInfo.modelKey,
    async (val) => {
      if (!val) return;
      await refreshDetailInfo(val);
    },
    { immediate: true },
  );

  async function refreshDetailInfo(key: string) {
    let res;
    if (props.templateInfo.viewType === ViewTypeEnum.VIEW_SQL) {
      res = await getSqlViewModelInfo({ modelKey: key });
    } else {
      res = await getViewModelInfo({ id: key });
    }
    Object.assign(viewDetail, res);
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
    await putOnlineFormTmplUpdateVersionByIdById(
      { id: props.templateInfo.id! },
      cloneFormData as any,
    );
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
