<template>
  <div class="ipad-page h100% overflow-auto">
    <div class="menu-icon" @click="hiddenMenu = false" v-show="hiddenMenu">
      <span class="gct-iconfont icon-icon_daohangquzhankai"></span>
    </div>
    <LeftMenu
      :class="{ 'hidden-menu': hiddenMenu }"
      @select="selectPage"
      :selectId="activePage?.id"
      class=""
    />
    <div @click="hiddenMenu = true" class="h100%">
      <router-view :key="activePage.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import type { Menus } from '@mobile/components/appItem/type';
  import LeftMenu from './leftMenu/index.vue';
  // import { useAppStore } from '@mobile/stores/useAppStore';
  import { initPremission } from '/@web-render/utils/UserappPermissions';

  const route = useRoute();
  const router = useRouter();
  const hiddenMenu = ref(false);
  const activePage = ref({});
  function selectPage(row: Menus) {
    router.replace({
      name: 'pageRender',
      params: { linkPage: row.linkPage },
      query: { menuId: row.id },
    });
    activePage.value = row;
  }
  initPremission();
</script>
<style scoped lang="less">
  .ipad-page {
    position: relative;
    padding: 8px;

    .menu-icon {
      display: flex;
      position: fixed;
      z-index: 1;
      top: 108px;
      left: 76px;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50px;
      background: rgb(255 255 255 / 70%);
      box-shadow: 0 4px 16px 0 rgb(0 0 0 / 10%);
      line-height: 1;
      backdrop-filter: blur(4px);
    }

    .hidden-menu {
      transform: translateX(-300px);
    }
  }
</style>
