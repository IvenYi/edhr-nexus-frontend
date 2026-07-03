<template>
  <a-button block type="primary" :ghost="!data.exp" size="small" @click="handleFormulaEdit">
    配置表达式
  </a-button>
</template>

<script setup lang="ts">
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    IdentifierItemInterface,
  } from '/@/components/Expression';
  import type { IGctBpmnNode, ICaseFormula } from '@gct/flow/src/plugins/bpmn/types';
  import { useBpmnSetting } from '../../hooks/useBpmnSetting';
  import { BpmnNodeTypeEnum, ButtonTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import { useGctFlow } from '@gct/flow';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    data: ICaseFormula;
  }>();

  const { openModal, identify } = useExpression();
  const { bpmnMasterModelFields } = useBpmnSetting();
  const { gctFlowDataMap } = useGctFlow();
  const { t } = useI18n();

  const getNodes = () => {
    return Object.values(gctFlowDataMap.value)
      .filter((item) =>
        [BpmnNodeTypeEnum.BpmnApproval, BpmnNodeTypeEnum.BpmnJudge].includes(
          item.node.type as BpmnNodeTypeEnum,
        ),
      )
      .map((item) => {
        const { data } = item.node as IGctBpmnNode;
        return {
          id: 'btn_' + data.key,
          // name: data.name || item.node.id,
          name: `${data.name}[${data.key}]`,
        };
      });
  };

  const handleFormulaEdit = () => {
    openModal({
      expr: props.data.exp || '',
      mode: ExpressionModeEnum.NOCODE_BPMN_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: (bpmnMasterModelFields.value ?? []).map((item) => ({
          id: item.key,
          name: item.name || item.key,
          valueType: item.type,
        })) as IdentifierItemInterface[],
        [ExpressionTabEnum.NODE]: [
          {
            id: 'node',
            name: $t('sys.expression.node'),
            children: getNodes(),
          },
          {
            id: 'button',
            name: $t('sys.pageDesigner.button'),
            children: Object.values(ButtonTypeEnum).map((item) => {
              return {
                id: `btn_${item}`,
                name: t('sys.bpmn.button.' + item),
              };
            }),
          },
        ],
      },
      callback: (expr, exprEcho, options) => {
        console.log(expr, exprEcho, options);
        props.data.exp = expr;
        props.data.expEcho = exprEcho;
        props.data.relationColumns = identify(expr);
      },
    });
  };
</script>

<style></style>
