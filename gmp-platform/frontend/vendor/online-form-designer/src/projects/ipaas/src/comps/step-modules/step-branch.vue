<template>
  <div class="p-12px">
    <div>
      <vue-draggable v-model="branches" :animation="200" ghostClass="ghost" itemKey="id">
        <template #item="{ element: r }">
          <div class="branch-item pr-4px">
            <div class="h-full w-24px cursor-move flex items-center justify-center">
              <i class="iconfont icon-drag mt-1px"></i>
            </div>
            <div>{{ r.children[0].id }}</div>
            <i v-if="branches.length > 1" class="iconfont icon-shanchu1"></i>
          </div>
        </template>
      </vue-draggable>

      <div class="branch-item pl-24px">
        <div>{{ $t('sys.ipaas.other') }}</div>
      </div>
    </div>

    <div class="text-center mt-10px">
      <a-button type="link" size="small">
        <template #icon>
          <plus-outlined />
        </template>
        {{ $t('sys.ipaas.condition.new') }}
      </a-button>
    </div>

    <!-- asfsdf -->
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { PanelStep } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import type { AppConnectorResp } from '/@/apis/gct-ipaas2/model';
  import { useFlow } from '../../hooks/useFlow';
  import type { GctFlowNode } from '@gct/flow';
  import VueDraggable from 'vuedraggable';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    nodeSteps: PanelStep[];
    nodeStep: PanelStep;
  }>();
  const emit = defineEmits(['toggle-step']);

  const branches = computed({
    get() {
      return props.node.children.slice(0, props.node.children.length - 1);
    },
    set(value) {
      console.log('computedcomputedcomputed');
      props.node.children = [...value, fixedBarnch.value];
    },
  });

  const fixedBarnch = computed(() => props.node.children[props.node.children.length - 1]);

  const activeStep = ref<'1' | '2'>('1');
  const { createNodeBizData, flowReadonly } = useFlow();
</script>

<style lang="less" scoped>
  .branch-item {
    display: flex;
    align-items: center;
    height: 32px;
    margin-bottom: 4px;
    border-radius: 4px;
    background: #f2f4f7;
    cursor: pointer;

    .iconfont {
      line-height: 1em;
    }

    .icon-drag {
      color: #c3c3c3;
    }

    .icon-shanchu1 {
      margin-left: auto;
      color: #333;
    }
  }
</style>
