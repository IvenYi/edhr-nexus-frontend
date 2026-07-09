<template>
  <div class="operation-config-triggers py-4 flex">
    <!-- 开启sn流转 -->
    <div v-if="computedSnEnabled" class="mr-12">
      <template v-if="snCheckVisible">
        <a-checkbox
          :checked="localFormData.split_sn_enabled_"
          :disabled="readonlyEnabled"
          @change="(e) => emit('update:split-sn', e.target.checked)"
        >
          {{ $t('sys.edhr.splitSnEnabledTip') }}
        </a-checkbox>
      </template>
      <template v-if="!snCheckVisible && splitSnNode">
        <span v-if="splitSnNode?.routing_operation_id_ === currentOperation?.routing_operation_id_">
          {{ $t('sys.edhr.splitSnEnabledTip') }}
        </span>
        <span v-else>
          {{ $t('sys.edhr.splitSnEnabledTip2', { sth: `【${splitSnNode?.name_}】` }) }}
        </span>
      </template>
    </div>

    <!-- 事件触发事务（详情状态不展示，通过下方的切换器能识别是否开启） -->
    <div class="mr-12" v-if="computedTriggerTxnEnabled && !readonlyEnabled">
      <a-checkbox
        :checked="localFormData.trigger_txn_enabled_"
        @change="(e) => emit('update:trigger-txn', e.target.checked)"
        :disabled="readonlyEnabled"
      >
        {{ $t('sys.edhr.triggerTxnEnabledTip') }}
      </a-checkbox>
    </div>

    <!-- 事务校验配置 -->
    <div class="mr-12" v-if="!readonlyEnabled">
      <a-checkbox
        :checked="localFormData.operation_before_txn_check_enabled_"
        @change="(e) => emit('update:txn-check', e.target.checked)"
        :disabled="readonlyEnabled"
      >
        <span>{{ $t('sys.edhr.txnCheckTip') }}</span>
        <a-tooltip :title="$t('sys.edhr.txnCheckTip2')" placement="top">
          <info-circle-outlined class="explain-icon ml5px" />
        </a-tooltip>
      </a-checkbox>
    </div>

    <!-- 配置最终产后工序 -->
    <div v-if="computedFinalOutputEnabled" class="mr-12">
      <template v-if="finalOutputCheckVisible">
        <a-checkbox
          :checked="localFormData.final_output_bool_"
          @change="(e) => emit('update:final-output', e.target.checked)"
          :disabled="readonlyEnabled"
        >
          <span>{{ $t('sys.edhr.finalOutputBoolTip') }}</span>
          <a-tooltip :title="$t('sys.edhr.finalOutputBoolTip2')" placement="top">
            <info-circle-outlined class="explain-icon ml5px" />
          </a-tooltip>
        </a-checkbox>
      </template>
      <template v-else-if="!finalOutputCheckVisible && finalOutputNode">
        <a-tooltip
          v-if="finalOutputNode?.routing_operation_id_ === currentOperation?.routing_operation_id_"
          :title="$t('sys.edhr.finalOutputBoolTip2')"
          placement="top"
        >
          <span>{{ $t('sys.edhr.finalOutputBoolTip') }}</span>
          <info-circle-outlined class="explain-icon ml5px" />
        </a-tooltip>
        <span v-else>
          {{ $t('sys.edhr.finalOutputBoolTip1', { sth: `【${finalOutputNode?.name_}】` }) }}
        </span>
      </template>
    </div>

    <!-- 并行工艺:前置执行 -->
    <div class="mr-12" v-if="computedPreExecuteEnabled && !readonlyEnabled">
      <a-checkbox
        :checked="localFormData.operation_advance_execution_enabled_"
        @change="(e) => emit('update:pre-execute', e.target.checked)"
        :disabled="readonlyEnabled"
      >
        <span>{{ $t('sys.edhr.preExecuteTip') }}</span>
        <a-tooltip :title="$t('sys.edhr.preExecuteTip2')" placement="top">
          <info-circle-outlined class="explain-icon ml5px" />
        </a-tooltip>
      </a-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts" name="operation-trigger">
  import { computed } from 'vue';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  import { isParallelNode } from '../composable/useWorkflowNodes';

  interface Props {
    formData: any;
    readonlyEnabled: boolean;
    computedSnEnabled?: boolean;
    snCheckVisible?: boolean;
    splitSnNode?: any;
    computedFinalOutputEnabled?: boolean;
    finalOutputCheckVisible?: boolean;
    finalOutputNode?: any;
    computedTriggerTxnEnabled?: boolean;
    currentOperation?: any;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:split-sn', value: boolean): void;
    (e: 'update:trigger-txn', value: boolean): void;
    (e: 'update:final-output', value: boolean): void;
    (e: 'update:txn-check', value: boolean): void;
    (e: 'update:pre-execute', value: boolean): void;
  }>();

  const localFormData = computed(() => props.formData);

  /** 非并行节点不能配置提前执行*/
  const computedPreExecuteEnabled = computed(() => {
    if (!props.currentOperation) {
      return false;
    }
    return isParallelNode(props.currentOperation);
  });
</script>

<style lang="less" scoped>
  .operation-config-triggers {
    border-bottom: 1px solid #d9d9d9;
    .explain-icon {
      color: var(--ant-primary-color) !important;
    }
  }
</style>
