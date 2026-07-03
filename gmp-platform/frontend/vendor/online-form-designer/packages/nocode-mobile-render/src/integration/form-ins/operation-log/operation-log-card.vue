<template>
  <div :class="['operation-log-card']">
    <div :class="['operation-log-card__title']">{{ item.title }}</div>
    <div :class="['operation-log-card__time']">{{ item.data.createTime }}</div>
    <div :class="['operation-log-card__users']">
      <template v-if="item.data.logUsers.length === 1">
        <Avatar
          :class="['operation-log-card__avatar']"
          :name="item.data.logUsers[0].fullName"
          :avatar="item.data.logUsers[0].avatar"
        />

        <div v-if="item.data.logUsers[0].opinion" :class="['operation-log-card__reason']">
          <span :class="['operation-log-card__label']"
            >{{ getReasonLabel(item.changeType) }}：</span
          >
          <div :class="['operation-log-card__value']">{{ item.data.logUsers[0].opinion }}</div>
        </div>
      </template>
      <template v-else-if="item.data.logUsers.length === 2">
        <Avatar
          :class="['operation-log-card__avatar']"
          :name="item.data.logUsers[0].fullName"
          :avatar="item.data.logUsers[0].avatar"
        />
        <i :class="['operation-log-card__arrow', 'iconfont', 'icon-a-Rightarrow']"></i>
        <Avatar
          :class="['operation-log-card__avatar']"
          :name="item.data.logUsers[1].fullName"
          :avatar="item.data.logUsers[1].avatar"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup name="operation-log-card">
  import { i18n } from '@mobile/locales/setupI18n';
  import Avatar from '../../../components/_common_/avatar/avatar.vue';
  import { ChangeType } from './types';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      item: any;
    }>(),
    {},
  );

  const getReasonLabel = (changeType) => {
    return changeType === ChangeType.Abandon
      ? t('sys.onlineForm.formAbandonReason')
      : t('sys.appDesigner.approval.opinion');
  };
</script>

<style lang="less" scoped>
  .operation-log-card {
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #e8ebf0;

    &__title {
      font-weight: 500;
      font-size: 16px;
      color: #000000;
      line-height: 22px;
    }

    &__time {
      font-weight: 400;
      font-size: 12px;
      color: #8f8f8f;
      line-height: 14px;
      margin-bottom: 8px;
    }

    &__users {
      display: flex;
      align-items: center;
    }

    &__avatar {
      // 相邻的间距
      & ~ & {
        padding-left: 20px;
      }
    }

    &__reason {
      display: flex;
    }

    &__label {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
      margin-left: 8px;
      flex: 0 0 auto;
    }

    &__value {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
    }

    &__arrow {
      color: #797a7d;
      margin-left: 20px;
    }
  }
</style>
