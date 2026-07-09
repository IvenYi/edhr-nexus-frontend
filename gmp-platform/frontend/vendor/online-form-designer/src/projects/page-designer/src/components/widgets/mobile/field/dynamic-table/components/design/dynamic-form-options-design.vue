<template>
  <van-tag plain type="primary" color="#E8EBF0" textColor="rgba(0,0,0,.85)" :closeable="false">
    <span class="tag-content"> 示例数据 </span>
  </van-tag>
</template>
<script name="gct-dynamic-form-options" setup lang="ts">
  //
</script>

<style lang="less" scoped>
  .van-tag {
    padding: 0 6px;
    background-color: #fafafa;
    .tag-content {
      display: inline-block;
      line-height: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 90px;
    }

    &:last-child {
      margin-right: 0;
    }
  }
</style>
