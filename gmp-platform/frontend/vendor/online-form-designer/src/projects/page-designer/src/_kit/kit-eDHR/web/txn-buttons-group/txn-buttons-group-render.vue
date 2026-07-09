<template>
  <div class="txn-buttons-group h-100% overflow-hidden">
    <template v-if="txnList.length">
      <Scrollbar class="relative pr-12px pb-12px">
        <a-button
          v-for="item in txnList"
          class="txn-buttons-group_item"
          size="large"
          block
          :key="item.id"
          :loading="item.loading"
          @click="handleTxn(item)"
        >
          <span class="txn-buttons-group_item-name">{{ item.name }}</span>
          <span class="txn-buttons-group_item-count">{{ item.totalCount }}</span>
        </a-button>
      </Scrollbar>
    </template>
    <div v-else class="flex justify-center items-center h-[100%] text-[#999999]">
      <a-empty
        :description="$t('sys.noData')"
        :image="emptyImage"
        :imageStyle="{ width: '90px', height: '66px' }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRef, ref } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { formMap } from '/@/projects/web-render/src/render/Event/utils/runGlobalByPage';
  import { Scrollbar } from '/@/components/Scrollbar';
  import emptyImage from '/@/assets/images/pic_nodata.png';
  import { ITxnButtonsGroup } from './schema';
  import { E_TXN_MODULE, E_PRODUCT_MODALITY } from '../../../enums';

  const Event = getPageEvent();

  const props = defineProps<{
    widget: ITxnButtonsGroup;
  }>();

  const { txnModule, executeType, productModality, refSearchForm, refSearchField, disabled } =
    reactive(props.widget.props);

  const refSearchData = toRef(() => {
    const data: any = {};
    const [productId, mainId, txnId] = refSearchField ?? [];
    data['productId'] = formMap.value?.[refSearchForm]?.[productId];
    // 生产：工序；检验：检验类型（事务）；放行：放行类型（事务）
    data['mainId'] = formMap.value?.[refSearchForm]?.[mainId];
    // txnId：批次lotId；snId；生产标识id
    data['txnId'] = formMap.value?.[refSearchForm]?.[txnId];
    return data;
  });

  const txnList = ref<
    Array<{
      id: string;
      name: string;
      type: string;
      code: string;
      procDefId: string;
      txnDefinitionId: string;
      txnModule?: string;
      txnLabelId?: string;
      totalCount: number;
      loading: boolean;
      [key: string]: any;
    }>
  >([]);

  function getTxnMainInfo() {
    switch (txnModule) {
      case E_TXN_MODULE.PRODUCTION:
        return {
          productId: refSearchData.value.productId,
          routingOperationId: refSearchData.value.mainId,
          containerId:
            productModality === E_PRODUCT_MODALITY.CONTAINER
              ? refSearchData.value.txnId
              : undefined,
          snId: productModality === E_PRODUCT_MODALITY.SN ? refSearchData.value.txnId : undefined,
          // 生产：作业类型提交时用executeType字段，列表查询时用type字段
          type: executeType,
          productionType: executeType,
        };
      case E_TXN_MODULE.INSPECTION:
        return {
          productId: refSearchData.value.productId,
          // 检验：提交用executionTxnId，列表查询时用inspectionListId字段
          executionTxnId: refSearchData.value.mainId,
          inspectionListId: refSearchData.value.mainId,
          productionIdentificationId: refSearchData.value.txnId,
          // inspectionNumber: undefined,
        };
      case E_TXN_MODULE.RELEASE:
        return {
          productId: refSearchData.value.productId,
          releaseId: refSearchData.value.mainId,
        };
      default:
        return {
          productId: refSearchData.value.productId,
        };
    }
  }

  async function loadTxnData() {
    if (!refSearchData.value?.txnId) return;

    const queryData = {
      ...getTxnMainInfo(),
      txnModule,
      showTotalCount: true,
      showNoTxnLabelId: true,
    };

    await Event.runEventByName('beforeSearch', props.widget.events, queryData);

    const data = await Event.context.$customBizService.get(
      {
        key: 'em_txn_definition',
        action: 'biz_txn_def_list_search',
      },
      {
        ...queryData,
      },
    );
    txnList.value = data.map((item) => {
      return {
        ...item,
        id: item.id,
        name: item.name,
        type: item.type,
        code: item.code,
        procDefId: item.procDefId,
        txnDefinitionId: item.id,
        totalCount: item?.totalCount || 0,
        loading: false,
      };
    });
    await Event.runEventByName('afterSearch', props.widget.events, data);
  }

  async function handleTxn(data) {
    if (disabled) return;

    const postData = {
      ...getTxnMainInfo(),
      effective: false,
      txnDefinitionId: data.id,
      procDefId: data.procDefId,
    };
    await Event.runEventByName('beforeClick', props.widget.events, postData, data);
    try {
      data.loading = true;
      const res = await Event.context.$customBizService.post(
        {
          key: 'em_txn_inst',
          action: 'biz_inst_submit',
        },
        {
          ...postData,
        },
      );
      await Event.runEventByName('afterClick', props.widget.events, res, data);
    } catch (error) {
      console.log(error);
    }
    data.loading = false;
  }

  defineExpose({
    reload: loadTxnData,
    reset: () => {
      txnList.value = [];
    },

    setData: (param: Array<any>) => {
      txnList.value = param;
    },

    getData: () => txnList.value,

    setExtraQuery: (param: Record<string, any>) => {
      // 支持页面传入自定义参数
      console.log('setExtraQuery: ', param);
    },
  });
</script>

<style lang="less" scoped>
  .txn-buttons-group {
    &_item {
      margin-bottom: 8px;
      background-color: #026ac80f;
      border: 1px solid #026ac833;
      font-size: 14px;
      display: flex;
      justify-items: space-between;
      align-items: center;
      gap: 12px;

      &-name {
        flex: 1;
        flex-shrink: 0;
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &-count {
        max-width: 48px;
        color: #8b8b8b;
        font-size: 12px;
      }

      &:hover {
        background-color: var(--ant-primary-color);
        border: 1px solid var(--ant-primary-color);
        color: #ffffff;
        .txn-buttons-group_item-count {
          color: #ffffff;
        }
      }
    }
  }
</style>
