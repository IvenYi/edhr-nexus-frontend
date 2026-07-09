<template>
  <div>
    <runCode v-if="runCode" />
    <div class="h120px bg-[#FCFCFD] text-[#C3C3C3] ks-row-center-middle gct-border-dashed" v-else>
      Vue3 内容占位
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-custom-code">
  import { toRefs, computed } from 'vue';
  import { CustomCode } from '/@page-designer/types/web';
  import { getVueComponentByCode } from '@gct/vue-editor';

  const props = defineProps<{ widget: CustomCode }>();

  const runCode = computed(() => {
    const runtimeCode = props.widget.props.runtimeCode;
    if (runtimeCode) {
      return getVueComponentByCode(runtimeCode);
    } else {
      return '';
    }
  });
</script>

<style scoped lang="less"></style>
