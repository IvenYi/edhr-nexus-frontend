<template>
  <a-form-item
    v-if="sourceNodeType === BpmnElementEnum.ExclusiveGateway"
    :label="t('执行规则')"
    :rules="[{ required: true }]"
  >
    <a-radio-group class="" v-model:value="formState.rule" @change="handleChange">
      <a-radio :style="radioStyle" v-for="r in rules" :key="r.id" :value="r.id">{{
        r.title
      }}</a-radio>
    </a-radio-group>
  </a-form-item>

  <a-form-item
    v-else-if="sourceNodeType === BpmnElementEnum.ApprovalCateway"
    :label="t('执行规则')"
    :rules="[{ required: true }]"
  >
    <a-radio-group v-model:value="formState.rule" @change="handleChange">
      <a-radio :style="radioStyle" v-for="r in ApprovalRules" :key="r.id" :value="r.id">{{
        r.title
      }}</a-radio>
    </a-radio-group>
  </a-form-item>
</template>

<script lang="ts" setup>
  import { computed, watch, inject, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { UserType, TaskMode, BpmnNode, RollbackRule, BpmnElementEnum } from '../../types';
  import { JUEL_PRESET, ApprovalRules } from '../../constants';
  // import ControlProperty from '../control-property/index.vue';
  import { useBpmn } from '../../hooks/useBpmn';

  const { t } = useI18n();
  const { setProperties, globalSettingDataObject, getProperties, updateText } = useBpmn();

  const props = defineProps<{
    id: string;
    data: any;
    properties: BpmnNode.SequenceFlow;
    formState: BpmnNode.SequenceFlow;
  }>();

  const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
  });

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      console.log(value);
      Object.assign(props.formState, value);
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

  const sourceNodeType = computed(() => {
    const properties = getProperties(props.data.sourceNodeId);
    return properties._type_;
  });

  const rules = computed(() => {
    return globalSettingDataObject.value.rules[props.data.sourceNodeId];
  });

  const handleChange = (e) => {
    const id = e.target.value;
    if (sourceNodeType.value === BpmnElementEnum.ApprovalCateway) {
      const rule = ApprovalRules.find((item) => item.id === id);
      console.log(rule);
      updateText(props.id, rule!.title);
    } else if (sourceNodeType.value === BpmnElementEnum.ExclusiveGateway) {
      const rule = (rules.value ?? []).find((item) => item.id === id);
      console.log(rule);
      updateText(props.id, rule!.title);
    }
  };
</script>

<style lang="less" scoped></style>
