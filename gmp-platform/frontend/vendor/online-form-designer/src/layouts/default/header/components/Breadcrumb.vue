<template>
  <div class="flex-none pl-24px pr-24px p-20px pb-12px bg-[#F7F8FA]">
    <a-breadcrumb>
      <a-breadcrumb-item v-for="route in routes" :key="route.path">
        <span v-if="themeSetting.showBreadcrumbIcon && route.icon">
          <IconNext v-if="renderIconNext" :size="18" :value="route.icon" color="currentcolor" />
          <Icon v-else :icon="route.icon" :size="18" />
        </span>
        {{ t(route.name || route.meta.title) }}
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { layoutMenus, useLayoutMenu } from '/@/layouts/default/menu/useLayoutMenu';
  import { getAllParentPath } from '/@/router/helper/menuHelper';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { IconNext } from '/@/components/Icon';
  import Icon from '@/components/Icon/Icon.vue';

  defineProps<{
    showIcon?: boolean;
  }>();

  const { currentRoute } = useRouter();
  const { t } = useI18n();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { themeSetting } = useThemeSetting();
  useLayoutMenu();
  // todo 当前路由
  // todo hideinbreadcrumb

  /**
   * 过滤指定菜单
   * todo优化 递归 或者 tree转map
   * @param menus
   * @param path
   * @param total
   */
  const filter = (menus: any[], path: string, total: any[] = []) => {
    menus.forEach((m) => {
      if (m.path === path) {
        total.push(m);
      } else if (m.children && m.children.length > 0) {
        filter(m.children, path, total);
      }
    });

    return total;
  };

  const routes = computed(() => {
    const currentActiveMenu = currentRoute.value.meta.currentActiveMenu ?? currentRoute.value.path;
    const pathes = getAllParentPath(layoutMenus.value, currentActiveMenu);
    const routes = pathes.map((path) => {
      const routes = filter(layoutMenus.value, path, []) ?? [];
      const route = { ...routes[0] };
      if (!route.icon) {
        route.icon = route?.meta?.icon;
      }
      return route;
    });

    return [...routes];
  });

  const renderIconNext = computed(() => {
    return getCurrentProject === ProjectName.WEB_RENDER;
  });
</script>

<style lang="less" scoped>
  .ant-breadcrumb {
    color: #797a7d;
    height: 22px;
    line-height: 22px;
    display: flex;

    & > span {
      // display: inline-flex;
      display: flex;
      align-items: center;
    }

    & > span:last-child {
      color: #212528;
    }

    ::v-deep(.ant-breadcrumb-link) {
      display: inline-flex;
      align-items: center;

      & > span:first-child {
        margin-right: 6px;
        display: flex;
        align-items: center;
      }
    }
  }
</style>
