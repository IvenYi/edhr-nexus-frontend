<template>
  <div class="w100% h100% flex justify-center items-center">
    <div class="w324px h190px mr32px">
      <img :src="notFound" alt="" />
    </div>
    <div>
      <div class="font-600 text-[52px] mb8px">404</div>
      <div class="text-[14px] w182px"> 很抱歉，沙箱环境已被删除， 暂不可访问沙箱环境链接 </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import notFound from '/@/assets/svg/pic_404.svg';
</script>
