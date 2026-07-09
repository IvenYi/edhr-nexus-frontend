<template>
  <div class="w120px h120px flex items-center justify-center img-designer">
    <van-image class="w32px h32px" :src="DefaultThumbnail" />
  </div>
</template>

<script name="electronic-signature" setup lang="ts">
  import DefaultThumbnail from '/@/assets/svg/pic_default.svg';
  import { ref, onMounted, watchEffect, computed } from 'vue';
</script>
<style scoped lang="less">
  .img-designer {
    border-radius: 4px;
    background-color: #f3f5f7;
  }
</style>
