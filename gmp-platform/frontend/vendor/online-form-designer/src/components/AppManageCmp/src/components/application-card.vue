<template>
  <div :class="`${prefixCls}-card-wrapper`">
    <div :class="clientType === 'Card' ? `${prefixCls}-card-area` : `${prefixCls}-table-area`">
      <ScrollContainer v-if="clientType === 'Card'">
        <div :class="`${prefixCls}-card`">
          <application-card-item
            v-for="cardItem of cardData"
            :key="cardItem.id"
            :data="cardItem"
            :filterButton="filterButton"
            :tabActiveKey="tabActiveKey"
            :appActiveKey="appActiveKey"
            :platformType="platformType"
            :prefixCls="prefixCls"
            @on-notify="handleNotify"
            :classifyType="classifyType"
          />
        </div>
      </ScrollContainer>
      <application-list
        v-else-if="clientType === 'List'"
        :tableData="cardData"
        :filterButton="filterButton"
        :tabActiveKey="tabActiveKey"
        :appActiveKey="appActiveKey"
        :platformType="PlatformEnum.PLATFORM_DEVELOPER_CENTER"
        :pagination="pagination"
        @on-notify="handleNotify"
      />
      <slot name="pageMore"></slot>
      <a-empty v-if="!cardData.length" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
    <!-- <div :class="`${prefixCls}-table-area`" v-else-if="clientType === 'List'">
      <application-list
        :tableData="cardData"
        :filterButton="filterButton"
        :tabActiveKey="tabActiveKey"
        :platformType="PlatformEnum.PLATFORM_DEVELOPER_CENTER"
        :pagination="pagination"
        @on-notify="handleNotify"
      />
    </div> -->
    <application-detail
      ref="detailPageRef"
      :tenantId="tenantId"
      :platformType="platformType"
      :isOnlyBI="isOnlyBI"
      @reload="handleNotify"
    />
    <app-rest-modal @register="register" @ok="handleModalOk" />
  </div>
</template>
<script setup lang="ts" name="application-card">
  import { ref } from 'vue';
  import { message, Empty } from 'ant-design-vue';
  import ApplicationCardItem from './application-card-item.vue';
  import ApplicationDetail from './detail/application-detail.vue';
  import { AppTabsMenuEnum, PlatformEnum, AppClassifyEnum } from '../constant/interface';
  import AppRestModal from './modal/app-rest-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { putAppAppRestoreByIdByUserId } from '/@/apis/gct-platform/AppController';
  import ApplicationList from './application-list.vue';
  import { ScrollContainer } from '/@/components/Container';
  import type { IButtonProps } from '../types/index.d';
  import type { AppResponse } from '/@/apis/gct-platform/model/index';

  interface Props {
    prefixCls: string;
    cardData: Array<AppResponse>;
    filterButton?: IButtonProps[];
    tenantId: string;
    tabActiveKey: AppTabsMenuEnum;
    appActiveKey: AppClassifyEnum;
    platformType: PlatformEnum;
    clientType: 'Card' | 'List';
    pagination: any;
    isOnlyBI?: boolean; // 只开放了BI看板权限，没有个人中心和工作台
    classifyType: string;
  }

  const { t } = useI18n();

  defineProps<Props>();

  const emit = defineEmits(['on-request-data', 'on-request-total']);

  const [register, { openModal }] = useModal();

  const detailPageRef = ref();

  const handleNotify = (param) => {
    if (param.key === 'open-detail') {
      detailPageRef.value.onOpen(param.pid, param.isHideEditBtn, param.isHideDesignBtn);
    } else if (param.key === 'open-rest-modal') {
      openModal(true, { pid: param.pid });
    } else if (param.key === 'request-data') {
      // 请求数据回调
      emit('on-request-data');
      // 是否需要刷新total
      if (param.isRequestTotal) {
        emit('on-request-total');
      }
    }
  };

  const handleModalOk = async (info) => {
    await putAppAppRestoreByIdByUserId({
      id: info.appId,
      userId: info.userId,
    });
    message.success(t('sys.developer.appCenter.restSuccess'));
    handleNotify({ key: 'request-data', isRequestTotal: true });
  };
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-card-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .@{prefix-cls}-card-area {
    height: 100%;
    // overflow: auto;
  }

  .@{prefix-cls}-table-area {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .@{prefix-cls}-card {
    display: grid;
    grid-gap: 24px;
    grid-template-columns: repeat(auto-fill, minmax(365px, 1fr));
    padding: 8px 20px 20px;
  }
</style>
