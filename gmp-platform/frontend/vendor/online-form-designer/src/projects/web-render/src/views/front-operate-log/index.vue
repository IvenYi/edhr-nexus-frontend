<template>
  <basic-page-render>
    <div class="operation-log-container">
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item name="username" :label="t('sys.appDesigner.operatePerson')">
              <a-input
                v-model:value="formState.username"
                :placeholder="t('sys.pleaseInputSth', { sth: t('sys.appDesigner.operatePerson') })"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="operateType" :label="t('sys.appDesigner.operate')">
              <a-select
                v-model:value="formState.operateType"
                :options="OperateTypeOptions"
                :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.appDesigner.operate') })"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="bizModel" :label="t('sys.appDesigner.operateModule')">
              <a-select
                v-model:value="formState.bizModel"
                :options="BizModelTypeOptions"
                :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.appDesigner.operateModule') })"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8" v-show="expand">
            <a-form-item name="createTime" :label="t('sys.appDesigner.operateTime')">
              <a-range-picker
                style="width: 100%"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                :placeholder="[t('sys.startTime'), t('sys.endTime')]"
                v-model:value="formState.createTime"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8" v-show="expand">
            <a-form-item name="keyword" :label="t('sys.appDesigner.operateContent')">
              <a-input
                v-model:value="formState.keyword"
                :placeholder="t('sys.pleaseInputSth', { sth: t('sys.appDesigner.operateContent') })"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" style="text-align: right">
            <a-button @click="() => formRef?.resetFields()">
              <template #icon>
                <undo-outlined />
              </template>
              {{ t('sys.reset') }}
            </a-button>
            <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.query') }}
            </a-button>
            <a style="font-size: 12px" @click="expand = !expand">
              <template v-if="expand">
                <up-outlined />
              </template>
              <template v-else>
                <down-outlined />
              </template>
              {{ t('sys.contract') }}
            </a>
          </a-col>
        </a-row>
      </a-form>
      <div class="table-wrap">
        <a-table
          :columns="operationLogColumns"
          :data-source="tableData"
          :bordered="true"
          :expand-column-width="42"
          rowKey="id"
          :scroll="{ x: 'max-content', y: 'max-content' }"
          sticky
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'operateType'">
              {{ getChValue(OperateTypeOptions, record.operateType) }}
            </template>
            <template v-if="column.key === 'module'">
              {{ getChValue(BizModelTypeOptions, record.module) }}
            </template>
          </template>

          <template #expandIcon="props">
            <i
              style="cursor: pointer"
              @click="
                (e) => {
                  props.onExpand(props.record, e);
                }
              "
            >
              <DownOutlined v-if="props.expanded" />
              <RightOutlined v-else />
            </i>
          </template>

          <template #expandedRowRender="{ record }">
            <div class="expand-wrap">
              <a-descriptions :column="1" size="middle">
                <a-descriptions-item :label="t('sys.appDesigner.requestUrl')">
                  <span v-html="record.requestInfo ?? '-'"></span>
                </a-descriptions-item>
                <a-descriptions-item :label="t('sys.appDesigner.inputContent')">{{
                  record.inputContent ?? '-'
                }}</a-descriptions-item>
                <a-descriptions-item :label="t('sys.appDesigner.outContent')">{{
                  record.outputContent ?? '-'
                }}</a-descriptions-item>
              </a-descriptions>
            </div>
          </template>
        </a-table>
      </div>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts" name="operation-log-container">
  import { ref, reactive, onBeforeMount } from 'vue';
  import {
    SearchOutlined,
    UndoOutlined,
    UpOutlined,
    DownOutlined,
    RightOutlined,
  } from '@ant-design/icons-vue';
  import dayjs from 'dayjs';
  import {
    operationLogColumns,
    OperateTypeOptions,
    BizModelTypeOptions,
    getChValue,
  } from './constant/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getFrontOperateLogPageList } from '/@/apis/gct-apaas/FrontOperateLogController';
  import type { FormInstance } from 'ant-design-vue';
  import type { FrontOperateLogResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  interface FormState {
    /** 操作人 */
    username?: string;
    /** 操作类型 */
    operateType?: string;
    /** 模块类型 */
    bizModel?: string;
    /** 内容 */
    keyword?: string;
    /** 操作时间 */
    createTime?: string[];
  }

  const formState = reactive<FormState>({
    username: undefined,
    operateType: undefined,
    bizModel: undefined,
    keyword: undefined,
    createTime: [],
  });

  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showQuickJumper: false,
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const formRef = ref<FormInstance>();
  const tableData = ref<Array<FrontOperateLogResponse>>([]);
  const expand = ref<boolean>(false);

  const getTableData = async () => {
    const result = await getFrontOperateLogPageList({
      bizModel: formState.bizModel,
      keyword: formState.keyword,
      operateType: formState.operateType,
      username: formState.username,
      startTime: formState.createTime?.[0]
        ? dayjs(formState.createTime?.[0]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      endTime: formState.createTime?.[1]
        ? dayjs(formState.createTime?.[1]).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
    pagination.value.total = result?.totalCount ?? 0;
    tableData.value = result?.data ?? [];
  };

  onBeforeMount(getTableData);

  const handleSearch = () => {
    formRef.value?.validate().then(() => {
      pagination.value.current = 1;
      getTableData();
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.value.current = current;
    pagination.value.total = total;
    pagination.value.pageSize = pageSize;
    getTableData();
  };
</script>

<style lang="less" scoped>
  .operation-log-container {
    padding: 16px;

    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .table-wrap {
      margin-top: 12px;
      overflow: hidden;

      .expand-wrap {
        width: 100%;

        :deep(.ant-descriptions-row) {
          .ant-descriptions-item-container {
            border: 1px solid #c9e9ff;
            background-color: #f0faff;
            border-radius: 4px;
            padding: 12px;
          }

          &:first-child {
            .ant-descriptions-item-container {
              border: 1px solid #d1d6ff;
              background-color: #f0f4ff;
            }
          }

          &:last-child {
            .ant-descriptions-item-container {
              border: 1px solid #b9f1ce;
              background-color: #edfff3;
            }

            .ant-descriptions-item {
              padding-bottom: 0;
            }
          }
        }
      }

      :deep(.ant-table-wrapper) {
        position: relative;
        height: 100%;
        .ant-spin-nested-loading {
          height: 100%;
          .ant-spin-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            .ant-table {
              flex: 1;
              overflow: hidden;
            }
            .ant-table-container {
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
              .ant-table-body {
                flex: 1;
                overflow: auto !important;
              }
            }
          }
        }
      }
    }
  }
</style>
