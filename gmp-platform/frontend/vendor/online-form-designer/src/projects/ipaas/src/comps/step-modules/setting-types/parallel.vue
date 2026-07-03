<template>
  <div class="mx--12px mt--12px">
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <SimpleCollapse :title="$t('sys.appDesigner.approval.basicInfo')">
        <a-form-item :label="$t('sys.ipaas.nodeName')" name="nodeName" :rules="[{ required: true }]">
          <a-input
            v-model:value="formState.nodeName"
            size="small"
            :placeholder="$t('sys.inputText')"
            :disabled="readonly"
          />
        </a-form-item>
      </SimpleCollapse>
      <SimpleCollapse :title="$t('sys.appDesigner.approval.caseSetting')">
        <div class="pb-4px" v-if="!readonly">
          <a class="text-12px text-[#3168EC]" @click.prevent="handleCaseAdd">{{ $t('sys.ipaas.addBranch') }}</a>
        </div>
        <vue-draggable
          v-model="cases"
          :animation="200"
          ghostClass="ghost"
          itemKey="id"
          handle=".case-drag"
        >
          <template #item="{ element: item, index }">
            <div
              class="flex items-center h-32px bg-[#F2F4F7] rounded-4px pl-6px pr-6px mb-4px cursor-pointer"
              @click="handleCaseChange(item.id)"
            >
              <div
                class="h-16px w-16px mr-6px flex items-center justify-center"
                :class="{
                  'case-drag': !readonly,
                }"
              >
                <i
                  class="iconfont icon-drag lh-1em color-[#c3c3c3]"
                  :class="readonly ? 'cursor-not-allowed' : 'cursor-pointer'"
                ></i>
              </div>
              <span class="text-12px lh-1em">
                {{ item.data?.bizData?.nodeName }}{{ index + 1 }}
              </span>
              <i
                v-if="!readonly && cases.length > 2"
                class="iconfont icon-shanchu1 lh-1em cursor-pointer error-gct ml-[auto] important-text-14px"
                @click.stop="handleCaseDelete(item.id)"
              ></i>
            </div>
          </template>
        </vue-draggable>
      </SimpleCollapse>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { computed, createVNode } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import type {
    GctBpmnNode,
    NodeBizDataSchema,
    NodeDataSchema,
  } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import SimpleCollapse from '../__comps__/simple-collapse.vue';
  import VueDraggable from 'vuedraggable';
  import { caseGenerator } from '@gct/flow/src/plugins/ipaas-bpmn/models/parallel';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnParallel;
    nodeData: NodeDataSchema.Parallel;
    readonly: boolean;
  }>();

  const { setFlowSelected } = useGctFlow();

  const formState = computed<NodeBizDataSchema.Parallel>({
    get() {
      return props.nodeData.bizData as any;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData = value;
    },
  });

  const cases = computed({
    get() {
      return props.node.children;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.node.children = [...value];
    },
  });

  const handleCaseChange = (id: string) => {
    setFlowSelected(id);
  };

  const handleCaseAdd = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.push(caseGenerator());
  };

  const handleCaseDelete = (id: string) => {
    Modal.confirm({
      title: $t('sys.ipaas.deleteNodeConfirm'),
      icon: createVNode(ExclamationCircleFilled),
      content: $t('sys.ipaas.deleteNodeTip'),
      centered: true,
      onOk() {
        const index = props.node.children.findIndex((item) => item.id === id);
        // eslint-disable-next-line vue/no-mutating-props
        props.node.children.splice(index, 1);
      },
      onCancel() {},
    });
  };
</script>
<style lang="less" scoped></style>
