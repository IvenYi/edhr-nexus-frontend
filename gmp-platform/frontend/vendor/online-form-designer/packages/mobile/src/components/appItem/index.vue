<template>
  <div class="rounded-6px align-bottom app-item">
    <div class="relative">
      <div class="app-item-info">
        <div
          class="w40px h40px rounded-6px icon-wrap"
          :style="`background-color:${app.bgColor ?? ''}`"
        >
          <vImage :size="24" :src="app.logo" :logoType="app.logoType" :color="app.color" />
        </div>
        <div class="text-12px mt4px text-overflow w100% lh-18px"> {{ app.name }} </div>
      </div>
      <span
        class="absolute ope iconfont icon-tianjia1 text-18px primary-color"
        v-if="opeType === 'add'"
        @click="addApp"
      ></span>
      <span
        class="absolute ope iconfont icon-yichu text-18px danger-color"
        v-if="opeType === 'remove'"
        @click="removeApp"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { LogoTypeEnum } from '@mobile/type';

  const emit = defineEmits(['add', 'remove']);
  defineProps<{
    app: { logoType: LogoTypeEnum; name: string; logo: string; color?: string; bgColor?: string };
    opeType?: string;
  }>();
  function addApp() {
    emit('add');
  }
  function removeApp() {
    emit('remove');
  }
</script>
<style scoped lang="less">
  .ope {
    top: -8px;
    right: -8px;
  }

  .text-overflow {
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-item {
    width: 20%;
    padding: 8px 4px;

    &-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      width: 100%;

      .icon-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        :deep(img) {
          border-radius: 4px;
        }
      }
    }
  }
</style>
