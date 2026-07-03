<template>
  <a-form-item :label="t('分支规则')" :rules="[{ required: true }]">
    <a-button class="mb-8px" type="primary" ghost block @click="handleAddRule">新建规则</a-button>

    <div>
      <vue-draggable v-model="rules" :animation="200" ghostClass="ghost" itemKey="id">
        <template #item="{ element: r }">
          <div class="gateway-rule">
            <div>{{ r.title }}</div>
            <i class="iconfont icon-bianji" @click.stop="handleEditRule(r)"></i>
            <i class="iconfont icon-shanchu" @click.stop="handleDeleteRule(r)"></i>
          </div>
        </template>
      </vue-draggable>
    </div>
  </a-form-item>
</template>

<script lang="ts" setup>
  import { computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BpmnNode } from '../../types';
  import VueDraggable from 'vuedraggable';
  import { useBpmn } from '../../hooks/useBpmn';
  import { useModelFields } from '../../hooks/useModelFields';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    IdentifierItemInterface,
  } from '/@/components/Expression/index';
  import { useRules } from '../../hooks/useRules';

  const { t } = useI18n();
  const {
    setProperties,
    processResponse,
    globalSettingDataObject,
    getNodeOutgoingEdge,
    updateText,
  } = useBpmn();
  const { getModelFields } = useModelFields();
  const { openModal } = useExpression();
  const { setRules } = useRules();

  const props = defineProps<{
    id: string;
    formState: BpmnNode.BusinessTask;
    data: any;
  }>();

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      console.log(value);
      Object.assign(props.formState, value);
    },
  });

  const rules = computed({
    get() {
      return globalSettingDataObject.value.rules[props.id] ?? [];
    },
    set(value) {
      globalSettingDataObject.value.rules[props.id] = value;
    },
  });

  watch(
    () => props.formState,
    (value) => {
      console.log(value);
      setProperties(props.id, value);
    },
    {
      deep: true,
    },
  );

  const handleAddRule = async () => {
    const fields = await getModelFields(processResponse.value.tableMetaKey!);
    openModal({
      expr: '',
      exprName: '',
      mode: ExpressionModeEnum.GATEWAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: (fields ?? []).map((item) => ({
          id: item.key,
          name: item.name || item.key,
          valueType: item.type,
        })) as IdentifierItemInterface[],
      },
      callback: (expr, exprEcho, options) => {
        if (!globalSettingDataObject.value.rules) {
          globalSettingDataObject.value.rules = { [props.id]: [] };
        }
        if (!globalSettingDataObject.value.rules[props.id]) {
          globalSettingDataObject.value.rules[props.id] = [];
        }
        const data = {
          id: `rule_${Math.random().toString(16).substring(2, 8)}`,
          expr: expr,
          title: options?.exprName,
        };
        globalSettingDataObject.value.rules[props.id].push(data);
        setRules(globalSettingDataObject.value);
      },
    });
  };

  const handleEditRule = async (rule) => {
    const fields = await getModelFields(processResponse.value.tableMetaKey!);
    openModal({
      expr: rule.expr,
      exprName: rule.title,
      mode: ExpressionModeEnum.GATEWAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: (fields ?? []).map((item) => ({
          id: item.key,
          name: item.name || item.key,
          valueType: item.type,
        })) as IdentifierItemInterface[],
      },
      callback: (expr, exprEcho, options) => {
        const target = globalSettingDataObject.value.rules[props.id].find(
          (item) => item.id === rule.id,
        );
        if (!target) return;
        Object.assign(target, {
          expr,
          title: options?.exprName,
        });

        // 获取输出并修改title
        const outgoing = (getNodeOutgoingEdge(props.id) ?? []).find(
          (item) => item.properties.rule === target.id,
        );
        if (outgoing) {
          updateText(outgoing.id, target.title);
        }

        setRules(globalSettingDataObject.value);
      },
    });
  };

  const handleDeleteRule = (rule) => {
    globalSettingDataObject.value.rules[props.id] = globalSettingDataObject.value.rules[
      props.id
    ]!.filter((item) => item.id !== rule.id);
    setRules(globalSettingDataObject.value);
  };
</script>

<style lang="less" scoped>
  .gateway-rule {
    height: 40px;
    padding: 0 16px;
    background-color: #f5f5f5;
    align-items: center;
    display: flex;
    color: #333;
    margin-bottom: 6px;
    border-radius: 4px;
    cursor: move;
    line-height: 1em;
    border: 1px dashed #f5f5f5;

    &.ghost {
      border-color: var(--ant-primary-color);
    }

    .iconfont {
      color: #c1c1c1;
      cursor: pointer;

      &:nth-of-type(1) {
        margin-left: auto;
        &:hover {
          color: var(--ant-primary-color);
        }
      }
      &:nth-of-type(2) {
        margin-left: 12px;
        &:hover {
          color: var(--ant-error-color);
        }
      }
    }
  }
</style>
