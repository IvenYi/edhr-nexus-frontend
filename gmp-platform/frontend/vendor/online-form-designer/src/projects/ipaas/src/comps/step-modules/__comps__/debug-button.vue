<template>
  <a-button
    :loading="loading"
    type="primary"
    size="small"
    class="w100% mt20px"
    :disabled="disabled || debugNodeInfo.completed === 1"
    @click="onConfigDebugger"
  >
    {{ $t('sys.ipaas.debugPreview') }}
  </a-button>
</template>
<script setup lang="ts">
  import DebugConfigModal from './debug-config-modal.vue';
  import { useFlow } from '../../../hooks/useFlow';
  import { ref } from 'vue';

  const props = defineProps<{
    nodeId: string;
    disabled?: boolean;
  }>();

  const { createDebugContext, debugNodeInfo } = useFlow();
  const loading = ref(false);

  const onConfigDebugger = async () => {
    const res: any = await gct.openUtil.modal(
      DebugConfigModal,
      {},
      {
        title: $t('sys.ipaas.debugParamConfig'),
        width: 640,
        okText: $t('sys.okText'),
      },
    );
    if (res.ok) {
      loading.value = true;
      const { config } = res.params;
      console.log('config', config);
      await createDebugContext(props.nodeId, config).finally(() => {
        loading.value = false;
      });
    }
  };
</script>
<style lang="less" scoped></style>
