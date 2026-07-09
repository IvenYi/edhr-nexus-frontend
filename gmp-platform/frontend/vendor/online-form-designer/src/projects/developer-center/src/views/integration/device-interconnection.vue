<template>
  <basic-page>
    <div class="px24px py12px">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('sys.menu.deviceInterconnection')">
          <Device :userActions="userActions" />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('sys.appDesigner.printDesign.paramList')">
          <ParamsList :userActions="userActions" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page>
</template>
<script setup lang="ts">
  import { ref, reactive, onBeforeMount, computed, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Device from './components/deviceInterconnection/device.vue';
  import ParamsList from './components/deviceInterconnection/params-list.vue';
  import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';
  import { getPermissionByKey } from '/@/projects/web-render/src/utils/UserappPermissions';

  const props = defineProps<{
    permissionPageKey?: string;
  }>();

  const { t } = useI18n();

  const activeKey = ref('1');

  onBeforeMount(() => {
    getLicenseModuleAuth({ module: 'IOT' }).then((res) => {
      if (!res) {
        window.location.href = `${location.origin}${location.pathname}`;
      }
    });
  });

  const userActions = computed(() => {
    return {
      AddDevice: getPermission('AddDevice'),
      ImportDevice: getPermission('ImportDevice'),
      BatchExportDevice: getPermission('BatchExportDevice'),
      EditDevice: getPermission('EditDevice'),
      CopyDevice: getPermission('CopyDevice'),
      DeleteDevice: getPermission('DeleteDevice'),
      AddParams: getPermission('AddParams'),
      ImportParams: getPermission('ImportParams'),
      BatchExportParams: getPermission('BatchExportParams'),
      EditParams: getPermission('EditParams'),
      DeleteParams: getPermission('DeleteParams'),
    }
  })

  function getPermission(key) {
    if (!props.permissionPageKey) return true;
    return !!getPermissionByKey(props.permissionPageKey, key);
  }
</script>
<style lang="less" scoped>
  :deep(.basic-page__body) {
    background-image: url('/@/assets/images/device-bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100px;
    border-radius: 8px 8px 8px 8px;
    border: 1px solid #fff;
  }
</style>
