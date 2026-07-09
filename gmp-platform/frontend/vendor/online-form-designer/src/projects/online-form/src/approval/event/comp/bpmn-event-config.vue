<template>
  <div :class="[ns.b()]">
    <a-button :class="[ns.e('add')]" type="link" @click="addEvent" :disabled="bpmnReadonly">{{
      addLabel || t('sys.pageDesigner.newEvents')
    }}</a-button>
    <div :class="[ns.e('container')]">
      <EventEditor
        v-for="(event, index) in eventList"
        :key="index"
        :noEvent="noEvent"
        :class="[ns.e('container-item')]"
        :value="eventList[index]"
        @update:value="(v) => updateEvent(v, index)"
        :support-action-types="supportActionTypes"
        :support-event-types="supportEventTypes"
        :disabled-types="calcDisabledTypes(event)"
        @remove="() => remove(index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="bpmn-event-config">
  import { computedEx, useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IApprovalEventAction, IApprovalNodeEvent } from '../types';
  import { ApprovalEvent, ApprovalEventAction } from '../constant';
  import EventEditor from './event-editor.vue';
  import { computed, inject } from 'vue';
  import { SignatureTypeEnum } from '@gct/nocode-base';
  import { omit } from 'lodash-es';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const ns = useNamespace('bpmn-event-config');
  const { t } = useI18n() as any;

  type FlowEvent = {
    /**	事件标识 */
    key?: string;
    /**	执行资源配置 */
    executeResourceConfig?: any;
    /** 执行资源id */
    executeResourceId?: string;
    /** 执行资源类型（脚本/编排/内置/页面脚本) */
    executeResourceType?: string;
    /** 关联关系类型 */
    relationType?: string;
  };

  /** 解析执行资源配置 */
  function parseExecuteResourceConfig(event: FlowEvent) {
    if (
      event.executeResourceType === 'SYS_BUILTIN' &&
      event.executeResourceId === 'FILL_SIGN_FIELD'
    ) {
      const result: any = {
        fillSignFields: [],
      };
      // 解析配置数据
      if (event.executeResourceConfig) {
        try {
          //新数据格式是JSON字符串
          const config = JSON.parse(event.executeResourceConfig);
          Object.assign(result, config);
        } catch (e) {
          // 解析失败说明是老数据，是逗号分隔字符串
          result.fillSignFields = event.executeResourceConfig.split(',');
        }
      }
      if (!result.signatureType) {
        result.signatureType = SignatureTypeEnum.SIGNATURE_ONLY;
      }
      return result;
    }
    return {};
  }

  const props = withDefaults(
    defineProps<{
      value?: FlowEvent[];
      noEvent?: boolean;
      addLabel?: string;
      supportEventTypes?: ApprovalEvent[];
      supportActionTypes?: ApprovalEventAction[];
      getActionEditor?: (type: ApprovalEventAction) => any;
    }>(),
    {
      noEvent: false,
      supportEventTypes: () => Object.values(ApprovalEvent),
      supportActionTypes: () => Object.values(ApprovalEventAction),
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: FlowEvent[]): void;
  }>();

  const flowEvents = computedEx({
    get: () => props.value || [],
    set: (value) => {
      emit('update:value', value);
    },
    deep: true,
  });

  const eventList = computed(() => {
    if (!props.value) {
      return [];
    }
    return props.value.map((item) => {
      const result = {
        eventType: item.key,
      };
      if (
        item.executeResourceType === 'SYS_BUILTIN' &&
        item.executeResourceId === 'FILL_SIGN_FIELD'
      ) {
        const config = parseExecuteResourceConfig(item);
        Object.assign(result, {
          eventType: item.key,
          actionType: ApprovalEventAction.FillSignField,
          ...config,
        });
      } else if (item.executeResourceType === 'SCRIPT_SERVICE') {
        Object.assign(result, {
          eventType: item.key,
          actionType: ApprovalEventAction.ExecuteScript,
          executeFn: item.executeResourceId,
        });
      }
      return result as any;
    });
  });

  const updateEvent = (item: IApprovalEventAction, index: number) => {
    const result = {
      key: item.eventType,
      relationType: 'PROC_NODE_DEF',
    };
    if (item.actionType === ApprovalEventAction.FillSignField) {
      const configStr = JSON.stringify(omit(item, ['eventType', 'actionType']));
      Object.assign(result, {
        key: item.eventType,
        executeResourceConfig: configStr,
        executeResourceId: 'FILL_SIGN_FIELD',
        executeResourceType: 'SYS_BUILTIN',
      });
    } else if (item.actionType === ApprovalEventAction.ExecuteScript) {
      Object.assign(result, {
        key: item.eventType,
        executeResourceId: item.executeFn,
        executeResourceType: 'SCRIPT_SERVICE',
      });
    }
    if (!flowEvents.value[index]) {
      flowEvents.value.push(result);
    } else {
      Object.assign(flowEvents.value[index], result);
    }
  };

  const addEvent = () => {
    flowEvents.value.push({});
  };

  const remove = (index: number) => {
    flowEvents.value.splice(index, 1);
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
  $bpmn-event-config: (
    height: auto,
  );

  @include b(bpmn-event-config) {
    @include set-component-css-var(bpmn-event-config, $bpmn-event-config);
    height: getCssVar(bpmn-event-config, height);
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
