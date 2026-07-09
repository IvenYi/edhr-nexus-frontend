<template>
  <div class="h100% flex">
    <div class="left px12px py16px">
      <div
        v-for="(item, index) in module"
        :key="index"
        class="w196px h36px mb4px module-item flex items-center"
        :class="{ selected: item.id === selectedModule }"
        @click="toModule(item)"
      >
        <img :src="item.icon" :alt="item.module" />
        <div class="ell ml8px">
          {{ item.module }}
        </div>
      </div>
    </div>
    <div class="right px24px py16px">
      <LicenseTable :type="selectedModule" @reloadMsg="emit('reloadMsg')" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import IconBI from '/@/assets/svg/icon_BI_1.svg';
  import IconDevice from '/@/assets/svg/icon_device.svg';
  import IconOCR from '/@/assets/svg/icon_OCR.svg';
  import LicenseTable from './activate-table.vue';

  const emit = defineEmits(['reloadMsg']);
  const module = [
    {
      module: 'BI',
      icon: IconBI,
      id: 'BI',
    },
    {
      module: '设备互联',
      icon: IconDevice,
      id: 'IOT',
    },
    {
      module: 'OCR图像识别',
      icon: IconOCR,
      id: 'OCR',
    },
  ];

  const selectedModule = ref('BI');

  const toModule = (item) => {
    selectedModule.value = item.id;
  };
</script>
<style lang="less" scoped>
  .left {
    width: 220px;
    border-right: 1px solid #e0e3eb;
    height: 100%;
  }
  .module-item {
    border-radius: 4px 4px 4px 4px;
    cursor: pointer;
    padding: 0 12px;
    &:hover {
      background: #f2f5f8;
    }
  }
  .selected {
    background: hsl(from var(--ant-primary-color) h s l / 8%);
  }
  .right {
    flex: 1;
    height: 100%;
  }
</style>
