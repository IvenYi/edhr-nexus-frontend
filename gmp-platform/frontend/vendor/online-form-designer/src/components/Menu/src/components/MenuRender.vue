<template>
  <div class="menu-ul">
    <ul>
      <li v-for="menu in items" :key="menu.path">
        <a-popover
          v-if="menuCollapsed && level === 1"
          placement="rightTop"
          overlay-class-name="menu-popup-overlay menu-classic"
        >
          <template #content>
            <div class="h-36px pl-10px pr-10px flex items-center primary-gct font-500">{{
              t(menu.name)
            }}</div>
            <template v-if="menu.children && menu.children.length > 0">
              <div class="h-1px bg-[#E0E3EA] mt-8px mb-8px"></div>
              <menu-popover :items="menu.children" :level="level" />
            </template>
          </template>
          <menu-title
            :data="menu"
            :level="level"
            :searchVal="searchVal"
            :submenu="menu.children && menu.children.length > 0"
          />
        </a-popover>

        <menu-title
          v-else
          :data="menu"
          :level="level"
          :searchVal="searchVal"
          :submenu="menu.children && menu.children.length > 0"
        />
        <menu-render
          v-if="menu.children && menu.children.length > 0"
          :items="menu.children"
          :searchVal="searchVal"
          :level="level + 1"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts" name="menu-render">
  import { useI18n } from '/@/hooks/web/useI18n';
  import MenuTitle from './MenuTitle.vue';
  import MenuPopover from './MenuPopover.vue';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  defineProps<{
    items: any[];
    level: number;
    searchVal: string;
  }>();

  const { t } = useI18n();
  const { menuCollapsed } = useThemeSetting();
</script>

<style></style>
