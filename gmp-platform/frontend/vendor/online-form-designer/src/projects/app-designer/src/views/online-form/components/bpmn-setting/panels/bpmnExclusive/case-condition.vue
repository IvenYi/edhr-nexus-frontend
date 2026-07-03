<template>
  <div>
    <div class="border-all rounded-4px">
      <div class="flex items-center">
        <span class="pl-6px pr-6px">{{ $t('sys.onlineForm.when') }}</span>
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
          :placeholder="$t('sys.dataSet.pleaseSelectField')"
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
          :placeholder="$t('sys.dataSet.pleaseSelectNode')"
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
          @change="handleOperatorChange"
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

      <!-- 左子表 -->
      <div
        v-if="formState.operator === CaseOperatorEnum.FIELD_VALUE"
        class="flex items-center border-top"
      >
        <a-select
          size="small"
          class="w-10px flex-1 border-right bg-white"
          :bordered="false"
          :disabled="bpmnReadonly"
          v-model:value="formState.lSubValue"
          @select="handleLeftSubValueChange"
          :placeholder="$t('sys.dataSet.pleaseSelectField')"
        >
          <a-select-option
            v-for="ele in lSubModelFields"
            :key="ele.key"
            :value="ele.key"
            :title="ele._title_"
          >
            {{ ele._title_ }}
          </a-select-option>
        </a-select>
        <a-input-number
          size="small"
          :disabled="bpmnReadonly"
          :bordered="false"
          v-model:value="formState.lSubIndex"
          :placeholder="$t('sys.bpmn.idx')"
          :controls="false"
          :precision="0"
          :min="1"
          class="bg-white border-right rounded-0! lh-24px"
          style="width: 50px"
        />
        <a-select
          size="small"
          class="w-90px flex-none bg-white"
          :class="{
            'border-right': NoRightOperators.includes(formState.lSubOperator),
          }"
          :disabled="bpmnReadonly"
          v-model:value="formState.lSubOperator"
          :bordered="false"
        >
          <template v-if="formState.lSubFieldType">
            <template
              v-for="ele in FieldTypeSettingMap[formState.lSubFieldType].operators"
              :key="ele"
            >
              <a-select-option :value="ele">{{ getOperatorLabel(ele) }}</a-select-option>
            </template>
          </template>
          <template v-else>
            <template v-for="ele in StringOperators" :key="ele">
              <a-select-option :value="ele">{{ t('sys.bpmn.operator.' + ele) }}</a-select-option>
            </template>
          </template>
        </a-select>

        <template v-if="NoRightOperators.includes(formState.lSubOperator)">
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
    <template
      v-if="
        !NoRightOperators.includes(formState.operator) &&
        !NoRightOperators.includes(formState.lSubOperator)
      "
    >
      <div class="border-all rounded-4px mt-8px">
        <!-- 右值来源 -->
        <a-select
          size="small"
          :disabled="bpmnReadonly"
          class="w-full bg-white"
          v-model:value="formState.rType"
          :bordered="false"
          :placeholder="$t('sys.chooseText')"
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
              @change="handleRightValueChange"
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
              :placeholder="$t('sys.inputText')"
            />
          </div>

          <template
            v-if="!formState.rValue || getFieldType(formState.rValue) !== FIELD_TYPE.MASTERSLAVE"
          >
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

        <!-- 右子表 -->
        <div
          v-if="formState.rValue && getFieldType(formState.rValue) === FIELD_TYPE.MASTERSLAVE"
          class="flex items-center border-top"
        >
          <a-select
            size="small"
            class="w-10px flex-1 border-right bg-white"
            :bordered="false"
            :disabled="bpmnReadonly"
            v-model:value="formState.rSubValue"
            :placeholder="$t('sys.dataSet.pleaseSelectField')"
          >
            <a-select-option
              v-for="ele in rSubModelFields"
              :key="ele.key"
              :value="ele.key"
              :title="ele._title_"
            >
              {{ ele._title_ }}
            </a-select-option>
          </a-select>
          <a-input-number
            size="small"
            :disabled="bpmnReadonly"
            :bordered="false"
            v-model:value="formState.rSubIndex"
            :placeholder="$t('sys.bpmn.idx')"
            :controls="false"
            :precision="0"
            :min="1"
            class="bg-white border-right rounded-0! lh-24px"
            style="width: 50px"
          />
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

  const { bpmnMasterModelFields, bpmnFieldMap } = useBpmnSetting();
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

  const getSubFields = (key: string) => {
    const subField = getField(key, bpmnModelValidFields.value);
    return bpmnFieldMap.value[subField!.bindInfo!]?.fields?.map((item) => {
      return {
        ...item,
        _title_: item.name + '[' + item.key + ']',
      };
    });
  };

  const lSubModelFields = computed(() => {
    return getSubFields(formState.value.lValue!);
  });

  const rSubModelFields = computed(() => {
    return getSubFields(formState.value.rValue!).filter((e) => {
      return TypeToFieldTypeMap[formState.value.lSubType || formState.value.type].includes(
        e.type as any,
      );
    });
  });

  const rightFields = computed(() => {
    return bpmnModelValidFields.value.filter((item) => {
      // 子表支持选择字段后，所有的字段类型应都可以选择子表字段
      return (
        item.type === FIELD_TYPE.MASTERSLAVE ||
        TypeToFieldTypeMap[formState.value.lSubType || props.condition.type].includes(
          item.type as any,
        )
      );
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

  const getField = (fieldKey: string, fields: any[]) => {
    return fields.find((item) => item.key === fieldKey);
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
      lSubFieldType: undefined,
      lSubValue: undefined,
      lSubIndex: undefined,
      lSubOperator: undefined,
      lSubType: undefined,
      rSubValue: undefined,
      rSubIndex: undefined,
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
      lSubFieldType: undefined,
      lSubValue: undefined,
      lSubIndex: undefined,
      lSubOperator: undefined,
      lSubType: undefined,
      rSubValue: undefined,
      rSubIndex: undefined,
    };

    Object.assign(formState.value, row);
  };

  const handleLeftSubValueChange = (lSubValue: string) => {
    const subField = getField(lSubValue, lSubModelFields.value);
    const lSubFieldType = subField?.type;
    Object.assign(formState.value, {
      lSubFieldType,
      lSubType: FieldTypeSettingMap[lSubFieldType].type,
      lSubOperator: FieldTypeSettingMap[lSubFieldType].operators[0],
      rType: CaseValueSource.Manual,
      rValue: undefined,
      rSubValue: undefined,
      rSubIndex: undefined,
    });
  };

  const handleRightTypeChange = () => {
    const row: Partial<ICondition> = {
      rValue: undefined,
      rSubValue: undefined,
      rSubIndex: undefined,
    };
    Object.assign(formState.value, row);
  };

  const handleRightValueChange = (rValue: string) => {
    if (getFieldType(rValue) === FIELD_TYPE.MASTERSLAVE) {
      const row: Partial<ICondition> = {
        rSubValue: undefined,
        rSubIndex: 1,
      };
      Object.assign(formState.value, row);
    }
  };

  const handleOperatorChange = (ope) => {
    // 子表取字段值时，给默认配置
    if (ope === CaseOperatorEnum.FIELD_VALUE) {
      formState.value.lSubIndex = 1;
      formState.value.lSubOperator = CaseOperatorEnum.EQ;
    }
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
