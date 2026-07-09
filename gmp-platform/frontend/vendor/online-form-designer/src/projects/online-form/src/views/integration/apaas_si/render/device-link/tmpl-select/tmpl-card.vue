<template>
  <div class="tmpl-card">
    <div class="tmpl-card__header">
      <div class="tmpl-card__title">
        <slot name="title"></slot>
      </div>
      <a-dropdown
        overlayClassName="tmpl-card__dropdown"
        class="add-tmpl-btn"
        placement="bottomRight"
      >
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="detail">{{ $t('sys.tableActionDesc') }}</a-menu-item>
            <a-menu-item key="edit">{{ $t('sys.edit') }}</a-menu-item>
          </a-menu>
        </template>
        <RemoveIcon icon="icon-ziduan-biaodananniu-quanbuzhedie" />
      </a-dropdown>
    </div>
    <div class="tmpl-card__body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="tmpl-card">
  import { RemoveIcon } from '/@online-form/components/ui';

  const emit = defineEmits<{
    (e: 'detail'): void;
    (e: 'edit'): void;
  }>();

  const handleMenuClick = (e) => {
    emit(e.key);
  };
</script>

<style lang="scss" scoped>
  .tmpl-card {
    background: #ffffff;

    &__header {
      border-bottom: 1px solid #f2f5f8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      padding: 0 11px 0 16px;
    }

    &__icon {
      font-size: 14px;
      color: #026ac8;
      margin-right: 4px;
    }

    &__title {
      flex-grow: 1;
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;
    }

    &__body {
      padding: 12px 16px 16px;
    }
  }

  .tmpl-card ~ .tmpl-card {
    margin-top: 12px;
  }
</style>

<style lang="less">
  .tmpl-card__dropdown {
    width: 72px;
    .ant-dropdown-menu {
      background: #ffffff;
      box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.1);
      border-radius: 4px 4px 4px 4px;
    }
    .ant-dropdown-menu-item,
    .ant-dropdown-menu-submenu-title {
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;
      line-height: 20px;
    }
  }
</style>
