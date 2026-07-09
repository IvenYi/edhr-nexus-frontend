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
          'cursor-not-allowed': readonly,
        }"
        @click="handleLogicToggle"
      >
        {{ t('sys.bpmn.logicalOperators.' + formState.logicalOperators) }}
      </span>

      <span class="color-[#797A7D] text-12px ml-12px" v-if="!readonly">
        <i
          v-if="allowDelete && depth > 1"
          class="iconfont icon-shanchu1 lh-[1em] important-text-14px mr-10px relative top-1px cursor-pointer color-[#8F8F8F]"
          @click="handleGroupDelete"
        ></i>
        <a class="mr-6px cursor-pointer" @click.prevent="handleConditionAdd">{{$t('sys.ipaas.addCondition')}}</a>
        <template v-if="depth === 1">
          <span class="color-[#c3c3c3] mr-6px">/</span>
          <a class="cursor-pointer" @click.prevent="handleConditionGroupAdd">{{$t('sys.ipaas.addConditionGroup')}}</a>
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
              :readonly="readonly"
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
            :readonly="readonly"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="case-editor">
  import { computed, ref } from 'vue';
  import type { IConditionRoot } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CaseCondition from './case-condition.vue';
  import { ConditionOperatorEnum, ConditionTypeEnum } from '../../../enums';

  const props = withDefaults(
    defineProps<{
      data: IConditionRoot;
      depth?: number;
      allowDelete?: boolean;
      deleteFn?: Function;
      readonly?: boolean;
    }>(),
    {
      depth: 1,
      allowDelete: false,
    },
  );

  const { t } = useI18n();
  const isExpand = ref<boolean>(true);

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
        type: ConditionTypeEnum.String,
        operator: ConditionOperatorEnum.eq,
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
              type: ConditionTypeEnum.String,
              operator: ConditionOperatorEnum.eq,
            },
          },
        ],
      },
    });
  };

  const handleLogicToggle = () => {
    if (props.readonly) return;
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
      top: 50%;
      left: 0;
      width: 12px;
      height: 1px;
      transform: translateX(-100%);
      background: #e0e0e0;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -12px;
      width: 1px;
      height: 100%;
      background: #e0e0e0;
    }

    &.is-last-child::after {
      height: 50%;
    }

    &-inner {
      padding: 8px;
      border-radius: 4px;
      outline: 1px dashed #f0f0f0;
      background-color: #fcfcfc;
    }
  }

  .case-item__condition-group {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 17px;
      left: 0;
      width: 12px;
      height: 1px;
      transform: translateX(-100%);
      background: #e0e0e0;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -12px;
      width: 1px;
      height: 100%;
      background: #e0e0e0;
    }

    &.is-last-child::after {
      height: 18px;
    }
  }
</style>
