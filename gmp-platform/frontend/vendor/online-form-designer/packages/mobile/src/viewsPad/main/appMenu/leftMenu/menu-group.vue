<template>
  <div class="menu-group" :class="{ 'group-open': menu.open }">
    <div class="menu-group-row" @click.stop="menu.open = !menu.open">
      <!-- <van-icon name="calendar-o" class="text-16px mr12px" /> -->
      <div class="w16px mr12px"></div>
      <div class="title ell"> {{ menu.name }} </div>
      <van-icon name="arrow-down" class="text-16px arrow" />
    </div>
    <div class="menu-children">
      <ul>
        <li
          :key="item.id"
          v-for="item in menu.children"
          :class="{ active: item.id === selectId }"
          @click.stop="handleSelect(item)"
        >
          <span class="truncate">{{ item.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import type { Menus } from '@mobile/components/appItem/type';

  const props = defineProps<{
    menu: Menus;
    selectId?: string;
  }>();
  const emit = defineEmits(['select']);

  function handleSelect(item: Menus) {
    if (item.id === props.selectId) return;
    emit('select', item);
  }
</script>
<style scoped lang="less">
  .menu-group {
    padding: 0 12px;

    &-row {
      display: flex;
      align-items: center;
      height: 40px;
    }

    .title {
      flex: 1;
    }

    .arrow {
      transition: transform 0.3s ease;
    }

    .menu-children {
      display: grid;
      grid-template-rows: 0fr;
      transition: all 0.3s ease;

      ul {
        overflow: hidden;
      }

      li {
        display: flex;
        align-items: center;
        height: 40px;
        margin-bottom: 4px;
        padding-left: 26px;
        border-radius: 6px;
      }

      .active {
        background-color: #fff;
        color: var(--van-primary-color);
        font-weight: 600;
      }
    }
  }

  .group-open {
    .arrow {
      transform: rotate(-180deg);
    }

    .menu-children {
      grid-template-rows: 1fr;
    }
  }
</style>
