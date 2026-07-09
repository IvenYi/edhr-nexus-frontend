<template>
  <div class="menu-ul">
    <ul>
      <li v-for="menu in items" :key="menu.path">
        <menu-title
          :data="menu"
          :level="level"
          :submenu="menu.children && menu.children.length > 0"
          :isPopover="true"
        />
        <menu-popover
          v-if="menu.children && menu.children.length > 0"
          :items="menu.children"
          :level="level + 1"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts" name="menu-popover">
  import { useI18n } from '/@/hooks/web/useI18n';
  import MenuTitle from './MenuTitle.vue';

  defineProps<{
    items: any[];
    level: number;
  }>();

  const { t } = useI18n();
</script>

<style></style>
