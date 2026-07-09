<template>
  <div class="index-view-wrap">
    <a-collapse
      :bordered="false"
      collapsible="icon"
      style="margin-bottom: 20px"
      @change="handleCollapseChange($event)"
    >
      <a-collapse-panel key="1">
        <template #header>
          <div class="header">
            <div class="header-title"> {{ t('sys.appDesigner.basicInformation') }}</div>
            <div class="action">
              <div class="switch-wrap" @click.stop
                >{{ t('sys.appDesigner.msgNotification')
                }}<a-switch
                  size="small"
                  v-model:checked="viewDetail.supportMessage"
                  :checkedValue="1"
                  :unCheckedValue="0"
                  @click="handleChangeMsgNotification($event)"
                  style="margin-left: 8px"
              /></div>
              <a-button @click.stop="handleViewSQL" class="ml-16px btn-text">
                <!-- <edit-outlined /> -->
                {{ t('sys.view') + 'SQL' }}
              </a-button>
              <a-button @click.stop="handleEdit" class="ml-16px btn-text">
                <edit-outlined />
                {{ t('sys.editInfo') }}
              </a-button>
              <a-button @click.stop="handleDelete" class="ml-16px btn-text">
                <delete-outlined />
                {{ t('sys.model.deleteViewModel') }}
              </a-button>
            </div>
          </div>
          <div :class="['description', { 'desc-expand': isExpand }]">
            <a-descriptions class="item" :column="4">
              <a-descriptions-item :label="t('sys.model.viewName')">{{
                viewDetail.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.model.viewKey')">
                <copy-module-key :moduleKey="viewDetail.key" />
              </a-descriptions-item>
              <!-- <a-descriptions-item :label="t('sys.model.viewType')">{{
                Ch_ViewType[viewDetail.type ?? '']
              }}</a-descriptions-item> -->
              <a-descriptions-item :label="t('sys.createUser')">{{
                viewDetail.createUserName
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.createTime')">{{
                viewDetail.createTime
              }}</a-descriptions-item>
            </a-descriptions>
          </div>
        </template>
        <a-descriptions :column="4" class="desc-area">
          <a-descriptions-item :label="t('sys.modifier')">{{
            viewDetail.modifyUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.modifyTime')">{{
            viewDetail.modifyTime
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
            {{ viewDetail.description }}</a-descriptions-item
          >
        </a-descriptions>
      </a-collapse-panel>
    </a-collapse>
    <a-tabs
      v-model:activeKey="activeKey"
      type="card"
      class="view-tab"
      :class="['2', '4'].includes(activeKey) && 'tab-pane-no-border-b'"
      destroyInactiveTabPane
    >
      <a-tab-pane key="1" :tab="t('sys.model.dataField')">
        <view-field-table
          ref="viewFieldTableRef"
          :model="viewDetail"
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
      <a-tab-pane key="2" :tab="t('sys.model.functionMenu')">
        <view-function-table ref="viewFunctionTableRef" :model="viewDetail" />
      </a-tab-pane>
      <a-tab-pane key="3" :tab="t('sys.appDesigner.service')">
        <view-business-service-table ref="viewBsTableRef" :model="viewDetail" />
      </a-tab-pane>
      <a-tab-pane key="4" :tab="t('sys.model.viewConfig')" style="height: 100%">
        <view-config-panel :model="viewDetail" @editFilterCondition="handleEditFilterCondition" />
      </a-tab-pane>
      <a-tab-pane key="5" :tab="t('sys.appDesigner.dataTemp')">
        <view-data-template ref="ViewDataTemplateRef" :model="viewDetail" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts" name="index-view">
  import { createVNode, reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getViewModelInfo,
    putViewModelSupportMessageByModelKeyByEnabled,
  } from '/@/apis/gct-apaas/ViewModelController';
  import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';
  import ViewFieldTable from './components/view-field-table.vue';
  import ViewFunctionTable from './components/view-function-table.vue';
  import ViewBusinessServiceTable from './components/view-business-service-table.vue';
  import ViewConfigPanel from './components/view-config-panel.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import type { ViewModelResponse } from '/@/apis/gct-apaas/model';
  import viewDataTemplate from './components/view-data-template.vue';

  const { t } = useI18n();

  const Ch_ViewType = {
    QUERY: t('sys.model.queryView'),
    DB: t('sys.model.sqlView'),
  };

  const isExpand = ref<boolean>(false);

  const props = defineProps({
    model: String,
  });

  const emit = defineEmits([
    'edit',
    'delete',
    'register',
    'viewSQL',
    'node-change',
    'handle-expand',
    'handle-tab-click',
  ]);

  const viewDetail = reactive<ViewModelResponse>({});

  //tab页的key
  const activeKey = ref('1');

  const viewFieldTableRef = ref();
  const viewBsTableRef = ref();
  const viewFunctionTableRef = ref();
  const ViewDataTemplateRef = ref();

  watch(
    () => props.model,
    async (value) => {
      if (!value) return;

      await refreshDetailInfo(value);
    },
    {
      immediate: true,
    },
  );

  async function refreshDetailInfo(key: string) {
    const res = await getViewModelInfo({ id: key });
    Object.assign(viewDetail, res);
  }

  const handleEdit = async () => {
    const info = await getViewModelInfo({ id: props.model ?? '' });
    emit('edit', info);
  };

  const handleViewSQL = async () => {
    emit('viewSQL', { model: props.model ?? '' });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.model.viewDeleteModel'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        emit('delete', viewDetail.id);
      },
    });
  };

  const handleEditFilterCondition = async (id, stepIndex) => {
    const info = await getViewModelInfo({ id: props.model ?? '' });
    emit('edit', info, stepIndex);
  };

  const handleCollapseChange = (e) => {
    isExpand.value = !!e[0];
    setTimeout(() => {
      viewFieldTableRef.value && viewFieldTableRef.value.redoHeight();
      viewBsTableRef.value && viewBsTableRef.value.redoHeight();
      viewFunctionTableRef.value && viewFunctionTableRef.value.redoHeight();
    }, 300);
  };

  const handleChangeMsgNotification = async (checked: any) => {
    console.log(checked, 'enabled');
    if (!checked) {
      Modal.confirm({
        title: () => t('sys.tip'),
        content: () => t('sys.model.msgNotificationTips'),
        icon: () =>
          createVNode(
            'span',
            {
              class: 'anticon anticon-exclamation-circle',
            },
            [
              createVNode('i', {
                class: 'iconfont icon-jinggao1',
                style: { position: 'relative', top: '3px', color: '#FF8C4B' },
              }),
            ],
          ),
        onOk() {
          putViewModelSupportMessageByModelKeyByEnabled({
            modelKey: viewDetail.key ?? '',
            enabled: checked,
          })
            .then(() => {
              message.success(t('sys.model.modifySuccess'));
              refreshDetailInfo(viewDetail.id ?? '');
            })
            .catch(() => {
              viewDetail.supportMessage = checked ? 0 : 1;
            });
        },
        onCancel() {
          viewDetail.supportMessage = checked ? 0 : 1;
        },
      });
    } else {
      await putViewModelSupportMessageByModelKeyByEnabled({
        modelKey: viewDetail.key ?? '',
        enabled: checked,
      });
      message.success(t('sys.model.modifySuccess'));
      refreshDetailInfo(viewDetail.id ?? '');
    }
  };

  defineExpose({
    refreshDetailInfo,
  });
</script>

<style lang="less" scoped>
  @import '/@/design/mixins.less';

  .index-view-wrap {
    flex: 1;
    height: 100%;
    overflow-y: hidden;
    background-color: #fff;
    display: flex;
    flex-direction: column;

    :deep(.btn-text.ant-btn) {
      // color: #212528;
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

      .action {
        .switch-wrap {
          display: inline-block;
        }
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

  :deep(.ant-switch-small) {
    min-width: 18px;
    height: 12px;
    line-height: 12px;

    .ant-switch-handle {
      top: 1px;
      left: 1px;
      width: 10px;
      height: 10px;
    }

    &.ant-switch-checked {
      .ant-switch-handle {
        left: calc(100% - 11px);
      }
    }
  }

  :deep(.ant-tabs.view-tab) {
    height: 100%;
    flex: 1;

    .ant-tabs-content {
      height: 100%;
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
        border-radius: 0;
        margin-left: 0;
        border-right-width: 0;
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
