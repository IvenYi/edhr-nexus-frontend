<template>
  <div class="item">
    <div :class="[isBorder ? 'border' : '']" style="padding: 6px; margin-right: 12px">
      <img :src="map[data.imgUrl]" :alt="data.imgUrl" style="width: 265px" />
    </div>
    <a-radio :value="data.value">{{ data.label }}</a-radio>
  </div>
</template>

<script setup lang="ts">
  import ToolbarLeft from '/@/assets/platform/toolbar-left.png';
  import ToolbarComplexTop from '/@/assets/platform/toolbar-complex-top.png';
  import ToolbarTop from '/@/assets/platform/toolbar-top.png';
  import Login from '/@/assets/platform/login.png';
  import LoginPassword from '/@/assets/platform/login-password.png';

  const map = {
    'toolbar-left.png': ToolbarLeft,
    'toolbar-complex-top.png': ToolbarComplexTop,
    'toolbar-top.png': ToolbarTop,
    'login.png': Login,
    'login-password.png': LoginPassword,
  };

  interface DataType {
    imgUrl: string;
    value: string;
    label: string;
  }
  defineProps<{
    data: DataType;
    isBorder?: boolean;
  }>();

  // const basicUrl = '/src/assets/platform/';
</script>

<style lang="less" scoped>
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .border {
    border: 2px solid var(--ant-primary-color);
    border-radius: 4px;
    margin-bottom: 8px;
  }
</style>
