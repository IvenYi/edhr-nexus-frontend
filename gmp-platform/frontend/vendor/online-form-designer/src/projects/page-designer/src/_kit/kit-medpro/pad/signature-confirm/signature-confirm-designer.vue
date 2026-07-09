<template>
  <div class="signature-confirm-designer">
    <div class="text-[14px] py4px add-btn mb10px">
      <i class="iconfont icon-chuangjianbanben lh-1 mr6px"></i>
      {{ $t('sys.add') }}
    </div>
    <van-form label-align="left" input-align="right">
      <van-cell-group :border="false">
        <van-field :border="false" label="账号" required placeholder="请输入" />
        <van-field :border="false" label="密码" required placeholder="请输入" />
        <div class="ks-row verify-item">
          <div class="verify-btn text-[14px]">签名验证</div>
          <i class="iconfont icon-shanchu2 error-gct text-[14px] lh-1 p7px ml14px"></i>
        </div>
      </van-cell-group>
    </van-form>
    <van-form class="mt10px">
      <van-cell-group :border="false">
        <van-field :border="false" label="账号" required placeholder="请输入" />
        <van-field :border="false" label="密码" required placeholder="请输入" />
        <div class="ks-row verify-item">
          <div class="verify-btn">签名验证</div>
          <i class="iconfont icon-shanchu2 error-gct text-[14px] lh-1 p7px ml14px"></i>
        </div>
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup lang="ts" name="gct-signature-confirm-designer"></script>
<style lang="less" scoped>
  .add-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--van-primary-color);
    color: var(--van-primary-color);
    border-radius: 6px;
  }
  :deep(.van-cell-group) {
    background: transparent;
    border: 1px solid #eeeeee;
    border-radius: 6px;
    padding: 14px 10px;
  }
  :deep(.van-cell) {
    background: transparent;
    padding: 10px;
  }
  .verify-item {
    justify-content: right;
    align-items: center;
    .verify-btn {
      padding: 6px 21px;
      background-color: var(--van-primary-color);
      border-radius: 6px;
      color: #fff;
    }
  }
</style>
