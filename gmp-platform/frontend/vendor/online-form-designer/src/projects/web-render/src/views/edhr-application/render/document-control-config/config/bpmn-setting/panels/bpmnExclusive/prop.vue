<template>
  <div>
    <a-form v-if="!caseFlowNode" :model="formState" layout="vertical">
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
      <SimpleCollapse :title="t('sys.appDesigner.approval.caseSetting')">
        <vue-draggable
          v-model="caseIfs"
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
                  'case-drag': !bpmnReadonly,
                }"
              >
                <i
                  class="iconfont icon-drag lh-1em color-[#c3c3c3]"
                  :class="bpmnReadonly ? 'cursor-not-allowed' : 'cursor-pointer'"
                ></i>
              </div>
              <span class="text-12px lh-1em">#{{ index + 1 }} {{ item.caseCfg.name }}</span>
              <i
                v-if="caseIfs.length > 1 && !bpmnReadonly"
                class="iconfont icon-shanchu1 lh-1em cursor-pointer error-gct ml-[auto] important-text-14px"
                @click.stop="handleCaseDelete(item.id)"
              ></i>
            </div>
          </template>
        </vue-draggable>
        <div
          v-for="item in caseElse"
          :key="item.id"
          class="flex items-center h-32px bg-[#F2F4F7] rounded-4px pl-6px pr-6px mb-4px cursor-not-allowed"
        >
          <div class="h-16px w-16px mr-6px"> </div>
          <span class="text-12px lh-1em">#else {{ item.caseCfg.name }}</span>
        </div>
      </SimpleCollapse>
    </a-form>
    <!-- 当前选中为分支条件配置 -->
    <CaseProp v-else :key="caseFlowNode.id" :case-flow-node="caseFlowNode!" />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import FormItem from '../../comps/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CaseProp from './case-prop.vue';
  import { useGctFlow } from '@gct/flow';
  import VueDraggable from 'vuedraggable';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const { t } = useI18n();
  const { flowSelectedId, setFlowSelected } = useGctFlow();

  const props = defineProps<{
    node: GctBpmnNode.BpmnExclusive;
  }>();

  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  const caseFlowNode = computed(() => {
    if (flowSelectedId.value) {
      return props.node.children.find((item) => item.id === flowSelectedId.value);
    }
    return null;
  });

  const caseElse = computed(() => props.node.children.slice(-1));

  const caseIfs = computed({
    get() {
      return props.node.children.slice(0, props.node.children.length - 1);
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.node.children = [...value, ...caseElse.value];
    },
  });

  const handleCaseChange = (id: string) => {
    setFlowSelected(id);
  };

  const handleCaseDelete = (id: string) => {
    const index = props.node.children.findIndex((item) => item.id === id);
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index, 1);
  };
</script>

<style></style>
