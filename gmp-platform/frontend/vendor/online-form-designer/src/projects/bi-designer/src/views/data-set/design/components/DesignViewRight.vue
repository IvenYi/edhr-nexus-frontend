<template>
  <div :class="[ns.b(), 'h100%', 'relative']">
    <template v-if="isDsConfig || databaseType === DataSourceType.API">
      <template v-if="databaseType == DataSourceType.API">
        <ApiFieldsConfig
          v-if="apiStep === APIDataSetStep.FIELD_CONFIG"
          ref="apiFieldRef"
          :apiDatabaseId="apiDatabaseId"
          :configData="configData"
          :apiSelected="apiSelected"
          :isApiEdit="isApiEdit"
          :isApiDBChecked="isApiDBChecked"
        />
        <ApiConfigForm
          v-if="apiStep === APIDataSetStep.DATASET_CONFIG"
          ref="apiFormRef"
          :connType="connType"
          :configData="configData"
          :modelConfig="modelConfig"
          @handleDeploy="() => emit('handleDeploy', isApiDBChecked)"
          @updateChange="() => emit('updateChange')"
        />
      </template>
      <template v-else>
        <ModelConfig v-if="step === ReportDataSetStepBI.MODEL_CONFIG" />
        <FieldsConfig v-else-if="step === ReportDataSetStepBI.FIELD_CONFIG" ref="fieldRef" />
      </template>
    </template>
    <template v-else>
      <a-button
        v-if="databaseType !== DataSourceType.FILE"
        class="on-run-btn"
        :loading="isSave"
        type="primary"
        @click="() => emit('handleRun', false)"
      >
        <template #default>{{ $t('sys.bi.run') }}</template>
        <template #icon><RetweetOutlined /></template>
      </a-button>
      <code-editor
        v-if="databaseType !== DataSourceType.FILE"
        v-model:value="_scriptStr"
        language="sql"
        ref="editorRef"
        :theme="Theme.VS"
        class="dateset-code-wrap"
        :style="{ height: editorHeight }"
        :gapVal="110"
        @editorMounted="onEditorMounted"
      />
    </template>
    <div
      v-if="
        (isDsOrApiConfig &&
          (step === ReportDataSetStepBI.DATASET_CONFIG ||
            apiStep === APIDataSetStep.DATASET_CONFIG)) ||
        !isDsOrApiConfig
      "
      :class="{
        'collapsible-container': true,
        'mt-1px': !isCollapsed,
        'mt--1px': isCollapsed,
        'collapse-con-height':
          databaseType !== DataSourceType.FILE && step !== ReportDataSetStepBI.DATASET_CONFIG,
      }"
    >
      <a-tabs v-if="!open" v-model:activeKey="activeKey">
        <template #rightExtra>
          <a-button
            v-if="
              databaseType !== DataSourceType.FILE &&
              step !== ReportDataSetStepBI.DATASET_CONFIG &&
              apiStep !== APIDataSetStep.DATASET_CONFIG
            "
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
        <a-tab-pane key="1" :tab="$t('sys.bi.dataPreview')">
          <div v-show="!isCollapsed" class="flex flex-col h-100% overflow-hidden">
            <slot></slot>
          </div>
        </a-tab-pane>
        <a-tab-pane v-if="!isDsOrApiConfig" key="2" :tab="$t('sys.bi.historyLog')">
          <div v-show="!isCollapsed" class="flex flex-col h-100% overflow-hidden py-16px">
            <a-table
              v-if="historyDataSource?.length > 0"
              :dataSource="historyDataSource"
              :columns="databaseType == DataSourceType.FILE ? history4FileColumns : historyColumns"
              ref="tableContainerRef1"
              class="gct-edhr-table h-full"
              size="middle"
              :pagination="false"
              :scroll="{
                y: scrollHeight1,
              }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'index' && databaseType == DataSourceType.FILE">
                  <span>{{ record.index }}</span
                  ><span v-if="record.currentVerison" class="cur-version ml-4px">{{
                    $t('sys.bi.currentVerison')
                  }}</span>
                </template>
                <template v-if="column.key === 'actions'">
                  <table-action-auto
                    :actions="[
                      // {
                      //   label: t('回滚'),
                      //   popConfirm: {
                      //     title: t('sys.app.version.sureToToggle'),
                      //     confirm: () => handleRoleBack(record),
                      //   },
                      // },
                      {
                        label: $t('sys.download'),
                        onClick: () => handleDownload(record),
                      },
                    ]"
                    :stopButtonPropagation="true"
                  />
                </template>
              </template>
            </a-table>

            <a-empty style="margin-top: 50px" v-else />
          </div>
        </a-tab-pane>
        <template v-else-if="isDsOrApiConfig && apiStep == APIDataSetStep.DATASET_CONFIG">
          <a-tab-pane key="2" :tab="$t('sys.bi.callLog')">
            <a-table
              v-if="deployLogDataSource?.length > 0"
              :dataSource="deployLogDataSource"
              :columns="deployLogColumns"
              ref="tableContainerRef2"
              class="gct-edhr-table h-full"
              size="middle"
              :pagination="false"
              :scroll="{
                y: scrollHeight2,
              }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'requestype'">
                  <span>{{ requestypeArr[record.requestype] }}</span>
                </template>
              </template>
            </a-table>

            <a-empty style="margin-top: 50px" v-else />
          </a-tab-pane>
        </template>
      </a-tabs>

      <div class="wrong" v-else>
        <a-result
          status="error"
          :title="$t('sys.bi.runFailed')"
          :sub-title="$t('sys.bi.runFailedTip')"
        >
          <template #extra>
            <div class="w-full flex justify-between items-center">
              <span>{{ $t('sys.bi.errorDetail') }}</span>
            </div>
          </template>
          <div class="desc">
            <p class="wrong-info">
              <strong>The content you submitted has the following error:</strong>
              {{ wrongInfo }}
            </p>
          </div>
        </a-result>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useNamespace, useAntTableScrollHeight } from '@gct/runtime';
  import { ReportDataSetStepBI, ModelConfig, FieldsConfig } from '@gct/runtime-web';
  import { DataSourceType } from '/@bi-designer/enum/database';
  import { Theme } from '/@/components/code-editor/useMonacoEditor';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import { getBiFileDatasetConfigListDatasetid } from '/@/apis/gct-platform/FileDatasetConfigController';
  import { getDatasetLogList } from '/@/apis/gct-platform/PnDatasetLogController';
  import { downloadByUrl } from '/@/utils/file/download';
  import ApiFieldsConfig from './ApiFieldsConfig.vue';
  import ApiConfigForm from './ApiConfigForm.vue';
  import { APIDataSetStep } from '../../interface/type';
  import { getDatabaseInfo } from '/@/apis/gct-platform/DatabaseController';
  import { BasicTable, TableActionAuto } from '/@/components/Table';

  const props = defineProps<{
    scriptStr: string;
    isDsConfig: boolean;
    step: string;
    apiStep?: APIDataSetStep;
    open: boolean;
    datasetId: string;
    databaseType?: DataSourceType;
    apiDatabaseId?: string;
    configData?: any[];
    isApiEdit?: boolean;
    wrongInfo?: string;
    modelConfig?: string;
    originDatabaseId?: string;
  }>();

  const ns = useNamespace('design-view-con-right');
  const emit = defineEmits([
    'updateData',
    'handleRun',
    'update:scriptStr',
    'handleDeploy',
    'updateChange',
  ]);

  const tableContainerRef1 = ref();
  const { scrollHeight: scrollHeight1 } = useAntTableScrollHeight(tableContainerRef1, {
    pagination: false,
  });

  const tableContainerRef2 = ref();
  const { scrollHeight: scrollHeight2 } = useAntTableScrollHeight(tableContainerRef2, {
    pagination: false,
  });

  const activeKey = ref('1');
  const isCollapsed = ref<boolean>(false);
  const isSave = ref<boolean>(false);
  const historyDataSource = ref<any>([]);
  const editorRef = ref();
  const fieldRef = ref();
  const apiFieldRef = ref();
  const apiFormRef = ref();
  const deployLogDataSource = ref<any>([]);
  const connType = ref<0 | 1>();
  const apiSelected = ref<string>('');

  const _scriptStr = computed({
    get() {
      return props.scriptStr || '';
    },
    set(val) {
      emit('update:scriptStr', val);
    },
  });

  const editorHeight = computed(() => {
    return isCollapsed.value ? 'calc(100% - 44px)' : '50%';
  });

  const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  const isDsOrApiConfig = computed(() => {
    return props.isDsConfig || props.databaseType == DataSourceType.API;
  });

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

  const history4FileColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 100,
    },
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
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
    {
      title: $t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
      width: 120,
    },
  ];

  const deployLogColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: '调用时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '调用方式',
      dataIndex: 'requestype',
      key: 'requestype',
      width: 150,
    },
    {
      title: 'API地址',
      dataIndex: 'script',
      key: 'script',
    },
    {
      title: '调用账号',
      dataIndex: 'createUserName',
      key: 'createUserName',
      width: 180,
    },
  ];

  const requestypeArr = [
    $t('sys.bi.fullCoverage'),
    $t('sys.bi.fullAppend'),
    $t('sys.bi.incrementExtract'),
    $t('sys.bi.direct'),
  ];

  const isApiDBChecked = computed(() => {
    return props.originDatabaseId && props.originDatabaseId !== props.apiDatabaseId;
  });

  const getHistoryLog = async () => {
    const res =
      (await getDatasetLogList({
        datasetId: props.datasetId,
      })) || [];
    if (isDsOrApiConfig.value) {
      deployLogDataSource.value =
        res?.map((item, index) => {
          return {
            ...item,
            index: index + 1,
          };
        }) ?? [];
    } else {
      historyDataSource.value =
        res?.map((item, index) => {
          let decodedScript = decodeURIComponent(item?.script ?? '');
          return {
            ...item,
            index: index + 1,
            script: decodedScript,
          };
        }) ?? [];
      historyDataSource.value.sort((a, b) => new Date(b.modifyTime) - new Date(a.modifyTime));
    }
  };

  const getHistoryLog4File = async () => {
    const res = (await getBiFileDatasetConfigListDatasetid({ datasetId: props.datasetId })) || [];
    historyDataSource.value =
      res?.map((item, index) => {
        return {
          ...item,
          index: index + 1,
          name: item.url?.split('/').at(-1),
        };
      }) ?? [];
    historyDataSource.value.sort((a, b) => new Date(b.modifyTime) - new Date(a.modifyTime));
  };

  const getDeployLog = async () => {};

  const handleDownload = (record) => {
    downloadByUrl({ url: `/minio/${record.url}` });
  };

  // const handleCopy = async () => {
  //   try {
  //     await navigator.clipboard.writeText(props.wrongInfo || '');
  //     console.log('success');

  //     message.success('复制成功！');
  //   } catch (err) {
  //     console.log('err', err);
  //     message.warning('复制失败，请手动复制');
  //   }
  // };

  let reloadScript: string = '';

  const reloadEditor = async (script) => {
    if (editorRef.value?.isMonacoReady === true) {
      editorRef.value.reload(script);
    } else {
      reloadScript = script;
    }
  };

  const fieldValid = () => {
    if (props.databaseType == DataSourceType.API) {
      return apiFieldRef.value?.validate();
    }
    return fieldRef.value?.validate();
  };

  const getApiFieldConfig = () => {
    return apiFieldRef.value?.getNodes();
  };

  const getApiDatabaseInfo = async (databaseId) => {
    const res = (await getDatabaseInfo({ id: databaseId })) || {};
    const apiConfig = JSON.parse(res?.apiConfig || '{}');
    connType.value = apiConfig.connType;
    apiSelected.value = apiConfig.selected || '';
  };

  watch(
    () => props.apiDatabaseId,
    (v) => {
      v && getApiDatabaseInfo(props.apiDatabaseId);
    },
    {
      deep: true,
      immediate: true,
    },
  );

  function onEditorMounted(): void {
    if (reloadScript) {
      editorRef.value.reload(reloadScript);
      reloadScript = '';
    }
  }

  defineExpose({
    getHistoryLog,
    getHistoryLog4File,
    reloadEditor,
    fieldValid,
    getApiFieldConfig,
    getDeployLog,
    getApiForm() {
      return connType.value === 1 ? { syncType: null } : apiFormRef.value?.formState;
    },
    apiFormValid() {
      return apiFormRef.value?.validate();
    },
    resetApiForm() {
      return apiFormRef.value?.reset();
    },
  });
</script>

<style lang="scss" scoped>
  @include b(design-view-con-right) {
    display: flex;
    flex-direction: column;
  }

  .wrong-info {
    height: 100px;
    overflow-y: auto;
    overflow-wrap: break-word;
    font-size: 16px;
  }
 
  .collapsible-container {
    flex: 1;
    height: 100%;
    padding: 0 10px;
    background-color: #fff;

    &.collapse-con-height {
      height: 50%;
      overflow-y: auto;
    }

    .ant-table {
      height: 100%;
    }

    :deep(.ant-result-content) {
      border: solid 1px rgb(255 204 199);
      background-color: rgb(255 242 240);
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
    z-index: 11;
    top: 4px;
    right: 14px;
  }

  .isCollapsed-btn {
    transform: rotate(270deg);

    &--active {
      transform: rotate(90deg);
    }
  }

  .copy {
    color: rgb(2 106 200);
  }

  :deep(.preview-table) {
    .ant-table-tbody > tr > td {
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 超出部分显示省略号 */
      word-break: break-word; /* 长单词或URL换行 */
      white-space: nowrap; /* 禁止换行 */
    }
  }

  .cur-version {
    display: inline-block;
    padding: 2px 4px;
    border-radius: 4px;
    background: #e2eef9;
    color: var(--ant-primary-color);
    font-size: 12px;
  }

  :deep(.dateset-code-wrap.m-e .m-e-main .m-e-main_container) {
    min-height: 240px;
  }
</style>
