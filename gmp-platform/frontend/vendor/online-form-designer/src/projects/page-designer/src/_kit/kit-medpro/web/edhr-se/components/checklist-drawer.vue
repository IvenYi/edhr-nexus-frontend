<template>
  <a-drawer
    v-model:visible="open"
    class="gct-edhr-se-drawer"
    root-class-name="root-class-name"
    :root-style="{ color: 'blue' }"
    :title="t('sys.detail')"
    width="60%"
    placement="right"
    @close="afterCloseChange"
  >
    <div class="table-list mb-16px" v-for="(item, index) in dataCollects" :key="item.name + index">
      <div class="table-list-title">数据采集 | {{ item.name || '进站' }}</div>
      <a-table
        :dataSource="item.dataList"
        :columns="entriesColumns"
        :pagination="false"
        class="mt-10px"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
          <template v-if="column.dataIndex === 'value_'">
            <template v-if="record.type_ === 'image'">
              <template v-if="getDataCollectValue(record)?.length">
                <div v-for="(img, i) in getDataCollectValue(record)" :key="i" class="mt-6px">
                  <img :src="img" style="max-width: 150px" />
                </div>
              </template>
            </template>
            <template v-else>
              {{ getDataCollectValue(record) }}
            </template>
          </template>
        </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup lang="ts" name="gct-edhr-se-drawer">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { entriesColumns } from '../type';
  import { isNil } from 'lodash-es';

  const props = defineProps<{
    orgData: any;
    userDataNotOrg: any;
  }>();

  const { t } = useI18n();
  const Event = getPageEvent();

  const open = ref<boolean>(false);

  const dataCollects = ref<any>([]);

  const getDataCollect = async (rowData) => {
    const _dataCollects: any = [];
    let data: any;
    if (rowData.status_ === 'waiting') {
      data = await Event.context.$customBizService.post(
        {
          action: 'listAll',
          key: 'em_data_collection_entry',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { query: { 'ref_master_id_.eq': rowData.data_collection_id__ri_ } },
      );
    } else {
      data = await Event.context.$customBizService.post(
        {
          action: 'listAll',
          key: 'em_data_collection_item_history',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { query: { 'ref_master_id_.eq': rowData.id_ } },
      );
    }
    const transformData = transformSourceData(data.data, data.dict) as any;
    _dataCollects.push({
      name: rowData.checklist_name_,
      dataList: transformData,
    });
    dataCollects.value = _dataCollects;
  };
  const afterCloseChange = () => {
    dataCollects.value = [];
  };

  const showDrawer = (rowData) => {
    getDataCollect(rowData);
    open.value = true;
  };

  const getOrgName = (id) => {
    return props.orgData.find((n) => n.id === id)?.name ?? '';
  };

  const getUserName = (id) => {
    return props.userDataNotOrg.find((n) => n.id === id)?.fullname ?? '';
  };

  const getDataCollectValue = (record) => {
    let value = record.value_;
    switch (record.type_) {
      case 'user':
        value = getUserName(value);
        break;
      case 'org':
        value = getOrgName(value);
        break;
      case 'boolean':
        if (isNil(value)) {
          value = record.default_value_ === 'true' ? record.true_text_ : record.false_text_;
        } else {
          value = value === 'true' ? record.true_text_ : record.false_text_;
        }
        break;
      case 'image':
      case 'attachment':
        let urls = value ? value.split(',') : [];
        urls = urls.map((item) => {
          return import.meta.env.VITE_MINIO_PATH + '/' + item;
        });
        value = urls;
        break;
    }
    return value;
  };

  defineExpose({
    showDrawer,
  });
</script>

<style lang="less" scoped>
  .gct-edhr-se-drawer {
    padding: 16px;
    .base-info-container {
      padding: 16px;
      background: #f7f8fa;
      border-radius: 4px;
      :deep(.ant-form-item) {
        margin: 0;
      }
    }
  }
</style>
