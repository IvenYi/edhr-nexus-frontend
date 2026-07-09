<template>
  <div>
    <a-form :model="formState" layout="vertical">
      <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
        <form-item :label="t('sys.appDesigner.approval.nodeKey')" :inline="false" is-first>
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
          <a-input
            v-model:value="formState!.name"
            size="small"
            :maxlength="32"
            show-count
            :disabled="bpmnReadonly"
          />
        </form-item>
        <form-item
          :label="t('sys.appDesigner.approval.nodeDesc')"
          :inline="false"
          name="description"
        >
          <a-textarea
            v-model:value="formState!.description"
            size="small"
            :maxlength="120"
            show-count
            :disabled="bpmnReadonly"
          />
        </form-item>
      </SimpleCollapse>
      <SimpleCollapse :title="$t('sys.onlineForm.noticeConfig')">
        <form-item required :label="$t('sys.onlineForm.noticeUsers')" :inline="false" is-first>
          <approval-user-select-config
            v-model:modelValue="formState!.targetUserConfig"
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
          <div v-show="!bpmnReadonly" class="field-select-wrap">
            <FieldSearchCascader
              ref="fieldSearchRef"
              v-model:value="cascadeValue"
              :modelKey="bpmnMasterModelKey"
              noShowName
              :btnTitle="btnTitle"
              :filterFunc="filterFunc"
              @update:value="updateValue"
            />
          </div>
          <a-textarea
            v-model:value="formState!.msgContentConfig!.contentName"
            class="msg-content"
            :rows="6"
            :disabled="bpmnReadonly"
          />
        </form-item>
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, ref } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import FormItem from '../../comps/form-item.vue';
  import approvalUserSelectConfig from '../../comps/approval-user-select-config.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldSearchCascader } from '/@/components/FieldSearchCascader';
  import { useBpmnSetting } from '../../hooks/useBpmnSetting';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const { bpmnMasterModelKey } = useBpmnSetting();

  const { t } = useI18n();

  const props = defineProps<{
    node: GctBpmnNode.BpmnMessage;
  }>();

  const cascadeValue = ref();

  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const btnTitle = computed(() => {
    return bpmnMasterModelKey.value === 'em_edhr_tmpl'
      ? $t('sys.onlineForm.dhrFields')
      : $t('sys.onlineForm.formFields');
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

  // 表单模板、DHR 模板是内置的模型，消息节点字段可选字段仅支持选择 表单名称、编码、版本、线下版本
  function filterFunc(item) {
    if (
      bpmnMasterModelKey.value === 'em_form_tmpl' ||
      bpmnMasterModelKey.value === 'em_edhr_tmpl'
    ) {
      return ['name_', 'code_', 'version_', 'offline_version_'].includes(item.key);
    }
    return true;
  }
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
