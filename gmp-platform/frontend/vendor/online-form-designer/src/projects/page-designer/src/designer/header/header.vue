<template>
  <div class="designer-header">
    <a-breadcrumb>
      <a-breadcrumb-item>{{ pageInfo.categoryResponse?.name }}</a-breadcrumb-item>
      <a-breadcrumb-item> {{ pageInfo.name }}</a-breadcrumb-item>
    </a-breadcrumb>
    <DevTools />
    <component-search />
    <user-lock />

    <!-- <div class="designer-header__divider"></div> -->
    <div class="designer-header__actions">
      <a-button type="primary" @click="preview">
        <i class="iconfont icon-yulan"></i>
        {{ t('sys.preview') }}
      </a-button>
      <a-button type="primary" @click="save">
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.saveText') }}
      </a-button>
      <!-- <a-button>
        <i class="iconfont icon-guanbi"></i>
        {{ t('sys.closeText') }}
      </a-button> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pageInfo } from '/@page-designer/hooks/usePage';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { UserLock } from '/@/components/UserOccupy';
  import { ComponentSearch } from '/@/components/ComponentSearch';
  import { DevTools } from '@/components/DevTools';

  const { t } = useI18n();
  const { save, preview } = useDesigner();
</script>

<style lang="less" scoped>
  .designer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background-color: #1a1d23;
    :deep(.ant-breadcrumb) {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.64);
      .ant-breadcrumb-separator {
        color: rgba(255, 255, 255, 0.64);
      }
      & > span:last-child {
        color: #fff;
      }
    }

    &__lock-info {
      margin-left: auto;

      > span {
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }

    &__divider {
      height: 24px;
      border-left: 1px solid #e3e3e3;
      margin: 0 15px;
    }

    &__actions {
      margin-left: 28px;
      .ant-btn-primary {
        background-color: rgba(255, 255, 255, 0.12);
        border-color: transparent;
        padding: 4px 12px;
        color: #fff;
        .iconfont {
          line-height: 1em;
          margin-right: 8px;
          position: relative;
          top: 1px;
        }

        &:hover {
          background-color: var(--ant-primary-color);
        }
      }
      .ant-btn:not(:last-child) {
        margin-right: 16px;
      }
      .ant-btn:no:last-child {
        margin-right: 12px;
      }
    }
  }
</style>
