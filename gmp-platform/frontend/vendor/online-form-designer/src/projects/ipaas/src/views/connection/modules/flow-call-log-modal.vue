<template>
  <Transition name="slide-fade">
    <div
      id="flow-call-log-modal"
      class="absolute top-0px left-0px h-full w-full z-99 bg-white"
      v-show="visible"
    >
      <div class="h-full flex flex-col">
        <div class="h-40px flex items-center pl-20px border border-b-solid border-color-[#eee]">
          <div class="flex items-center cursor-pointer" @click="visible = false">
            <arrow-left-outlined />
            <span class="ml-4px">{{ t('sys.integration.backToPrevPage') }}</span>
          </div>
        </div>

        <div class="flex-1 h-100px flex">
          <div class="h-full w-60% p-20px">
            <a-table
              class="h-full log-table"
              row-key="id"
              :columns="columns"
              :data-source="tableData"
              :pagination="false"
              :loading="loading"
              size="middle"
              ref="tableContainerRef"
              :scroll="{
                y: scrollHeight,
              }"
              :customRow="rowClick"
              :rowClassName="(_, index) => (index === currentRowIndex ? 'highlight' : '')"
            />
          </div>

          <div :key="currentRowIndex" class="h-full w-1px flex-1 pr-20px overflow-auto">
            <a-spin :spinning="nodeLogDetailLoading">
              <template v-if="errorMsg">
                <a-divider v-if="errorMsg" orientation="left">{{
                  t('sys.integration.errorReason')
                }}</a-divider>
                <div class="error-gct">{{ errorMsg }}</div>
              </template>
              <template v-if="nodeLogDetail?.input?.endpointType === 'webhook'">
                <a-divider
                  v-if="nodeLogDetail?.input?.endpointType === 'webhook'"
                  orientation="left"
                  >{{ t('sys.integration.requestAddDisplay') }}</a-divider
                >
                <copy-module-key :moduleKey="webhookUrl" />
              </template>
              <template v-if="nodeLogDetail?.input?.endpointType !== EndpointType.apiResponse">
                <a-divider
                  v-if="
                    inputPath ||
                    inputQuery ||
                    inputHeader ||
                    inputBody ||
                    inputParameter ||
                    inputSql ||
                    (nodeLogDetail?.input &&
                      [EndpointType.if, EndpointType.ldap, EndpointType.sapRfc].includes(
                        nodeLogDetail?.input?.endpointType,
                      ))
                  "
                  orientation="left"
                  >{{ t('sys.editor.input') }}</a-divider
                >
                <CodeSection v-if="inputPath" :json="inputPath" title="Path" />
                <CodeSection v-if="inputQuery" :json="inputQuery" title="Query" />
                <CodeSection v-if="inputHeader" :json="inputHeader" title="Header" />
                <CodeSection v-if="inputBody" :json="inputBody" title="Body" />
                <CodeSection v-if="inputParameter" :json="inputParameter" title="Parameter" />
                <CodeSection v-if="inputSql" :json="inputSql" title="Sql" />
                <template
                  v-if="
                    nodeLogDetail?.input && nodeLogDetail?.input?.endpointType === EndpointType.ldap
                  "
                >
                  <a-form layout="vertical">
                    <a-form-item :label="t('sys.integration.adServerAddress')">
                      {{ nodeLogDetail?.input?.loginAddress }}
                    </a-form-item>
                    <a-form-item :label="t('sys.integration.loginAccount')">
                      {{
                        nodeLogDetail?.input?.authFormConfig?.find((e) => e.key === 'account')
                          ?.value
                      }}
                    </a-form-item>
                    <a-form-item :label="t('sys.integration.baseDn')">
                      {{ nodeLogDetail?.input?.baseDn }}
                    </a-form-item>
                    <a-form-item :label="t('sys.integration.filterDetail')">
                      {{ nodeLogDetail?.input?.filter }}
                    </a-form-item>
                  </a-form>
                </template>
                <template v-if="nodeLogDetail?.input?.endpointType === EndpointType.sapRfc">
                  <a-form layout="vertical">
                    <a-form-item :label="t('sys.integration.callFuncName')">
                      {{ nodeLogDetail?.input?.functionName }}
                    </a-form-item>
                  </a-form>
                  <CodeSection
                    v-if="nodeLogDetail.input.imports"
                    :json="nodeLogDetail.input.imports"
                    title="IMPORT"
                  />
                  <CodeSection
                    v-if="nodeLogDetail.input.tables"
                    :json="nodeLogDetail.input.tables"
                    title="TABLES"
                  />
                </template>
              </template>
              <div
                v-if="nodeLogDetail?.input?.endpointType === EndpointType.if"
                class="code-section"
                data-title="Condition"
              >
                <case-translate :data="nodeLogDetail?.input" class="pt34px" />
              </div>
              <template
                v-if="outputHeader || outputBody || outputData || outputExport || outputTables"
              >
                <a-divider orientation="left">{{ t('sys.editor.output') }}</a-divider>
                <CodeSection v-if="outputHeader" :json="outputHeader" title="Header" />
                <template v-if="outputBody">
                  <template
                    v-if="
                      nodeLogDetail?.output?.endpointType === EndpointType.db &&
                      Array.isArray(nodeLogDetail?.output.body)
                    "
                  >
                    <DebugResponseTable
                      v-if="nodeLogDetail?.output.body && nodeLogDetail?.output.body.length"
                      :data="nodeLogDetail?.output.body"
                    />
                  </template>
                  <CodeSection v-else :json="outputBody" title="Body" />
                </template>

                <CodeSection v-if="outputData" :json="outputData" title="Data" />
                <CodeSection v-if="outputExport" :json="outputExport" title="Export" />
                <CodeSection v-if="outputTables" :json="outputTables" title="Tables" />
              </template>
            </a-spin>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { TableColumnsType } from 'ant-design-vue';
  import { postFlowNodeLog } from '/@/apis/gct-ipaas/IpaasLogController';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { useGlobSetting } from '/@/hooks/setting';
  import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import DebugResponseTable from '../../../comps/step-modules/__comps__/debug-response-table.vue';
  import caseTranslate from '../../../comps/step-modules/__comps__/case-translate.vue';
  import { CodeSection } from '/@/components/VirtualJsonViewer';
  import { getFlowNodeLogByReqId } from '/@/apis/gct-ipaas2/FlowLogController';
  import type { FlowNodeLogResp } from '/@/apis/gct-ipaas2/model';

  const loading = ref<boolean>(false);
  const tableData = ref<FlowNodeLogResp[]>([]);
  const tableContainerRef = ref();
  const nodeLogDetail = ref({});
  const nodeLogDetailLoading = ref<boolean>(false);
  const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef, {
    pagination: false,
  });
  const { host } = useGlobSetting();
  const { t } = useI18n();

  const inputPath = ref<string>('');
  const inputQuery = ref<string>('');
  const inputHeader = ref<string>('');
  const inputBody = ref<string>('');
  const inputParameter = ref<string>('');
  const inputSql = ref<string>('');
  const outputHeader = ref<string>('');
  const outputBody = ref<string>('');
  const outputData = ref<string>('');
  const outputExport = computed(() => nodeLogDetail.value.output?.export);
  const outputTables = computed(() => nodeLogDetail.value.output?.tables);
  const errorMsg = ref<string>('');

  const currentRowIndex = ref<number>(0);
  const visible = ref<boolean>(false);

  // const reqId = route.params.reqId as string;

  const webhookUrl = computed(() => {
    if (tableData.value.length === 0) return;
    const hostUrl = import.meta.env.DEV ? host : window.location.origin;
    return `${hostUrl}/gct-ipaas/api/webhook${
      nodeLogDetail.value?.input?.responseMethod === 'ASYNC' ? '/async' : ''
    }/rest/${tableData.value[0].fuuid}`;
  });

  const columns: TableColumnsType = [
    {
      title: t('sys.integration.nodeId'),
      dataIndex: 'nodeId',
      key: 'nodeId',
      ellipsis: true,
    },
    {
      title: t('sys.integration.nodeType'),
      dataIndex: 'endpointType',
      key: 'endpointType',
      ellipsis: true,
      customRender: ({ text }) => (text ? $t(`sys.ipaas.endpointType.${text}`) : text),
    },
    {
      title: t('sys.integration.runTime'),
      dataIndex: 'processTimeStart',
      key: 'processTimeStart',
      ellipsis: true,
    },
    {
      title: t('sys.integration.endTime'),
      dataIndex: 'processTimeEnd',
      key: 'processTimeEnd',
      ellipsis: true,
    },
    {
      title: `${t('sys.integration.executionTime')} (ms)`,
      dataIndex: 'processTime',
      key: 'processTime',
      width: 120,
      ellipsis: true,
    },
  ];

  const rowClick = (record: FlowNodeLogResp, index: number) => {
    return {
      onClick: () => {
        if (currentRowIndex.value === index) return;
        getNodeLogDetail(record, index);
        currentRowIndex.value = index;
      },
    };
  };

  const _toJsonString = (data) => {
    let result = data;
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
        result = JSON.stringify(result, null, 2);
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        result = JSON.stringify(result, null, 2);
      } catch (err) {
        console.log(err);
      }
    }
    return result;
  };

  const getNodeLogDetail = async (record: FlowNodeLogResp, recordIndex: number = 0) => {
    nodeLogDetailLoading.value = true;
    inputPath.value = '';
    inputQuery.value = '';
    inputHeader.value = '';
    inputBody.value = '';
    inputParameter.value = '';
    inputSql.value = '';
    outputHeader.value = '';
    outputBody.value = '';
    outputData.value = '';
    errorMsg.value = '';
    nodeLogDetail.value = '';
    const { fuuid, reqId, nodeId } = record;
    const res: any = await postFlowNodeLog({
      fuuid,
      reqId,
      nodeId,
    });
    if (currentRowIndex.value == recordIndex) {
      nodeLogDetail.value = res;
      inputPath.value = _toJsonString(res?.input?.uriParameters);
      inputQuery.value = _toJsonString(res?.input?.queryParameters);
      inputHeader.value = _toJsonString(res?.input?.headerParameters);
      inputBody.value = _toJsonString(res?.input?.body);
      inputParameter.value = _toJsonString(res?.input?.parameters);
      inputSql.value = _toJsonString(res?.input?.sql);
      errorMsg.value = res?.errorMsg;

      outputHeader.value = _toJsonString(res?.output?.headerParameters);
      outputBody.value = _toJsonString(res?.output?.body);
      outputData.value = _toJsonString(res?.output?.data);

      setTimeout(() => {
        nodeLogDetailLoading.value = false;
      }, 150);
    }
  };

  const open = ({ reqId }) => {
    visible.value = true;
    calcScrollHeight();
    getFlowNodeLogByReqId({ reqId }).then((res) => {
      tableData.value = res ?? [];
      if (res.length > 0) {
        getNodeLogDetail(res[0]);
        currentRowIndex.value = 0;
      }
    });
  };

  defineExpose({
    open,
  });
</script>

<style lang="less" scoped>
  .log-table :deep(.highlight) {
    background-color: rgba(from var(--ant-primary-color) r g b / 20%);
  }

  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(10px);
    opacity: 0;
  }

  :deep(.ant-form-vertical) {
    .ant-form-item-label label {
      color: #797a7d;
    }

    .ant-form-item-control-input {
      min-height: auto;
    }
  }
</style>
