<template>
  <div class="designer-template">
    <div class="designer-template__item" v-for="n in 5" :key="n">
      <div class="designer-template__item-name">template {{ n }}.0</div>
      <div class="designer-template__item-action">
        <div><i class="iconfont icon-yulan"></i>预览</div>
        <div><i class="iconfont icon-xiazai"></i>下载</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="toolkit-template">
  defineProps({
    config: {
      type: Object,
      default: () => ({}),
    },
  });
</script>

<style lang="less" scoped>
  .designer-template {
    padding: 16px;

    &__item {
      height: 140px;
      position: relative;
      background: #eee;
      cursor: pointer;
      overflow: hidden;
      border-radius: 4px;
      box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);

      &:not(:last-child) {
        margin-bottom: 20px;
      }

      &-name {
        height: 32px;
        background: #fff;
        line-height: 32px;
        text-align: center;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        border-radius: 4px;
      }

      &-action {
        height: 32px;
        background: var(--ant-primary-color);
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: all 0.3s;
        transform: translateY(100%);
        opacity: 0;
        display: flex;
        justify-content: space-evenly;
        border-radius: 4px;

        & > div {
          // width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          line-height: 1em;

          .iconfont {
            margin-right: 5px;
          }
        }
      }

      &:hover {
        .designer-template__item-action {
          transform: translateY(0%);
          opacity: 1;
        }
      }
    }
  }
</style>
