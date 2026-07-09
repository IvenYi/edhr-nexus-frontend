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
    <div class="base-info-container">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col class="gutter-row" :span="6">
            <a-form-item label="批次名称">
              <span class="value">{{ baseData.container_name || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item label="工站">
              <span class="value">{{ baseData.operation_name || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item label="工艺">
              <span class="value">{{ baseData.workflow_step_name || '-' }}</span>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item label="设备">
              <span class="value">{{ baseData.device_names || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col class="gutter-row" :span="6">
            <a-form-item label="进站">
              <div class="value">
                <div v-if="baseData.move_in_user && baseData.move_in_date">
                  <div>{{ getUserName(baseData.move_in_user) }}</div>
                  <div>{{ baseData.move_in_date }}</div>
                </div>
                <div v-else>-</div>
              </div>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item label="出站">
              <div class="value">
                <div v-if="baseData.move_user && baseData.move_date">
                  <div>{{ getUserName(baseData.move_user) }}</div>
                  <div>{{ baseData.move_date }}</div>
                </div>
                <div v-else>-</div>
              </div>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item label="进站签名">
              <div class="value">
                <img
                  v-if="baseData.move_in_sign_name"
                  :src="baseData.move_in_sign_name"
                  style="max-width: 150px"
                />
                <div v-else-if="baseData.move_in_sign_user_id">
                  <div>{{ getUserName(baseData.move_in_sign_user_id) }}</div>
                  <div>{{ baseData.move_in_sign_time }}</div>
                </div>
                <div v-else>-</div>
              </div>
            </a-form-item>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-form-item label="出站签名">
              <div class="value">
                <img
                  v-if="baseData.move_sign_name"
                  :src="baseData.move_sign_name"
                  style="max-width: 150px"
                />
                <div v-else-if="baseData.move_sign_user_id">
                  <div>{{ getUserName(baseData.move_sign_user_id) }}</div>
                  <div>{{ baseData.move_sign_time }}</div>
                </div>
                <div v-else>-</div>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col class="gutter-row" :span="24">
            <a-form-item label="描述">
              <span class="value">{{ baseData.description || '-' }}</span>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div
      class="table-list mt-16px"
      v-for="item in dataSource.moveInDataCollectionHistory"
      :key="item.id_"
    >
      <div class="table-list-title">
        {{ item.name_ ? `数据采集 - ${item.name_}` : '数据采集' }} | 进站
      </div>
      <a-table
        v-if="item.collection_method_ === 'dataCollection'"
        :dataSource="item.entries_"
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
            <template v-else-if="record.type_ === 'attachment'">
              <FieldUpload
                :modelValue="getDataCollectValue(record)"
                :isDesign="false"
                readonly
                hideSwitch
              />
            </template>
            <template v-else>
              {{ getDataCollectValue(record) }}
            </template>
          </template>
        </template>
      </a-table>
      <div class="bg-#F7F8FA p-10px mt-10px" v-else>
        <a-button type="link" ghost @click="openOnlineFormModal(item.online_form_inst_id_)">
          {{ item.online_form_name_ }}
        </a-button>
      </div>
    </div>
    <div
      class="table-list mt-16px"
      v-for="item in dataSource.moveDataCollectionHistory"
      :key="item.id_"
    >
      <div class="table-list-title">
        {{ item.name_ ? `数据采集 - ${item.name_}` : '数据采集' }} | 出站
      </div>
      <a-table
        v-if="item.collection_method_ === 'dataCollection'"
        :dataSource="item.entries_"
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
            <template v-else-if="record.type_ === 'attachment'">
              <FieldUpload
                :modelValue="getDataCollectValue(record)"
                :isDesign="false"
                readonly
                hideSwitch
              />
            </template>
            <template v-else>
              {{ getDataCollectValue(record) }}
            </template>
          </template>
        </template>
      </a-table>
      <div class="bg-#F7F8FA p-10px mt-10px" v-else>
        <a-button type="link" ghost @click="openOnlineFormModal(item.online_form_inst_id_)">
          {{ item.online_form_name_ }}
        </a-button>
      </div>
    </div>
    <div class="table-list mt-16px">
      <div class="table-list-title">上料信息</div>
      <a-table
        :dataSource="dataSource.material_issue"
        :columns="txnMaterialIssueColumns"
        :pagination="false"
        class="mt-10px"
      >
        <template #bodyCell="{ column, index }">
          <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
        </template>
      </a-table>
    </div>
    <div class="table-list mt-16px">
      <div class="table-list-title">批次不良信息</div>
      <a-table
        :dataSource="dataSource.txn_scrap_detail"
        :columns="txnScrapColumns"
        :pagination="false"
        class="mt-10px"
      >
        <template #bodyCell="{ column, index, text }">
          <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
          <template v-else>
            <div v-if="text">
              <div>{{ text }}</div>
            </div>
            <div v-else>-</div>
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
  import { txnMaterialIssueColumns, txnScrapColumns, entriesColumns } from '../type';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { onlineFormModal } from '/@web-render/render/Event/utils/builtInMethods';
  import { FileModeEnum, PrintModeEnum } from '@gct/nocode-web-render';

  const props = defineProps<{
    orgData: any;
    userDataNotOrg: any;
  }>();

  const { t } = useI18n();
  const Event = getPageEvent();

  const open = ref<boolean>(false);

  const baseData = ref<any>({});

  const dataSource = ref<any>({});

  const containerId = ref('');

  const getDataSource = async () => {
    const res: any = await Event.context.$customBizService.post(
      {
        action: 'biz_query_container_edhr_mcoa',
        key: 'em_container',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        data: {
          containerId: containerId.value,
          level: 'detail',
          containerInfo: [baseData.value],
        },
      },
    );
    dataSource.value = res?.[0] || {};
  };

  const afterCloseChange = () => {
    dataSource.value = {};
    baseData.value = {};
    containerId.value = '';
  };

  const showDrawer = (rowData, id) => {
    containerId.value = id;
    baseData.value = rowData;
    getDataSource();
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
        value = value === 'true' ? (record?.true_text_ ?? value) : (record?.false_text_ ?? value);
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

  const openOnlineFormModal = (id) => {
    onlineFormModal({
      modelType: 'drawer',
      selfId: id,
      title: '在线表单',
      keep: false,
      modeType: 'view-mode',
      callback: async (options) => {
        console.log('options', options);
      },
    });
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

    .table-list {
    }
  }
</style>
