<template>
  <a-dropdown placement="bottomLeft" :overlayClassName="`${prefixCls}-dropdown-overlay`">
    <span :class="[prefixCls, `${prefixCls}--${theme}`]" class="flex">
      <img :class="`${prefixCls}__header`" :src="transformUrl(getUserInfo.avatar)" />
      <span :class="`${prefixCls}__info hidden md:block`">
        <span :class="`${prefixCls}__name  `" class="truncate">
          {{ getUserInfo.fullname }}
        </span>
      </span>
    </span>

    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item key="management">
          <span class="flex items-center">
            <desktop-outlined class="mr-1" />
            <span>{{ t('sys.backendManage') }}</span>
          </span>
        </a-menu-item>
        <a-menu-item key="devcenter">
          <span class="flex items-center">
            <user-outlined class="mr-1" />
            <span>{{ t('sys.developCenter') }}</span>
          </span>
        </a-menu-item>
        <a-menu-item key="password">
          <span class="flex items-center">
            <lock-outlined class="mr-1" />
            <span>{{ t('sys.changePassword') }}</span>
          </span>
        </a-menu-item>
        <a-menu-item key="logs">
          <span class="flex items-center">
            <deployment-unit-outlined class="mr-1" />
            <span>{{ t('sys.loginFoot') }}</span>
          </span>
        </a-menu-item>
        <a-menu-item key="mysetting">
          <span class="flex items-center">
            <setting-outlined class="mr-1" />
            <span>{{ t('sys.mySettings') }}</span>
          </span>
        </a-menu-item>
        <a-menu-item key="logout">
          <span class="flex items-center">
            <poweroff-outlined class="mr-1" />
            <span>{{ t('sys.dropdownItemLoginOut') }}</span>
          </span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <password-modal @register="register1" />
  <login-history-modal @register="register2" />
  <user-settings-modal @register="register3" />
</template>
<script lang="ts" setup>
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';
  import {
    DesktopOutlined,
    UserOutlined,
    PoweroffOutlined,
    SettingOutlined,
    DeploymentUnitOutlined,
    LockOutlined,
  } from '@ant-design/icons-vue';
  import { computed } from 'vue';

  import { useUserStore } from '/@/store/modules/user';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import PasswordModal from '/@portal/views/user/password/password-modal.vue';
  import LoginHistoryModal from '/@portal/views/user/login-history/login-history-modal.vue';
  import UserSettingsModal from '/@portal/views/user/user-settings/user-settings-modal.vue';
  import headerImg from '/@/assets/images/header.jpg';
  import { openWindow } from '/@/utils';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';

  type MenuEvent = 'management' | 'devcenter' | 'password' | 'logs' | 'mysetting' | 'logout';

  const { prefixCls } = useDesign('header-user-dropdown');
  const { t } = useI18n();
  const userStore = useUserStore();

  const getUserInfo = computed(() => {
    const { fullname = '', avatar, desc } = userStore.getUserInfo || {};
    return { fullname, avatar: avatar || headerImg, desc };
  });

  const [register1, { openModal: openPasswordModal }] = useModal();
  const [register2, { openModal: openHistoryModal }] = useModal();
  const [register3, { openModal: openSettingModal }] = useModal();

  //  login out
  function handleLoginOut() {
    userStore.confirmLoginOut();
  }

  function handleMenuClick(e: MenuInfo) {
    switch (e.key as MenuEvent) {
      case 'management':
        openWindow(
          `${location.origin}${
            import.meta.env.VITE_PATHNAME_BACKEND_MANAGEMENT
          }#/organization/user`,
        );
        break;
      case 'devcenter':
        openWindow(`${location.origin}${import.meta.env.VITE_PATHNAME_DEVELOPER_CENTER}`);
        break;
      case 'password':
        openPasswordModal();
        break;
      case 'logs':
        openHistoryModal();
        break;
      case 'mysetting':
        openSettingModal();
        break;
      case 'logout':
        handleLoginOut();
        break;
    }
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    align-items: center;
    height: @header-height;
    padding: 0 0 0 10px;
    padding-right: 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;

    img {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }

    &__header {
      border-radius: 50%;
    }

    &__name {
      font-size: 14px;
    }

    &--dark {
      &:hover {
        background-color: @header-dark-bg-hover-color;
      }
    }

    &--light {
      &:hover {
        background-color: @header-light-bg-hover-color;
      }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }

    &-dropdown-overlay {
      .ant-dropdown-menu-item {
        min-width: 100px;
      }
    }
  }
</style>
