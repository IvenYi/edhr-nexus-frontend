<template>
  <div>
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical" :rules="rules">
      <a-form-item label="cron表达式" name="cronPattern">
        <a-input
          v-model:value="formState.cronPattern"
          @input="handleCronPatternInput"
          :disabled="readonly"
        />
      </a-form-item>
      <a-form-item :label="$t('sys.ipaas.expExample')">
        <div class="text-12px">
          <pre>{{ tips }}</pre>
          <h4>{{ $t('sys.ipaas.symbol') }}：*</h4>
          <p>{{ $t('sys.ipaas.expExampleTip1') }}</p>

          <h4>{{ $t('sys.ipaas.symbol') }}：,</h4>
          <p>{{ $t('sys.ipaas.expExampleTip2') }}</p>

          <h4>{{ $t('sys.ipaas.symbol') }}：-</h4>
          <p>{{ $t('sys.ipaas.expExampleTip3') }}</p>

          <h4>{{ $t('sys.ipaas.symbol') }}：/</h4>
          <p>{{ $t('sys.ipaas.expExampleTip4') }}</p>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { reactive, ref, onBeforeUnmount, onMounted, computed } from 'vue';
  import type { NodeDataSchema, NodeBizDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import type { GctFlowNode } from '@gct/flow';
  import { getFlowExtValidCron } from '/@/apis/gct-ipaas2/FlowExtController';
  // import { useValidate } from '/@ipaas/hooks/useValidator';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Trigger;
    readonly: boolean;
  }>();

  const tips =
    `* * * * * * [${$t('sys.ipaas.optional')}]\n` +
    '- - - - - -\n' +
    '| | | | | |\n' +
    `| | | | | +--- ${$t('sys.ipaas.weekDay')}[0-6][${$t('sys.ipaas.sun')}=0]\n` +
    `| | | | +----- ${$t('sys.ipaas.month')}[1-12]\n` +
    `| | | +------- ${$t('sys.ipaas.date')}[1-31]\n` +
    `| | +--------- ${$t('sys.component.time.hours')}[0-23]\n` +
    `| +----------- ${$t('sys.component.time.minutes')}[0-59]\n` +
    `+------------- ${$t('sys.component.time.seconds')}[0-59][${$t('sys.ipaas.optionalField')}]`;

  const formRef = ref();
  // const formState = reactive<NodeBizDataSchema.Cron['nodeConfig']>(
  //   props.nodeData.bizData.nodeConfig,
  // );
  const formState = computed<NodeBizDataSchema.Cron['nodeConfig']>({
    get() {
      return props.nodeData.bizData.nodeConfig as any;
    },
    set(val) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig = val;
    },
  });

  const rules = {
    cronPattern: [
      {
        required: true,
        message: $t('sys.ipaas.pleaseEnterCronExp'),
      },
      {
        validator: validateCron,
        trigger: 'blur',
      },
    ],
  };

  // useValidate(formRef, props);

  const handleCronPatternInput = () => {
    formState.value.isValid = false;
  };

  async function validateCron(rule, value) {
    if (!value || !value.trim()) {
      return;
    }
    const res: any = await getFlowExtValidCron({ cron: value });
    if (!res?.result) {
      formState.value.isValid = false;
      return Promise.reject($t('sys.ipaas.cronExpErrorTip'));
    }
    formState.value.isValid = true;
    return Promise.resolve();
  }
</script>

<style lang="less" scoped>
  h4 {
    margin-bottom: 2px;
  }
</style>
