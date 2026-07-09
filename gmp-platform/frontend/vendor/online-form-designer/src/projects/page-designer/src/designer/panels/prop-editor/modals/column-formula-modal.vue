<template>
  <basic-modal
    @register="register"
    :title="title || $t('sys.pageDesigner.addFormulaSelectionField')"
    centered
    width="640px"
    :min-height="300"
    :maskClosable="false"
    @ok="handleOk"
  >
    <a-form
      ref="refForm"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <!-- {{ formState }} -->
      <a-collapse ghost v-model:activeKey="activeKey">
        <a-collapse-panel key="1" :header="$t('sys.pageDesigner.essentialInformation')">
          <a-form-item name="name" :label="$t('sys.pageDesigner.dataResource')">
            <a-radio-group
              v-model:value="dataSource"
              name="radioGroup"
              :disabled="isEdit"
              @change="handleChange"
            >
              <a-radio value="fieldType">
                {{ $t('sys.pageDesigner.fieldType') }}
              </a-radio>
              <a-radio :value="FormComponents.ReadonlyCmp">
                {{ $t('sys.pageDesigner.custom') }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <!-- <a-form-item name="name" :label="$t('sys.pageDesigner.dataResource')">
            <a-radio-group
              v-model:value="formState.createType"
              name="radioGroup"
              :disabled="isEdit"
            >
              <a-radio :value=" ">
                {{ $t('sys.pageDesigner.formula') }}
              </a-radio>
              <a-radio :value="FormComponents.ReadonlyCmp">
                {{ $t('sys.pageDesigner.custom') }}
              </a-radio>
            </a-radio-group>
          </a-form-item> -->

          <!-- 字段类型 -->
          <a-form-item
            v-if="dataSource == 'fieldType'"
            :label="`${$t('sys.field')}${$t('sys.type')}`"
            name="type"
          >
            <a-select v-model:value="formState.createType">
              <a-select-option v-for="item in options" :value="item" :key="item">
                {{
                  item === FormComponents.DataTableFormula
                    ? $t('sys.pageDesigner.formula')
                    : $t(`sys.model.${item}`)
                }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            name="label"
            :label="$t('sys.pageDesigner.fieldTitle')"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.fieldTitle') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <i18n-select-input
              attr="title"
              @on-i18n-select="handleI18nSelect"
              :i18nConfig="{ title: formState.labeli18n }"
            >
              <template #i18n-input>
                <a-input
                  style="width: calc(100% - 32px); height: 32px"
                  v-model:value.trim.lazy="formState.label"
                  :placeholder="$t('sys.inputText')"
                  :maxlength="32"
                  show-count
                />
              </template>
            </i18n-select-input>
          </a-form-item>

          <a-form-item
            label="Code"
            name="key"
            :rules="[
              { required: true },
              { pattern: /^[a-z0-9_]+$/, message: $t('sys.model.fieldKeyFormat') },
            ]"
          >
            <a-input
              v-model:value="formState.key"
              :addon-before="keyPrefix"
              show-count
              :maxlength="64 - keyPrefix.length"
              :placeholder="$t('sys.inputText')"
            />
          </a-form-item>

          <a-form-item
            name="remark"
            v-if="dataSource !== 'fieldType'"
            :label="$t('sys.pageDesigner.remark')"
          >
            <a-textarea
              v-model:value="formState.remark"
              :placeholder="$t('sys.inputText')"
              :maxlength="120"
              show-count
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel
          key="2"
          v-if="dataSource == 'fieldType'"
          :header="$t('sys.pageDesigner.configurationOption')"
        >
          <a-form-item
            name="formula"
            :label="$t('sys.pageDesigner.formula')"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.formula') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-input
              readonly
              @click="addFormula"
              :placeholder="$t('sys.inputText')"
              :value="formState.formula"
            />
          </a-form-item>
          <a-form-item name="remark" :label="$t('sys.pageDesigner.remark')">
            <a-textarea
              v-model:value="formState.remark"
              :placeholder="$t('sys.inputText')"
              :maxlength="120"
              show-count
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts" name="field-formula-editor">
  import { BasicModal, useModal } from '/@/components/Modal';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { reactive, ref, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
    ReturnTypeEnum,
    EntityFormulaReturnTypeEnum,
  } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FormComponents } from '/@page-designer/enum';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { FIELD_TYPE, CreateType } from '@/enums/appEnum';
  import { formulaFilter } from '@gct/runtime';

  defineProps({
    title: {
      type: String,
    },
  });

  const { keyPrefix, keyPad, keyClip } = useKeyParser('cus', '');

  const { openModal: openExp } = useExpression();
  const callback: any = ref();
  const activeKey = ref(['1', '2']);
  const [register, { openModal, closeModal }] = useModal();
  const refForm = ref<FormInstance>();
  const table = ref({ id: '', model: '', validateCustomKey: Function });
  const isEdit = ref<Boolean>(false);
  const createType = ref<
    CreateType.CUSTOM | FormComponents.DataTableFormula | FormComponents.ReadonlyCmp
  >(FormComponents.DataTableFormula);

  const fieldTypes: any = [
    FIELD_TYPE.TEXT,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.DECIMAL,
  ];

  const options = computed(() => {
    return [FormComponents.DataTableFormula];
  });

  const dataSource = computed({
    get() {
      return [CreateType.CUSTOM, FormComponents.DataTableFormula].includes(createType.value)
        ? 'fieldType'
        : FormComponents.ReadonlyCmp;
    },
    set(val) {
      createType.value =
        val === 'fieldType'
          ? fieldTypes.includes(formState.type)
            ? CreateType.CUSTOM
            : FormComponents.DataTableFormula
          : FormComponents.ReadonlyCmp;
    },
  });

  const formState = reactive({
    label: '',
    labeli18n: '',
    formula: '',
    remark: '',
    type: EntityFormulaReturnTypeEnum.Text,
    key: '',
    createType: FormComponents.DataTableFormula,
  });

  const handleChange = (e) => {
    console.log(e, createType.value);
  };

  async function addFormula() {
    openExp({
      expr: formState.formula,
      returnType: formState.type as EntityFormulaReturnTypeEnum,
      mode: ExpressionModeEnum.PAAS_CREATE_FIELD,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr, _, type) => {
        formState.formula = expr;
        formState.type = type!.returnType!;
        refForm.value?.validate();
      },
    });
  }
  const _getIdentifiers = async () => {
    const P = [
      {
        id: table.value.id,
        props: { name: $t('sys.pageDesigner.currTableRow'), model: table.value.model },
      },
    ]
      .filter((i) => i.props.model)
      .map(async (form) => {
        const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
        const children =
          fieldList
            ?.filter(formulaFilter)
            .map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
        return {
          id: form.id,
          name: form.props.name || form.id,
          children,
        };
      });
    const data = await Promise.all(P);
    return data;
  };
  async function open(
    tabledata: typeof table.value,
    data = { createType: FormComponents.DataTableFormula },
  ): Promise<typeof formState> {
    await refForm.value?.resetFields();
    table.value = tabledata;
    isEdit.value = data.isEdit || false;
    Object.assign(formState, { ...data, key: data.key ? keyClip(data.key) : undefined });
    openModal();
    return new Promise((resolve) => {
      callback.value = resolve;
    });
  }

  const handleOk = async () => {
    await refForm.value?.validate();
    const res = table.value.validateCustomKey({
      ...formState,
      isEdit: isEdit.value,
      key: formState.key ? keyPad(formState.key) : undefined,
    });
    if (typeof table.value.validateCustomKey === 'function' && res) {
      return;
    }
    closeModal();
    callback.value({
      ...formState,
      key: formState.key ? keyPad(formState.key) : undefined,
    });
  };
  function handleI18nSelect({ i18nKey, i18nTitle }) {
    formState.labeli18n = i18nKey;
    formState.label = i18nTitle;
  }
  defineExpose({ open });
</script>
<style scoped lang="less"></style>
