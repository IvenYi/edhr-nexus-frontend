<template>
  <form-item :label="t('sys.appDesigner.approval.nodeKey')" is-first>
    {{ formState!.key }}
  </form-item>
  <form-item
    :label="t('sys.appDesigner.approval.nodeName')"
    name="name"
    :inline="false"
    :rules="[
      {
        required: true,
        message: t('sys.notEmptySth', { sth: t('sys.appDesigner.approval.nodeName') }),
      },
    ]"
  >
    <i18n-select-input
      attr="i18nKey"
      :i18nConfig="formState.i18n"
      :btnHeight="'24px'"
      :btnWidth="'26px'"
      @on-i18n-select="handleI18nSelect"
    >
      <template #i18n-input>
        <a-input
          style="width: calc(100% - 26px); height: 24px"
          v-model:value="formState.name"
          :placeholder="t('sys.inputText')"
          :maxlength="32"
          :disabled="bpmnReadonly"
          show-count
          size="small"
        />
      </template>
    </i18n-select-input>
  </form-item>
  <form-item :label="t('sys.appDesigner.approval.nodeDesc')" :inline="false" name="description">
    <a-textarea
      v-model:value="formState!.description"
      size="small"
      :maxlength="120"
      show-count
      :rows="3"
      :disabled="bpmnReadonly"
      :placeholder="t('sys.inputText')"
    />
  </form-item>
</template>
<script setup lang="ts">
  import FormItem from './form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, inject } from 'vue';
  import type { IGctBpmnNodeDefinition } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { I18nSelectInput } from '/@/components/I18nSelect';

  const props = defineProps<{
    data?: IGctBpmnNodeDefinition;
  }>();

  const { t } = useI18n();
  const bpmnReadonly = inject('bpmnReadonly ', false);

  const formState = computed({
    get() {
      return props.data;
    },
    set(value) {
      Object.assign(props.data ?? {}, value);
    },
  });

  const handleI18nSelect = (params) => {
    formState.value!.i18n = JSON.stringify(params);
  };
</script>
<style lang="less" scoped></style>
