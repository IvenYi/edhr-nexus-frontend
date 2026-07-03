<template>
  <div class="empty overflow-hidden">
    <crumbs :links="drillingLinkList" :crumbsClick="crumbsClick!" />
    <div class="ks-col ks-column ks-row-center">
      <div class="empty-img" v-if="isDelete">
        <img src="@/assets/images/report-404.svg" />
        <div class="empty-describe"> 抱歉，您所访问的报表不存在</div>
      </div>
      <div class="empty-img" v-else>
        <img src="@/assets/images/no-auth.svg" />
        <div class="empty-describe"> 抱歉，您没有权限访问该报表</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import type { LinkItem } from '../drilling-hook';
  import crumbs from './crumbs.vue';

  const props = defineProps<{
    isDelete: boolean;
    title?: string;
    drillingLinkList: LinkItem[];
    crumbsClick: Function;
  }>();
</script>
<style scoped lang="less">
  .empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    padding: 16px;

    &-img {
      text-align: center;
    }

    &-describe {
      color: #8b8b8b;
    }

    img {
      width: 35%;
      max-width: 400px;
    }
  }
</style>
