<template>
  <div ref="DndContainerRef" class="bpmn-pattern">
    <a-collapse v-model:activeKey="activeKey" ghost expandIconPosition="right">
      <a-collapse-panel v-for="g in validPatternGroupList" :key="g.type" :header="t(g.nameI18n)">
        <template v-if="processResponse.type">
          <template v-if="g.type === 'task'">
            <div
              :style="{
                '--width': ElementViewSchema[n]?.width + 'px',
                '--height': ElementViewSchema[n]?.height + 'px',
              }"
              class="bpmn-element__task cursor-pointer"
              v-for="n in g.nodes"
              :key="n"
              @mousedown="startDrag(n)"
            >
              <i class="iconfont" :class="ElementViewSchema[n]?.icon"></i>
              <div>{{ t(ElementViewSchema[n]?.nameI18n) }}</div>
            </div>
          </template>
          <template v-if="g.type === 'gateway'">
            <div
              class="flex items-center flex-col"
              v-for="n in g.nodes"
              :key="n"
              @mousedown="startDrag(n)"
            >
              <div
                :style="{
                  '--width': ElementViewSchema[n]?.width + 'px',
                  '--height': ElementViewSchema[n]?.height + 'px',
                }"
                class="bpmn-element__gateway cursor-pointer"
              >
                <i class="iconfont" :class="ElementViewSchema[n]?.icon"></i>
                <div class="mt-3px"> {{ t(ElementViewSchema[n]?.nameI18n) }}</div>
              </div>
            </div>
          </template>
        </template>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { PatternGroupList, ElementViewSchema } from '../../constants';
  import { BpmnElementEnum } from '../../types';
  import { useBpmn } from '../../hooks/useBpmn';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { startDrag, processResponse } = useBpmn();
  const { t } = useI18n();

  const activeKey = ref<string[]>(PatternGroupList.map((item) => item.type));

  const validPatternGroupList = computed(() => {
    if (processResponse.value.type === 'APPROVE') {
      return PatternGroupList.map((item) => {
        return {
          ...item,
          nodes: item.nodes.filter((n) => n !== BpmnElementEnum.ApprovalCateway),
        };
      });
    } else {
      return PatternGroupList;
    }
  });
</script>

<style lang="less" scoped>
  .bpmn-pattern {
    &__title {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      color: #333;
      padding-left: 16px;
      border-bottom: 1px solid #eaeaea;
      font-weight: bold;
    }

    .ant-collapse {
      :deep(.ant-collapse-header) {
        border-bottom: 1px solid #eaeaea;
      }
      :deep(.ant-collapse-content-box) {
        display: grid;
        grid-template-columns: 50% 50%;
        justify-items: center;
        row-gap: 16px;
      }

      user-select: none;
    }
  }
</style>
