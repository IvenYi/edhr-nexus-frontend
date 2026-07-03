<template>
  <basic-page>
    <div class="pt16px h100% flex flex-col">
      <LicenseAlert v-if="expireMsg && expireMsg.length" @close="close" :message="expireMsg" />
      <a-tabs v-model:activeKey="activeKey" :destroyInactiveTabPane="true" @change="changeTab">
        <a-tab-pane key="platform" :tab="t('sys.menu.platformAuthorization')">
          <div class="px24px">
            <LicenseTable type="platform" @reloadMsg="getExpireMsg" />
          </div>
        </a-tab-pane>
        <a-tab-pane key="__MODULE__" :tab="t('sys.license.moduleLisence')">
          <ModuleLisence @reloadMsg="getExpireMsg" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import LicenseTable from './components/activate-table.vue';
  import LicenseAlert from './components/license-alert.vue';
  import ModuleLisence from './components/module-license.vue';
  import { LicenseExpireMsg } from '/@/apis/gct-platform/model';
  import { getLicenseGetExpireMsg } from '/@/apis/gct-platform/LicenseController';
  import { getSeatMessageCloseById } from '/@/apis/gct-platform/SeatMessageController';

  const { t } = useI18n();

  const activeKey = ref('platform');

  const expireMsg = ref<LicenseExpireMsg[]>();

  /** 获取警告信息 */
  const getExpireMsg = async () => {
    // expireMsg.value = [];
    const res1 = await getLicenseGetExpireMsg({
      appId: 'platform',
    });
    const res2 = await getLicenseGetExpireMsg({
      appId: '__MODULE__',
    });

    expireMsg.value = [...res1, ...res2];
  };

  /** 警告关闭 */
  function close(id) {
    getSeatMessageCloseById({ id }).then(() => {
      getExpireMsg();
    });
  }

  const changeTab = () => {
    // expireMsg.value = [];
  };
</script>
<style lang="less" scoped>
  .platform-activate-header {
    padding: 24px;
    border-bottom: 1px solid #e0e3ea;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0;
  }

  :deep(.ant-tabs-content) {
    height: 100%;
  }
  :deep(.ant-tabs-nav) {
    padding-left: 24px;
  }
  :deep(.basic-page__body) {
    background: #f2f5f8;
  }
  :deep(.ant-tabs) {
    background-color: #fff;

    flex: 1;
  }
</style>
