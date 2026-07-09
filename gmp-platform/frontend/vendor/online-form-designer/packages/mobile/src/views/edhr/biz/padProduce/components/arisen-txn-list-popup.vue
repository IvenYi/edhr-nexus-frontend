<template>
  <basic-popup
    v-model:show="show"
    :title="'事务列表'"
    :popup-props="popupProps"
    :extraStyle="{ width: '800px' }"
    :showFooter="false"
  >
    <div class="p16px h100% overflow-auto">
      <Empty
        v-if="txnList.length === 0"
        class="h-full"
        description="暂无数据"
        :size="[90, 66]"
      />
      <div v-for="item in txnList" :key="item.id_" class="txn-item">
        <div class="txn-item-title ks-row-middle">
          <div class="status" :class="[item.status_]">{{ item._DICT?.status_[item.status_][0] || '--' }}</div>
          <div class="title">{{ item._DICT?.txn_definition_id_[item.txn_definition_id_][0] || '--' }}</div>
        </div>
        <div class="txn-item-main my16px ks-row-between">
          <div class="main-one">
            <div class="item-label">事务编号</div>
            <div class="item-content">
              {{ item.txn_no_ || '--' }}
            </div>
          </div>
          <div class="main-one">
            <div class="item-label">当前处理人</div>
            <div class="item-content">
              {{ item.view_range_ ? item._DICT?.view_range_[item.view_range_].join(',') : '--' }}
            </div>
          </div>
          <div class="main-one">
            <div class="item-label">创建时间</div>
            <div class="item-content">
              {{ item.create_time_ || '--' }}
            </div>
          </div>
        </div>
        <div class="txn-item-btns">
          <van-button v-show="item.status_ === 'waiting'" plain type="danger" size="small" @click="onDelete(item)">删除</van-button>
          <!-- <van-button plain size="small">详情</van-button> -->
          <van-button v-show="item.status_ === 'running' || item.status_ === 'waiting'" type="primary" size="small" @click="onHandle(item)">处理</van-button>
        </div>
      </div>
    </div>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { transformSourceData } from '@mobile/views/edhr/_utils_';
  import { showConfirmDialog, showDialog } from 'vant';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey, getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { handlePadTxn } from '../../txn/txn-handler';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const props = defineProps<{
    popupProps: any;
    context: {
     params: any;
     callback?: Function;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const txnList = ref<any[]>([]);

  onMounted(() => {
    getData();
  });

  async function getData() {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey: 'em_txn_inst',
        bsKey: 'listByPage',
      },
      {
        query: {
          'effective_.eq': 'true',
          'status_.isNotNull': null,
          ...(props.context?.params || {})
        },
        pageNo: 1,
        pageSize: 9999,
      },
      {
      },
      {
        ignoreParamsToData: true,
      },
    );

    txnList.value = (res?.data ?? []).map(e => transformSourceData(e, res?.dict));
  }

  function onDelete(item) {
    showConfirmDialog({
      title: '提示',
      message: '确认执行？',
    })
    .then(async() => {
      const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: 'entity',
          modelKey: 'em_txn_inst',
          bsKey: 'biz_remove',
        },
        {
          id_: item.id_,
        },
      )
      getData();
    })
  }

  async function onHandle(item: any) {
    const txnNodeRes = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: 'entity',
      modelKey: 'em_txn_node_status',
      bsKey: 'biz_permissions_search',
    },
    {
      query: {
        'status_.in': ['waiting', 'running'],
        'current_task_type_.in': ['config_node', 'form_node'],
        'txn_inst_id_': item.id_
      }
    })
  if (!txnNodeRes?.data?.length) {
    showDialog({
      title: '提示',
      message: '当前事务暂无处理权限',
    })
    return;
  }
  const txnNodeData = txnNodeRes?.data?.[0] ?? {}
  const { current_task_type_ } = txnNodeData;
  // 表单节点
  if (current_task_type_ === 'form_node' && item.online_form_inst_id_) {
    handlePadTxn(
      { onlineFormInstId: item.online_form_inst_id_, mfgOrderId: item.mfg_order_id_ },
      () => {
        getData();
        if (props.context?.callback) props.context.callback();
      }
    )
  }
  // 配置节点
  if (current_task_type_ === 'config_node') {
    handlePadTxn({})
  }
  }

</script>

<style scoped lang="less">
  .txn-item {
    padding: 16px;
    background-color: #FFF;
    color: #1A1D23;
    border-radius: 8px;

    & + & {
      margin-top: 8px;
    }

    &-title {

      .status {
        padding: 4px 10px;
        margin-right: 8px;
        font-size: 12px;
        border: 1px solid rgba(from var(--color) r g b / 50%);
        border-radius: 13px;
        line-height: 16px;
        flex-shrink: none;
        background-color: rgba(from var(--color) r g b / 8%);

        &::before {
          content: ' ';
          display: inline-block;
          margin-right: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color);
          
        }

        &.waiting {
          --color: #F1AD47;
        }
        &.running {
          --color: #2C8FFF;
        }
        &.finished {
          --color: #48C65C;
        }
        &.ended {
          --color: #8B8B8B;
        }
      }
      .title {
        font-size: 16px;
        font-weight: 600;
        flex: 1;
        word-break: break-all;
      }
    }

    &-main {
      column-gap: 8px;

      .main-one {
        flex: 1;
        flex-shrink: none;
        overflow: hidden;
        word-break: break-all;

        .item-label {
          font-size: 13px;
          color: #8B8B8B;
          margin-bottom: 6px;
        }
  
        .item-content {
          font-size: 14px;
        }
      }
    }

    &-btns {
      display: flex;
      justify-content: flex-end;
      column-gap: 12px;
      :deep(.van-button) {
        padding: 0 20px;
        font-size: 15px;
      }
    }
  }
</style>
