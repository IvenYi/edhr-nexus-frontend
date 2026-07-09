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
      <SimpleCollapse :title="t('sys.appDesigner.approval.caseSetting')">
        <div class="pb-4px" v-if="!bpmnReadonly">
          <a class="text-12px" @click.prevent="handleCaseAdd">添加分支</a>
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
                v-if="!bpmnReadonly && cases.length > 2"
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
  import { computed, inject } from 'vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import FormItem from '../../comps/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGctFlow } from '@gct/flow';
  import VueDraggable from 'vuedraggable';
  import { caseGenerator } from '@gct/flow/src/plugins/bpmn/models/bpmnParallel';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const { t } = useI18n();
  const { setFlowSelected } = useGctFlow();

  const props = defineProps<{
    node: GctBpmnNode.BpmnParallel;
  }>();

  const formState = computed({
    get() {
      return props.node.data;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
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
    const index = props.node.children.findIndex((item) => item.id === id);
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index, 1);
  };
</script>

<style></style>
