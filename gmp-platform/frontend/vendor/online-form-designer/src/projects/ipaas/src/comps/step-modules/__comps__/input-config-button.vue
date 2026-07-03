<template>
  <a-button
    size="small"
    class="mt12px w100%"
    :type="isPrimary ? 'primary' : 'default'"
    @click="onConfig"
  >
    {{
      props.readonly ? $t('sys.ipaas.viewInputParamsConfig') : $t('sys.ipaas.paramsStructureConfig')
    }}
  </a-button>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import InputConfigModal from './input-config-modal.vue';
  import { cloneDeep, pick } from 'lodash-es';

  const props = defineProps<{
    form: any;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:form']);

  const isPrimary = computed(() => {
    return (
      props.form?.metaHeader || props.form?.metaBody || props.form?.metaQuery || props.form?.metaUri
    );
  });

  const onConfig = async () => {
    const res: any = await gct.openUtil.modal(
      InputConfigModal,
      {
        ...cloneDeep(pick(props.form, ['metaHeader', 'metaBody', 'metaQuery', 'metaUri'])),
        readonly: props.readonly,
      },
      {
        title: window.$t('sys.ipaas.paramsStructureConfig'),
        width: 800,
        okText: window.$t('sys.okText'),
      },
    );
    if (res.ok) {
      emit('update:form', {
        ...props.form,
        ...(res.params ?? {}),
      });
    }
  };
</script>
<style lang="less" scoped></style>
