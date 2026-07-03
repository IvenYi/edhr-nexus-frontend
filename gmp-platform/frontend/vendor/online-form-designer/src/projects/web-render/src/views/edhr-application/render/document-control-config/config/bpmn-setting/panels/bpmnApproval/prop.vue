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
      <ApprovalPropConfig :node="node" />
      <SimpleCollapse :title="t('sys.appDesigner.approval.buttonPerm')">
        <OpConfig
          :edit-ops="NodeTypeOperateButtonMap[node.type]"
          v-model:value="formState!.buttonConfig"
          :show-opinion-config="true"
        />
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, inject } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import FormItem from '../../comps/form-item.vue';
  import ApprovalPropConfig from '../../comps/approval-prop-config.vue';
  import { OpConfig } from '/@online-form/approval';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { NodeTypeOperateButtonMap } from '../../constant';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const { t } = useI18n();

  const props = defineProps<{
    node: GctBpmnNode.BpmnApproval;
  }>();

  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });
</script>

<style></style>
