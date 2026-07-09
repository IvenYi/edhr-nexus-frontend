<template>
  <van-image class="w64px h32px" :src="DefaultThumbnail" />
</template>

<script name="electronic-signature" setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import DefaultThumbnail from '/@/assets/images/default.svg';
</script>
<style scoped lang="less"></style>
