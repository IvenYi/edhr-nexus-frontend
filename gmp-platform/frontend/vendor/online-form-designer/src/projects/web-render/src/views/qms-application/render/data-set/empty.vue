<template>
  <div class="gct-bi-data-source-empty">
    <a-empty
      :image="emptyPng"
      :image-style="{
        height: '120px',
      }"
    >
      <template #description>
        <span class="gct-bi-data-source-empty__description">
          还没有创建过数据集，您可以立即开始创建
        </span>
      </template>
      <a-button type="primary" @click="emit('add')">
        {{
          t('sys.newSth', {
            sth: t('sys.menu.dataSet'),
          })
        }}
      </a-button>
    </a-empty>
  </div>
</template>

<script setup lang="ts" name="BiDataSetEmpty">
  import emptyPng from '/@bi-designer/assets/empty.png';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['add']);

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .gct-bi-data-source-empty {
    padding: 200px 48px 0;

    &__description {
      font-weight: 400;
      font-size: 12px;
      color: #8f8f8f;
    }

    &__divider {
      margin: 40px 0 24px;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
    }

    .gct-quick-create {
      display: flex;
      flex-wrap: wrap;
      padding: 0 110px;
      gap: 20px;
      align-items: center;
      justify-content: center;

      .gct-quick-create-item {
        width: calc(25% - 20px);
        max-width: 205px;
        height: 48px;
        border: 1px solid #e8e8e8;
        background-color: #fff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 400;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
</style>
