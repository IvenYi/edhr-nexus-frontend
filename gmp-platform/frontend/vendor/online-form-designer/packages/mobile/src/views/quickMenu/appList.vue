<template>
  <div class="pt20px">
    <van-radio-group :modelValue="activeAppId">
      <van-cell
        clickable
        class="mb10px"
        v-for="app in getAppList(appStore.getAppOptions, false)"
        :key="app.id"
        @click="changeApp(app)"
      >
        <template #title>
          <div class="flex items-center">
            <div
              class="flex justify-center items-center w-8 h-8 rounded-lg overflow-hidden"
              :style="{ background: app.bgColor }"
            >
              <vImage
                :size="app.logoType === LogoTypeEnum.Icon ? 20 : 32"
                :src="app.logo"
                :logoType="app.logoType"
                :color="app.color"
              />
            </div>
            <span class="ml-2">{{ app.name }}</span>
          </div>
        </template>
        <template #right-icon>
          <van-radio :name="app.id" />
        </template>
      </van-cell>
    </van-radio-group>
  </div>
</template>
<script setup lang="ts">
  import type { AppResponse } from '@mobile/apis/gct-platform/model';
  import { useAppStore } from '@mobile/stores/useAppStore';
  import { onMounted } from 'vue';
  import { LogoTypeEnum } from '@mobile/type';
  import { getAppList } from '@mobile/components/tabbar-views/workbench/components/panes/util';

  const appStore = useAppStore();
  defineProps<{
    activeAppId?: string;
  }>();
  const emit = defineEmits(['change']);
  onMounted(() => {
    let first = appStore.getAppOptions?.[0];
    first && emit('change', first);
  });

  function changeApp(value: AppResponse) {
    emit('change', value);
  }
</script>
<style scoped lang="less">
  .van-cell {
    --van-cell-background: #f5f5f5ff;
  }
</style>
