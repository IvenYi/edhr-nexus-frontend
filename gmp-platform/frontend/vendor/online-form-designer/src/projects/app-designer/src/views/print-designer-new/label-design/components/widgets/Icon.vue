<template>
  <div
    class="icon-picker-next__trigger cursor-pointer"
    :style="{
      background: props.logoBgColor,
    }"
  >
    <icon-next size="72" :value="props.icon" :color="props.logoColor" />
  </div>
</template>

<script lang="ts" setup name="ICON">
  import { IconNext } from '/@/components/Icon';

  const props = defineProps({
    icon: {
      type: String,
    },
    logoBgColor: {
      type: String,
    },
    logoColor: {
      type: String,
    },
  });
</script>

<style scoped lang="css">
  .p-qrcode {
    position: absolute;
    overflow: hidden;
    text-align: center;
  }

  .p-qrcode img {
    width: 100%;
    height: 100%;
  }
</style>
