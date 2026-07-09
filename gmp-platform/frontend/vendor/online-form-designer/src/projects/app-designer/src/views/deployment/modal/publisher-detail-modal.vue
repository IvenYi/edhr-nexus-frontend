<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.appDesigner.releaseDetails')"
    centered
    width="640px"
    :footer="null"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-row :gutter="24">
      <a-col :span="12"
        >{{ t('sys.appDesigner.executionVersion') }}: {{ deployDetail.appVersionTag }}</a-col
      >
      <a-col :span="12"
        >{{ t('sys.status') }}：<a-tag :color="colorMap.get(deployDetail.state)">{{
          deployState(deployDetail.state)
        }}</a-tag></a-col
      >
    </a-row>
    <a-row :gutter="24" class="row">
      <a-col :span="12"
        >{{ t('sys.appDesigner.publisher') }}：{{ deployDetail.createUserName }}</a-col
      >
      <a-col :span="12"
        >{{ t('sys.appDesigner.releaseTime') }}：{{ deployDetail.createTime }}</a-col
      >
    </a-row>
    <div>
      {{ t('sys.appDesigner.publishContent') }}:
      <span class="content">{{ deployDetail.content }}</span></div
    >
    <div class="tab">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('sys.appDesigner.problem')">
          <div class="problem">
            <template v-for="item in deployDetail.problemList" :key="item.id">
              <div class="error">
                <div class="icon"><i class="iconfont icon-cuowu"></i></div>
                <div class="err-content">{{ item }}</div>
              </div>
            </template>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.appDesigner.log')">
          <div class="log">
            <template v-for="item in deployDetail.stepList" :key="item.id">
              <div class="log-detail">
                <div class="time">{{ `[${item.createTime}]` }}</div>
                <div class="log-content">{{ item.content }}</div>
              </div>
            </template>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { StateEnum, TableDataType } from '../types/type';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { colorMap, deployState } from '../constant/publish';
  import { getAppReleaseInfo } from '/@/apis/gct-apaas/AppReleaseController';
  import { AppReleaseResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const activeKey = ref('1');
  const deployDetail = ref<TableDataType>({
    appVersionTag: '',
    state: StateEnum.SUCCESS,
    createTime: '',
    createUserName: '',
    content: '',
    stepList: null,
    problemList: null,
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = (data) => {
    const { appVersionTag, state, createTime, createUserName, content } = data;
    deployDetail.value.appVersionTag = appVersionTag;
    deployDetail.value.state = state;
    deployDetail.value.content = content;
    deployDetail.value.createTime = createTime;
    deployDetail.value.createUserName = createUserName;
    activeKey.value = '1';
    formatDetail(data.id);
  };

  const formatDetail = async (id: string) => {
    const appInfo: AppReleaseResponse = (await getAppReleaseInfo({ id })) || {};
    const { stepList, problemList } = appInfo;
    if (stepList && stepList.length > 0) {
      deployDetail.value.stepList = stepList.map((item) => {
        return {
          createTime: item.createTime || '',
          content: item.content || '',
        };
      });
    }
    if (problemList && problemList.length > 0) {
      deployDetail.value.problemList = problemList.map((item) => {
        return item.content || '';
      });
    }
  };

  const handleClose = () => {
    closeModal();
  };

  const handleOk = () => {
    closeModal();
  };
</script>

<style lang="less" scoped>
  .row {
    margin: 10px 0;
  }
  .content {
    width: 100%;
    height: 90px;
    text-overflow: ellipsis;
    color: #999;
    overflow: hidden;
    // display: -webkit-box;
    -webkit-box-orient: vertical;
    word-break: break-all;
    -webkit-line-clamp: 4;
  }
  .tab {
    :deep(.ant-tabs-content) {
      min-height: 200px !important;
    }
    .log {
      width: 100%;
      overflow: auto;
      .log-detail {
        display: flex;
        align-items: center;
        .time {
          margin-right: 12px;
        }
        .log-content {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }
      }
    }
    .problem {
      width: 100%;
      .error {
        display: flex;
        align-items: center;
      }
    }
  }
</style>
