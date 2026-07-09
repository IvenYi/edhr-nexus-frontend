<template>
  <div class="mx--12px mt--12px">
    <a-form
      v-if="!caseFlowNode"
      ref="formRef"
      :model="formState"
      autocomplete="off"
      layout="vertical"
    >
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
          <a class="text-12px text-[#3168EC]" @click.prevent="handleCaseAdd">{{ $t('sys.ipaas.addCondition') }}</a>
        </div>
        <vue-draggable
          v-model="caseIfs"
          :animation="200"
          ghostClass="ghost"
          itemKey="id"
          handle=".case-drag"
        >
          <template #item="{ element: item, index }">
            <div class="flex items-center bg-[#F2F4F7] rounded-4px p8px mb-4px cursor-pointer">
              <div
                class="h-40px w-16px mr-6px flex items-center justify-center"
                :class="{
                  'case-drag': !readonly,
                }"
              >
                <i
                  class="iconfont icon-drag lh-16px color-[#c3c3c3]"
                  :class="readonly ? 'cursor-not-allowed' : 'cursor-pointer'"
                ></i>
              </div>
              <div class="ks-col">
                <div class="mb4px ks-row-middle">
                  <div class="text-12px lh-1em ks-col">
                    <span class="text-[#088C49] mr8px">{{ index > 0 ? 'ELSE IF' : 'IF' }}</span>
                    <span class="text-[#8F8F8F] mr4px">{{ $t('sys.ipaas.priority') }}</span>
                    <span class="text-[#666666]">{{ index + 1 }}</span>
                  </div>
                  <i
                    v-if="caseIfs.length > 1 && !readonly"
                    class="iconfont icon-shanchu1 cursor-pointer lh-18px error-gct-hover text-[#666666] ml8px"
                    @click.stop="handleCaseDelete(item.id)"
                  ></i>
                </div>
                <div class="ks-row-middle bg-[#fff] condition-input-wrap">
                  <div class="ks-col">
                    <a-input
                      ref="caseInputRef"
                      v-model:value="item.data.bizData.nodeName"
                      :placeholder="$t('sys.inputText')"
                      size="small"
                      :allow-clear="false"
                      :disabled="readonly"
                      :bordered="false"
                      @click.stop
                      @blur="handleCaseNameBlur(index, item.data?.bizData?.nodeName)"
                    />
                  </div>
                  <span
                    class="primary-gct cursor-pointer ml4px text-[12px]"
                    @click="handleCaseChange(item.id)"
                  >
                    {{ $t('sys.config') }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </vue-draggable>
        <div
          v-for="item in caseElse"
          :key="item.id"
          class="flex items-center h-32px bg-[#F2F4F7] rounded-4px pl-8px pr-8px mb-4px cursor-pointer"
          @click="handleCaseChange(item.id)"
        >
          <div class="h-16px w-16px mr-6px"> </div>
          <div class="ks-row-center-between ks-col text-[12px]">
            <span class="text-[#088C49] mr8px">{{ 'ELSE' }}</span>
            <span class="lh-1em text-[#666666]">{{ item.data?.bizData?.nodeName }}</span>
          </div>
        </div>
      </SimpleCollapse>
    </a-form>
    <IfSetting
      v-else-if="caseFlowNode.data?.bizData?.endpointType === EndpointType.if"
      :key="caseFlowNode.id"
      :node="caseFlowNode"
      :node-data="caseFlowNode.data.bizData"
      :readonly="readonly"
    />
    <div v-else class="p8px bg-[#f7f7f7] m12px text-[#797A7D] text-12px">
      {{ $t('sys.ipaas.noConditionTip') }}
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import type {
    GctBpmnNode,
    NodeBizDataSchema,
    NodeDataSchema,
  } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import SimpleCollapse from '../__comps__/simple-collapse.vue';
  import VueDraggable from 'vuedraggable';
  import { caseIfGenerator } from '@gct/flow/src/plugins/ipaas-bpmn/models/exclusive';
  import IfSetting from './if.vue';
  import { EndpointType } from '@gct/flow/src/plugins/ipaas-bpmn/enums';

  const props = defineProps<{
    node: GctBpmnNode.BpmnExclusive;
    nodeData: NodeDataSchema.Exclusive;
    readonly: boolean;
  }>();

  const { setFlowSelected, flowSelectedId } = useGctFlow();

  const formState = computed<NodeBizDataSchema.Exclusive>({
    get() {
      return props.nodeData.bizData as any;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData = value;
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

  const caseFlowNode = computed(() => {
    if (flowSelectedId.value) {
      return props.node.children?.find((item) => item.id === flowSelectedId.value);
    }
    return null;
  });

  const handleCaseChange = (id: string) => {
    setFlowSelected(id);
  };

  const handleCaseAdd = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(props.node.children.length - 1, 0, caseIfGenerator());
  };

  const handleCaseDelete = (id: string) => {
    const index = props.node.children.findIndex((item) => item.id === id);
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(index, 1);
  };

  const handleCaseNameBlur = (index, name) => {
    if (!name || !name.trim()) {
      const obj = props.node.children[index];
      const data = obj.data;
      data.bizData = {
        ...data.bizData,
        nodeName: name,
      };
      // eslint-disable-next-line vue/no-mutating-props
      props.node.children.splice(index, 1, {
        ...obj,
      });
    }
  };
</script>
<style lang="less" scoped>
  .condition-input-wrap {
    padding-right: 8px;
    border: 1px solid #e8ebf0;
    border-radius: 4px;
  }
</style>
