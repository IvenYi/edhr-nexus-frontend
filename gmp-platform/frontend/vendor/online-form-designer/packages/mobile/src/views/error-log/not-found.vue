<template>
  <div class="w100% h100% flex flex-col justify-center items-center">
    <div class="w238px h140px">
      <img :src="notFound" alt="" class="w100% h100%" />
    </div>
    <div class="font-600 text-[16px] mb8px mt-24px">很抱歉，沙箱环境已被删除</div>
    <div class="text-[14px] text-[#5A5F6B]"> 暂不可访问沙箱环境链接 </div>
  </div>
</template>
<script lang="ts" setup>
  import notFound from '/@/assets/svg/pic_404.svg';
</script>
