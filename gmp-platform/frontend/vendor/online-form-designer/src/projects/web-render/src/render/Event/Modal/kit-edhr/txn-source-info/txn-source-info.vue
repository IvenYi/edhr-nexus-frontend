<template>
  <div class="txn-source-modal">
    <collapse-detail
      class="txn-source-modal_collapse"
      :collapseInfo="collapseInfo"
      :defaultExpand="true"
      :column="3"
      ref="collapseDetailRef"
    >
      <template #status="{ item }">
        <div class="status-tag" :class="`${item.name}`">
          {{ $t(`sys.edhr.containerSnStatus.${item.name}`) }}
        </div>
      </template>
    </collapse-detail>

    <div class="txn-source-modal_flow">
      <div class="header-title">{{ t('sys.edhr.bizProcess') }}</div>
      <txn-flow-path
        ref="flowPathRef"
        :processId="flowPathData.processId"
        :instId="flowPathData.instId"
        :txnId="flowPathData.txnId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { IModal } from '@gct/runtime';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  // import StatusTag from '/@web-render/render/Event/Modal/kit-edhr/rework-configuration/status-tag/status-tag.vue';
  import TxnFlowPath from './txn-flow-path.vue';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    modal: IModal;
    txnInstId: string;
  }>();

  const { t } = useI18n();

  const infoResult = ref<any>({});

  const flowPathData = computed(() => {
    return {
      instId: infoResult.value?.data?.proc_inst_id_,
      txnId: infoResult.value?.data?.id_,
      processId: undefined,
    };
  });

  const collapseInfo = computed(() => {
    return [
      {
        label: t('sys.edhr.txnNo'),
        name: infoResult.value?.data?.txn_no_ || '--',
      },
      {
        label: t('sys.edhr.field.product'),
        name: getFieldValueByDict('product_id_') || '--',
      },
      {
        label: t('sys.edhr.field.mfgOrder'),
        name: getFieldValueByDict('mfg_order_id_') || '--',
      },
      {
        label: t('sys.edhr.transaction'),
        name: getFieldValueByDict('txn_definition_id_') || '--',
      },
      {
        label: t('sys.edhr.processChoice.status'),
        name: infoResult.value?.data?.status_ || '--',
        useSlot: true,
        slotName: 'status',
      },
      {
        label: t('sys.createUser'),
        name: getFieldValueByDict('create_user_id_') || '--',
      },
      {
        label: t('sys.createTime'),
        name: infoResult.value?.data?.create_time_ || '--',
      },
    ];
  });

  watch(
    () => props.txnInstId,
    (val) => {
      if (val) loadTxnData();
    },
    { immediate: true },
  );

  function getFieldValueByDict(field: string, source = infoResult.value || {}) {
    const { data, dict } = source;
    const fieldValue = data?.[field];
    return dict?.[field]?.[fieldValue] || '--';
  }

  async function loadTxnData() {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_txn_inst',
        bsKey: 'getById',
        modelCategory: 'entity',
      },
      // @ts-ignore
      { id: props.txnInstId },
    );
    infoResult.value = res || {};
  }
</script>

<style lang="less" scoped>
  .txn-source-modal {
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;

    &_collapse {
      :deep(.ant-collapse-arrow) {
        display: none !important;
      }

      :deep(.header) {
        padding-top: 0;
        .header-title {
          display: flex;
          align-items: center;
          font-weight: bold;
          font-size: 14px;
          margin-top: 4px;
          color: #212528;

          &::before {
            content: ' ';
            display: inline-block;
            width: 3px;
            height: 14px;
            background-color: var(--ant-primary-color);
            margin-right: 8px;
            vertical-align: middle;
          }
        }
      }

      .status-tag {
        background-color: #f0f0f0;
        padding: 4px 6px;
        border-radius: 4px;
        &.waiting {
          color: #000000;
        }
        &.running {
          color: #0066ffc5;
        }
        &.finished {
          color: #309c41;
        }
        &.closed {
          color: #fff;
        }
        &.ended {
          color: #ff0000;
        }
      }
    }
    &_flow {
      flex: 1;
      display: flex;
      flex-direction: column;

      .header-title {
        display: flex;
        align-items: center;
        font-weight: bold;
        font-size: 14px;
        padding-bottom: 12px;
        color: #212528;

        &::before {
          content: ' ';
          display: inline-block;
          width: 3px;
          height: 14px;
          background-color: var(--ant-primary-color);
          margin-right: 8px;
          vertical-align: middle;
        }
      }

      .txn-flow-path {
        flex: 1;
      }
    }
  }
</style>
