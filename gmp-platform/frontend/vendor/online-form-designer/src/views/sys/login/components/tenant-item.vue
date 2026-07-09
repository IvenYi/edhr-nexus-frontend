<template>
  <div class="tenant-card" size="default">
    <div class="tenant-card__last-login" v-show="tenantItem.id === current">
      <span>{{ t('sys.lastLogin') }}</span>
    </div>
    <div>{{ tenantItem.name }}</div>
    <arrow-right-outlined />
  </div>
</template>

<script setup lang="ts">
  import { ArrowRightOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps<{
    tenantItem: { id: string; name: string; status?: boolean };
    current: string;
  }>();
  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .tenant-card {
    height: var(--size, 64px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    position: relative;
    background: #f5f5f5;
    color: #333;
    font-size: 16px;
    border-radius: 4px;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;

    .anticon {
      transition: all 0.3s;
    }

    &:hover {
      color: var(--ant-primary-color);
      background-color: #ededed;

      .anticon {
        transform: translate(5px);
      }
    }

    &__last-login {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 12px;
      background: rgba(13, 170, 156, 0.1);
      padding: 0 4px;
      border-radius: 4px;
      span {
        color: var(--ant-primary-color);
      }
    }
  }
</style>
