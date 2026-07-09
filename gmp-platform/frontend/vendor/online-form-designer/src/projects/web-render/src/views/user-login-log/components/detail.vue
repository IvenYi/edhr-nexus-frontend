<template>
  <div class="p20px">
    <a-descriptions :column="2">
      <a-descriptions-item label="姓名">
        {{ data.fullname }}
      </a-descriptions-item>
      <a-descriptions-item label="工号">
        {{ data.empNo }}
      </a-descriptions-item>
      <a-descriptions-item label="手机号">
        {{ data.mobile }}
      </a-descriptions-item>
      <a-descriptions-item label="主机IP">
        {{ data.ip }}
      </a-descriptions-item>
      <a-descriptions-item label="浏览器">
        {{ data.browser }}
      </a-descriptions-item>
      <a-descriptions-item label="登录状态">
        <span :class="['login-status', data.loginStatus]">{{
          Ch_LoginStatus[data.loginStatus]
        }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="登录时间" :span="3">
        {{ data.modifyTime }}
      </a-descriptions-item>
      <a-descriptions-item label="操作系统" :span="3">
        {{ data.os }}
      </a-descriptions-item>
      <a-descriptions-item label="备注" :span="3">
        {{ data.description }}
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    data: any;
  }>();

  const Ch_LoginStatus = {
    SUCCEED: $t('sys.portal.succeed'),
    FAILURE: $t('sys.portal.failure'),
  };
</script>
<style lang="less" scoped>
  .login-status {
    display: inline-block;
    font-size: 14px;
    line-height: 18px;
    border-radius: 2px;
    padding: 2px 6px;
    color: #fff;

    &.SUCCEED {
      background-color: #0dcf8d;
    }

    &.FAILURE {
      background-color: #ff4d4f;
    }
  }
</style>
