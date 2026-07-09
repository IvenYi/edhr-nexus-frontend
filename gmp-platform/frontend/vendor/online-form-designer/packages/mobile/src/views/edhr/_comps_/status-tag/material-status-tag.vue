<template>
  <div class="edhr-material-status" :class="'edhr-material-status-' + code"
    >{{ t('sys.edhr.materialStatus.' + code) }}
  </div>
</template>

<script setup lang="ts">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;
  defineProps<{
    code: string;
  }>();
</script>

<style scoped lang="less">
  .edhr-material-status {
    height: 22px;
    padding: 0 4px;
    border-radius: 2px;
    color: #fff;
    background-color: #ccc;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &-FORM {
      color: #3168ec;
      background-color: rgba(49, 104, 236, 0.1);
    }

    &-LOT {
      color: #02c889;
      background-color: rgba(2, 200, 137, 0.1);
    }
    &-SN {
      color: #a002c8;
      background-color: rgba(160, 2, 200, 0.1);
    }
    &-PRODUCT_RELEASE {
      color: #dda200;
      background: #faf3df;
    }

    &-LOT_SN_APPEND {
      color: #3168ec;
      background-color: rgba(49, 104, 236, 0.1);
    }
  }
</style>
