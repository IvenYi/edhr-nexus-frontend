<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('type-container')]">
      <a-form :model="local" :class="[ns.e('type-form')]" :label-col="{ style: 'width: 36px;' }">
        <a-form-item v-if="!noEvent" :label="$t('sys.edhr.event')" required>
          <a-select
            class="w-full"
            v-model:value="local.eventType"
            :options="eventTypeOptions"
            :placeholder="t('sys.inputText')"
            :disabled="bpmnReadonly"
          />
        </a-form-item>
        <a-form-item :label="$t('sys.edhr.action')" required>
          <a-select
            class="w-full"
            v-model:value="local.actionType"
            :options="actionTypeOptions"
            :placeholder="t('sys.inputText')"
            :disabled="bpmnReadonly"
          />
        </a-form-item>
        <div ref="typeFormFooter" :id="typeFormFooterId"></div>
      </a-form>
      <i
        v-if="!bpmnReadonly"
        :class="['iconfont icon-shanchu2', ns.e('remove')]"
        @click="() => emit('remove')"
      ></i>
    </div>
    <component
      :class="[ns.e('action')]"
      v-if="typeFormFooter && value?.actionType"
      :is="getActionEditor!(value.actionType)"
      v-model:value="local"
    />
  </div>
</template>

<script lang="ts" setup name="event-editor">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IApprovalNodeEvent } from '../types';
  import { ApprovalEvent, ApprovalEventAction, getApprovalEventActionMap } from '../constant';
  import { computed, inject, provide, ref } from 'vue';
  import { getActionEditorByType } from '../logic';
  import { uuid2 } from '/@/utils/uuid';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const ns = useNamespace('event-editor');
  const { t } = useI18n() as any;

  const typeFormFooterId = 'typeFormFooterId' + uuid2(32);

  provide('typeFormFooterId', typeFormFooterId);

  const typeFormFooter = ref<HTMLElement | null>(null);

  const props = withDefaults(
    defineProps<{
      value: IApprovalNodeEvent;
      supportEventTypes: ApprovalEvent[];
      supportActionTypes: ApprovalEventAction[];
      disabledTypes: {
        eventType: ApprovalEvent[];
        actionType: ApprovalEventAction[];
      };
      noEvent?: boolean;
      getActionEditor?: (type: ApprovalEventAction) => any;
    }>(),
    {
      value: undefined,
      disabledTypes: () => ({
        eventType: [],
        actionType: [],
      }),
      getActionEditor: getActionEditorByType,
    },
  );

  const emit = defineEmits<{
    (e: 'remove'): void;
    (e: 'update:value', value: IApprovalNodeEvent): void;
  }>();

  const local = computedEx({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
    deep: true,
  });

  const eventTypeOptions = computed(() => {
    return props.supportEventTypes.map((eventType) => ({
      label: $t(`sys.appDesigner.approval.event.${eventType}`),
      value: eventType,
      disabled: props.disabledTypes.eventType.includes(eventType),
    }));
  });

  const actionTypeOptions = computed(() => {
    return props.supportActionTypes.map((actionType) => ({
      label: getApprovalEventActionMap()[actionType],
      value: actionType,
      disabled: props.disabledTypes.actionType.includes(actionType),
    }));
  });
</script>

<style lang="scss" scoped>
  $event-editor: (
    height: auto,
  );

  @include b(event-editor) {
    @include set-component-css-var(event-editor, $event-editor);

    @include e(type-container) {
      display: flex;
      align-items: center;
      padding: 8px 0 8px 4px;
      border-radius: 4px;
      background: #fff;
    }

    @include e(type-form) {
      flex-grow: 1;

      &.ant-form {
        :deep(.ant-form-item) {
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }

    @include e(remove) {
      padding: 0 4px;
      color: #333;
      cursor: pointer;
    }

    position: relative;
    width: 100%;
    height: getcssvar(event-editor, height);
    padding: 8px;
  }
</style>
