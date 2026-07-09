<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    class="model-designer-basic-table"
    :columns="eventColumns"
    :dataSource="tableData"
  >
    <template #headerTop>
      <div style="text-align: right">
        <a-button @click="handleNew" type="primary">{{ t('sys.new') }}</a-button>
      </div>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'bizServiceName'">
        <a-tooltip>
          <template #title>{{ record.bizServiceKey }}</template>
          {{ record.bizServiceName }}
        </a-tooltip>
      </template>
      <template v-if="column.key === 'type'">
        {{ t(i18nKeyMap[record.type]) }}
      </template>
      <template v-if="column.key === 'executeType'">
        {{ t(i18nKeyMap[record.executeType]) }}
      </template>
      <template v-if="column.key === 'resourceType'">
        {{ t(i18nKeyMap[record.resourceType]) }}
      </template>
      <template v-if="column.key === 'name'">
        <span class="event-name" @click.stop="handleDesign(record)">{{ record.name }}</span>
      </template>
      <template v-if="column.key === 'enabled'">
        <a-switch
          v-model:checked="record.enabled"
          size="small"
          :checkedValue="1"
          :unCheckedValue="0"
          @click="updateStatus($event, record)"
        />
      </template>
      <template v-if="column.key === 'description'">
        <a-tooltip>
          <template #title>{{ record.description }}</template>
          <span class="w-full">{{ record.description }}</span>
        </a-tooltip>
      </template>
      <template v-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDelete'),
                confirm: handleRowDelete.bind(null, record.id),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
  <event-modal @register="registerEvent" :modelKey="model.key" @refresh="onRefresh" />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { eventColumns } from './constant/columns';
  import EventModal from './modal/event-modal.vue';
  import { i18nKeyMap, triggerEnum } from './type';
  import {
    deleteBizEvent,
    getBizEventList,
    putBizEventById,
  } from '/@/apis/gct-apaas/BizEventController';
  import { BizEventResponse } from '/@/apis/gct-apaas/model';
  import { getScriptInfoByKey } from '/@/apis/gct-apaas/ScriptController';
  import { getServiceOrchestrationInfoByKey } from '/@/apis/gct-apaas/ServiceOrchestrationController';
  import { openWindow } from '/@/utils';

  const props = defineProps<{
    model;
  }>();

  const { t } = useI18n();
  const [registerEvent, { openModal }] = useModal();
  const tableData = ref<BizEventResponse[]>([]);
  const tableRef = ref();

  const handleNew = () => {
    openModal();
  };

  const initTableData = async () => {
    tableData.value = (await getBizEventList({ modelKey: props.model.key })) || [];
  };

  watch(
    () => props.model.key,
    () => {
      initTableData();
    },
    {
      immediate: true,
    },
  );

  const onRefresh = () => {
    initTableData();
  };

  // 设计
  const handleDesign = async (record) => {
    const { relationId, resourceType } = record;
    if (resourceType === triggerEnum.SCRIPT_SERVICE) {
      const res = await getScriptInfoByKey({ key: relationId });
      openWindow(location.href.split('#')[0] + '#/script-editor/' + res!.id, {
        target: '_blank',
      });
    } else if (resourceType === triggerEnum.SO_SERVICE) {
      const res = await getServiceOrchestrationInfoByKey({ key: relationId });
      openWindow(location.href.split('#')[0] + '#/service-orchestration/' + res!.id, {
        target: '_blank',
      });
    }
  };

  // 编辑
  const handleRowEdit = (data: BizEventResponse) => {
    openModal(true, { ...data, edit: true });
  };

  // 删除
  const handleRowDelete = async (id: string) => {
    await deleteBizEvent({ ids: id });
    message.success('删除成功');
    onRefresh();
  };
  // 修改状态
  const updateStatus = async (val, record) => {
    const { id, name, ...data } = record;
    console.log(val, name);
    try {
      await putBizEventById({ id: id }, data);
      message.success('修改成功！');
      onRefresh();
    } catch {
      message.success('修改失败');
      onRefresh();
    }
  };

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less" scoped>
  .event-name {
    cursor: pointer;
    color: var(--ant-primary-color);
    // &:hover {
    //   text-decoration: underline;
    // }
  }
</style>
