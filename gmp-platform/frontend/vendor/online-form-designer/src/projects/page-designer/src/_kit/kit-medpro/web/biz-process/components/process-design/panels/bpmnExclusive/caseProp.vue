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
          attr="i18nKey"
          :i18nConfig="formState.i18n"
          :btnHeight="'24px'"
          :btnWidth="'26px'"
          @on-i18n-select="handleI18nSelect"
        >
          <template #i18n-input>
            <a-input
              style="width: calc(100% - 26px); height: 24px"
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
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import { computed, inject, provide } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { useProcess } from '../../hook/useProcess';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import FormItem from '../../components/form-item.vue';
  import FieldCondition from '../../components/field-condition.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/biz-bpmn/enums';

  const props = defineProps<{
    caseId?: string;
    node: GctBpmnNode.BpmnExclusive | GctBpmnNode.BpmnParallel;
  }>();

  provide('isDataFilterEditor', true);
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const { t } = useI18n();
  const { flowSelectedId } = useGctFlow('bizBpmn');
  const { openModal, identify } = useExpression();
  const { processInfo, getParentNodesByType } = useProcess();

  const caseFlowNode = computed(() => {
    return props.node.children.find((item) => item.id === flowSelectedId.value)!;
  });

  const formState = computed({
    get() {
      return caseFlowNode.value?.caseCfg || {};
    },
    set(value) {
      console.log('set');
      Object.assign(caseFlowNode.value?.caseCfg ?? {}, value);
    },
  });

  const dataRuleExp = computed(() => {
    return JSON.parse(formState.value?.json?.dataRule || '{}').exp;
  });

  const handleI18nSelect = (params) => {
    formState.value.i18n = JSON.stringify(params);
    // formState.value.name = t(params.i18nKey);
  };

  const handleCaseTypeChange = (val) => {
    formState.value.formula = undefined;
    formState.value.json = undefined;
    if (val === 'FORMULA') {
      formState.value.formula = {};
    }
  };
  const onClickInput = async () => {
    const parentNodes = getParentNodesByType([
      BpmnNodeTypeEnum.BpmnBizDocument,
      BpmnNodeTypeEnum.BpmnForm,
    ]);
    const filterParentNodes = parentNodes.filter((e) => e.onlineFormModelKey);
    filterParentNodes.push({
      key: 'MAIN',
      name: processInfo.value.modelName,
      onlineFormModelKey: processInfo.value.modelKey,
      fixed: true,
    });
    const defaultKey = parentNodes.length ? parentNodes[parentNodes.length - 1].key : 'MAIN';
    const treeData = await getModelList(filterParentNodes, defaultKey);
    if (formState.value.type === 'FORMULA') {
      handleFormulaEdit(treeData);
    } else {
      openConditionModal(treeData);
    }
  };

  const handleFormulaEdit = async (treeData) => {
    openModal({
      expr: formState.value?.formula?.exp || '',
      mode: ExpressionModeEnum.MEDPRO_BUSINESSFLOW,
      identifiers: {
        [ExpressionTabEnum.FIELD]: treeData.map((e) => {
          return {
            ...e,
            children: e.children.filter((f) => {
              const types = [
                FIELD_TYPE.TEXT,
                FIELD_TYPE.LONG_TEXT,
                FIELD_TYPE.INTEGER,
                FIELD_TYPE.LONG,
                FIELD_TYPE.DECIMAL,
                FIELD_TYPE.DOUBLE,
                FIELD_TYPE.BOOLEAN,
                FIELD_TYPE.DATE,
                FIELD_TYPE.TIME,
                FIELD_TYPE.DATE_TIME,
                FIELD_TYPE.USER,
                FIELD_TYPE.USER_MULTI,
                FIELD_TYPE.ORG,
                FIELD_TYPE.ORG_MULTI,
                FIELD_TYPE.ENUM,
                FIELD_TYPE.ENUM_MULTI,
                FIELD_TYPE.REF,
                FIELD_TYPE.REF_MULTI,
                FIELD_TYPE.OPTION,
                FIELD_TYPE.OPTION_MULTI,
              ];
              return (
                ((f.createType === CreateType.USER_DEFINED ||
                  (f.createType === CreateType.BUILTIN && f.initCommitId === '__0000__')) &&
                  types.includes(f.type)) ||
                (f.createType === CreateType.BUILTIN &&
                  ['name_', 'description_', 'version_'].includes(f.key)) ||
                (f.createType === CreateType.SYSTEM &&
                  [
                    'id_',
                    'tenant_id_',
                    'create_time_',
                    'create_user_id_',
                    'create_org_id_',
                    'modify_time_',
                    'modify_user_id_',
                    'modify_org_id_',
                  ].includes(f.key))
              );
            }),
          };
        }),
      },
      callback: (expr, exprEcho, options) => {
        formState.value.formula!.exp = expr;
        formState.value.formula!.expEcho = exprEcho;
        formState.value.formula!.relationColumns = identify(expr);
      },
    });
  };

  const openConditionModal = async (treeData) => {
    if (!formState.value.json) {
      formState.value.json = {
        dataRule: '',
        dataRuleConfig: '',
      };
    }
    const res = await gct.openUtil.modal(
      FieldCondition,
      {
        treeData,
        detail: formState.value?.json,
        mainModelKey: processInfo.value.modelKey,
      },
      {
        title: $t('sys.pageDesigner.fieldConditionRules'),
        width: 800,
        okText: $t('sys.okText'),
        showFooter: true,
      },
    );
    if (res.ok && res.params?.json) {
      Object.assign(formState.value.json!, res.params?.json);
    }
    console.log('res', res);
  };

  async function getModelList(data, defaultKey) {
    const fieldsList: any[] = [];
    const modelKeys: any[] = [...new Set(data.map((e) => e.onlineFormModelKey))];
    const fnList = modelKeys.map((e) => getFields(e));
    const list = await Promise.all(fnList);
    data.forEach((e: any) => {
      const obj: any = list.find((f) => f.modelKey === e.onlineFormModelKey) || {};
      const children = obj.fields || [];
      fieldsList.push({
        ...e,
        name: e.key === 'MAIN' ? e.name : obj.modelName,
        nodeName: e.name,
        children: children.map((f) => {
          return { ...f, id: f.key };
        }),
        defaultValue: defaultKey === e.key,
        id: `${e.prevKey || e.key}.${e.onlineFormModelKey}`,
      });
    });
    async function getFields(modelKey) {
      const res: any = await getModelMetaDetail({ modelKey });
      const fields = res.fieldMetaList?.map((e) => {
        return {
          ...e,
          modelName: res.name,
        };
      });
      return {
        modelKey,
        modelName: res.name,
        fields,
      };
    }
    return fieldsList;
  }
</script>
<style lang="less" scoped></style>
