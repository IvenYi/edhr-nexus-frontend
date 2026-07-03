<template>
  <div>
    <runCode v-if="runtimeCode" ref="runCodeComponent" :formData="formData" :CTX="Event.context" />
  </div>
</template>

<script setup lang="ts" name="gct-custom-code">
  import { ref, computed } from 'vue';
  import { CustomCode } from '/@page-designer/types/web';
  import { getVueComponentByCode } from '@gct/vue-editor';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{ widget: CustomCode; formData: Object }>();
  const Event = getPageEvent();
  const runCodeComponent = ref();
  const runtimeCode = props.widget.props.runtimeCode;
  const runCode = computed(() => {
    if (runtimeCode) {
      return getVueComponentByCode(runtimeCode);
    } else {
      return '';
    }
  });

  defineExpose({
    getCodeRender() {
      return runCodeComponent.value;
    },
  });
</script>

<style scoped lang="less"></style>
