<template>
  <div class="params-item-card">
    <div class="flex justify-between items-center">
      <div class="w-50% truncate pr-11px" :title="deviceParams.code">{{ deviceParams.code }}</div>
      <div class="w-50% pl-11px flex items-center justify-end">
        <span class="flex-shrink-1 truncate" :title="deviceParams.name">{{
          deviceParams.name
        }}</span>

        <a-popover placement="bottomRight" overlayClassName="dhr-custom-popover">
          <template #content>
            <DeviceFieldStatus :deviceParams="deviceParams" />
          </template>
          <i class="gct-iconfont icon-moban-xiangqing tooltip-icon cursor-pointer"></i>
        </a-popover>
      </div>
    </div>
    <a-divider class="pt2px pb6px"><i class="gct-iconfont icon-lianjie"></i></a-divider>
    <div class="flex items-center">
      <div class="flex-grow-1 w-1px">
        <slot></slot>
      </div>
      <div
        v-if="props.enableCollapse"
        :class="['collapse-icon', collapse && 'collapse-icon--active']"
        @click="clickCollapse"
      >
        <i class="gct-iconfont icon-icon_shuzujiegou"></i>
      </div>
    </div>
    <div class="params-item-card__children" v-if="props.enableCollapse && collapse">
      <slot name="children"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="params-item-card">
  import { ref } from 'vue';
  import { DeviceFieldStatus } from '/@online-form/components/device';
  import { DeviceLink } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      /** 启用折叠功能 */
      enableCollapse?: boolean;
      deviceParams: DeviceLink.IDeviceLinkParams;
    }>(),
    {
      enableCollapse: false,
    },
  );

  const collapse = ref(false);
  const clickCollapse = () => {
    collapse.value = !collapse.value;
  };

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();
</script>

<style lang="less" scoped>
  .params-item-card ~ .params-item-card {
    margin-top: 8px;
  }
  .params-item-card {
    padding: 8px 8px 12px;
    background: #f9fafb;
    border-radius: 4px 4px 4px 4px;
    border: 1px dashed #e0e3eb;
    font-weight: 400;
    font-size: 12px;
    color: #1a1d23;

    :deep(.ant-popover-open) {
      &.tooltip-icon {
        color: var(--ant-primary-color);
      }
    }

    .tooltip-icon {
      margin-left: 4px;
      font-size: 14px;
      color: #A6A6A6;
    }

    .collapse-icon {
      flex-shrink: 0;
      margin-left: 4px;
      width: 26px;
      height: 26px;
      background: #ffffff;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #e0e3eb;
      color: #1a1d23;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      .gct-iconfont {
        font-size: 14px;
      }

      &--active,
      &:hover {
        border: 1px solid #026ac8;
        color: #026ac8;
      }
    }

    &__children {
      padding-top: 8px;
      .params-item-card {
        background: #ffffff;
        border-radius: 4px 4px 4px 4px;
        border: none;
      }
    }

    .form-item {
      display: flex;
      flex-wrap: nowrap;
      & ~ & {
        margin-top: 8px;
      }
    }
    .form-item-label {
    }

    .form-item-value {
      margin-left: 8px;
    }
  }
</style>

<style lang="less">
  .params-item-card__tooltip-popover {
    padding-top: 4px !important;

    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style>
