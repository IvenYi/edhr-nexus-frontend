<template>
  <van-image class="w160px h90px" :src="DefaultThumbnail" />
</template>

<script name="electronic-signature" setup lang="ts">
  import DefaultThumbnail from '/@/assets/images/default.svg';
  import { ref, onMounted, watchEffect, computed } from 'vue';
</script>
<style scoped lang="less"></style>
