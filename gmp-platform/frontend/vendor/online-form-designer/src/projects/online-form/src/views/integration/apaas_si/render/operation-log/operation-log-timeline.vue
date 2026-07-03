<template>
  <Timeline :items="items" v-model:selected-id="selectedId" :class="[ns.b()]">
    <template #default="{ item }">
      <div :class="[ns.e('item')]">
        <div :class="[ns.e('item-title')]">{{ item.title }}</div>
        <div :class="[ns.e('item-time')]">{{ item.data.createTime }}</div>
        <div :class="[ns.e('users')]">
          <template v-if="item.data.logUsers.length === 1">
            <Avatar
              :class="[ns.e('avatar')]"
              :name="item.data.logUsers[0].fullName"
              :avatar="item.data.logUsers[0].avatar"
            />

            <div>
              <div v-if="item.data.logUsers[0].opinion" :class="[ns.e('reason')]">
                <span :class="[ns.e('label')]">{{ getReasonLabel(item.changeType) }}：</span>
                <div :class="[ns.e('value')]">{{ item.data.logUsers[0].opinion }}</div>
              </div>
              <div v-if="item.data.remark" :class="[ns.e('reason'), 'mt-2px']">
                <span :class="[ns.e('label')]">{{ t('sys.notes') }}：</span>
                <div :class="[ns.e('value')]">{{ item.data.remark }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="item.data.logUsers.length === 2">
            <Avatar
              :class="[ns.e('avatar')]"
              :name="item.data.logUsers[0].fullName"
              :avatar="item.data.logUsers[0].avatar"
            />
            <i :class="[ns.e('arrow'), 'iconfont', 'icon-a-Rightarrow']"></i>
            <Avatar
              :class="[ns.e('avatar')]"
              :name="item.data.logUsers[1].fullName"
              :avatar="item.data.logUsers[1].avatar"
            />
            <div>
              <div v-if="item.data.logUsers[0].opinion" :class="[ns.e('reason')]">
                <span :class="[ns.e('label')]">{{ getReasonLabel(item.changeType) }}：</span>
                <div :class="[ns.e('value')]">{{ item.data.logUsers[0].opinion }}</div>
              </div>
              <div v-if="item.data.remark" :class="[ns.e('reason'), 'mt-2px']">
                <span :class="[ns.e('label')]">{{ t('sys.notes') }}：</span>
                <div :class="[ns.e('value')]">{{ item.data.remark }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </Timeline>
</template>

<script lang="ts" setup name="operation-log-timeline">
  import { useNamespace } from '@gct/runtime';
  import Timeline from '/@/components/Timeline/timeline.vue';
  import { computed, ref, watch } from 'vue';
  import Avatar from '/@/components/Avatar/avatar.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ChangeType } from '../annotation/use-annotation';
  import { OnlineFormLogResponse } from '/@/apis/gct-apaas/model';

  const ns = useNamespace('operation-log-timeline');

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      logs: Array<OnlineFormLogResponse>;
      selectedId?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:selectedId', value?: string): void;
  }>();

  const items = computed(() => {
    return props.logs.map((item) => {
      console.log('log', item);
      let title = $t('sys.onlineForm.unknown');
      let color = 'var(--ant-primary-color)';
      if (item.buttonConfig) {
        const json = JSON.parse(item.buttonConfig);
        title = json.title;
        color = json.color;
      }
      return {
        id: item.id!,
        color: color,
        title: title,
        data: item,
        changeType: item.btnType,
      };
    });
  });

  const selectedId = computed({
    get: () => props.selectedId,
    set: (value) => emit('update:selectedId', value),
  });

  const getReasonLabel = (changeType) => {
    switch (changeType) {
      case ChangeType.Abandon:
        return t('sys.onlineForm.formAbandonReason');
      case ChangeType.Form:
        return t('sys.onlineForm.formChangeReason');
      default:
        return t('sys.appDesigner.approval.opinion');
    }
  };
</script>
<style lang="scss" scoped>
  $operation-log-timeline: (
    height: auto,
  );

  @include b(operation-log-timeline) {
    @include set-component-css-var(operation-log-timeline, $operation-log-timeline);
    height: getCssVar(operation-log-timeline, height);
    // width: 421px;

    @include e(item) {
      :deep(.ant-timeline-item-content) {
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px 4px 4px 4px;
        border: 1px solid #e8ebf0;
      }
    }

    @include e(item) {
      padding: 8px 12px;
    }

    @include e(item-title) {
      font-weight: 500;
      font-size: 16px;
      color: #000000;
      line-height: 22px;
    }

    @include e(item-time) {
      font-weight: 400;
      font-size: 12px;
      color: #8f8f8f;
      line-height: 14px;
      margin-bottom: 8px;
    }

    @include e(users) {
      display: flex;
      align-items: center;
    }

    @include e(avatar) {
      // 相邻的间距
      & ~ & {
        padding-left: 20px;
      }
    }

    @include e(reason) {
      display: flex;
    }

    @include e(label) {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
      margin-left: 8px;
      flex: 0 0 auto;
    }

    @include e(value) {
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 18px;
    }

    @include e(arrow) {
      color: #797a7d;
      margin-left: 20px;
    }
  }
</style>
