<template>
  <div :class="[ns.b()]">
    <EventList v-model:value="localValue" :support-event-types="NodeEventTypesMap[nodeType]" />
  </div>
</template>

<script lang="ts" setup name="event-config">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { ApprovalEventAction, EventList } from '/@online-form/approval';
  import { computed } from 'vue';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import { NodeEventTypesMap } from '../constant';

  const ns = useNamespace('event-config');
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
  };

  const props = withDefaults(
    defineProps<{
      value?: FlowEvent[];
      nodeType: BpmnNodeTypeEnum;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: FlowEvent[]): void;
  }>();

  const localValue = computed({
    get() {
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
          Object.assign(result, {
            eventType: item.key,
            actionType: ApprovalEventAction.FillSignField,
            fillSignFields: item.executeResourceConfig ? item.executeResourceConfig.split(',') : [],
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
    },
    set(v) {
      if (v === undefined) {
        emit('update:value', []);
        return;
      }
      const emitVal = v.map((item) => {
        const result = {
          key: item.eventType,
        };
        if (item.actionType === ApprovalEventAction.FillSignField) {
          Object.assign(result, {
            key: item.eventType,
            executeResourceConfig: item.fillSignFields?.join(','),
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
        return result;
      });
      emit('update:value', emitVal);
    },
  });
</script>

<style lang="scss" scoped>
  $event-config: (
    height: auto,
  );

  @include b(event-config) {
    @include set-component-css-var(event-config, $event-config);
    height: getCssVar(event-config, height);
  }
</style>
