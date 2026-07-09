<template>
  <div :class="ns.b()">
    <ButtonStyleEditor
      v-model:value="formData"
      ref="formRef"
      :isSaveButton="isSaveButton"
      :noControlConfig="noControlConfig"
  /></div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { ref } from 'vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { pickBy } from 'lodash-es';
  import ButtonStyleEditor from './button-style-editor.vue';
  import type { IGctBpmnNodeStyleConfig } from '@gct/flow/src/plugins/bpmn/types';

  const ns = useNamespace('button-style-modal');

  const props = defineProps<{
    data?: IGctBpmnNodeStyleConfig;
    isSaveButton?: boolean;
    noControlConfig?: boolean;
  }>();

  const formData = ref(props.data);

  useModal(async () => {
    const editedData = pickBy(formData.value, (v) => v !== undefined);
    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
      data: [editedData],
    };
  });
</script>

<style lang="scss" scoped>
  @include b(button-style-modal) {
    padding-top: 12px;
  }
</style>
