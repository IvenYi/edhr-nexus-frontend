<template>
  <van-dialog
    :show="show"
    v-bind="dialogProps"
    title="流程路径查看"
    width="fit-content"
    :show-cancel-button="false"
    @cancel="onCancel"
    @confirm="onOk"
  >
    <div class="flex flex-col h-80vh w-80vw sign-switcher-modal">
      <FormBpmnRuntime :of-inst-id="basicIns.key!" :modelKey="basicIns.modelKey!" />
    </div>
  </van-dialog>
</template>

<script setup lang="ts" name="user-select-popup">
  import { ref } from 'vue';
  import FormBpmnRuntime from '/@/components/BpmnRuntime/form/index.vue';
  import { IBasicInfoItem } from '@gct/nocode-base';

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      basicIns: IBasicInfoItem;
      dialogProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  /** 执行关闭操作 */
  const doClose = (data?: any) => {
    const isClosed = props.beforeClose(data);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    const data = {};
    doClose(data);
  };
</script>

<style lang="less" scoped>
  .user-select-popup {
  }
</style>
