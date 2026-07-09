<template>
  <div :class="ns.b()">
    <div :class="ns.b('header')">
      <div :class="ns.be('header', 'left')">
        <div :class="ns.be('header', 'back')" @click="onClose">
          <i class="iconfont icon-a-Leftarrow"></i>
        </div>
        <div :class="ns.be('header', 'title')">
          {{ t('sys.nameOfSth', { sth: t('sys.menu.dataSet') }) }}：
        </div>
        <div :class="ns.be('header', 'view-title-edit')">
          <a-input
            ref="nameRef"
            v-show="isEdit"
            v-model:value="titleName"
            :bordered="false"
            @click.stop
          />
          <span :class="ns.e('edit-title')" v-show="!isEdit" @click="onEdit">
            <span :title="titleName">{{ titleName }}</span>
            <i class="iconfont icon-a-Single-linetext"></i>
          </span>
        </div>
      </div>
      <div :class="ns.be('header', 'center')">
        <div :class="ns.be('header', 'view-actions')">
          <a-radio-group v-model:value="settingType" button-style="solid">
            <a-radio-button value="model">{{ t('模型配置') }}</a-radio-button>
            <a-radio-button value="field">{{ t('字段配置') }}</a-radio-button>
          </a-radio-group>
        </div>
      </div>
      <div :class="ns.be('header', 'right')">
        <div :class="ns.be('header', 'view-actions')">
          <a-button :loading="isSave" @click="onSave">
            <template #default>{{ t('sys.designView.save') }}</template>
            <template #icon><i class="iconfont icon-baocun1"></i></template>
          </a-button>
        </div>
      </div>
    </div>
    <div :class="ns.b('content')">
      <div :class="ns.be('content', 'left')">
        <basic-form ref="formRef" @updateDBType="handleUpdateDBType" />
      </div>
      <div :class="ns.be('content', 'right')">
        <div class="h100% relative" v-if="settingType === 'model'">
          <a-button
            type="primary"
            size="middle"
            class="on-run-btn"
            :loading="isSave"
            @click="onRun"
          >
            <template #default>{{ t('运行') }}</template>
            <template #icon><i class="iconfont icon-baocun mr-2"></i></template>
          </a-button>
          <code-editor
            v-model:value="scriptStr"
            language="sql"
            ref="editorRef"
            :theme="Theme.VS"
            :style="{ height: editorHeight }"
            @editor-mounted="handleEditorMounted"
          />
          <div
            :class="{
              'collapsible-container': true,
              'mt-1px': !isCollapsed,
              'mt--1px': isCollapsed,
            }"
          >
            <a-tabs v-model:activeKey="activeKey">
              <template #rightExtra>
                <a-button
                  @click="toggleCollapse"
                  type="link"
                  :class="{
                    'isCollapsed-btn': true,
                    'isCollapsed-btn--active': !isCollapsed,
                  }"
                >
                  <DoubleRightOutlined />
                </a-button>
              </template>
              <a-tab-pane key="1" tab="数据预览">
                <div v-show="!isCollapsed" class="flex flex-col h-100% overflow-hidden py-16px">
                  <a-table
                    v-if="columns?.length"
                    :dataSource="dataSource"
                    :columns="columns"
                    ref="tableContainerRef"
                    class="gct-edhr-table h-100px flex-1"
                    size="middle"
                    :pagination="pagination"
                    @change="handleTableChange"
                    :scroll="{ x: '100%', y: scrollHeight }"
                  >
                    <template #bodyCell="{ column, text }">
                      <span :title="text">{{ text }}</span>
                    </template>
                  </a-table>

                  <a-empty style="margin-top: 50px" v-else />
                </div>
              </a-tab-pane>
              <!-- <a-tab-pane key="2" tab="历史记录">
                <div v-show="!isCollapsed" class="flex flex-col h-100% overflow-hidden py-16px">
                  <a-table
                    v-if="historyDataSource?.length > 0"
                    :dataSource="historyDataSource"
                    :columns="historyColumns"
                    ref="tableContainerRef1"
                    class="gct-edhr-table h-full"
                    size="middle"
                    :pagination="false"
                    :scroll="{
                      y: scrollHeight1,
                    }"
                  />

                  <a-empty style="margin-top: 50px" v-else />
                </div>
              </a-tab-pane> -->
            </a-tabs>
          </div>
        </div>

        <field-setting v-else ref="fieldSettingRef" :fieldsData="fieldsData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick, h, onMounted, computed, reactive } from 'vue';
  import { useNamespace, IModal, useAntTableScrollHeight } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal, message } from 'ant-design-vue';
  import { onClickOutside } from '@vueuse/core';
  import { Theme } from '/@/components/code-editor/useMonacoEditor';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import BasicForm from './basic-form.vue';
  import FieldSetting, { IFieldSetting } from './field-setting.vue';
  import { getDatasetLogList } from '/@/apis/gct-platform/PnDatasetLogController';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { DataSourceType } from '/@/projects/bi-designer/src/enum/database';

  const props = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const settingType = ref('model');
  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const tableContainerRef1 = ref();
  const { scrollHeight: scrollHeight1 } = useAntTableScrollHeight(tableContainerRef1, {
    pagination: false,
  });

  const ns = useNamespace('design-view');
  const { t } = useI18n();

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const titleName = ref('');
  const oldTitleName = ref('');
  const scriptStr = ref('');
  const isEdit = ref<boolean>(false);
  const isSave = ref<boolean>(false);
  const isChange = ref<boolean>(false);
  const databaseType = ref<DataSourceType>();

  const nameRef = ref();
  const formRef = ref();
  const editorRef = ref();
  const fieldSettingRef = ref();
  const fieldsData = ref<IFieldSetting[]>([]);
  const onEdit = () => {
    isEdit.value = true;
    oldTitleName.value = titleName.value;
    nextTick(() => {
      nameRef.value?.focus();
      nameRef.value?.select();
    });
  };

  onClickOutside(nameRef, (e) => {
    if (isEdit.value) {
      isEdit.value = false;
      const newVal = (titleName.value = titleName.value.trim());
      if (titleName.value.length > 100) {
        return;
      }
      if (oldTitleName.value !== newVal) {
        if (newVal == '') {
          titleName.value = oldTitleName.value;
        } else {
          e.stopPropagation();
        }
      }
    }
  });

  const onClose = () => {
    if (isChange.value) {
      const cfg = Modal.confirm({
        title: t('sys.designView.saveConfirm.title'),
        content: h('div', {}, [
          h('span', {}, t('sys.designView.saveConfirm.content')),
          h('div', { class: ns.b('continue-edit') }, [
            h('button', { type: 'button', onClick: () => cfg.destroy() }, '继续编辑'),
          ]),
        ]),
        okText: t('sys.designView.saveConfirm.confirm'),
        cancelText: t('sys.designView.saveConfirm.cancel'),
        onOk: async () => {
          await onSave();
          closeModal();
        },
        onCancel: () => {
          closeModal();
        },
        class: ns.b('confirm'),
        maskStyle: {
          backgroundColor: 'transparent',
        },
      });
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    props.modal.dismiss({ ok: true });
  };

  const onSave = async () => {
    try {
      await handleSave();
    } catch (err) {
      console.warn(err);
    }
  };

  function handleUpdateDBType(type: DataSourceType) {
    databaseType.value = type;
    dataSource.value = [];
    editorRef.value?.reload();
  }

  /** 数据集保存 */
  async function handleSave() {
    const data = formRef?.value.getData();
    const fieldMeaning = fieldSettingRef.value?.getDataSource?.();
    const { databaseType: datasource_, databaseId, type: dataset_type_ } = data;
    if (!scriptStr.value || !data.databaseId) {
      message.warning(!data.databaseId ? '请选择数据源' : '请输入SQL语句');
      return;
    }
    const postData = {
      ...data,
      name_: titleName.value,
      datasource_,
      database_key_: databaseId,
      app_id_: databaseId,
      dataset_type_,
      script_: scriptStr.value,
      field_config_: JSON.stringify(fieldMeaning),
    };
    if (props.data.id_) {
      await postBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_dataset',
          bsKey: 'updateById',
        },
        {
          ...postData,
        },
        { id: props.data.id_ },
      );
    } else {
      await postBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_dataset',
          bsKey: 'save',
        },
        {
          ...postData,
        },
      );
    }
    message.success(t('sys.saveSuccess'));
    props.modal.dismiss({ ok: true });
  }

  const dataSource = ref<any>([]);
  const columns = ref<any>([]);
  const onRun = async () => {
    const data = formRef?.value.getData();
    if (!scriptStr.value || !data.databaseId) {
      message.warning(!data.databaseId ? '请选择数据源' : '请输入SQL语句');
      return;
    }
    console.log(data, 'data');
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_dataset',
        bsKey: 'biz_run_script',
      },
      {
        // ...data,
        name_: titleName.value,
        database_key_: data.databaseId, // 数据库数据源
        app_id_: data.databaseId, // 应用数据源
        script_: scriptStr.value,
        datasource_: data.databaseType,
      },
    );
    console.log(res, 'res: post script');
    if (res) {
      pagination.current = 1;
      pagination.total = 0;
      dataSource.value = res.rows;
      const _columns = res.columns?.length
        ? res.columns.map((item) => {
            return {
              title: item.column?.toLocaleLowerCase(),
              dataIndex: item.column?.toLocaleLowerCase(),
              key: item.column?.toLocaleLowerCase(),
              width: 130,
              ...item,
            };
          })
        : Object.keys(res.rows?.[0] ?? {}).map((item) => {
            return {
              title: item?.toLocaleLowerCase(),
              dataIndex: item,
              key: item,
              width: 130,
            };
          });
      columns.value = _columns;
      fieldsData.value = _columns;
    }
    console.log(res);
  };

  const historyDataSource = ref<any>([]);
  const historyColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },

    {
      title: 'SQL语句',
      dataIndex: 'script',
      key: 'script',
    },
    {
      title: '修改人',
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      width: 150,
    },
    {
      title: '修改时间',
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      width: 180,
    },
  ];

  const getHistoryLog = async () => {
    const res =
      (await getDatasetLogList({
        datasetId: props.data?.id_,
      })) || [];

    historyDataSource.value =
      res?.map((item, index) => {
        let decodedScript = decodeURIComponent(item?.script ?? '');
        return {
          ...item,
          index: index + 1,
          script: decodedScript,
        };
      }) ?? [];
  };

  const isCollapsed = ref<boolean>(false);
  const activeKey = ref('1');

  const editorHeight = computed(() => {
    return isCollapsed.value ? 'calc(100% - 44px)' : '300px';
  });

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const handleEditorMounted = () => {
    editorRef.value && editorRef.value?.reload(scriptStr.value);
  };

  onMounted(() => {
    const {
      script_: script,
      name_: name,
      id_: id,
      database_key_: databaseKey,
      app_id_: appId,
      datasource_: databaseType,
      field_config_: fieldConfig,
      type = 'SQL',
    } = props.data;
    titleName.value = name ?? '未命名数据集';
    scriptStr.value = script;
    fieldsData.value = typeof fieldConfig === 'string' ? JSON.parse(fieldConfig) : fieldConfig;
    const databaseId = databaseKey || appId;
    formRef?.value.setFormData({ id, databaseId, databaseType, type });
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
  };
</script>

<style lang="scss">
  @import './design-view.scss';
</style>

<style lang="scss" scoped>
  .collapsible-container {
    padding: 0 10px;
    background-color: #fff;
    height: calc(100% - 300px);

    .ant-table {
      height: 100%;
    }

    .ant-tabs {
      height: 100%;
      :deep(.ant-tabs-nav) {
        margin-bottom: 0;
      }
      :deep(.ant-tabs-content-holder) {
        height: calc(100% - 46px);
      }

      :deep(.ant-tabs-content) {
        height: 100%;
      }
    }
  }
  .on-run-btn {
    position: absolute;
    left: 4px;
    top: 4px;
    z-index: 11;
  }

  .isCollapsed-btn {
    transform: rotate(270deg);

    &--active {
      transform: rotate(90deg);
    }
  }
  :deep(.preview-table) {
    .ant-table-tbody > tr > td {
      white-space: nowrap; /* 禁止换行 */
      text-overflow: ellipsis; /* 超出部分显示省略号 */
      word-break: break-word; /* 长单词或URL换行 */
      overflow: hidden; /* 隐藏超出部分 */
    }
  }

  :deep(.ant-radio-button-wrapper-checked:focus-within) {
    box-shadow: none !important;
  }
</style>
