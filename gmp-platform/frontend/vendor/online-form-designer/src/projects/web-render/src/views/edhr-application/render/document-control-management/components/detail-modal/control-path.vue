<template>
  <div class="absolute top-0px left-0px z-10 bg-[#ffffff] h100% w100%">
    <div class="pt13px pb16px pl8px">
      <a-button @click="emit('on-close')" type="link">
        <left-outlined class="mr-4px align-middle" />
        {{ $t('sys.onlineForm.backToForm') }}
      </a-button>
    </div>
    <DocControlBpmnRuntime :tmplId="tmplId" />
  </div>
</template>
<script setup lang="ts">
  import DocControlBpmnRuntime from '/@/components/BpmnRuntime/doc-control/index.vue';

  defineProps<{
    tmplId: string;
  }>();

  const emit = defineEmits(['on-close']);
</script>
<style lang="less" scoped></style>
