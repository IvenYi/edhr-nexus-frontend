<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('发布详情')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :footer="null"
  >
    <a-descriptions :column="2">
      <a-descriptions-item v-if="appEnv === 'test'" label="提交标识">{{
        formState.commitTag
      }}</a-descriptions-item>
      <a-descriptions-item v-else-if="appEnv === 'prod'" label="发行标识">{{
        formState.releaseTag
      }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{
        formState.state ? t('sys.app.publish.' + formState.state) : ''
      }}</a-descriptions-item>
      <a-descriptions-item label="发布人">{{ formState.createUserName }}</a-descriptions-item>
      <a-descriptions-item label="发布时间">{{ formState.createTime }}</a-descriptions-item>
      <a-descriptions-item label="发布内容" :span="2">
        {{ formState.description }}
      </a-descriptions-item>
    </a-descriptions>
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane :key="TabEnum.Problem" :tab="t('sys.appDesigner.problem')">
        <div class="flex items-center" v-for="p in formState.problemList" :key="p.id">
          <i
            class="iconfont icon-cuowu1 mr-5px error-gct"
            :style="{
              lineHeight: '1em',
            }"
          ></i>
          {{ p.description }}
        </div>
      </a-tab-pane>
      <a-tab-pane :key="TabEnum.log" :tab="t('sys.appDesigner.log')">
        <div v-for="l in formState.stepList" :key="l.id">
          <span class="mr-5px">[{{ l.createTime }}]</span>
          {{ l.description }}
        </div>
      </a-tab-pane>
    </a-tabs>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPublishLogInfo } from '/@/apis/gct-apaas/PublishLogController';
  import type { PublishLogResponse } from '/@/apis/gct-apaas/model';

  enum TabEnum {
    Problem,
    log,
  }

  type AppEnv = 'test' | 'prod';

  const { t } = useI18n();
  const [registerInner] = useModalInner(
    (data: { env: AppEnv; response: PublishLogResponse; payload: any }) => {
      if (!data) return;
      const { env, payload, response } = data;
      appEnv.value = env;

      if (response) {
        formState.value = response;
      } else {
        getPublishLogInfo({
          id: payload.id,
        }).then((res) => {
          formState.value = res ?? {};
        });
      }
    },
  );

  const activeTab = ref<TabEnum>(TabEnum.Problem);
  const formState = ref<PublishLogResponse>({});
  const appEnv = ref<AppEnv>('test');

  const handleClose = () => {
    formState.value = {};
  };
</script>

<style lang="less" scoped>
  .ant-tabs :deep(.ant-tabs-content) {
    min-height: 100px;
  }
</style>
