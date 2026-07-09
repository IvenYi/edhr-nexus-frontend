<template>
  <a-form-item
    :label="t('sys.model.displayRule')"
    validate-first
    :name="['specificConfig', 'displayRule']"
    :rules="
      required
        ? [
            {
              required: true,
              trigger: 'change',
            },
            {
              validator: validateExpression,
              trigger: 'change',
            },
          ]
        : []
    "
  >
    <expression-card
      :config-disabled="!source || !fieldsMap[source]"
      ref="ExpressionCardRef"
      v-model:expr="expressionInEditor"
      @config="handleEditDisplayRule"
      :isSimple="true"
    />
  </a-form-item>
</template>

<script setup lang="ts" name="field-display-rule">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useExpression, {
    ExpressionCard,
    ExpressionModeEnum,
    ExpressionTabEnum,
  } from '/@/components/Expression/index';
  import type { Rule } from 'ant-design-vue/es/form';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { SHOW_FIELDTYPES } from '/@app-designer/enum/const';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const { t } = useI18n();
  const { openModal, identify } = useExpression();

  interface ValueProps {
    exp: string;
    exprInEditor: string;
    relationColumns: string[];
    fieldType?: FIELD_TYPE;
  }

  const props = defineProps({
    value: {
      type: Object as PropType<ValueProps>,
      default: {},
    },
    source: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: true,
    },
    fieldType: {
      type: String as PropType<FIELD_TYPE>,
      default: '',
    },
  });

  const emit = defineEmits(['update:value']);

  const validateExpression = async (_rule: Rule, value: ValueProps) => {
    let data = '';
    try {
      data = value.exp;
    } catch (err) {
      data = '';
    }
    if (data === '') {
      return Promise.reject(t('sys.notEmptySth', { sth: t('sys.model.displayRule') }));
    } else {
      return Promise.resolve();
    }
  };

  const fieldsMap = ref({
    USER: [
      {
        key: 'fullname',
        name: '姓名',
        type: 'string',
      },
      {
        key: 'empNo',
        name: '工号',
        type: 'string',
      },
      {
        key: 'username',
        name: '账号',
        type: 'string',
      },
      {
        key: 'mobile',
        name: '手机号码',
        type: 'string',
      },
      {
        key: 'masterOrgName',
        name: '直属部门名称',
        type: 'string',
      },
    ],
  });

  watch(
    () => props.source,
    async (value) => {
      if (fieldsMap.value[value] === undefined && value) {
        const res =
          (await getFieldMetaList({
            modelKey: props.source,
            sys: false,
            includeBuiltin: true,
          })) || [];
          const showFieldTypes = [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(props.fieldType) ? [...SHOW_FIELDTYPES, FIELD_TYPE.ENUM] : SHOW_FIELDTYPES ;
        fieldsMap.value[value] =
          res.filter((i) => showFieldTypes.includes(i.type as FIELD_TYPE) || i.key === 'default_') || [];
      }
    },
    { immediate: true },
  );

  const ExpressionCardRef = ref();
  const expression = computed<string>(() => {
    try {
      return props.value.exp;
    } catch (err) {
      return '';
    }
  });
  const expressionInEditor = computed<string>({
    get() {
      try {
        return props.value.exprInEditor;
      } catch (err) {
        return '';
      }
    },
    set(value: string) {
      // card组件中只能置空表达式
      emit('update:value', value ? { exp: '', exprInEditor: value, relationColumns: [] } : {});
    },
  });
  const handleEditDisplayRule = () => {
    const fields = fieldsMap.value[props.source];
    if (fields === undefined) return;
    openModal({
      expr: expression.value,
      mode: ExpressionModeEnum.EXPORT_TEMPLATE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: fields.map((item) => ({
          id: item.key,
          name: item.name || item.key,
          valueType: item.type,
        })),
      },
      callback: (expr, exprInEditor) => {
        const relationColumns = identify(expr);
        emit('update:value', { exp: expr, exprInEditor, relationColumns });
        ExpressionCardRef.value.onFieldChange();
      },
    });
  };
</script>

<style lang="less" scoped></style>
