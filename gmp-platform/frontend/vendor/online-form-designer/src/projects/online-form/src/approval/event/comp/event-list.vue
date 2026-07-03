<template>
  <div :class="[ns.b()]">
    <a-button :class="[ns.e('add')]" type="link" @click="addEvent">{{
      t('sys.pageDesigner.newEvents')
    }}</a-button>
    <div :class="[ns.e('container')]">
      <EventEditor
        v-for="(event, index) in eventList"
        :key="index"
        :class="[ns.e('container-item')]"
        v-model:value="eventList[index]"
        :support-action-types="supportActionTypes"
        :support-event-types="supportEventTypes"
        :disabled-types="calcDisabledTypes(event)"
        @remove="() => remove(event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="event-list">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IApprovalNodeEvent } from '../types';
  import { ApprovalEvent, ApprovalEventAction } from '../constant';
  import EventEditor from './event-editor.vue';

  const ns = useNamespace('event-list');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: IApprovalNodeEvent[];
      supportEventTypes?: ApprovalEvent[];
      supportActionTypes?: ApprovalEventAction[];
      getActionEditor?: (type: ApprovalEventAction) => any;
    }>(),
    {
      supportEventTypes: () => Object.values(ApprovalEvent),
      supportActionTypes: () => Object.values(ApprovalEventAction),
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IApprovalNodeEvent[]): void;
  }>();

  const eventList = computedEx({
    get: () => props.value || [],
    set: (value) => {
      emit('update:value', value);
    },
    deep: true,
  });

  const addEvent = () => {
    eventList.value.push({});
  };

  const remove = (event: IApprovalNodeEvent) => {
    const index = eventList.value.indexOf(event);
    eventList.value.splice(index, 1);
  };

  /** 计算需要禁用的类型 */
  const calcDisabledTypes = (event: IApprovalNodeEvent) => {
    const disableActions = eventList.value
      .filter(
        (e) =>
          e.actionType! && e.eventType === event.eventType && e.actionType !== event.actionType,
      )
      .map((e) => e.actionType!);
    const disabledEvents = eventList.value
      .filter(
        (e) => e.eventType && e.actionType === event.actionType && e.eventType !== event.eventType,
      )
      .map((e) => e.eventType!);
    return {
      eventType: disabledEvents,
      actionType: disableActions,
    };
  };
</script>

<style lang="scss" scoped>
  $event-list: (
    height: auto,
  );

  @include b(event-list) {
    @include set-component-css-var(event-list, $event-list);
    height: getCssVar(event-list, height);
    padding: 16px 12px 4px;

    @include e(add) {
      margin-bottom: 12px;
      height: 24px;
      padding: 0;
    }

    @include e(container-item) {
      background: #f2f4f7;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    // 统一压制ant
    :deep(.ant-btn) {
      font-size: 12px;
    }
    :deep(.ant-select) {
      font-size: 12px;
    }
    :deep(.ant-input) {
      font-size: 12px;
    }
    :deep(.ant-input-number-input) {
      font-size: 12px;
    }
    :deep(.ant-form-item-label > label) {
      font-size: 12px;
      &::before {
        margin-right: 2px;
      }
      &::after {
        content: '';
      }
    }
  }
</style>
