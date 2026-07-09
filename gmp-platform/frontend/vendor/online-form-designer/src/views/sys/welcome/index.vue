<template>
  <div class="text-center pt-50">
    <!-- <img src="~@/assets/images/welcome.svg" class="w-500px" /> -->
    <!-- <div class="welfont"> 欢迎进入应用管理系统 </div> -->
    <!-- <div class="exp mt-10px"> 暂无模块选择，模块已隐藏或在菜单配置进行配置 </div> -->
    <img src="~@/assets/images/no-auth.svg" alt="no-auth" class="w-320px" />
    <div class="info"> 暂无任何菜单权限，请联系管理员 </div>
  </div>
</template>

<style scoped lang="less">
  .welfont {
    color: #333;
    font-size: 20px;
    font-weight: bold;
  }

  .exp {
    color: #999;
    font-size: 12px;
  }

  .info {
    margin-top: -52px;
    line-height: 20px;
    color: #797a7d;
  }
</style>
