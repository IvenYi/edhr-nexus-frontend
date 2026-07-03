<template>
  <SectionCard
    :class="['my-transaction']"
    title="我的事务"
    :empty="isEmpty"
    :loading="loading"
    :disabledPullRefresh="true"
  >
    <div class="w-full h-full">
      <ButtonRadio class="w-full h-36px" :options="options" v-model:value="active" />
      <div class="h-[calc(100%_-_36px)]">
        <PullList :key="active" :loadApi="loadApi">
          <template #item="{ item }">
            <ListItem
              :title="item.title"
              :subTitle="item.subtitle"
              :status="item.status"
              :statusColor="item.statusColor"
              :statusBgColor="item.statusBgColor"
              :statusBorderColor="item.statusBorderColor"
              @click="() => onClick(item)"
            />
          </template>
        </PullList>
      </div>
    </div>
  </SectionCard>
</template>

<script lang="ts" setup name="my-transaction">
  import { i18n } from '@mobile/locales/setupI18n';
  import SectionCard from '../layout/section-card.vue';
  import { computed, reactive } from 'vue';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey as postGeneral } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getTranslateValue } from '@mobile/utils/translate';
  import { handlePadTxn } from '../../txn/txn-handler.ts';

  import PullList from '../layout/pull-list.vue';
  import ListItem from '../layout/list-item.vue';
  import { ButtonRadio } from '@gct/nocode-mobile-render';

  const options = [
    { label: '批次事务', value: 0 },
    { label: 'SN事务', value: 1 },
  ];

  const { t } = i18n.global;

  const active = ref(0);
  const loading = ref(false);
  const isEmpty = ref(false);
  const statusColorMap = {
    running: '#247BFF',
    waiting: '#F1AD47',
  };
  const statusBgColorMap = {
    running: 'rgba(44,143,255,0.08)',
    waiting: 'rgba(241,173,71,0.08)',
  };
  const statusBorderColorMap = {
    running: 'rgba(44,143,255,0.5)',
    waiting: 'rgba(241,173,71,0.5)',
  };

  const loadApi = async (params: { currentPage: number }) => {
    const typeKey = active.value === 0 ? 'container_is_not_null_' : 'sn_is_not_null_';
    const materialNoKey = active.value === 0 ? 'container_id_' : 'sn_id_';
    const res = await postGeneral(
      {
        modelCategory: 'entity',
        modelKey: 'em_txn_inst',
        bsKey: 'biz_txn_inst_list_search',
      },
      {
        query: {
          effective_: true,
          needPermission: true,
          [typeKey]: true,
          status_list_: ['waiting', 'running'],
        },
        exp: '',
        pageNo: params.currentPage,
        pageSize: 20,
        foreignFields: [],
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
      } as any,
    );
    const data = (res?.data ?? []).map((i) => {
      const _data = { data: i, dict: res.dict };
      const productName = getTranslateValue(_data, 'product_id_');
      const txnName = getTranslateValue(_data, 'txn_definition_id_');
      const txnNo = i.txn_no_;
      const materialNo = getTranslateValue(_data, materialNoKey);
      const statusName = getTranslateValue(_data, 'status_');
      return {
        id: i.id_,
        title: `${materialNo} / ${productName}`,
        subtitle: `${txnName}：${txnNo}`,
        status: statusName,
        statusColor: statusColorMap[i.status_],
        statusBgColor: statusBgColorMap[i.status_],
        statusBorderColor: statusBorderColorMap[i.status_],
        onlineFormInstId: i.current_task_type_ === 'form_node' ? i.online_form_inst_id_ : undefined,
      };
    });

    console.log('res', res);
    return {
      data: data,
      totalPage: res.totalPage,
    };
  };

  const onClick = (item) => {
    console.log('item', item);
    handlePadTxn(item);
  };
</script>

<style lang="less" scoped>
  .my-transaction {
    :deep(.van-tabs) {
      --van-tabs-bottom-bar-width: 80px;
      --van-tab-font-size: 16px;
      --van-tabs-line-height: 38px;
      --van-tab-active-text-color: #026ac8;
      --van-tab-text-color: #5a5f6b;
      .van-tabs__nav--line.van-tabs__nav--shrink,
      .van-tabs__nav--line.van-tabs__nav--complete {
        padding-left: 0;
      }
      .van-tabs__content {
        height: calc(100% - 38px);
        .van-tab__panel {
          height: 100%;
        }
      }
    }
  }
</style>
