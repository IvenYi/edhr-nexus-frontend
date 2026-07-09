<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.appDesigner.approval.caseSetting')">
      <span v-if="!paasBpmnReadonly" class="primary-gct cursor-pointer" @click="handleCaseAdd">
        {{ t('sys.process.addCase') }}
      </span>
      <vue-draggable
        v-model="caseIfs"
        :animation="200"
        ghostClass="ghost"
        itemKey="id"
        handle=".case-drag"
        class="mt8px"
      >
        <template #item="{ element: item, index }">
          <div class="flex items-center bg-[#F2F4F7] rounded-4px p8px mb-4px cursor-pointer">
            <div
              v-if="node.type !== BpmnNodeTypeEnum.BpmnParallel"
              class="h-40px w-16px mr-6px flex items-center justify-center"
              :class="{
                'case-drag': !paasBpmnReadonly,
              }"
            >
              <i
                class="iconfont icon-drag lh-16px color-[#c3c3c3]"
                :class="paasBpmnReadonly ? 'cursor-not-allowed' : 'cursor-pointer'"
              ></i>
            </div>
            <div class="ks-col">
              <div class="mb4px ks-row-middle">
                <div class="text-12px lh-1em ks-col pl6px">条件{{ index + 1 }}</div>
                <span class="text-[#8F8F8F]">优先级 {{ index + 1 }}</span>
                <i
                  v-if="caseIfs.length > 1 && !paasBpmnReadonly"
                  class="iconfont icon-shanchu1 cursor-pointer lh-18px error-gct-hover text-[#666666] ml8px"
                  @click.stop="handleCaseDelete(item.id)"
                ></i>
              </div>
              <div class="ks-row-middle">
                <div class="ks-col">
                  <a-input
                    ref="caseInputRef"
                    v-model:value="item.caseCfg.name"
                    :placeholder="t('sys.inputText')"
                    size="small"
                    :allow-clear="false"
                    :disabled="paasBpmnReadonly"
                    @click.stop
                    @blur="handleCaseNameBlur(index, item.caseCfg.name)"
                  />
                </div>
                <span class="primary-gct cursor-pointer ml4px" @click="handleCaseChange(item.id)">
                  {{ t('sys.config') }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </vue-draggable>
      <div
        v-for="item in caseElse"
        :key="item.id"
        class="flex items-center h-32px bg-[#F2F4F7] rounded-4px p8px mb-4px cursor-not-allowed"
      >
        <div v-if="node.type !== BpmnNodeTypeEnum.BpmnParallel" class="w-16px mr-4px"></div>
        <div class="ks-col">{{ item.caseCfg.name }}</div>
        <div class="mr4px text-[#8F8F8F]">优先级</div>
        <div class="text-[#666666]">默认</div>
      </div>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { computed, inject, nextTick, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import VueDraggable from 'vuedraggable';
  import { useGctFlow } from '@gct/flow';
  import { caseIfGenerator } from '@gct/flow/src/plugins/biz-bpmn/models/bpmnExclusive';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/biz-bpmn/enums';

  const props = defineProps<{
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnParallel;
  }>();

  const { setFlowSelected } = useGctFlow('bizBpmn');
  const { t } = useI18n();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const caseInputRef = ref();

  const formState = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
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

  const handleCaseAdd = () => {
    const index = caseIfs.value.length;
    const newCase = caseIfGenerator(index + 1);
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index, 0, newCase);
    nextTick(() => {
      caseInputRef.value.select();
    });
  };

  const handleCaseDelete = (id: string) => {
    const index = props.node.children.findIndex((item) => item.id === id);
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index, 1);
  };

  const handleCaseNameBlur = (index, name) => {
    if (!name || !name.trim()) {
      const obj = props.node.children[index];
      // eslint-disable-next-line vue/no-mutating-props
      props.node.children.splice(index, 1, {
        ...obj,
        caseCfg: { ...obj.caseCfg, name: `条件${index + 1}` },
      });
    }
  };
</script>
<style lang="less" scoped></style>
