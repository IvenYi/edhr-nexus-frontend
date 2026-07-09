<template>
  <div class="wrap">
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
              <div
                v-if="
                  (modelDetail.type === EntityModelTypeEnum.WORKFLOW ||
                    modelDetail.type === EntityModelTypeEnum.NDO ||
                    modelDetail.type === EntityModelTypeEnum.RDO) &&
                  isExiststate
                "
                class="switch-wrap"
                @click.stop
              >
                {{ t('sys.model.dataState') }}
                <a-tooltip class="ml6px text-[#5A5F6B]">
                  <template #title>控制该模型状态字段为“关闭”的数据是否能够被引用</template>
                  <question-circle-outlined />
                </a-tooltip>

                <a-switch
                  size="small"
                  v-model:checked="modelDetail.specificConfig.operatingStateEnabled"
                  :checkedValue="1"
                  :unCheckedValue="0"
                  @click="handleChangeState($event)"
                  style="margin-left: 8px"
              /></div>
              <div class="switch-wrap ml16px" @click.stop
                >{{ t('sys.appDesigner.msgNotification')
                }}<a-switch
                  size="small"
                  v-model:checked="modelDetail.supportMessage"
                  :checkedValue="1"
                  :unCheckedValue="0"
                  @click="handleChangeMsgNotification($event)"
                  style="margin-left: 8px"
              /></div>
              <div class="switch-wrap ml16px" @click.stop
                >{{ t('sys.model.dataAuthority')
                }}<a-switch
                  size="small"
                  v-model:checked="modelDetail.permissionEnabled"
                  :checkedValue="1"
                  :unCheckedValue="0"
                  @click="handleChangePermissionEnabled($event)"
                  style="margin-left: 8px"
              /></div>
              <!-- <a-button
                v-if="!modelDetail.permissionEnabled"
                class="ml-10px"
                type="primary"
                ghost
                @click.stop="() => handleChangePermissionEnabled(1)"
              >
                <edit-outlined />
                {{ t('sys.model.openDataAuthority') }}
              </a-button>
              <a-popconfirm
                v-else
                :title="t('sys.model.dataAuthorityTips')"
                placement="topRight"
                @confirm="() => handleChangePermissionEnabled(0)"
              >
                <a-button type="primary" class="ml-10px" ghost @click.stop>
                  <edit-outlined />
                  {{ t('sys.model.closeDataAuthority') }}
                </a-button>
              </a-popconfirm> -->
              <a-button @click.stop="handleEdit" class="ml-16px btn-text">
                <edit-outlined />
                {{ t('sys.editInfo') }}
              </a-button>
              <a-button @click.stop="handleDeleteEntity" class="ml-16px btn-text">
                <delete-outlined />
                {{ t('sys.deleteModel') }}
              </a-button>
            </div>
          </div>
          <div :class="['description', { 'desc-expand': isExpand }]">
            <a-descriptions class="item" :column="4">
              <a-descriptions-item :label="t('sys.model.modelType')">
                {{ t('sys.model.' + modelDetail.type) }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.model.modelName')">{{
                modelDetail.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="`${t('sys.model')}KEY`">
                <copy-module-key :moduleKey="modelDetail.key" />
              </a-descriptions-item>
              <a-descriptions-item v-if="modelDetail.type !== EntityModelTypeEnum.RDO">
                <template #label>
                  <span>
                    {{ t('sys.displayField') }}
                  </span>
                  <a-tooltip placement="top">
                    <template #title>{{ t('sys.displayFieldTip') }}</template>
                    <span
                      class="iconfont icon-assist text-[#bfbfbf] config-icon"
                      style="left: 0"
                    ></span>
                  </a-tooltip>
                </template>
                <span>{{ displayName }}</span>
                <span
                  @click.stop="
                    openConfigModal(true, {
                      modelKey: modelDetail.key,
                      fieldKey: modelDetail.displayField,
                    })
                  "
                >
                  <span class="iconfont icon-shezhi primary-gct config-icon"></span>
                  <span class="ml5px primary-gct">{{ t('sys.config') }}</span>
                </span>
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </template>
        <a-descriptions :column="4" class="desc-area">
          <a-descriptions-item :span="2" :label="t('sys.model.modelIdentifier')">
            <span class="tag" v-if="modelDetail.supportTree">{{ t('sys.treeStructure') }}</span>
            <span class="tag process" v-if="modelDetail.supportProcess">{{
              t('sys.model.flowIdentifier')
            }}</span>
            <span class="tag auth" v-if="modelDetail.permissionEnabled">{{
              t('sys.model.dataAuthority')
            }}</span>
            <span class="tag policy">{{
              modelDetail.deletePolicy ? t('sys.model.physicalDelete') : t('sys.model.logicDelete')
            }}</span>
            <span class="tag trace" v-if="modelDetail.modelTraceSettingEnabled">{{
              t('sys.appDesigner.modelTrace')
            }}</span>
            <span class="tag ident" v-if="modelDetail.subModel">{{
              t('sys.model.subTableIdent')
            }}</span>
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.createUser')">{{
            modelDetail.createUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.createTime')">{{
            modelDetail.createTime
          }}</a-descriptions-item>
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
            <span :title="modelDetail.description" class="index-entity-desc">{{
              modelDetail.description
            }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-collapse-panel>
    </a-collapse>
    <a-tabs
      v-model:activeKey="activeKey"
      type="card"
      class="entity-tab"
      :class="['6', '4'].includes(activeKey) && 'tab-pane-no-border-b'"
      destroyInactiveTabPane
    >
      <a-tab-pane key="1" :tab="t('sys.model.dataField')">
        <data-field-table
          ref="DataFieldTableRef"
          :model="modelDetail"
          @update="getFieldData"
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
      <a-tab-pane key="8" :tab="t('sys.model.modelConstraint')">
        <model-constraint-table
          ref="DataFieldTableRef"
          :model="modelDetail"
          @update="refreshDetailInfo"
        />
      </a-tab-pane>
      <a-tab-pane key="6" :tab="t('sys.model.functionMenu')">
        <function-table ref="FunctionTableRef" :model="modelDetail" />
      </a-tab-pane>
      <!-- <a-tab-pane key="6" :tab="t('sys.appDesigner.serviceVerification')" style="padding: 0 10px">
        <service-verification-table :model="modelDetail" />
      </a-tab-pane> -->
      <a-tab-pane key="2" :tab="t('sys.appDesigner.service')">
        <business-service-table ref="BusinessServiceTableRef" :model="modelDetail" />
      </a-tab-pane>
      <a-tab-pane key="7" :tab="t('sys.appDesigner.events')">
        <event-table ref="EventTableRef" :model="modelDetail" />
      </a-tab-pane>
      <template
        v-if="
          !noSupportModel.includes(modelDetail.type) &&
          modelDetail?.specificConfig?.modeltype !== 'workflownode'
        "
      >
        <a-tab-pane key="3" :tab="t('sys.appDesigner.dataTemp')">
          <data-template ref="DataTemplateRef" :model="modelDetail" />
        </a-tab-pane>
      </template>
      <!-- <a-tab-pane key="5" :tab="t('sys.appDesigner.trigger')">
        <trigger-table ref="TriggerTableRef" :model="modelDetail" />
      </a-tab-pane> -->
      <template v-if="!traceNotSupport.includes(modelDetail.type) && !modelDetail.subModel">
        <a-tab-pane key="4" :tab="t('sys.appDesigner.modelTrace')">
          <traceability :model="modelDetail" :activeKey="activeKey" />
        </a-tab-pane>
      </template>
    </a-tabs>
  </div>
  <FieldConfigModal @register="register" @ok="handleConfigOk" />
</template>

<script setup lang="ts" name="index-entity">
  import { createVNode, reactive, ref, watch, computed, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getModelMetaInfo,
    putModelMetaByModelKeyByEnabled,
    getModelMetaDetail,
    putModelMetaSupportMessageByModelKeyByEnabled,
    putModelMetaById,
  } from '/@/apis/gct-apaas/ModelMetaController';
  import DataFieldTable from './components/data-field/data-field-table.vue';
  import ModelConstraintTable from './components/constraint/constraint-table.vue';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { ModelMetaResponse } from '/@/apis/gct-apaas/model';
  import {
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    QuestionCircleOutlined,
  } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';
  import BusinessServiceTable from './components/business-service/business-service-table.vue';
  import DataTemplate from './components/data-template/data-template.vue';
  import Traceability from './components/traceability/model-traceability.vue';
  import FunctionTable from './components/function/function-table.vue';
  // import TriggerTable from './components/trigger/trigger-table.vue';
  import EventTable from './components/event/event-table.vue';
  // import ServiceVerificationTable from './components/service-verification/service-verification-table.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useModal } from '/@/components/Modal';
  import FieldConfigModal from './components/field-config-modal.vue';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { putFieldMetaById } from '/@/apis/gct-apaas/FieldMetaController';

  const emit = defineEmits([
    'edit',
    'delete',
    'register',
    'node-change',
    'handle-expand',
    'handle-tab-click',
  ]);
  const { selectedTreeKey } = useTreeSiderPage('ModelDesigner');
  const { t } = useI18n();
  //tab页的key
  const activeKey = ref('1');
  let modelDetail = reactive({});

  const DataFieldTableRef = ref();
  const FunctionTableRef = ref();
  const BusinessServiceTableRef = ref();
  const DataTemplateRef = ref();
  const TriggerTableRef = ref();
  const EventTableRef = ref();
  const isExpand = ref<boolean>(false);
  const noSupportModel = [
    // EntityModelTypeEnum.DYNAMIC_FORM,
    EntityModelTypeEnum.TRANSACTION,
    EntityModelTypeEnum.WORKFLOW,
  ];
  const traceNotSupport = [EntityModelTypeEnum.TRANSACTION, EntityModelTypeEnum.DYNAMIC_FORM];

  const props = defineProps({
    model: String,
  });

  const [register, { openModal: openConfigModal, closeModal }] = useModal();

  watch(
    () => props.model,
    async (value) => {
      if (!value) return;
      const res = await getModelMetaInfo({ id: value });

      res.supportTree = res?.type === EntityModelTypeEnum.TREE;
      Object.assign(modelDetail, res);
      getFieldData();
    },
    {
      immediate: true,
    },
  );
  const handleEdit = async () => {
    const res = await getModelMetaInfo({ id: selectedTreeKey.value! });
    emit('edit', {
      ...res,
      isEdit: true,
      categoryId: res?.categoryResponse?.id,
      isExiststate: isExiststate.value,
    });
  };

  const handleDeleteEntity = () => {
    Modal.confirm({
      title: modelDetail.initCommitId
        ? t('sys.model.modelDeleteMessage')
        : t('sys.model.modelDraftDeleteMessage'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        emit('delete', modelDetail.id);
      },
    });
  };

  const refreshDetailInfo = async (key: string) => {
    const res = await getModelMetaInfo({ id: key });
    Object.assign(modelDetail, res);
  };

  const handleChangePermissionEnabled = async (checked: any) => {
    if (!checked) {
      Modal.confirm({
        title: () => '提示',
        content: () => t('sys.model.dataAuthorityTips'),
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
          putModelMetaByModelKeyByEnabled({
            modelKey: modelDetail.key ?? '',
            enabled: checked,
          })
            .then(() => {
              message.success(t('sys.model.modifySuccess'));
              refreshDetailInfo(modelDetail.id ?? '');
            })
            .catch(() => {
              modelDetail.permissionEnabled = checked ? 0 : 1;
            });
        },
        onCancel() {
          modelDetail.permissionEnabled = checked ? 0 : 1;
        },
      });
    } else {
      try {
        await putModelMetaByModelKeyByEnabled({
          modelKey: modelDetail.key ?? '',
          enabled: checked,
        });
        message.success(t('sys.model.modifySuccess'));
        refreshDetailInfo(modelDetail.id ?? '');
      } catch (err) {
        console.warn(err);
        modelDetail.permissionEnabled = checked ? 0 : 1;
      }
    }
  };

  const handleChangeMsgNotification = async (checked: any) => {
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
          putModelMetaSupportMessageByModelKeyByEnabled({
            modelKey: modelDetail.key ?? '',
            enabled: checked,
          })
            .then(() => {
              message.success(t('sys.model.modifySuccess'));
              refreshDetailInfo(modelDetail.id ?? '');
            })
            .catch(() => {
              modelDetail.supportMessage = checked ? 0 : 1;
            });
        },
        onCancel() {
          modelDetail.supportMessage = checked ? 0 : 1;
        },
      });
    } else {
      try {
        await putModelMetaSupportMessageByModelKeyByEnabled({
          modelKey: modelDetail.key ?? '',
          enabled: checked,
        });
        message.success(t('sys.model.modifySuccess'));
        refreshDetailInfo(modelDetail.id ?? '');
      } catch (err) {
        console.warn(err);
        modelDetail.supportMessage = checked ? 0 : 1;
      }
    }
  };

  const fieldData = ref([]);
  const displayName = computed(() => {
    const field: any =
      fieldData.value.filter((e: any) => e.key! === modelDetail.displayField)[0] || {};
    return field.name;
  });
  const handleConfigOk = (data) => {
    modelDetail.displayField = data.fieldKey;
  };
  async function getFieldData() {
    const res: any = await getModelMetaDetail({ modelKey: modelDetail.key! });
    fieldData.value = res?.fieldMetaList || [];
  }

  const isExiststate = computed(() => {
    return fieldData.value.filter((i) => {
      return i.key === 'operating_state_';
    }).length;
  });

  const handleChangeState = async (checked) => {
    modelDetail.specificConfig.operatingStateEnabled = checked;
    const res = await getModelMetaInfo({ id: selectedTreeKey.value! });
    await putModelMetaById(
      { id: modelDetail.id },
      {
        ...modelDetail,
        isEdit: true,
        categoryId: res?.categoryResponse?.id,
        isExiststate: isExiststate.value,
      },
    );

    const row = fieldData.value.filter((i) => i.key === 'operating_state_')[0];
    putFieldMetaById(
      { id: row.id },
      {
        ...row,
        defaultValue: row.defaultValue
          ? {
              ...row.defaultValue,
              value: !checked,
              type: row?.defaultValue.type || 'FIXED',
            }
          : {
              value: !checked,
            },
      },
    );

    message.success(t('sys.model.modifySuccess'));
  };

  const handleCollapseChange = (e) => {
    isExpand.value = !!e[0];
    setTimeout(() => {
      DataFieldTableRef.value && DataFieldTableRef.value.redoHeight();
      FunctionTableRef.value && FunctionTableRef.value.redoHeight();
      BusinessServiceTableRef.value && BusinessServiceTableRef.value.redoHeight();
      DataTemplateRef.value && DataTemplateRef.value.redoHeight();
      TriggerTableRef.value && TriggerTableRef.value.redoHeight();
      EventTableRef.value && EventTableRef.value.redoHeight();
    }, 300);
  };

  defineExpose({
    refreshDetailInfo,
  });
</script>

<style lang="less" scoped>
  @import '/@/design/mixins.less';

  .wrap {
    flex: 1;
    height: 100%;
    overflow-y: hidden;
    background-color: #fff;

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
        display: flex;

        .switch-wrap {
          display: flex;
          align-items: center;
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

      .index-entity-desc {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 20px;
        }
      }

      .tag {
        margin-right: 8px;
        padding: 0 8px;
        border-radius: 4px;
        background: rgba(from #f7f8fa r g b / 50%);

        &.process {
          background: #cfeced;
          color: #1d969b;
        }

        &.auth {
          background: #d5e0fb;
          color: #3168ec;
        }

        &.policy {
          background: #e8e2f3;
          color: #5822b4;
        }

        &.trace {
          background: #f5e5ef;
          color: #b12f7c;
        }

        &.ident {
          background: #ffe5d6;
          color: #e96c25;
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
