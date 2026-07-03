<template>
  <a-form-item
    :label="t('sys.process.titleConfig')"
    validate-first
    name="titleConfig"
    :rules="[
      {
        required: true,
        trigger: 'change',
      },
      {
        validator: validateExpression,
        trigger: 'change',
      },
    ]"
  >
    <expression-card
      :config-disabled="!source || !fieldsMap[source]"
      ref="ExpressionCardRef"
      v-model:expr="expressionInEditor"
      @config="handleEditDisplayRule"
    />
  </a-form-item>
</template>

<script setup lang="ts" name="process-title">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useExpression, {
    ExpressionCard,
    ExpressionModeEnum,
    ExpressionTabEnum,
  } from '/@/components/Expression/index';
  import type { Rule } from 'ant-design-vue/es/form';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';

  const { t } = useI18n();
  const { openModal, identify } = useExpression();

  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:value']);

  const validateExpression = async (_rule: Rule, value: string) => {
    let data = '';
    try {
      data = JSON.parse(value || '').expr;
    } catch (err) {
      data = '';
    }
    if (data === '') {
      return Promise.reject(t('sys.notEmptySth', { sth: t('sys.process.titleConfig') }));
    } else {
      return Promise.resolve();
    }
  };

  const fieldsMap = ref({});

  watch(
    () => props.source,
    async (value) => {
      if (fieldsMap.value[value] === undefined && value) {
        console.log(value);
        const res = await getFieldMetaList({ modelKey: props.source, sys: false });
        // console.log(res);
        fieldsMap.value[value] = res;
      }
    },
    { immediate: true },
  );

  const ExpressionCardRef = ref();
  const expression = computed<string>(() => {
    try {
      return JSON.parse(props.value || '').expr;
    } catch (err) {
      return '';
    }
  });
  const expressionInEditor = computed<string>({
    get() {
      try {
        return JSON.parse(props.value || '').exprEcho;
      } catch (err) {
        return '';
      }
    },
    set(value: string) {
      // card组件中只能置空表达式
      const displayRule = value
        ? JSON.stringify({ expr: '', exprEcho: value, relationColumns: [] })
        : '';
      emit('update:value', displayRule);
    },
  });
  const handleEditDisplayRule = () => {
    const fields = fieldsMap.value[props.source];
    if (fields === undefined) return;
    openModal({
      expr: expression.value,
      mode: ExpressionModeEnum.PROCESS_TITLE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: [
          {
            id: 'process_fields',
            name: '流程字段',
            idToChildren: false,
            children: [
              {
                id: '$PROCESS_NAME',
                name: '流程名称',
                valueType: 'string',
              },
            ],
          },
          {
            id: 'model_fields',
            name: '模型字段',
            idToChildren: false,
            children: fields.map((item) => ({
              id: item.key,
              name: item.name || item.key,
              valueType: item.type,
            })),
          },
        ],
      },
      callback: (expr, exprEcho) => {
        const relationColumns = identify(expr);
        const displayRule = JSON.stringify({ expr, exprEcho, relationColumns });
        emit('update:value', displayRule);
        ExpressionCardRef.value.onFieldChange();
      },
    });
  };

  // 人员类型初始化为fullname
  if (!props.value) {
    emit(
      'update:value',
      JSON.stringify({
        expr: '$PROCESS_NAME',
        exprEcho: '流程名称',
        relationColumns: ['$PROCESS_NAME'],
      }),
    );
  }
</script>

<style lang="less" scoped></style>
