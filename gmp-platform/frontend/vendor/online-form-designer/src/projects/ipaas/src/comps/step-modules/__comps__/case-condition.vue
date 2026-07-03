<template>
  <div class="flex items-center">
    <div class="border-all rounded-4px ks-col" :class="[readonly ? 'bg-[#F7F8FA]' : 'bg-[#fff]']">
      <div class="flex items-center">
        <!-- 左值来源 -->
        <a-input
          v-model:value="formState.left"
          type="text"
          allowClear
          size="small"
          :bordered="false"
          :placeholder="$t('sys.inputText')"
          :disabled="readonly"
        />
        <a-select
          size="small"
          :disabled="readonly"
          class="w-80px flex-none border-left"
          v-model:value="formState.type"
          :bordered="false"
          @select="handleLeftTypeChange"
        >
          <a-select-option
            v-for="item in Object.values(ConditionTypeEnum)"
            :value="item"
            :key="item"
            >{{ $t(`sys.ipaas.${item}`) }}</a-select-option
          >
        </a-select>
      </div>

      <div class="flex items-center border-top">
        <!-- 操作符-->
        <a-select
          size="small"
          class="w-80px flex-none border-right"
          :disabled="readonly"
          v-model:value="formState.operator"
          :bordered="false"
          :dropdown-match-select-width="false"
        >
          <template v-for="ele in ConditionTypeOpeMap[formState.type]" :key="ele">
            <a-select-option :value="ele">{{ t('sys.ipaas.conditionOpe.' + ele) }}</a-select-option>
          </template>
        </a-select>
        <template
          v-if="
            formState.operator !== ConditionOperatorEnum.isNotNull &&
            formState.operator !== ConditionOperatorEnum.isNull
          "
        >
          <StringNumberInput
            v-if="formState.type === ConditionTypeEnum.Number"
            v-model:value="formState.right"
            :bordered="false"
            :placeholder="$t('sys.inputText')"
            :disabled="readonly"
          />
          <a-radio-group
            v-else-if="formState.type === ConditionTypeEnum.Boolean"
            v-model:value="formState.right"
            :disabled="readonly"
          >
            <a-radio value="1">{{$t('sys.ipaas.booleanTrue')}}</a-radio>
            <a-radio value="2">{{$t('sys.ipaas.booleanFalse')}}</a-radio>
          </a-radio-group>
          <a-input
            v-else
            v-model:value="formState.right"
            type="text"
            allowClear
            size="small"
            :bordered="false"
            :placeholder="$t('sys.inputText')"
            :disabled="readonly"
          />
        </template>
      </div>
    </div>
    <div v-if="allowDelete && !readonly">
      <i
        class="iconfont icon-shanchu1 text-[#8F8F8F] ml4px cursor-pointer"
        @click="deleteFn && deleteFn()"
      ></i>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, Ref } from 'vue';
  import type { ICondition } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ConditionOperatorEnum, ConditionTypeEnum, ConditionTypeOpeMap } from '../../../enums';
  import StringNumberInput from './stringNumberInput.vue';
  import ReadonlycmpDesign from '/@/projects/page-designer/src/components/widgets/mobile/field/readonlycmp/readonlycmp-design.vue';

  const props = defineProps<{
    condition: ICondition['element'];
    allowDelete?: boolean;
    deleteFn?: Function;
    readonly?: boolean;
  }>();

  const formState = computed({
    get() {
      return props.condition;
    },
    set(value) {
      Object.assign(props.condition, value);
    },
  });

  const { t } = useI18n();

  const handleLeftTypeChange = () => {
    console.log('change----', formState.value);
    formState.value = {
      ...formState.value,
      operator: ConditionTypeOpeMap[formState.value.type][0],
      right: '',
    };
  };
</script>

<style lang="less" scoped>
  .border-all {
    overflow: hidden;
    border: 1px solid #e6e6e6;
  }

  .border-top {
    border-top: 1px solid #e6e6e6;
  }

  .border-right {
    border-right: 1px solid #e6e6e6;
  }

  .border-left {
    border-left: 1px solid #e6e6e6;
  }

  :deep(.ant-radio-group) {
    // background-color: #fff;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }

  :deep(.ant-radio-wrapper) {
    margin: 0;
    font-size: 12px;

    .ant-radio-inner {
      width: 12px;
      height: 12px;
    }
  }

  :deep(.ant-select-borderless) {
    .ant-select-selector {
      border: 0;
    }
  }
</style>
