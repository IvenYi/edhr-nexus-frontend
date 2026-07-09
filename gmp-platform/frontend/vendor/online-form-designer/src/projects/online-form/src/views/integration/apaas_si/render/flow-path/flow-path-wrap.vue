<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('header')]">
      <a-button @click="handleCloseLog" type="link">
        <left-outlined class="mr-4px align-middle" />
        {{ t('sys.onlineForm.backToForm') }}
      </a-button>
    </div>
    <div :class="[ns.e('body')]">
      <FormBpmnRuntime :of-inst-id="formIns.id!" :modelKey="formIns.modelKey!"/>
    </div>
  </div>
</template>

<script lang="ts" setup name="flow-path-wrap">
  import { useNamespace } from '@gct/runtime';
  import { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FormBpmnRuntime from '/@/components/BpmnRuntime/form/index.vue';

  const ns = useNamespace('flow-path-wrap');
  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      formIns: OnlineFormInstanceResponse;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const handleCloseLog = () => {
    emit('close');
  };
</script>

<style lang="scss" scoped>
  $flow-path-wrap: ();

  @include b(flow-path-wrap) {
    @include set-component-css-var(flow-path-wrap, $flow-path-wrap);
    position: relative;
    height: 100%;
    width: 100%;

    @include e(header) {
      padding-top: 13px;
      padding-bottom: 16px;
      padding-left: 8px;
    }

    @include e(body) {
      padding: 0 24px 29px;
      height: calc(100% - 61px);
    }
  }
</style>
