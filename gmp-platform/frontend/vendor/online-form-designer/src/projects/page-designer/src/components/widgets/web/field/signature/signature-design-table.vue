<template>
  <div class="table-field-box">
    <PlusOutlined v-show="!readonly" class="icon-color pr-8px" :class="[disabled && 'disabled']" />
    <span v-show="readonly" class="img-icon flex">
      <i class="iconfont icon-tupian-shili"></i>
    </span>
  </div>
</template>
<script name="gct-printer" setup lang="ts">
  import { toRefs } from 'vue';
  import { Signature } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Signature; rowReadonly?: boolean }>();
  const { readonly, disabled } = toRefs(props.widget.props);
</script>

<style lang="less" scoped>
  .table-field-box {
    width: 100%;
    display: flex;
    align-items: center;

    .icon-color {
      font-size: 16px;
      color: var(--ant-primary-color);

      &.disabled {
        color: #c3c3c3;
      }
    }
    .img-icon {
      align-items: center;
      color: #c3c3c3;
      .iconfont {
        padding: 0 1px 0 2px;
        background: #f7f8fa;
        font-size: 22px !important;
      }
    }
  }

  .upload-field-con {
    .ant-popover-inner-content {
      padding: 16px;
    }
  }
</style>
