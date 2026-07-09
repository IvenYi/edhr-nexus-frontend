<template>
  <div class="item-container">
    <div class="title-area">
      <span class="title">{{ title }}</span>
      <div class="subtitle-area" v-if="subtitle">
        <span class="subtitle">{{ subtitle }}</span>
      </div>
      <div class="add-btn" v-if="userGroupUsePerms.Insert" @click="() => $emit('notify', type)">
        <PlusOutlined />
        {{ t('sys.appDesigner.add') }}
      </div>
    </div>
    <div class="item-area" :style="containerStyle">
      <slot name="item-area"></slot>
    </div>
  </div>
</template>
<script setup lang="ts" name="item-container">
  import { RelationTypeEnum } from '../../constant/interface';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRole } from '../../hooks/useRole';
  import type { CSSProperties } from 'vue';

  const { t } = useI18n();

  interface Props {
    title: string;
    subtitle?: string;
    containerStyle?: CSSProperties;
    filterButton?: any;
    type?: RelationTypeEnum;
  }

  defineProps<Props>();

  defineEmits(['notify']);

  const { userGroupUsePerms } = useRole();
</script>
<style lang="less" scoped>
  .item-container {
    position: relative;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    flex: 1;
    .title-area {
      position: relative;
      padding: 20px 16px 8px 20px;
      position: relative;
      display: flex;
      align-items: center;
      .title {
        display: inline-block;
        color: #333;
        line-height: 24px;
        font-size: 18px;
        font-weight: 400;
      }

      .subtitle-area {
        position: relative;
        display: flex;
        align-items: center;
        padding-left: 8px;
        &::before {
          content: '';
          position: absolute;
          width: 1px;
          height: 14px;
          background: #eaeaea;
        }
        .subtitle {
          display: inline-block;
          color: #666666;
          font-weight: 400;
          line-height: 18px;
          padding-left: 8px;
        }
      }

      .add-btn {
        position: relative;
        margin-left: 8px;
        padding-left: 8px;
        color: var(--ant-primary-color);
        cursor: pointer;
        &::before {
          content: '';
          position: absolute;
          width: 1px;
          height: 14px;
          background: #eaeaea;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }
    .item-area {
      padding: 10px 16px 16px 20px;
      background-color: #fff;
      border-bottom: 1px solid #eaeaea;
      height: 100%;
    }

    &:last-child {
      .item-area {
        border-bottom: 0;
      }
    }
  }
</style>
