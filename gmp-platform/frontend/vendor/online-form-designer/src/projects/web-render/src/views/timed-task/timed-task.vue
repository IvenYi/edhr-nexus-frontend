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
        <template #action="{ record }">
          <table-action-auto
            :class="ns.b('column-actions')"
            :actions="[
              {
                label: t('sys.webRender.timedTask.actions.manualExecution'),
                color: 'success',
                popConfirm: {
                  title: t('sys.appDesigner.timedTask.grid.confirm.title'),
                  confirm: () => {
                    onAction(record, 'MANUAL_EXECUTION');
                  },
                },
                ifShow: getShouldShow(CustomAction.ViewTask),
              },
              {
                label: t('sys.webRender.timedTask.actions.view'),
                onClick: () => {
                  onAction(record, 'VIEW');
                },
                ifShow: getShouldShow(CustomAction.ManualTrigger),
              },
            ]"
          />
        </template>
        <template #bodyCell="{ column, text, record }">
          <span v-if="column.dataIndex === 'triggerPolicy'">{{ triggerPolicyCache[text] }}</span>
          <span v-if="column.dataIndex === 'resourceType'">{{ resourceTypeCache[text] }}</span>
          <a-tag
            v-if="column.dataIndex === 'status'"
            :class="[
              ns.be('table', 'status'),
              ns.is('enabled', text === 'ENABLED'),
              ns.is('disabled', text === 'DISABLED'),
            ]"
            :color="text === 'ENABLED' ? '#DEF8E2' : '#E8EBF0'"
          >
            {{ statusCache[text] }}
          </a-tag>
          <span
            v-if="column.dataIndex === 'resourceId' && record.resourceType === 'SCRIPT_SERVICE'"
          >
            {{ triggerScriptServiceMap[text] }}
          </span>
          <span v-if="column.dataIndex === 'resourceId' && record.resourceType === 'SO_SERVICE'">
            {{ triggerArrangeServiceMap[text] }}
          </span>
        </template>
      </basic-table>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { ICodeList, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { triggerPolicy, resourceType, status } from './code-list';
  import { model } from './layout-config';
  import { BasicColumn, TableActionAuto } from '/@/components/Table';
  import { JobResponse } from '/@/apis/gct-apaas/model';
  import { getJobPageList, postJobExec } from '/@/apis/gct-apaas/JobController';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { message } from 'ant-design-vue';
  import { TimedTaskEdit } from '../../../../app-designer/src/views/timed-task/timed-task-edit';
  import { CustomAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '../../utils/UserappPermissions';

  const userActions = computed(() => {
    return {
      [CustomAction.ViewTask]: getPermissionByKey('TimedTask', CustomAction.ViewTask),
      [CustomAction.ManualTrigger]: getPermissionByKey('TimedTask', CustomAction.ManualTrigger),
    };
  });

  const getShouldShow = (action) => {
    if (userActions.value[action]) {
      return true;
    }
    return false;
  };

  const { t } = useI18n();

  const ns = useNamespace('app-timed-task');

  // 代码表注册
  gct.codeList.register(triggerPolicy);
  gct.codeList.register(resourceType);
  gct.codeList.register(status);

  const formatCodeList = (codeList: ICodeList) => {
    const cache: IData = {};
    if (codeList.items) {
      codeList.items.forEach((item) => {
        cache[item.value] = item.label;
      });
    }
    return cache;
  };

  const triggerPolicyCache = formatCodeList(triggerPolicy);

  const resourceTypeCache = formatCodeList(resourceType);

  const statusCache = formatCodeList(status);

  const triggerScriptServiceMap = ref<IData>({});

  const triggerArrangeServiceMap = ref<IData>({});

  const searchFormRef = ref<any>(null);

  const items = ref<JobResponse[]>([]);

  const searchData = ref<any>({});

  const pagination = reactive({
    pageSize: 20,
    total: 0,
    current: 1,
  });

  const columns: BasicColumn[] = [
    {
      title: t('sys.webRender.timedTask.grid.index'),
      dataIndex: 'index',
      width: 72,
      fixed: 'left',
    },
    {
      title: t('sys.webRender.timedTask.grid.jobName'),
      dataIndex: 'jobName',
      fixed: 'left',
    },
    {
      title: t('sys.webRender.timedTask.grid.triggerPolicy'),
      dataIndex: 'triggerPolicy',
    },
    {
      title: t('sys.webRender.timedTask.grid.resourceType'),
      dataIndex: 'resourceType',
    },
    {
      title: t('sys.webRender.timedTask.grid.resourceName'),
      dataIndex: 'resourceId',
    },
    {
      title: t('sys.webRender.timedTask.grid.status'),
      dataIndex: 'status',
    },
    {
      width: 180,
      title: t('sys.webRender.operate'),
      dataIndex: 'action',
      slots: { customRender: 'action' },
      fixed: 'right',
    },
  ];

  const onChange = (p) => {
    pagination.current = p.current;
    pagination.pageSize = p.pageSize;
    onFetch();
  };

  const onSearch = async () => {
    searchData.value = searchFormRef.value?.getData() || {};
    pagination.current = 1;
    onFetch();
  };

  const onFetch = async () => {
    const data = await getJobPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...searchData.value,
    });
    await loadTriggerServiceList();
    if (data) {
      items.value = data.data || [];
      pagination.total = data.totalCount || 0;
    } else {
      items.value = [];
    }
    items.value.forEach((item, i) => {
      (item as any).index = i + 1;
    });
  };

  // 加载代码表
  async function loadTriggerServiceList() {
    const items = await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT });
    if (items) {
      items.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            triggerScriptServiceMap.value[child.id!] = child.name!;
          });
        }
      });
    }
    const items2 = await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION });
    if (items2) {
      items2.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            triggerArrangeServiceMap.value[child.id!] = child.name!;
          });
        }
      });
    }
  }

  const onAction = (item: any, type: string) => {
    if (type === 'VIEW') {
      gct.openUtil.modal(
        TimedTaskEdit,
        { context: { id: item.id }, isInfo: true },
        {
          width: 740,
          maskClosable: true,
          title: t(`sys.webRender.timedTask.modal.title`),
          footer: false,
        },
      );
    }
    if (type === 'MANUAL_EXECUTION') {
      // 手动执行
      manualExecution(item);
    }
  };

  /**
   * 手动执行定时任务
   *
   * @author zhanghanrui
   * @date 2024-03-22 14:03:57
   * @param {any} [item]
   * @return {*}  {Promise<void>}
   */
  const manualExecution = async (item: any): Promise<void> => {
    await postJobExec({ id: item.id }, { joinParamsToUrl: true });
    message.success(t('sys.appDesigner.timedTask.info.manualExecutionSuccess'));
  };

  onFetch();
</script>
<style lang="scss">
  @import './timed-task.scss';
</style>
