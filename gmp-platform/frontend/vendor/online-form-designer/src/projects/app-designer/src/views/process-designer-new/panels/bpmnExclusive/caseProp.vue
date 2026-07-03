<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.caseSetting')">
      <form-item
        :label="t('sys.appDesigner.approval.caseName')"
        :rules="[
          {
            required: true,
            message: t('sys.notEmptySth', { sth: t('sys.appDesigner.approval.caseName') }),
          },
        ]"
        :inline="false"
        is-first
      >
        <i18n-select-input
          attr="name"
          :i18nConfig="formState.i18n"
          :disabled="paasBpmnReadonly"
          size="small"
          @on-i18n-select="handleI18nSelect"
        >
          <template #i18n-input>
            <a-input
              style="width: calc(100% - 28px); height: 28px"
              v-model:value="formState.name"
              :placeholder="t('sys.inputText')"
              :maxlength="32"
              :disabled="paasBpmnReadonly"
              show-count
              size="small"
            />
          </template>
        </i18n-select-input>
      </form-item>
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.process.caseRule')">
      <form-item
        :label="t('sys.process.ruleSetting')"
        :rules="[{ required: true }]"
        :inline="false"
        is-first
      >
        <a-input-group compact>
          <a-select
            v-model:value="formState.type"
            :disabled="paasBpmnReadonly"
            size="small"
            style="width: 30%"
            @change="handleCaseTypeChange"
          >
            <a-select-option value="JSON">{{ t('sys.process.fieldCondition') }}</a-select-option>
            <a-select-option value="FORMULA">{{ t('sys.bpmn.caseType.FORMULA') }}</a-select-option>
          </a-select>
          <template v-if="formState.type === 'FORMULA'">
            <a-tooltip v-if="formState.formula!.exp" placement="topLeft">
              <template #title>
                {{ formState.formula!.exp }}
              </template>
              <a-input
                v-model:value="formState.formula!.exp"
                size="small"
                readonly
                style="width: 70%"
                :disabled="paasBpmnReadonly"
                :placeholder="
                  t('sys.process.configSth', {
                    sth: t('sys.bpmn.caseType.FORMULA'),
                  })
                "
                @click="!paasBpmnReadonly && onClickInput()"
              />
            </a-tooltip>
            <a-input
              v-else
              v-model:value="formState.formula!.exp"
              size="small"
              readonly
              style="width: 70%"
              :disabled="paasBpmnReadonly"
              :placeholder="
                t('sys.process.configSth', {
                  sth: t('sys.bpmn.caseType.FORMULA'),
                })
              "
              @click="!paasBpmnReadonly && onClickInput()"
            />
          </template>
          <template v-else>
            <a-tooltip v-if="dataRuleExp" placement="topLeft">
              <template #title>
                {{ dataRuleExp }}
              </template>
              <a-input
                v-model:value="dataRuleExp"
                size="small"
                readonly
                style="width: 70%"
                :disabled="paasBpmnReadonly"
                :placeholder="
                  t('sys.process.configSth', {
                    sth: t('sys.process.fieldCondition'),
                  })
                "
                @click="!paasBpmnReadonly && onClickInput()"
              />
            </a-tooltip>
            <a-input
              v-else
              v-model:value="dataRuleExp"
              size="small"
              readonly
              style="width: 70%"
              :disabled="paasBpmnReadonly"
              :placeholder="
                t('sys.process.configSth', {
                  sth: t('sys.process.fieldCondition'),
                })
              "
              @click="!paasBpmnReadonly && onClickInput()"
            />
          </template>
        </a-input-group>
      </form-item>
    </SimpleCollapse>
  </a-form>

  <fieldConditionRulesModal
    :excludeValueType="[ValueTypeEnum.SYS, ValueTypeEnum.VAR]"
    :excludeOperatorType="[
      SEARCH_SEVICE.RANGE,
      SEARCH_SEVICE.ORANGE,
      SEARCH_SEVICE.LORANGE,
      SEARCH_SEVICE.RORANGE,
    ]"
    @register="fieldConditionRulesRegister"
    @refresh="onRefresh"
  />
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { computed, inject, onMounted, provide, ref } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { useProcess } from '../../hook/useProcess';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import FormItem from '../../components/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { useModal } from '/@/components/Modal';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import fieldConditionRulesModal from '/@/projects/page-designer/src/designer/panels/prop-editor/modals/field-condition-rules-modal.vue';
  import { ValueTypeEnum } from '/@/projects/web-render/src/views/user-group/constant/config';
  import { SEARCH_SEVICE } from '@/enums/designEnum';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const props = defineProps<{
    caseId?: string;
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnParallel;
  }>();

  provide('isDataFilterEditor', true);
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const { t } = useI18n();
  const { flowSelectedId } = useGctFlow();
  const modelFields = ref<any[]>([]);
  const { openModal, identify } = useExpression();
  const [fieldConditionRulesRegister, { openModal: openFieldRulesModal }] = useModal();
  const { processInfo, validNodeData } = useProcess();

  const caseFlowNode = computed(() => {
    return props.node.children.find((item) => item.id === flowSelectedId.value)!;
  });

  const formState = computed({
    get() {
      return caseFlowNode.value?.caseCfg || {};
    },
    set(value) {
      Object.assign(caseFlowNode.value?.caseCfg ?? {}, value);
    },
  });

  const dataRuleExp = computed(() => {
    return JSON.parse(formState.value?.json?.dataRule || '{}').exp;
  });

  const handleI18nSelect = (params) => {};

  const handleCaseTypeChange = (val) => {
    formState.value.formula = undefined;
    formState.value.json = undefined;
    if (val === 'FORMULA') {
      formState.value.formula = {};
    }
  };
  const onClickInput = () => {
    if (formState.value.type === 'FORMULA') {
      handleFormulaEdit();
    } else {
      if (!formState.value.json) {
        formState.value.json = {
          dataRule: '',
          dataRuleConfig: '',
        };
      }
      openFieldRulesModal(true, {
        detail: {
          ...formState.value?.json,
          dataRuleEnabled: true,
        },
        modelKey: processInfo.value.modelKey,
      });
    }
  };

  const onRefresh = (params) => {
    Object.assign(formState.value.json!, params);
    validNodeData(props.node?.id);
  };

  const handleFormulaEdit = async () => {
    modelFields.value = await loadOptions(processInfo.value.modelKey);
    openModal({
      expr: formState.value?.formula?.exp || '',
      mode: ExpressionModeEnum.PAAS_BPMN_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: modelFields.value,
      },
      callback: (expr, exprEcho, options) => {
        formState.value.formula.exp = expr;
        formState.value.formula.expEcho = exprEcho;
        formState.value.formula.relationColumns = identify(expr);
        validNodeData(props.node?.id);
      },
    });
  };

  const map: Map<string, any[]> = new Map();
  const loadOptions = async (modelKey, level = 1) => {
    if (level > 3) {
      return [];
    }
    const items: any[] = [];
    let files: any[] = [];
    if (!map.has(modelKey)) {
      files = (await getFieldMetaList({ modelKey }))!;
      if (files && files.length > 0) {
        map.set(modelKey, files);
      } else {
        files = [];
      }
    } else {
      files = map.get(modelKey)!;
    }
    const all: Promise<void>[] = [];
    files.forEach((item) => {
      const opt: any = {
        id: item.key,
        name: item.name,
      };
      items.push(opt);
      if ((item.type === FIELD_TYPE.REF || item.type === FIELD_TYPE.RDO_REF) && level <= 3) {
        const fn = async () => {
          const arr = await loadOptions(item.bindInfo, level + 1);
          if (arr && arr.length > 0) {
            opt.children = arr;
          }
        };
        all.push(fn());
      }
    });
    await Promise.all(all);
    return items;
  };
</script>
<style lang="less" scoped></style>
