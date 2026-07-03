<template>
  <a-button type="primary" size="small" class="w100% mt12px" ghost @click="onConfigParams">
    {{ readonly ? $t('sys.ipaas.viewParamsConfig') : $t('sys.ipaas.paramsConfig') }}
  </a-button>
</template>
<script setup lang="ts">
  import ParamsConfigModal from './params-config-modal.vue';

  const props = defineProps<{
    readonly?: boolean;
    form: any;
    type?: 'input' | 'output';
    hideTabs?: Array<'path' | 'query' | 'header' | 'body'>;
  }>();

  const onConfigParams = async () => {
    const res: any = await gct.openUtil.modal(
      ParamsConfigModal,
      {
        form: props.form,
        readonly: props.readonly,
        type: props.type ?? 'output',
        hideTabs: props.hideTabs ?? [],
      },
      {
        title: $t('sys.ipaas.paramsConfig'),
        width: 800,
        okText: $t('sys.okText'),
      },
    );
    if (res.ok) {
      Object.assign(props.form, res.params || {});
    }
  };
</script>
<style lang="less" scoped></style>
