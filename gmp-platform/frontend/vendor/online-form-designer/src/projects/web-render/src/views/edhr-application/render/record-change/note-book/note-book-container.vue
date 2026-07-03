<template>
  <div class="notebook-container">
    <div class="notebook-area" v-if="recordBookId">
      <EbrWikiLayout :loading="loading" :has-data="hasData" showFullScreen>
        <template #ebr-left>
          <fill-left
            :doc-instance-list="docInstanceList"
            v-model:search-value="searchVal"
            v-model:select-self-info="selectSelfInfo"
            :support-edit="!usePermissionActions.archived2RecordBook"
          >
          </fill-left>
        </template>
        <template #ebr-right>
          <OnlineFormOperator
            ref="operatorRef"
            class="paas-si-form-builder-container"
            style="flex: 1; overflow: hidden; height: 100%"
            :selfId="selectSelfInfo?.id"
            :in-drawer="false"
            keep
            :isViewPage="useIsViewPage.isViewPage"
            :btnNotForceReadOnly="useIsViewPage.btnNotForceReadOnly"
            :paramExtraProps="paramExtraProps"
            :is-record-fill="true"
            @btn-click-callback="
              () => {
                updateInstanceCounter();
              }
            "
          />
        </template>
      </EbrWikiLayout>
    </div>

    <div class="notebook-empty-area" v-else>
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </div>
</template>

<script setup lang="ts" name="notebook-container">
  import { provide, computed, ref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EBR_PROVIDE_ENUM } from '/@online-form/views/integration/utils/enum';
  import FillLeft from '/@online-form/views/integration/apaas_ebr/record-book/fill/fill-left.vue';
  import { EbrWikiLayout } from '@gct/nocode-base';
  import { OnlineFormOperator } from '/@online-form/views/integration/apaas_si/index';
  import { useRecordBookFillFactory } from '/@online-form/views/integration/apaas_ebr/record-book/fill/hooks/useRecordBookFillFactory';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      /** 记录本id */
      recordBookId: string;
      /** 是否是查看页面 */
      isViewPage: boolean;
      /** 页面类型 */
      pageType?: string;
      /** 是否启用表单填报时间段限制 */
      isFillRangeOn: boolean;
      /** 是否启用填报截止时间限制 */
      isFillDeadlineOn: boolean;
      /** 填报截止时间限制提示信息 */
      fillDeadlineOnMsg: string;
      /** 组件传进来的参数 */
      paramExtraProps?: Record<string, any>;
    }>(),
    {
      isViewPage: false,
      pageType: 'record-change',
      isFillRangeOn: false,
      isFillDeadlineOn: false,
      fillDeadlineOnMsg: '',
    },
  );

  const {
    loading,
    hasData,
    searchVal,
    recordBookDetailInfo,
    recordBookFillConfig,
    docInstanceList,
    selectSelfInfo,
    useIsViewPage,
    usePermissionActions,
    updateInstanceCounter,
    updateRecordBookCounter,
  } = useRecordBookFillFactory(props);

  provide(EBR_PROVIDE_ENUM.EDHR_BUTTON_PERMISSION, usePermissionActions);
</script>

<style scoped lang="less">
  .notebook-container {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;

    .notebook-area {
      display: flex;
      flex-direction: column;
      position: relative;
      // padding: 16px 16px 16px 20px;
      background-color: #fff;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .notebook-empty-area {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      height: 100%;
    }
  }
</style>
