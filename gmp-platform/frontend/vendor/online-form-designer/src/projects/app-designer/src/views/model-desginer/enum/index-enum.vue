<template>
  <div class="index-enum-wrap">
    <a-collapse
      :bordered="false"
      collapsible="icon"
      style="margin-bottom: 20px"
      @change="handleCollapseChange($event)"
    >
      <a-collapse-panel key="1">
        <template #header>
          <div class="header">
            <div class="header-title">{{ t('sys.model.basicInformation') }}</div>
            <div class="action">
              <a-button @click.stop="handleEdit" class="btn-text">
                <edit-outlined />
                {{ t('sys.editInfo') }}
              </a-button>
              <a-button @click.stop="handleDelete" class="ml-16px btn-text">
                <delete-outlined />
                {{ t('sys.delete') + t('sys.model.enum') }}
              </a-button>
            </div>
          </div>

          <div :class="['description', { 'desc-expand': isExpand }]">
            <a-descriptions class="item" :column="3">
              <a-descriptions-item :label="t('sys.model.modelName')">{{
                modelDetail.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="`${t('sys.model')}KEY`"
                ><copy-module-key :moduleKey="modelDetail.key"
              /></a-descriptions-item>
              <a-descriptions-item :label="t('sys.updatePerson')">{{
                modelDetail.modifyUserName
              }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </template>
        <a-descriptions :column="3" class="desc-area">
          <a-descriptions-item :label="t('sys.updateTime')">{{
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

    <!-- <a-descriptions :column="3" class="desc-area">
      <a-descriptions-item :label="t('sys.model.modelName')">{{
        modelDetail.name
      }}</a-descriptions-item>
      <a-descriptions-item :label="`${t('sys.model')}KEY`"
        ><copy-module-key :moduleKey="modelDetail.key"
      /></a-descriptions-item>
      <a-descriptions-item :label="t('sys.updatePerson')">{{
        modelDetail.modifyUserName
      }}</a-descriptions-item>
      <a-descriptions-item :label="t('sys.updateTime')">{{
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
    </a-descriptions> -->
    <a-tabs v-model:activeKey="activeKey" type="card" class="entity-tab">
      <a-tab-pane key="1" :tab="t('sys.model.enumField')">
        <data-enum-table ref="DataEnumTableRef" :id="model!" :isSYS="isSYS" :model="modelDetail" />
      </a-tab-pane>
      <!-- <a-tab-pane key="2" :tab="t('sys.model.operationRecords')" style="padding: 0 10px" /> -->
    </a-tabs>
  </div>
  <enum-category-modal @register="register" @refresh="() => emit('refresh')" />
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { EditOutlined } from '@ant-design/icons-vue';
  import { Modal } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DataEnumTable from './components/data-enum-table.vue';
  import EnumCategoryModal from './modal/enum-category-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { getEnumModelInfoById } from '/@/apis/gct-apaas/EnumModelController';
  import { EnumModelResponse } from '/@/apis/gct-apaas/model';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const emit = defineEmits(['refresh', 'delete']);

  const { selectedTreeNode, selectedTreeKey } = useTreeSiderPage('ModelDesigner');

  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  //tab页的key
  const activeKey = ref('1');
  const modelDetail = reactive<EnumModelResponse>({});
  const isExpand = ref<boolean>(false);
  const DataEnumTableRef = ref();

  const props = defineProps({
    model: String,
  });

  watch(
    () => props.model,
    async (value) => {
      if (!value) return;
      const res = await getEnumModelInfoById({ id: value });
      Object.assign(modelDetail, res);
    },
    {
      immediate: true,
    },
  );

  // const isSYS = computed(() => {
  //   return modelDetail.createUserId === '__SYS__' && !!modelDetail.sysBuiltin;
  // })

  const refreshEnum = async () => {
    if (!props.model) return;
    const res = await getEnumModelInfoById({ id: props.model });
    Object.assign(modelDetail, res);
  };

  const handleEdit = () => {
    const { node } = selectedTreeNode;
    openModal(true, { ...node, isEdit: true });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.model.confirmDelModelMsg', { modelName: modelDetail.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        if (!selectedTreeKey.value) return;
        emit('delete', selectedTreeKey.value);
      },
      onCancel: () => {},
    });
  };

  const handleCollapseChange = (e) => {
    isExpand.value = !!e[0];
    setTimeout(() => {
      DataEnumTableRef.value && DataEnumTableRef.value.redoHeight();
    }, 300);
  };

  defineExpose({
    refreshEnum,
  });
</script>

<style lang="less" scoped>
  .index-enum-wrap {
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
