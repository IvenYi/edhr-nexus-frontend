<template>
  <SectionCard
    :class="['my-audit']"
    title="我的审核"
    :empty="isEmpty"
    :loading="loading"
    :disabledPullRefresh="true"
  >
    <div class="w-full h-full">
      <ButtonRadio class="w-full h-36px" :options="options" v-model:value="active" />
      <div class="h-[calc(100%_-_36px)]">
        <PullList ref="PullListRef" v-if="active === 0" :loadApi="loadTodoList">
          <template #item="{ item }">
            <ListItem :title="item.title" :subTitle="item.subtitle" @click="() => onClick(item)" />
          </template>
        </PullList>
        <PullList ref="PullListRef2" v-else :loadApi="loadInitiatedList">
          <template #item="{ item }">
            <ListItem :title="item.title" :subTitle="item.subtitle" @click="() => onClick(item)" />
          </template>
        </PullList>
      </div>
    </div>
  </SectionCard>
</template>

<script lang="ts" setup name="my-audit">
  import { i18n } from '@mobile/locales/setupI18n';
  import SectionCard from '../layout/section-card.vue';
  import { computed, reactive } from 'vue';
  import { getProcessTaskTodoPageList } from '/@/apis/gct-apaas/ProcessTaskTodoController';
  import { getProcessTaskDonePageList } from '/@/apis/gct-apaas/ProcessTaskDoneController';
  import { getTranslateValue } from '@mobile/utils/translate';
  import PullList from '../layout/pull-list.vue';
  import ListItem from '../layout/list-item.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import {
    MobileEdhrFillModal,
    MobileSingleFormFillModal,
    ButtonRadio,
  } from '@gct/nocode-mobile-render';
  import { MaterialStatusEnum } from '@mobile/views/edhr/biz/audit/enums';

  const options = [
    { label: '我的待办', value: 0 },
    { label: '我的已办', value: 1 },
  ];

  const { t } = i18n.global;

  const active = ref(0);
  const loading = ref(false);
  const isEmpty = ref(false);
  const PullListRef = ref();
  const PullListRef2 = ref();

  const loadTodoList = async (params: { currentPage: number }) => {
    const res = await getProcessTaskTodoPageList({
      pageNo: params.currentPage,
      pageSize: 20,
      notEdhr: 1, // 只查询非DHR表单
    });

    const data = (res?.data ?? []).map((i) => {
      return {
        id: i.id,
        title: `${i.serialNo}${i.title ? `：${i.title}` : ''}`,
        subtitle: `${i.ofTmplName}${i.ofCode ? ` / ${i.ofCode}` : ''}`,
        ofInstanceId: i.ofInstanceId,
        materialNo: i.materialNo,
        docOutlineId: i.docOutlineId,
        materialStatus: i.materialStatus,
        edhrInstanceId: i.edhrInstanceId,
      };
    });
    return {
      data: data,
      totalPage: res.totalPage,
    };
  };

  const loadInitiatedList = async (params: { currentPage: number }) => {
    const res = await getProcessTaskDonePageList({
      pageNo: params.currentPage,
      pageSize: 20,
      notEdhr: 1, // 只查询非DHR表单
    });

    const data = (res?.data ?? []).map((i) => {
      return {
        id: i.id,
        title: `${i.serialNo}${i.title ? `：${i.title}` : ''}`,
        subtitle: `${i.ofTmplName}${i.ofCode ? `：${i.ofCode}` : ''}`,
        ofInstanceId: i.ofInstanceId,
        materialNo: i.materialNo,
        docOutlineId: i.docOutlineId,
        materialStatus: i.materialStatus,
        edhrInstanceId: i.edhrInstanceId,
      };
    });
    return {
      data: data,
      totalPage: res.totalPage,
    };
  };

  const onClick = (record: any) => {
    if (record.edhrInstanceId && record.materialStatus !== MaterialStatusEnum.PRODUCT_RELEASE) {
      GctPopup.open(MobileEdhrFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          materialNo: record.materialNo,
          ofTmplId: record.docOutlineId,
          ofInstanceId: record.ofInstanceId,
          viewPageLimit: false,
          isViewPage: false,
          needAutoSave: false,
          pageType: 'document-task-audit',
        },
        onOk: async (payload: { instId: string }, done: Function) => {
          if (payload?.type !== 'Cancel') {
            onRefresh();
          }
        },
      });
    } else {
      GctPopup.open(MobileSingleFormFillModal, {
        popupProps: {
          position: 'center',
        },
        context: {
          selfId: record.ofInstanceId,
          isViewPage: false,
          needAutoSave: false,
        },
        onOk: async (payload: { instId: string }, done: Function) => {
          if (payload?.type !== 'Cancel') {
            onRefresh();
          }
        },
      });
    }
  };

  const onRefresh = () => {
    PullListRef.value?.refresh();
    PullListRef2.value?.refresh();
  };
</script>

<style lang="less" scoped>
  .my-audit {
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
