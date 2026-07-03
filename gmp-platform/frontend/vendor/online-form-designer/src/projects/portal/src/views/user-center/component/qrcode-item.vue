<template>
  <div class="qrcode-card flex justify-between w100%">
    <div class="flex items-center app-info">
      <img v-if="props.logoType === 'image'" :src="props.image" :alt="props.title" class="w64px" />
      <div
        v-else-if="props.logoType === 'ICON'"
        class="logo-icon"
        :style="{
          backgroundColor: codeInfo.logoBgColor,
        }"
      >
        <IconNext :value="codeInfo.logo" :color="codeInfo.logoColor" :size="48" />
      </div>
      <div v-else-if="props.logoType === 'SVG'" class="logo-icon">
        <img :src="codeInfo.logo" alt="" />
      </div>
      <div v-else class="logo-icon">
        <img :src="codeInfo.logo" alt="" />
      </div>
      <div class="ml16px app-title">
        <div class="font-700 text-16px gct-text-overflow" v-ellipsis-title="props.title">
          {{ props.title }}
        </div>
        <div class="text-[#5A5F6B]" :class="{ pt6px: !props.subTitle2 }">{{ props.subTitle }}</div>
        <div class="text-[#5A5F6B]">{{ props.subTitle2 }}</div>
      </div>
    </div>
    <a-popover
      placement="bottomRight"
      :arrow="false"
      overlayClassName="qrcode__popover"
    >
      <template #content>
        <qr-code :value="codeString" :width="224" :options="options" />
      </template>

      <div class="p4px code">
        <qr-code :value="codeString" :width="80" :options="options" />
      </div>
    </a-popover>
  </div>
</template>
<script setup lang="ts">
  import { QrCode } from '/@/components/Qrcode/index';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { computed } from 'vue';

  const props = defineProps<{
    codeInfo: any;
    title: string;
    subTitle: string;
    subTitle2: string;
    image: string;
    logoType: string;
  }>();

  const options = { margin: 1 };
  const codeString = computed(() => {
    if (typeof props.codeInfo === 'string') {
      return props.codeInfo;
    } else {
      return JSON.stringify(props.codeInfo);
    }
  });
</script>
<style lang="less" scoped>
  .qrcode-card {
    padding: 8px 8px 8px 20px;
    border-radius: 8px;
    background: #f9fafb;

    .app-info {
      width: calc(100% - 88px - 36px);
    }

    .app-title {
      width: calc(100% - 80px);
    }

    .code {
      width: 90px;
      height: 90px;
      border: 1px solid #e0e3eb;
      border-radius: 4px;
      background: #fff;
    }
  }

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    // background-color: #3370ff;
    width: 64px;
    height: 64px;
    overflow: hidden;
    border-radius: 8px;
    color: #fff;

    > img {
      width: 64px;
      height: auto;
    }
  }
</style>
<style lang="less">
  .qrcode__popover {
    padding-top: 4px !important;

    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner,
    .ant-popover-content {
      border-radius: 4px;
    }
  }
</style>
