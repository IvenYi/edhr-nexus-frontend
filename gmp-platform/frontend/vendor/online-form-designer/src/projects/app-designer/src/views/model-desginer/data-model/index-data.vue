<template>
  <div class="index-data-wrap">
    <a-collapse
      :bordered="false"
      collapsible="icon"
      style="margin-bottom: 20px"
      @change="handleCollapseChange($event)"
    >
      <a-collapse-panel key="1">
        <template #header>
          <div class="header">
            <div class="header-title">{{ t('sys.appDesigner.basicInformation') }}</div>
            <div class="action">
              <a-button @click.stop="handleEdit" class="btn-text">
                <edit-outlined />
                {{ t('sys.editInfo') }}
              </a-button>
              <a-button @click.stop="handleDelete" class="ml-16px btn-text">
                <delete-outlined />
                {{ t('sys.delete') + t('sys.model.dataModel') }}
              </a-button>
            </div>
          </div>

          <div :class="['description', { 'desc-expand': isExpand }]">
            <a-descriptions class="item" :column="4">
              <a-descriptions-item :label="t('sys.model.modelName')">{{
                modelDetail.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="`${t('sys.model')}KEY`"
                ><copy-module-key :moduleKey="modelDetail.key"
              /></a-descriptions-item>
              <a-descriptions-item :label="t('sys.createUser')">{{
                modelDetail.createUserName
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.createTime')">{{
                modelDetail.createTime
              }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </template>
        <a-descriptions :column="4" class="desc-area">
          <a-descriptions-item :label="t('sys.modifier')">{{
            modelDetail.modifyUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.modifyTime')">{{
            modelDetail.modifyTime
          }}</a-descriptions-item>
          <a-descriptions-item
            :span="2"
            :label="t('sys.description')"
            :contentStyle="{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inlineBlock',
            }"
          >
            {{ modelDetail.description }}</a-descriptions-item
          >
        </a-descriptions>
      </a-collapse-panel>
    </a-collapse>

    <a-tabs
      v-model:activeKey="activeKey"
      type="card"
      class="entity-tab"
      :class="activeKey == '3' && 'tab-pane-no-border-b'"
      destroyInactiveTabPane
    >
      <a-tab-pane key="1" :tab="t('sys.model.dataField')">
        <data-field-table
          ref="DataFieldTableRef"
          :model="modelDetail"
          :category="categoryId"
          @update="refreshDetailInfo"
          @node-change="
            (val) => {
              emit('node-change', val);
            }
          "
          @handle-expand="
            (node) => {
              emit('handle-expand', node);
            }
          "
          @handle-tab-click="
            (tab) => {
              emit('handle-tab-click', tab);
            }
          "
        />
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.appDesigner.modelMapping')">
        <model-mapping-table
          ref="ModelMappingTableRef"
          :model="modelDetail"
          :category="categoryId"
          @update="refreshDetailInfo"
        />
      </a-tab-pane>
      <a-tab-pane key="3" :tab="t('sys.model.functionMenu')">
        <function-table ref="FunctionTableRef" :model="modelDetail" :category="categoryId" />
      </a-tab-pane>
      <a-tab-pane key="4" :tab="t('sys.appDesigner.service')">
        <business-service-table
          ref="BusinessServiceTableRef"
          :model="modelDetail"
          :category="categoryId"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
  <!-- <model-data-modal @register="register" /> -->
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, watch, nextTick, computed } from 'vue';
  import { EditOutlined } from '@ant-design/icons-vue';
  import { Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import DataEnumTable from './components/data-enum-table.vue';
  // import ModelDataModal from './modal/model-data-modal.vue';
  // import { useModal } from '/@/components/Modal';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { DataModelRequest, DataModelResponse } from '/@/apis/gct-apaas/model';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { getDataModelInfo } from '/@/apis/gct-apaas/DataModelController';
  import { omit } from 'lodash-es';
  import DataFieldTable from './components/data-field/data-field-table.vue';
  import BusinessServiceTable from './components/business-service/business-service-table.vue';
  import FunctionTable from './components/function/function-table.vue';
  import ModelMappingTable from './components/model-mapping/model-mapping-table.vue';

  const emit = defineEmits([
    'refresh',
    'edit',
    'delete',
    'register',
    'node-change',
    'handle-expand',
    'handle-tab-click',
  ]);

  const { selectedTreeNode, selectedTreeKey } = useTreeSiderPage('ModelDesigner');

  const { t } = useI18n();
  // const [register, { openModal }] = useModal();
  //tab页的key
  const activeKey = ref('1');
  const modelDetail = reactive<DataModelResponse>({});
  const DataFieldTableRef = ref();
  const FunctionTableRef = ref();
  const BusinessServiceTableRef = ref();
  const ModelMappingTableRef = ref();
  const isExpand = ref<boolean>(false);

  const categoryId = computed(() => {
    return selectedTreeNode.node?.categoryId || '';
  });

  const props = defineProps({
    model: String,
  });

  watch(
    () => props.model,
    async (value) => {
      if (!value) return;
      refreshDetailInfo(value);
    },
    {
      immediate: true,
    },
  );

  const handleEdit = () => {
    const { node } = selectedTreeNode;
    emit('edit', {
      ...omit(modelDetail, [
        'categoryResponse',
        'createTime',
        'createUserId',
        'createUserName',
        'modifyTime',
        'modifyUserId',
        'modifyUserName',
      ]),
      categoryId: node?.categoryId,
      isEdit: true,
    });
  };

  const fieldData = ref([]);

  async function refreshDetailInfo(key: string) {
    const res: any = await getDataModelInfo({ id: key });
    Object.assign(modelDetail, res);
  }

  // const handleEdit = async () => {
  //   const res = await getModelMetaInfo({ id: selectedTreeKey.value! });
  //   emit('edit', {
  //     ...res,
  //     isEdit: true,
  //     categoryId: res?.categoryResponse?.id,
  //   });
  // };

  // const handleDelete = () => {
  //   Modal.confirm({
  //     title: modelDetail.initCommitId
  //       ? t('sys.model.modelDeleteMessage')
  //       : t('sys.model.modelDraftDeleteMessage'),
  //     icon: createVNode(ExclamationCircleOutlined),
  //     okText: t('sys.ok'),
  //     cancelText: t('sys.cancel'),
  //     async onOk() {
  //       emit('delete', modelDetail.id);
  //     },
  //   });
  // };

  const handleCollapseChange = (e) => {
    isExpand.value = !!e[0];
    setTimeout(() => {
      DataFieldTableRef.value && DataFieldTableRef.value.redoHeight();
      ModelMappingTableRef.value && ModelMappingTableRef.value.redoHeight();
      FunctionTableRef.value && FunctionTableRef.value.redoHeight();
      BusinessServiceTableRef.value && BusinessServiceTableRef.value.redoHeight();
    }, 300);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.model.confirmDelModelMsg', { modelName: modelDetail.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        // if (!selectedTreeKey.value) return;
        // await deleteDataModel({ ids: selectedTreeKey.value });
        emit('delete', modelDetail.id);
      },
    });
  };

  defineExpose({
    refreshDetailInfo,
  });
</script>

<style lang="less" scoped>
  .index-data-wrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    overflow-y: hidden;
    background-color: #fff;

    :deep(.btn-text.ant-btn) {
      padding: 4px 12px;

      & > .anticon + span {
        margin-left: 8px;
      }
    }

    :deep(.ant-collapse-header) {
      flex-wrap: wrap;
      padding: 0;
      background-color: #fff;

      > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        padding-top: 16px;
      }
    }

    :deep(.ant-collapse-item) {
      border-bottom: none;
    }

    .header {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      padding-bottom: 12px;

      .header-title {
        font-size: 16px;
      }
    }

    .description {
      display: flex;
      align-items: center;
      // margin-left: 4px;
      padding: 20px 0;
      border-radius: 4px;
      background-color: #f7f8fa;

      &.desc-expand {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      }

      .item {
        padding: 0 20px;
      }

      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 0;
        }
      }
    }

    :deep(.ant-collapse.ant-collapse-borderless) {
      background: transparent;

      .ant-collapse-item {
        .ant-collapse-content {
          // margin-left: 4px;
          border-radius: 0 0 4px 4px;
          background-color: #f7f8fa;

          .ant-collapse-content-box {
            padding: 0 20px;
          }
        }
      }
    }

    :deep(.ant-descriptions-item-container .ant-descriptions-item-label) {
      color: #797a7d;
    }

    .desc-area {
      color: #333;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;

      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 20px;
        }
      }
    }
  }

  :deep(.ant-tabs-card.ant-tabs-top) {
    &.tab-pane-no-border-b > .ant-tabs-nav {
      &::before {
        border-bottom: none;
      }
    }

    .ant-tabs-nav {
      margin-bottom: 0;

      .ant-tabs-tab {
        margin-left: 0;
        border-right-width: 0;
        border-radius: 0;

        &:first-child {
          border-top-left-radius: 4px;
        }

        &:nth-last-of-type(2) {
          border-right-width: 1px;
          border-top-right-radius: 4px;
        }
      }
    }
  }

  .config-icon {
    position: relative;
    top: 1px;
    left: 3px;
    line-height: 1;
  }
</style>
