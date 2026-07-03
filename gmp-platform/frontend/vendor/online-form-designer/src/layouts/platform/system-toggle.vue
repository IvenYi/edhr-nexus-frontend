<template>
  <div class="platform-toggle relative" ref="SystemToggleRef" v-if="navList.length > 0">
    <a-popover
      trigger="click"
      v-model:visible="popoverVisible"
      overlay-class-name="platform-toggle__overlay popover-overlay"
    >
      <a-tooltip
        placement="bottom"
        v-model:visible="tooltipVisible"
        :overlay-class-name="popoverVisible ? 'important-display-[none]' : ''"
      >
        <template #title>
          <span>{{ $t('sys.systemSwitch') }}</span>
        </template>
        <div class="icon-wrapper">
          <i class="iconfont icon-qiehuan1"></i>
        </div>
      </a-tooltip>
      <template #content>
        <ul>
          <li
            v-for="item in navList"
            :key="item.url"
            :class="{
              selected: item.active,
            }"
            @click="handleToggle(item as any)"
          >
            <img class="h-20px w-20px mr-8px" :src="item.icon" alt="" srcset="" />
            <span>{{ item.name }}</span>
            <div class="ml-[auto] pl-8px" v-if="item.active">
              <check-outlined class="text-14px" />
            </div>
          </li>
        </ul>
      </template>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';
  // import { useEnv } from '/@/hooks/develop/useEnv';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import SysToggleBackendSvg from '/@/assets/platform/sys-toggle-backend.svg';
  import SysToggleDeveloperSvg from '/@/assets/platform/sys-toggle-developer.svg';
  import SysTogglePortalSvg from '/@/assets/platform/sys-toggle-portal.svg';
  import SysToggleTenantSvg from '/@/assets/platform/sys-toggle-tenant.svg';

  const userStore = useUserStore();
  const { t } = useI18n();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const popoverVisible = ref<boolean>(false);
  const tooltipVisible = ref<boolean>(false);
  const SystemToggleRef = ref();

  // 后台管理权限
  const managementAccess = computed(() => {
    const { globalSuperAdmin, platformManager } = userStore.getUserInfo || {};
    return globalSuperAdmin || platformManager;
  });
  /**租户列表不为空 */
  const isTenant = computed(() => !!userStore.getUserInfo.tenantList?.length);
  const navList = computed(() => {
    if (!isTenant.value) return [];
    return [
      {
        name: t('sys.workbench'),
        url: `${location.origin}${import.meta.env.VITE_PATHNAME_PROTAL}#/home`,
        active: getCurrentProject === ProjectName.PORTAL,
        visible: true,
        icon: SysTogglePortalSvg,
      },
      {
        name: t('sys.developCenter'),
        url: `${location.origin}${import.meta.env.VITE_PATHNAME_DEVELOPER_CENTER}`,
        active: getCurrentProject === ProjectName.DEVELOPER_CENTER,
        visible:
          userStore.getTenantUserInfo?.tenantDeveloper ||
          userStore.getTenantUserInfo?.globalSuperAdmin,
        icon: SysToggleDeveloperSvg,
      },
      {
        name: t('sys.tenantBackendManage'),
        url: `${location.origin}${import.meta.env.VITE_PATHNAME_TENANT_CENTER}`,
        active: getCurrentProject === ProjectName.TENANT_CENTER,
        visible:
          userStore.getTenantUserInfo?.globalSuperAdmin ||
          userStore.getTenantUserInfo?.tenantManager ||
          userStore.getTenantUserInfo?.tenantSuperAdmin,
        icon: SysToggleTenantSvg,
      },
      {
        name: t('sys.enterpriseMgtBackend'),
        url: `${location.origin}${import.meta.env.VITE_PATHNAME_BACKEND_MANAGEMENT}`,
        active: getCurrentProject === ProjectName.BACKEND_MANAGEMENT,
        visible: managementAccess.value,
        icon: SysToggleBackendSvg,
      },
    ].filter((item) => item.visible && !item.active);
  });

  const handleToggle = ({ url }) => {
    popoverVisible.value = false;
    window.open(url, '_blank', 'noopener');
  };
</script>

<style lang="less">
  @import url('./style/icon-wrapper.less');
  @import url('./style/popover-overlay.less');

  .platform-toggle__overlay.popover-overlay {
    z-index: 9999;
    width: 218px;
    padding-top: 0 !important;

    ul {
      padding: 8px;

      li {
        display: flex;
        align-items: center;
        height: 36px;
        padding: 0 8px;
        transition: all 0.3s;
        border-radius: 4px;
        line-height: 36px;
        cursor: pointer;

        > span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &:not(.selected):hover {
          background-color: #e6e9ef;
          font-weight: 500;
        }

        &.selected {
          color: var(--ant-primary-color);
          font-weight: 500;
        }

        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
</style>
