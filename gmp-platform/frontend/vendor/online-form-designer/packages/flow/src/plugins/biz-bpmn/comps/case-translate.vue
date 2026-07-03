<template>
  <span class="color-[#C3C3C3] break-all">
    <span v-for="(item, index) in data.elements" :key="index">
      <span v-if="item.type === 'condition'">
        <span class="space">当</span>
        <span class="color-text space">
          “{{ t('sys.bpmn.caseValueSource.' + item.element.lType) }}/{{
            item.element.lValue ?? '--'
          }}”
        </span>
        <span class="space">的值</span>
        <span class="color-operator space">{{
          t('sys.bpmn.operator.' + item.element.operator)
        }}</span>
        <template
          v-if="
            ![CaseOperatorEnum.IS_NULL, CaseOperatorEnum.IS_NOT_NULL].includes(
              item.element.operator,
            )
          "
        >
          <span class="color-text space">
            “{{
              item.element.rType ? t('sys.bpmn.caseValueSource.' + item.element.rType) : '--'
            }}/{{ item.element.rValue ?? '--' }}”
          </span>
          <span class="space">的值</span>
        </template>
      </span>
      <span v-else-if="item.type === 'conditionGroup'">
        <span class="space">(</span>
        <case-translate :data="item.element" />
        <span class="space">)</span>
      </span>
      <span v-if="index < data.elements.length - 1" class="space">
        {{ t('sys.bpmn.logicalOperators.' + data.logicalOperators) }}
      </span>
    </span>
  </span>
</template>

<script setup lang="ts" name="case-translate">
  import type { ICase } from '../types';
  import { CaseOperatorEnum } from '../enums';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps<{
    data: ICase;
  }>();

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .color-text {
    --color: #088c49;
    color: var(--color);
  }

  .color-operator {
    color: #797a7d;
  }

  .space {
    margin-right: 2px;
  }
</style>
