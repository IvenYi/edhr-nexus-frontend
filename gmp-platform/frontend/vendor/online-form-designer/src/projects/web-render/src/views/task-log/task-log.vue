<template>
  <basic-page-render :class="ns.b()">
    <app-search-form ref="searchFormRef" :model="model" @search="onSearch" isFixed />
    <div class="table-wrap">
      <basic-table
        :class="ns.b('table')"
        :striped="false"
        :bordered="true"
        :showIndexColumn="false"
        :ellipsis="true"
        ref="tableRef"
        :columns="columns"
        :dataSource="items"
        :pagination="pagination"
        @change="onChange"
      >
        <template #bodyCell="{ column, text, record }">
          <span v-if="column.dataIndex === 'triggerMode'">{{ modeCache[text] }}</span>
          <a-tag
            v-else-if="column.dataIndex === 'status'"
            :class="[
              ns.be('table', 'status'),
              ns.is('error', text === 'FAILURE'),
              ns.is('success', text === 'SUCCEED'),
            ]"
            :color="text === 'SUCCEED' ? '#DEF8E2' : '#FEECEC'"
          >
            {{ resultCache[text] }}
          </a-tag>
          <a-popover v-if="column.dataIndex === 'status' && text !== 'SUCCEED'">
            <template #title>
              <div class="flex justify-between pt-6px pl-4px pr-4px pt-4px">
                <div>
                  <InfoCircleOutlined style="color: #f54547" class="mr4px" />
                  {{ t('sys.fail') }}{{ t('sys.detail') }}
                </div>
                <a @click="copy(record.message)">{{ t('sys.copy') }}</a>
              </div>
            </template>
            <template #content>
              <div class="pop-message">{{ record.message }}</div>
            </template>
            <div class="fail">
              <QuestionCircleOutlined style="color: #8c8c8c; vertical-align: middle" />
            </div>
          </a-popover>
        </template>
      </basic-table>
    </div>
  </basic-page-render>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref } from 'vue';
  import { ICodeList, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { triggerMode, triggerResult } from './code-list';
  import { model } from './layout-config';
  import { BasicColumn } from '/@/components/Table';
  import { getJobLogPageList } from '/@/apis/gct-apaas/JobLogController';
  import { JobLogResponse } from '/@/apis/gct-apaas/model';
  import dayjs from 'dayjs';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { t } = useI18n();

  const ns = useNamespace('app-task-log');

  // 代码表注册
  gct.codeList.register(triggerMode);
  gct.codeList.register(triggerResult);

  const formatCodeList = (codeList: ICodeList) => {
    const cache: IData = {};
    if (codeList.items) {
      codeList.items.forEach((item) => {
        cache[item.value] = item.label;
      });
    }
    return cache;
  };

  const { createMessage } = useMessage();

  const modeCache = formatCodeList(triggerMode);

  const resultCache = formatCodeList(triggerResult);

  const searchFormRef = ref<any>(null);

  const searchData = ref<any>({});

  const items = ref<JobLogResponse[]>([]);

  const pagination = reactive({
    pageSize: 20,
    total: 0,
    current: 1,
  });

  const columns: BasicColumn[] = [
    {
      title: t('sys.webRender.taskLog.grid.index'),
      dataIndex: 'index',
      width: 72,
      fixed: 'left',
    },
    {
      title: t('sys.webRender.taskLog.grid.jobName'),
      dataIndex: 'jobName',
      fixed: 'left',
    },
    {
      title: t('sys.webRender.taskLog.grid.triggerMode'),
      dataIndex: 'triggerMode',
    },
    {
      title: t('sys.webRender.taskLog.grid.status'),
      dataIndex: 'status',
    },
    {
      title: t('sys.webRender.taskLog.grid.time'),
      dataIndex: 'duration',
    },
    {
      title: t('sys.webRender.taskLog.grid.operator'),
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.webRender.taskLog.grid.operatorDate'),
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
    },
  ];

  const onChange = (p) => {
    pagination.current = p.current;
    pagination.pageSize = p.pageSize;
    onFetch();
  };

  const onSearch = async () => {
    const today = dayjs();
    const data = searchFormRef.value?.getData() || {};
    if (!data.startTime) {
      data.startTime = today.subtract(1, 'month').format('YYYY-MM-DD') + ' 00:00:00';
    }
    if (!data.endTime) {
      data.endTime = today.format('YYYY-MM-DD') + ' 23:59:59';
    }
    searchData.value = data;
    pagination.current = 1;
    onFetch();
  };

  function formatDuration(time: number): string {
    // 计算各部分
    const totalSeconds = Math.floor(time / 1000); // 秒数
    const totalMinutes = Math.floor(totalSeconds / 60); // 分钟数
    const totalHours = Math.floor(totalMinutes / 60); // 小时数
    const totalDays = Math.floor(totalHours / 24); // 天数
    const milliseconds = time % 1000; // 毫秒数
    const seconds = totalSeconds % 60; // 剩余的秒数
    const minutes = totalMinutes % 60; // 剩余的分钟数
    const hours = totalHours % 24; // 剩余的小时数
    const days = totalDays; // 天数

    let str = '';
    if (days && days > 0) {
      str += `${days}d`;
    }
    if (hours && hours > 0) {
      str += `${hours}h`;
    }
    if (minutes && minutes > 0) {
      str += `${minutes}m`;
    }
    if (seconds && seconds > 0) {
      str += `${seconds}s`;
    }
    if (milliseconds && milliseconds > 0) {
      str += `${milliseconds}ms`;
    }

    return str;
  }

  const onFetch = async () => {
    const data = await getJobLogPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...searchData.value,
    });
    if (data) {
      items.value = data.data || [];
      pagination.total = data.totalCount || 0;
    } else {
      items.value = [];
    }
    items.value.forEach((item, i) => {
      (item as any).index = i + 1;
      if (item.duration != null && item.duration > 0) {
        item.duration = formatDuration(item.duration) as any;
      }
    });
  };

  const copy = (message) => {
    const { isSuccessRef } = useCopyToClipboard(message);
    unref(isSuccessRef) && createMessage.success(t('sys.pageDesigner.copySuccess'));
  };

  onSearch();
</script>
<style lang="scss">
  @import './task-log.scss';
</style>
<style lang="less" scoped>
  .pop-message {
    max-height: 270px;
    max-width: 540px;
    white-space: wrap;
    word-wrap: break-word;
    overflow: auto;
  }
  :deep(.ant-tag) {
    margin-right: 8px !important;
  }
  .fail {
    display: inline-block;
    width: 30px;
  }
</style>
