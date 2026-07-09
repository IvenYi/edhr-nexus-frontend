<template>
  <div>
    <div class="border-all rounded-4px">
      <div class="flex items-center">
        <span class="pl-6px pr-6px">当</span>
        <!-- 左值来源 -->
        <a-select
          size="small"
          :disabled="bpmnReadonly"
          class="flex-1 border-left bg-white"
          v-model:value="formState.lType"
          :bordered="false"
          @select="handleLeftTypeChange"
        >
          <a-select-option :value="CaseValueSource.Model">{{
            t('sys.bpmn.caseValueSource.Model')
          }}</a-select-option>
          <a-select-option :value="CaseValueSource.Node">{{
            t('sys.bpmn.caseValueSource.Node')
          }}</a-select-option>
        </a-select>
      </div>

      <div class="flex items-center border-top">
        <a-select
          size="small"
          class="w-10px flex-1 border-right bg-white"
          :bordered="false"
          v-if="formState.lType === CaseValueSource.Model"
          :disabled="bpmnReadonly"
          v-model:value="formState.lValue"
          @select="handleLeftValueChange"
          placeholder="请选择字段"
        >
          <a-select-option
            v-for="ele in bpmnModelValidFields"
            :key="ele.key"
            :value="ele.key"
            :title="ele._title_"
          >
            {{ ele._title_ }}
          </a-select-option>
        </a-select>

        <a-select
          size="small"
          class="w-10px flex-1 border-right bg-white"
          v-else-if="formState.lType === CaseValueSource.Node"
          :disabled="bpmnReadonly"
          v-model:value="formState.lValue"
          placeholder="请选择节点"
          :bordered="false"
        >
          <a-select-option
            v-for="ele in nodeOptions"
            :key="ele.node.id"
            :value="ele.node.id"
            :title="ele._title_"
          >
            {{ ele._title_ }}
          </a-select-option>
        </a-select>

        <!-- 操作符-->
        <a-select
          size="small"
          class="w-90px flex-none bg-white"
          :class="{
            'border-right': NoRightOperators.includes(formState.operator),
          }"
          :disabled="bpmnReadonly"
          v-model:value="formState.operator"
          :bordered="false"
        >
          <template v-if="formState.lType === CaseValueSource.Node">
            <template v-for="ele in StringOperators" :key="ele">
              <a-select-option :value="ele">{{ t('sys.bpmn.operator.' + ele) }}</a-select-option>
            </template>
          </template>
          <template v-else-if="formState.fType">
            <template v-for="ele in FieldTypeSettingMap[formState.fType].operators" :key="ele">
              <a-select-option :value="ele">{{ getOperatorLabel(ele) }}</a-select-option>
            </template>
          </template>
          <template v-else>
            <template v-for="ele in StringOperators" :key="ele">
              <a-select-option :value="ele">{{ t('sys.bpmn.operator.' + ele) }}</a-select-option>
            </template>
          </template>
        </a-select>

        <template v-if="NoRightOperators.includes(formState.operator)">
          <span class="pl-6px pr-6px">时</span>
          <div
            v-if="allowDelete && !bpmnReadonly"
            class="cursor-pointer pl-6px pr-6px border-left h-24px flex items-center"
            @click="handleDelete"
          >
            <i class="iconfont icon-shanchu1 lh-[1em] color-[#8F8F8F]"></i>
          </div>
        </template>
      </div>
    </div>

    <!-- 右值 -->
    <template v-if="!NoRightOperators.includes(formState.operator)">
      <div class="border-all rounded-4px mt-8px">
        <!-- 右值来源 -->
        <a-select
          size="small"
          :disabled="bpmnReadonly"
          class="w-full bg-white"
          v-model:value="formState.rType"
          :bordered="false"
          placeholder="请选择"
          @select="handleRightTypeChange"
        >
          <a-select-option v-for="ele in CaseValueSource" :value="ele" :key="ele">{{
            t('sys.bpmn.caseValueSource.' + ele)
          }}</a-select-option>
        </a-select>

        <div class="flex items-center border-top">
          <span class="pl-6px pr-6px">的</span>

          <div class="w-10px flex-1 border-left border-right bg-white">
            <a-select
              size="small"
              class="w-full"
              v-if="formState.rType === CaseValueSource.Model"
              :disabled="bpmnReadonly"
              v-model:value="formState.rValue"
              :bordered="false"
            >
              <a-select-option
                v-for="ele in rightFields"
                :key="ele.key"
                :value="ele.key"
                :title="ele._title_"
              >
                {{ ele._title_ }}
              </a-select-option>
            </a-select>

            <a-select
              class="w-full"
              size="small"
              v-else-if="formState.rType === CaseValueSource.Node"
              :disabled="bpmnReadonly"
              v-model:value="formState.rValue"
              :bordered="false"
            >
              <a-select-option
                v-for="ele in nodeOptions"
                :key="ele.node.id"
                :value="ele.node.id"
                :title="ele._title_"
              >
                {{ ele._title_ }}
              </a-select-option>
            </a-select>

            <template v-else-if="formState.rType === CaseValueSource.Manual">
              <CaseButtonValue
                class="w-full"
                v-if="formState.lType === CaseValueSource.Node"
                v-model:button-key="formState.rValue"
                :node-id="formState.lValue"
              />

              <CaseManualValue v-else :condition="formState" />
            </template>

            <a-input
              size="small"
              v-else
              :disabled="bpmnReadonly"
              :bordered="false"
              v-model:value="formState.rValue"
              placeholder="请输入"
            />
          </div>

          <span class="pl-6px pr-6px">时</span>
          <div
            v-if="allowDelete && !bpmnReadonly"
            class="cursor-pointer pl-6px pr-6px border-left h-24px flex items-center"
            @click="handleDelete"
          >
            <i class="iconfont icon-shanchu1 lh-[1em] color-[#8F8F8F]"></i>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, Ref } from 'vue';
  import type { ICondition } from '@gct/flow/src/plugins/bpmn/types';
  import {
    CaseOperatorEnum,
    BpmnNodeTypeEnum,
    CaseValueSource,
    CaseValueType,
  } from '@gct/flow/src/plugins/bpmn/enums';
  import { useBpmnSetting } from '../../hooks/useBpmnSetting';
  import { useGctFlow } from '@gct/flow';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    FieldTypeSettingMap,
    StringOperators,
    TypeToFieldTypeMap,
    NoRightOperators,
  } from '../../constant/field-type';
  import CaseButtonValue from './case-button-value.vue';
  import CaseManualValue from './case-manual-value.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { DefaultCaseElement } from '@gct/flow/src/plugins/bpmn/models/bpmnExclusive';

  const props = defineProps<{
    condition: ICondition;
    allowDelete?: boolean;
    deleteFn?: Function;
  }>();

  const formState = computed({
    get() {
      return props.condition;
    },
    set(value) {
      Object.assign(props.condition, value);
    },
  });

  const { bpmnMasterModelFields } = useBpmnSetting();
  const { gctFlowDataMap } = useGctFlow();
  const { t } = useI18n();
  // const isExpand = ref<boolean>(true);
  const bpmnReadonly: Ref<boolean> = inject('bpmnReadonly', false) as any;

  const bpmnModelValidFields = computed(() => {
    return bpmnMasterModelFields.value.map((item) => {
      return {
        ...item,
        _title_: item.name + '[' + item.key + ']',
      };
    });
  });

  const rightFields = computed(() => {
    return bpmnModelValidFields.value.filter((item) => {
      return TypeToFieldTypeMap[props.condition.type].includes(item.type as any);
    });
  });

  const getOperatorLabel = (operator: CaseOperatorEnum) => {
    if (
      [FIELD_TYPE.DATE, FIELD_TYPE.TIME, FIELD_TYPE.DATE_TIME].includes(props.condition.fType) &&
      [CaseOperatorEnum.GE, CaseOperatorEnum.LE].includes(operator)
    ) {
      return t('sys.bpmn.timeOperator.' + operator);
    }
    return t('sys.bpmn.operator.' + operator);
  };

  const getFieldType = (fieldKey: string) => {
    const field = bpmnMasterModelFields.value.find((item) => item.key === fieldKey);
    return field?.type;
  };

  const nodeOptions = computed(() => {
    return Object.values(gctFlowDataMap.value)
      .filter((item) =>
        [BpmnNodeTypeEnum.BpmnApproval, BpmnNodeTypeEnum.BpmnJudge].includes(
          item.node.type as BpmnNodeTypeEnum,
        ),
      )
      .map((item) => {
        return {
          ...item,
          _title_: item.node.data.name + '[' + item.node.id + ']',
        };
      });
  });

  const handleDelete = () => {
    props.deleteFn && props.deleteFn();
  };

  const handleLeftTypeChange = () => {
    const row: Partial<ICondition> = {
      type: CaseValueType.String,
      fType: undefined,
      lValue: undefined,
      operator: CaseOperatorEnum.EQ,
      rType: CaseValueSource.Manual,
      rValue: undefined,
    };
    Object.assign(formState.value, row);
  };

  const handleLeftValueChange = (lValue: string) => {
    const fType = getFieldType(lValue);
    const type = FieldTypeSettingMap[fType].type;
    const row: Partial<ICondition> = {
      type,
      fType,
      operator: FieldTypeSettingMap[fType].operators[0],
      rType: CaseValueSource.Manual,
      rValue: undefined,
    };
    Object.assign(formState.value, row);
  };

  const handleRightTypeChange = () => {
    const row: Partial<ICondition> = {
      rValue: undefined,
    };
    Object.assign(formState.value, row);
  };
</script>

<style lang="less" scoped>
  .border-all {
    border: 1px solid #e6e6e6;
    background-color: #fafafa;
    overflow: hidden;
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
</style>
