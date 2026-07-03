<template>
  <basic-page>
    <div class="h-full flex flex-col">
      <div class="detail-page__header">
        <a-button @click="router.back" type="primary" ghost size="small">{{
          t('sys.back')
        }}</a-button>
      </div>
      <div class="detail-page__info">
        <app-header :app-info="appInfo" />
      </div>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane :key="TabEnum.Deployment" tab="发布记录">
          <prod-app-deployment-log env="prod" :app-id="appId" @revert-success="onRevertSuccess" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import ProdAppDeploymentLog from './prod-app-deployment-log.vue';
  import type { PublishedAppDtoResponse } from '/@/apis/gct-platform/model';
  import { getReleasedAppPublishedAppGetById } from '/@/apis/gct-platform/PublishedAppController';
  import AppHeader from '../components/app-header.vue';

  enum TabEnum {
    Deployment,
  }

  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const activeTab = ref<TabEnum>(TabEnum.Deployment);
  const appInfo = ref<PublishedAppDtoResponse>({});
  const id = route.params.id as string;
  const appId = route.params.appid as string;

  async function getAppInfo() {
    const res: any = await getReleasedAppPublishedAppGetById({ id });
    appInfo.value = res;
  }
  getAppInfo();

  // 版本回退成功回调
  const onRevertSuccess = () => {
    getAppInfo();
  };
</script>

<style lang="less" scoped>
  .detail-page {
    &__header {
      padding: 16px 20px;
      border-bottom: 1px solid #eaeaea;
      flex: none;
    }
    &__info {
      padding: 16px 20px 10px;
      flex: none;
    }
  }

  .ant-tabs {
    flex: 1;
    height: 100px;

    :deep(.ant-tabs-nav) {
      padding-left: 20px;
    }
    :deep(.ant-tabs-content) {
      overflow: auto;
      height: 100%;
      padding: 0 20px 20px;
    }
  }
</style>
