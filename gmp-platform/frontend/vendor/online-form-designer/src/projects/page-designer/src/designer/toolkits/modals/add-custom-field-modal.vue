<template>
  <basic-modal
    @register="registerInner"
    :title="$t('sys.pageDesigner.addSelectionField')"
    :maskClosable="false"
    :visible="visible"
    centered
    width="640px"
    :afterClose="handleClose"
    @ok="handleOk(false)"
  >
    <a-form
      ref="fieldFormRef"
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 11 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item name="dataSource" :label="$t('sys.pageDesigner.dataResource')">
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
          <!-- 字段类型 -->
          <a-form-item
            v-if="dataSource == 'fieldType'"
            :label="`${t('sys.field')}${t('sys.type')}`"
            name="type"
          >
            <a-select v-model:value="formState.type" :disabled="isEdit" @change="handleChange">
              <a-select-option v-for="item in options" :value="item" :key="item">
                {{ t(`sys.model.${item}`) }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- 字段名称 -->
          <i18n-select-input-form
            :formRef="fieldFormRef"
            formItemName="name"
            :fromItemExtraProps="{ label: t('sys.model.fieldName'), rules: [{ required: true }] }"
            :inputExtraProps="{ showCount: true, maxlength: 32 }"
            v-model:text="formState.name"
            v-model:i18nConfig="formState.i18nConfig"
          />
          <!-- 字段KEY -->
          <a-form-item
            :label="`${t('sys.field')}KEY`"
            name="key"
            :rules="[
              { required: true },
              { pattern: /^[a-z0-9_]+$/, message: t('sys.model.fieldKeyFormat') },
            ]"
          >
            <a-input
              v-model:value="formState.key"
              :addon-before="keyPrefix"
              :disabled="isEdit"
              show-count
              :maxlength="64 - keyPrefix.length"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
          <!-- 自定义描述 -->
          <a-form-item
            v-if="dataSource == FormComponents.ReadonlyCmp"
            :label="`${t('sys.description')}`"
            name="description"
          >
            <a-textarea
              v-model:value="formState.description"
              :autoSize="{ minRows: 3, maxRows: 6 }"
              :maxlength="120"
              :placeholder="$t('sys.inputText')"
              show-count
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel
          v-if="dataSource == 'fieldType'"
          key="2"
          :header="$t('sys.model.configOpt')"
        >
          <!-- 输入属性 -->
          <a-form-item
            v-if="fieldTypes.includes(formState.type)"
            :label="`${t('sys.model.inputAttr')}`"
            name="required"
          >
            <a-checkbox v-model:checked="requierdFlag" :disabled="isEdit">
              {{ t('sys.model.required') }}
            </a-checkbox>
          </a-form-item>

          <component
            v-if="[...fieldTypes, FIELD_TYPE.DATA_TABLE_FORMULA].includes(formState.type)"
            :is="FieldTypes[formState.type]"
            ref="compRef"
            v-model:formState="formState"
            :is-edit="isEdit"
            :boolSupportTree="false"
            :is-custom="true"
            :formRef="fieldFormRef"
            :tableData="table"
          />
          <!-- 描述 -->
          <a-form-item :label="`${t('sys.description')}`" name="description">
            <a-textarea
              v-model:value="formState.description"
              :autoSize="{ minRows: 3, maxRows: 6 }"
              :maxlength="120"
              :placeholder="$t('sys.inputText')"
              show-count
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    <!-- <template v-if="!isEdit" #centerFooter>
      <a-button type="primary" @click="onSaveAndContinue">
        {{ $t('sys.confirmAndContinue') }}
      </a-button>
    </template> -->
  </basic-modal>
</template>
<script setup lang="ts" name="add-custom-field-modal">
  import { ref, reactive, computed, toRaw, nextTick } from 'vue';
  import { useModalDragMove } from '/@/components/Modal/src/hooks/useModalDrag';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldTypes from '/@app-designer/views/model-desginer/entity/components/data-field/field-type-form/index';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { FIELD_TYPE, CreateType, UniqueConstraintType } from '@/enums/appEnum';
  import { FieldFormState } from '/@/projects/app-designer/src/views/model-desginer/entity/types/entity';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormInstance, message } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';
  import { FormComponents } from '/@page-designer/enum';

  interface TableType {
    id: string;
    model: string;
    validateCustomKey: Function;
  }

  const props = defineProps<{
    isForm?: boolean;
  }>();

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const visible = ref(false);
  const isEdit = ref(false);
  const activeKey = ref(['1', '2']);
  const { keyPrefix, keyPad, keyClip, keyReset } = useKeyParser('cus', '');
  const table = ref<TableType>({
    id: '',
    model: '',
    validateCustomKey: Function,
  });

  const fieldFormRef = ref<FormInstance>();
  const validateKey = ref<(key) => boolean | undefined>();
  const compRef = ref();
  const createType = ref<
    CreateType.CUSTOM | FormComponents.DataTableFormula | FormComponents.ReadonlyCmp
  >(CreateType.CUSTOM);

  const formState = reactive<FieldFormState>({
    type: FIELD_TYPE.TEXT,
    required: 0,
    description: '',
    modelKey: '',
    name: '',
    key: '',
    uniqueConstraint: {
      type: UniqueConstraintType.NONE,
      fieldKeys: undefined,
    },
    defaultValue: {
      type: FieldDefaultValueTypeEnum.NONE,
      value: undefined,
    },
    specificConfig: {},
    i18nConfig: '',
  });

  const fieldTypes: any = [
    FIELD_TYPE.TEXT,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.DECIMAL,
  ];

  const handleChange = (e) => {
    console.log(createType.value);
    if (!isEdit.value) {
      nextTick(() => {
        Object.assign(formState, {
          ...{
            name: '',
            key: '',
            required: 0,
            description: '',
            uniqueConstraint: {
              type: UniqueConstraintType.NONE,
              fieldKeys: undefined,
            },
            defaultValue: {
              type: FieldDefaultValueTypeEnum.NONE,
              value: undefined,
            },
            specificConfig: {},
            i18nConfig: '',
          },
          ...(compRef.value?.initData && typeof compRef.value?.initData === 'function'
            ? compRef.value?.initData()
            : {}),
        });
      });
    }
  };

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

  const requierdFlag = computed({
    get() {
      return formState.required === 1 ? true : false;
    },
    set(val: boolean) {
      formState.required = val ? 1 : 0;
    },
  });

  const options = computed(() => {
    const list = props.isForm
      ? [...fieldTypes, FIELD_TYPE.DATA_TABLE_FORMULA]
      : [FIELD_TYPE.DATA_TABLE_FORMULA];
    return list;
  });

  // modal拖拽的方法
  useModalDragMove({ visible, destroyOnClose: ref(false), draggable: ref(true) });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    formState.modelKey = data?.formData?.modelKey;
    isEdit.value = data?.isEdit;
    table.value = data?.tableData;
    data && data.formData?.key && onDataReceive(data.formData);
    if (data && data.formData?.validateKey && typeof data.formData?.validateKey === 'function') {
      validateKey.value = data.formData.validateKey;
    } else {
      validateKey.value = undefined;
    }
  });

  const onDataReceive = async (data) => {
    console.log('onDataReceive', data);
    if (isEdit.value) {
      createType.value = data.createType;
      const key = data.key ? keyClip(data.key) : '';
      Object.assign(formState, { ...data, key });
    } else {
      nextTick(() => {
        if (compRef.value?.initData && typeof compRef.value?.initData === 'function') {
          Object.assign(formState, compRef.value?.initData());
        }
      });
    }
  };

  const handleOk = async (conti: Boolean) => {
    await fieldFormRef.value?.validate();
    if (
      validateKey.value &&
      validateKey.value({ ...formState, key: keyPad(formState.key), isEdit: isEdit.value })
    ) {
      return false;
    }
    if (dataSource.value === FormComponents.ReadonlyCmp) {
      formState.type = FIELD_TYPE.READONLYCMP;
    }

    /**
     * 表格字段时添加的验证
     */
    if (!props.isForm && table.value.id && typeof table.value.validateCustomKey === 'function') {
      const res: boolean = table.value.validateCustomKey({
        ...formState,
        isEdit: isEdit.value,
        key: formState.key ? keyPad(formState.key) : undefined,
      });
      if (res) return;
    }

    const cloneFormState = {
      ...cloneDeep(toRaw(formState)),
      createType: createType.value,
      mappingType:
        formState.type == FIELD_TYPE.DATA_TABLE_FORMULA ? formState.mappingType : formState.type,
      key: keyPad(formState.key),
      id: keyPad(formState.key),
    };
    fieldFormRef.value?.resetFields();
    message.success(t('sys.appDesigner.addSuccess'));
    if (!conti) closeModal();
    emit('ok', cloneFormState);
    return true;
  };

  // const onSaveAndContinue = async () => {
  //   const type = formState.type;
  //   const result = await handleOk(true);
  //   if (result) handleClose(type);
  // };

  const handleClose = (type) => {
    keyReset();
    fieldFormRef.value?.resetFields();
    isEdit.value = false;
    Object.assign(formState, {
      type: type || FIELD_TYPE.TEXT,
      required: 0,
      description: '',
      modelKey: '',
      name: '',
      key: '',
      uniqueConstraint: {
        type: UniqueConstraintType.NONE,
        fieldKeys: undefined,
      },
      defaultValue: {
        type: FieldDefaultValueTypeEnum.NONE,
        value: undefined,
      },
      specificConfig: {},
      i18nConfig: '',
    });
  };
</script>
<style lang="less" scoped></style>
