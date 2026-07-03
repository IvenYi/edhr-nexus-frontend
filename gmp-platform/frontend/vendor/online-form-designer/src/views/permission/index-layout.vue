<template>
  <basic-page class="menu-sider-page">
    <a-layout>
      <a-layout-sider width="155" style="background: #fff">
        <div class="menu-sider">
          <div
            v-for="item in menus"
            :key="item.path"
            class="menu-sider__item ell"
            :title="item.name"
            :class="{
              'menu-sider__item--active': selectedKeys[0] === item.path,
            }"
            @click="handleMenuClick(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </a-layout-sider>
      <div class="menu-sider-page__content">
        <slot></slot>
      </div>
    </a-layout>
  </basic-page>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRouter } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePermission } from '/@/hooks/web/usePermission';

  const { t } = useI18n();

  const go = useGo();

  const { currentRoute } = useRouter();
  const { hasPermission } = usePermission();

  interface MenuItemInterface {
    name: string;
    path: string;
    subPath?: string[];
  }

  const menus = computed<MenuItemInterface[]>(() => {
    return [
      {
        name: t('sys.menu.roleManagement'),
        path: '/org/permission/role',
        subPath: ['/org/permission/role-setting'],
        visible: hasPermission('OrgPermissionRole', undefined, true),
      },
      {
        name: t('sys.menu.administrator'),
        path: '/org/permission/administrator',
        visible: hasPermission('OrgPermissionAdmin', undefined, true),
      },
    ].filter((item) => item.visible);
  });

  const selectedKeys = computed(() => {
    const path = currentRoute.value.path;
    return menus.value
      .filter((item) => item.path === path || (item.subPath ?? []).includes(path))
      .map((item) => item.path);
  });

  const handleMenuClick = (item) => {
    go(item.path);
  };
</script>

<style lang="less" scoped>
  .menu-sider-page {
    :deep(.ant-layout) {
      height: 100%;
    }

    .ant-menu {
      height: 100%;
    }

    &__content {
      box-sizing: border-box;
      flex: 1;
      width: 10px;
      padding: 16px;
      background: #fff;
    }
  }

  .menu-sider {
    height: 100%;
    padding-top: 16px;
    padding-left: 24px;
    border-right: 1px solid #eaeaea;

    &__item {
      // display: flex;
      position: relative;
      align-items: center;
      height: 32px;
      margin-bottom: 12px;
      padding-left: 16px;
      transition: all 0.3s;
      line-height: 32px;
      cursor: pointer;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 2px;
        height: 100%;
        transition: all 0.3s;
      }

      &:hover {
        background-color: #f7f8fa;
      }

      &--active {
        background-color: #f7f8fa;
        color: var(--ant-primary-color);

        &::before {
          background-color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
