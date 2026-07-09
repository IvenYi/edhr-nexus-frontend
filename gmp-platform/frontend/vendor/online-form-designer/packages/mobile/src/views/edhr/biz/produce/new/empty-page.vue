<template>
  <div :class="['empty-page']">
    <div class="flex items-center">
      <div class="rounded-4px b-1px b-solid b-[#e5e7eb] overflow-hidden flex-1 mr-16px">
        <van-field
          v-model="materialNo"
          placeholder="搜索批次/SN"
          :border="false"
          clearable
          right-icon="scan"
          label="批次/SN"
          @click-right-icon="onScan"
        />
      </div>
      <van-button
        color="linear-gradient(180deg, #0280F2 0%, #0056AA 95%)"
        type="primary"
        class="min-w-180px"
        @click="handleSearch"
        >查询</van-button
      >
    </div>
    <div class="flex justify-center items-center h-[calc(100%_-_50px)]">
      <img class="empty-img" :src="EmptyImage" alt="" />
    </div>
  </div>
</template>

<script lang="ts" setup name="empty-page">
  import { i18n } from '@mobile/locales/setupI18n';
  import EmptyImage from '@mobile/assets/image/edhr-filling-empty.png';

  import { findContainerByName } from '@mobile/views/edhr/_hooks_/useApi';
  import { showToast } from 'vant';
  import { GctNative } from '@native/index';

  const { t } = i18n.global;

  const emit = defineEmits<{
    (e: 'search', name: string): void;
  }>();

  const materialNo = ref<string>();

  const onScan = async () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        materialNo.value = value.result;
      },
    });
  };

  const handleSearch = async () => {
    const name = materialNo.value?.trim();
    if (!name) return;
    try {
      const info = await findContainerByName(name);
      console.log('find info', info);
      emit('search', name);
    } catch (error) {
      showToast(error.subMessage ?? error.message);
    }
  };
</script>

<style lang="less" scoped>
  .empty-page {
    height: 100%;

    .empty-img {
      max-width: calc(100% - 80px);
    }
  }
</style>
