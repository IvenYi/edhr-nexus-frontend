<template>
  <div>
    <a-form :model="formState" layout="vertical">
      <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
        <NodeBasicInfo :data="node.data" />
      </SimpleCollapse>
      <SimpleCollapse :title="$t('sys.onlineForm.noticeConfig')">
        <form-item required :label="$t('sys.onlineForm.noticeUsers')" :inline="false" is-first>
          <approval-user-select-config
            v-model:modelValue="formState!.targetUserConfig"
            :disabled="paasBpmnReadonly"
            :placeholder="$t('sys.onlineForm.selectUsersTip')"
          />
        </form-item>
        <div class="relative"> </div>
        <form-item
          required
          :label="$t('sys.onlineForm.noticeContent')"
          :inline="false"
          class="relative"
        >
          <div v-show="!paasBpmnReadonly" class="field-select-wrap">
            <FieldSearchCascader
              ref="fieldSearchRef"
              v-model:value="cascadeValue"
              :modelKey="processInfo.modelKey"
              noShowName
              :btnTitle="$t('sys.component.dataConnection.modelField.transaction')"
              :filterFunc="fieldFilterFunc"
              @update:value="updateValue"
            />
          </div>
          <a-textarea
            v-model:value="formState!.msgContentConfig!.contentName"
            class="msg-content"
            :rows="6"
            :disabled="paasBpmnReadonly"
          />
        </form-item>
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, provide, ref } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import FormItem from '../../components/form-item.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import approvalUserSelectConfig from '/@app-designer/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldSearchCascader } from '/@/components/FieldSearchCascader';
  import { useProcess } from '../../hook/useProcess';

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);

  const { processInfo } = useProcess();

  const { t } = useI18n();

  const props = defineProps<{
    node: GctBpmnNode.BpmnMessage;
  }>();

  const cascadeValue = ref();

  const formState: any = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const updateValue = (val, info) => {
    console.log('updateValue', info);
    handleFieldChange(info);
  };

  function handleFieldChange(item) {
    if (!formState.value?.msgContentConfig?.placeholder.some((n) => n.key === item.key)) {
      formState.value?.msgContentConfig?.placeholder.push({
        type: item.type,
        key: item.key,
        name: item.name,
      });
    }
    const text = '${' + item.name + '}';
    const textarea: any = document.querySelector('.msg-content');
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;

    const value = formState.value?.msgContentConfig?.contentName || '';
    const beforeText = value.substring(0, startPos);
    const afterText = value.substring(endPos);
    const newText = beforeText + text + afterText;
    formState.value!.msgContentConfig!.contentName = newText;
  }

  const fieldFilterFunc = (item: any) => {
    return [
      'code_',
      'txn_no_',
      'txn_definition_id_',
      'status_',
      'operation_id_',
      'container_id_source_',
      'view_range_',
      'product_id_',
      'name_',
      'spec_',
      'create_user_id_',
      'create_time_',
      'modify_user_id_',
      'modify_time_',
    ].includes(item.key);
  };
</script>

<style lang="less" scoped>
  .field-select-wrap {
    position: absolute;
    right: 0;
    top: -23px;
    z-index: 9;
    cursor: pointer;
    :deep(.field-search-cascader-wrap) {
      line-height: 18px;
      .ant-btn-link {
        height: auto;
        padding: 0;
        font-size: 12px;
      }
    }
  }
</style>
