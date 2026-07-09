<template>
  <div class="workbench-comp-table">
    <a-table :columns="compColumns" :data-source="dataSource" size="middle" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabled'">
          <span :class="['column-state', { 'enable-state': record.enabled === StatusEnum.NORMAL }]">
            <i></i>
            {{ record.enabled === StatusEnum.NORMAL ? t('sys.enabled') : t('sys.disable') }}
          </span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-popconfirm
            :title="getEnabledInfo(record).title"
            @confirm="() => handleEnabledChange(record)"
          >
            <a-button type="link" size="small" v-bind="getEnabledInfo(record).btnExtraProps">{{
              getEnabledInfo(record).label
            }}</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts" name="workbench-comp-table">
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { compColumns } from '../constants/columns';
  import { StatusEnum } from '../constants/index';

  import {
    putWorkbenchComponentRelationWorkbenchComponentActiveById,
    getWorkbenchComponentRelationInfo,
  } from '/@/apis/gct-platform/WorkbenchComponentRelationController';

  import type { WorkbenchComponentRelationResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  interface Props {
    dataSource?: Array<WorkbenchComponentRelationResponse>;
    deviceSource: number;
  }

  const props = defineProps<Props>();

  const emits = defineEmits(['refresh']);

  const getEnabledInfo = (record) => {
    if (record.enabled === StatusEnum.NORMAL) {
      return {
        label: t('sys.component.userCmp.unEnable'),
        title: t('sys.portal.modalCloseTip'),
        btnExtraProps: {
          danger: true,
        },
        msg: t('sys.portal.closeSuccess'),
      };
    }
    return {
      label: t('sys.component.userCmp.enable'),
      title: t('sys.portal.modalOpenTip'),
      btnExtraProps: {},
      msg: t('sys.portal.openSuccess'),
    };
  };

  const handleEnabledChange = async (record) => {
    const info = await getWorkbenchComponentRelationInfo(
      { id: record.id },
      {
        transferToConfig: { headers: { source: props.deviceSource } },
      },
    );
    if (info) {
      let enabled;
      if (info.enabled === StatusEnum.NORMAL) {
        enabled = StatusEnum.DISABLED;
      } else if (info.enabled === StatusEnum.DISABLED) {
        enabled = StatusEnum.NORMAL;
      }

      await putWorkbenchComponentRelationWorkbenchComponentActiveById(
        { id: info.id ?? '' },
        `?enabled=${enabled}`,
        {
          transferToConfig: { headers: { source: props.deviceSource } },
        },
      );

      message.success(getEnabledInfo(record).msg);
      emits('refresh');
    }
  };
</script>
<style scoped lang="less">
  .workbench-comp-table {
    .column-state {
      display: flex;
      align-items: center;
      justify-content: center;

      > i {
        width: 6px;
        height: 6px;
        margin-right: 8px;
        border-radius: 3px;
        background-color: #00000040;
      }

      &.enable-state {
        > i {
          background-color: #00b578;
        }
      }
    }
  }
</style>
