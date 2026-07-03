<template>
  <div>
    <div class="flex items-center pt-4px pb-4px">
      <span
        class="h-16px w-16px flex items-center justify-center cursor-pointer"
        @click="isExpand = !isExpand"
      >
        <minus-square-outlined v-if="isExpand" class="important-color-[#8F8F8F]" />
        <plus-square-outlined v-else class="important-color-[#8F8F8F]" />
      </span>
      <span
        class="color-[#3168EC] bg-[#E6EEFF] h-26px rounded-4px w-42px flex items-center justify-center cursor-pointer ml-3px"
        :class="{
          'cursor-not-allowed': bpmnReadonly,
        }"
        @click="handleLogicToggle"
      >
        {{ t('sys.bpmn.logicalOperators.' + formState.logicalOperators) }}
      </span>

      <span class="color-[#797A7D] text-12px ml-12px" v-if="!bpmnReadonly">
        <i
          v-if="allowDelete && depth > 1"
          class="iconfont icon-shanchu1 lh-[1em] important-text-14px mr-10px relative top-1px cursor-pointer color-[#8F8F8F]"
          @click="handleGroupDelete"
        ></i>
        <a class="mr-6px cursor-pointer" @click.prevent="handleConditionAdd">{{
          $t('sys.process.addCase')
        }}</a>
        <template v-if="depth === 1">
          <span class="color-[#c3c3c3] mr-6px">/</span>
          <a class="cursor-pointer" @click.prevent="handleConditionGroupAdd">{{
            $t('sys.process.addCaseGroup')
          }}</a>
        </template>
      </span>
    </div>
    <div class="elements" v-show="isExpand">
      <template v-for="(item, index) in formState.elements" :key="index">
        <div
          class="case-item__condition pt-4px pb-4px"
          :class="{
            'is-last-child': index === formState.elements.length - 1,
          }"
          v-if="item.type === 'condition'"
        >
          <div class="case-item__condition-inner">
            <CaseCondition
              :allow-delete="formState.elements.length > 1"
              :delete-fn="() => handleDelete(index)"
              :condition="item.element"
            />
          </div>
        </div>
        <div
          class="case-item__condition-group"
          :class="{
            'is-last-child': index === formState.elements.length - 1,
          }"
          v-else-if="item.type === 'conditionGroup'"
        >
          <CaseEditor
            :allow-delete="formState.elements.length > 1"
            :delete-fn="() => handleDelete(index)"
            :data="item.element"
            :depth="depth + 1"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="case-editor">
  import { computed, ref, inject, Ref } from 'vue';
  import type { ICase, IGctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import {
    CaseOperatorEnum,
    CaseValueType,
    BpmnNodeTypeEnum,
    ButtonTypeEnum,
    CaseValueSource,
  } from '@gct/flow/src/plugins/bpmn/enums';
  import { DefaultCaseElement } from '@gct/flow/src/plugins/bpmn/models/bpmnExclusive';
  import { useBpmnSetting } from '../../hooks/useBpmnSetting';
  import { useGctFlow } from '@gct/flow';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldTypeSettingMap, StringOperators } from '../../constant/field-type';
  // import ButtonValue from './button-value.vue/';
  // import ManualValue from './manual-value.vue';
  import CaseCondition from './case-condition.vue';

  const props = withDefaults(
    defineProps<{
      data: ICase;
      depth?: number;
      allowDelete?: boolean;
      deleteFn?: Function;
    }>(),
    {
      depth: 1,
      allowDelete: false,
    },
  );

  const { bpmnMasterModelFields } = useBpmnSetting();
  const { gctFlowDataMap } = useGctFlow();
  const { t } = useI18n();
  const isExpand = ref<boolean>(true);
  const bpmnReadonly: Ref<boolean> = inject('bpmnReadonly', false) as any;

  // const getFieldType = (fieldKey: string) => {
  //   const field = bpmnMasterModelFields.value.find((item) => item.key === fieldKey);
  //   return field?.type;
  // };

  // const nodeOptions = computed(() => {
  //   return Object.values(gctFlowDataMap.value).filter((item) =>
  //     [BpmnNodeTypeEnum.BpmnApproval, BpmnNodeTypeEnum.BpmnJudge].includes(
  //       item.node.type as BpmnNodeTypeEnum,
  //     ),
  //   );
  // });

  const formState = computed({
    get() {
      return props.data;
    },
    set(value) {
      Object.assign(props.data, value);
    },
  });

  const handleConditionAdd = () => {
    formState.value.elements.push({
      type: 'condition',
      element: {
        ...DefaultCaseElement,
      },
    });
  };
  const handleConditionGroupAdd = () => {
    formState.value.elements.push({
      type: 'conditionGroup',
      element: {
        logicalOperators: 'and',
        elements: [
          {
            type: 'condition',
            element: {
              ...DefaultCaseElement,
            },
          },
        ],
      },
    });
  };

  const handleLogicToggle = () => {
    if (bpmnReadonly.value) return;
    formState.value.logicalOperators = formState.value.logicalOperators === 'and' ? 'or' : 'and';
  };

  const handleDelete = (index: number) => {
    formState.value.elements.splice(index, 1);
  };

  const handleGroupDelete = () => {
    props.deleteFn && props.deleteFn();
  };
</script>

<style lang="less" scoped>
  .elements {
    position: relative;
    padding-left: 20px;
  }
  .element-item {
    position: relative;
  }
  .case-item__condition {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      height: 1px;
      left: 0;
      top: 50%;
      width: 12px;
      transform: translateX(-100%);
      background: #e0e0e0;
    }
    &::after {
      content: '';
      position: absolute;
      left: -12px;
      top: 0;
      height: 100%;
      width: 1px;
      background: #e0e0e0;
    }
    &.is-last-child::after {
      height: 50%;
    }
    &-inner {
      background-color: #fcfcfc;
      outline: 1px dashed #f0f0f0;
      border-radius: 4px;
      padding: 8px;
    }
  }

  .case-item__condition-group {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      height: 1px;
      left: 0;
      top: 17px;
      width: 12px;
      transform: translateX(-100%);
      background: #e0e0e0;
    }
    &::after {
      content: '';
      position: absolute;
      left: -12px;
      top: 0;
      height: 100%;
      width: 1px;
      background: #e0e0e0;
    }
    &.is-last-child::after {
      height: 18px;
    }
  }
</style>
