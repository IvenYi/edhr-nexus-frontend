<template>
  <div class="platform-user-dropdown relative" ref="UserDropdownRef">
    <a-dropdown
      v-model:visible="parentVisible"
      trigger="click"
      overlay-class-name="platform-user-dropdown__overlay"
      :get-popup-container="() => UserDropdownRef"
    >
      <div class="flex items-center cursor-pointer">
        <platform-user-info class="mr-12px" :parentVisible="parentVisible" />
        <div
          class="flex justify-center items-center w-8 h-8 rounded text-32px transition-all-200"
          :class="
            isHorizontal
              ? 'color-[#202427] hover:bg-[#f1f6f8]'
              : 'color-[#fff] hover:bg-[#ffffff16]'
          "
        >
          <i class="iconfont icon-gengduo1 transition-all-200"></i>
        </div>
      </div>

      <template #overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="user-center">
            <div class="flex items-center">
              <i class="iconfont icon-shezhi1 mr-4px"></i>
              <span>{{ t('sys.menu.personalSetting') }}</span>
            </div>
          </a-menu-item>
          <a-sub-menu
            class="mt-10px"
            popup-class-name="platform-user-dropdown__tenant-popup"
            v-if="renderToggleTenant"
            key="tenant"
          >
            <template #title>
              <div class="flex items-center">
                <i class="iconfont icon-qiehuan mr-4px"></i>
                <span>切换租户</span>
              </div>
            </template>
            <a-menu-item
              v-for="item in getUserTenantList"
              :key="item.id"
              @click="handleTenantClick(item.id)"
              :class="{
                'current-tenant': item.id === userStore.getTenant,
              }"
            >
              <span>{{ item.name }}</span>
              <div class="ml-[auto] pl-8px">
                <check-outlined class="text-14px" />
              </div>
            </a-menu-item>
            <div class="empty-box" v-if="!getUserTenantList.length">
              <a-empty :image="simpleImage" :description="t('sys.ipaas.noData')" />
            </div>
          </a-sub-menu>
          <a-menu-divider class="mt-10px mb-10px" />
          <a-menu-item key="logout">
            <div class="flex items-center">
              <i class="iconfont icon-tuichu mr-4px"></i>
              <span>{{ t('sys.dropdownItemLoginOut') }}</span>
            </div>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>
<script lang="ts" setup>
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';
  import { computed, inject, ref } from 'vue';
  import { Empty } from 'ant-design-vue';

  import { useUserStore } from '/@/store/modules/user';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ProjectName } from '@/enums/appEnum';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useGo } from '/@/hooks/web/usePage';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import PlatformUserInfo from './platform-user-info.vue';
  import { postSignLog } from '/@/apis/gct-platform/SignLogController';
  import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';
  import { getLoginLogTenantLog } from "/@/apis/gct-platform/LoginLogController";

  type MenuEvent = 'user-center' | 'logout';

  // const { prefixCls } = useDesign('header-user-dropdown');
  const { t } = useI18n();
  const userStore = useUserStore();
  const { getCurrentProject } = usePermissionStore();
  const go = useGo();
  const { isTestEnv, getEnv, isSandbox } = useEnv();

  // header background 水平浅色，其它深色
  const isHorizontal = inject('isHorizontal') as boolean;

  const UserDropdownRef = ref();
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const parentVisible = ref(false);

  const renderToggleTenant = computed(() => {
    return (
      [
        ProjectName.PORTAL,
        ProjectName.DEVELOPER_CENTER,
        ProjectName.TENANT_CENTER,
        // ProjectName.BACKEND_MANAGEMENT,
      ].includes(getCurrentProject as ProjectName) && !isTestEnv.value
    );
  });

  //  login out
  function handleLoginOut() {
    userStore.confirmLoginOut();
  }

  const getUserTenantList = computed(() => {
    const tenantList = userStore.getTenantList || [];
    return tenantList;
  });

  const handleTenantClick = async (id) => {
    // 登录日志切换租户
    // const env = getEnv();
    // const fingerprint = await getBrowserFingerprint();

    // const data = {
    //   changeTenant: true,
    //   tenantIn: userStore.tenantId,
    //   tenantOut: id,
    //   env,
    //   browser: fingerprint,
    // };
    // await postSignLog(data);
    if (id === userStore.tenantId) return;
    await getLoginLogTenantLog({ tenantId: id });
    await userStore.setTenant(id);
  };

  const openWindow = (url: string) => {
    window.location.href = url;
  };

  function handleMenuClick(e: MenuInfo) {
    switch (e.key as MenuEvent) {
      case 'user-center':
        if (isSandbox) {
          go(PageEnum.USER_CENTER_LOGIN);
        } else if (userStore.getUserInfo?.globalSuperAdmin) {
          go(PageEnum.USER_CENTER_PWD);
        } else {
          go(PageEnum.USER_CENTER);
        }
        // if (getCurrentProject === ProjectName.PORTAL) {
        // } else {
        //   openWindow(
        //     `${location.origin}${import.meta.env.VITE_PATHNAME_PROTAL}#${PageEnum.USER_CENTER}`,
        //   );
        // }
        break;
      case 'logout':
        handleLoginOut();
        break;
    }
  }
</script>

<style lang="less">
  .platform-user-dropdown__overlay {
    // width: 100%;
    padding-top: 9px !important;

    ul {
      padding: 8px;
      border: 1px solid #e8ebf0;
      border-radius: 4px;

      li.ant-dropdown-menu-item,
      li.ant-dropdown-menu-submenu .ant-dropdown-menu-submenu-title {
        display: flex;
        align-items: center;
        height: 36px;
        padding: 0 8px;
        border-radius: 4px;

        &:hover {
          background-color: #e6e9ef;
          color: #212528;
          font-weight: 500;
        }
      }

      li .ant-dropdown-menu-submenu-arrow {
        display: none;
      }
    }
  }

  .platform-user-dropdown__tenant-popup {
    padding-right: 4px;

    ul {
      max-height: 480px;
      overflow-y: auto;
    }

    li {
      width: 160px;

      .ant-dropdown-menu-title-content {
        display: flex;
        align-items: center;
        width: 100%;

        > span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &.current-tenant {
        background-color: transparent !important;
        color: var(--ant-primary-color) !important;
        font-weight: 500 !important;
      }

      &:not(.current-tenant) .anticon {
        display: none;
      }
    }

    li:not(:first-child) {
      margin-top: 10px;
    }
  }

  .empty-box {
    width: 160px;

    .ant-empty-normal {
      margin: 16px 0 0;
    }
  }
</style>
