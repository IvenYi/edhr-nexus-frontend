<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? `${t('sys.edit')}${t('sys.field')}` : `${t('sys.new')}${t('sys.field')}`"
    centered
    width="860px"
    :maskClosable="false"
    :afterClose="handleClose"
    :cancel-text="isEdit ? $t('sys.cancel') : $t('sys.editor.prev')"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="fieldFormRef"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <a-form-item :label="`${t('sys.field')}${t('sys.type')}`" name="type">
            <a-select
              v-model:value="formState.type"
              :options="fieldTypeOptions"
              :disabled="isEdit || isExtField"
              show-search
              optionFilterProp="label"
            />
          </a-form-item>
          <i18n-select-input-form
            :formRef="fieldFormRef"
            formItemName="name"
            :fromItemExtraProps="{
              label: t('sys.model.fieldName'),
              rules: [{ required: true }, { validator: nameValidator, trigger: 'blur' }],
            }"
            :inputExtraProps="{ showCount: true, maxlength: 32 }"
            v-model:text="formState.name"
            v-model:i18nConfig="formState.i18nConfig"
          />

          <a-form-item v-if="isAutoField" :label="`${t('sys.field')}KEY`">
            <template v-if="isAutoField">
              {{ autoFieldKey }}
            </template>
          </a-form-item>

          <a-form-item
            v-else
            :label="`${t('sys.field')}KEY`"
            name="key"
            :rules="[
              { required: true },
              { validator: validateSpecialCharacters },
              { validator: fieldKeyValidator, trigger: 'blur' },
            ]"
          >
            <a-input
              v-if="isUserDefined"
              v-model:value="formState.key"
              :addon-before="keyPrefix"
              :addon-after="keySuffix"
              :disabled="isEdit"
              show-count
              :maxlength="63 - keyPrefix.length - keySuffix.length"
              :placeholder="t('sys.inputText')"
            />

            <a-input
              v-else
              v-model:value="formState.key"
              :disabled="isEdit"
              show-count
              :maxlength="64"
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item
            :label="`${t('sys.model.inputAttr')}`"
            v-show="
              ![
                FIELD_TYPE.SERIAL,
                FIELD_TYPE.BOOLEAN,
                FIELD_TYPE.EXPRESSION,
                FIELD_TYPE.AGG,
              ].includes(formState.type) ||
              (formState.type === FIELD_TYPE.BOOLEAN && isInOnlineForm)
            "
            name="required"
          >
            <a-checkbox v-model:checked="requierdFlag">
              {{ t('sys.model.required') }}
            </a-checkbox>
          </a-form-item>
          <template v-if="!isExtField">
            <a-form-item
              :label="`${t('sys.model.fieldAttr')}`"
              v-show="
                [
                  FIELD_TYPE.LONG_TEXT,
                  FIELD_TYPE.TEXT,
                  FIELD_TYPE.INTEGER,
                  FIELD_TYPE.LONG,
                  FIELD_TYPE.BOOLEAN,
                  FIELD_TYPE.DATE,
                  FIELD_TYPE.DATE_TIME,
                  FIELD_TYPE.TIME,
                  FIELD_TYPE.DECIMAL,
                  FIELD_TYPE.DOUBLE,
                  // FIELD_TYPE.ENUM,
                ].includes(formState.type) &&
                props.isRdoModel &&
                formState.createType === CreateType.USER_DEFINED
              "
              name="parentField"
              :extra="t('sys.model.appointToParentFieldTip')"
            >
              <a-checkbox v-model:checked="parentFieldFlag">
                {{ t('sys.model.appointToParentField') }}
              </a-checkbox>
            </a-form-item>
            <template
              v-if="
                isInOnlineForm &&
                !(
                  formState.type === FIELD_TYPE.DECIMAL ||
                  formState.type === FIELD_TYPE.USER ||
                  formState.type === FIELD_TYPE.USER_MULTI ||
                  formState.type === FIELD_TYPE.REF ||
                  formState.type === FIELD_TYPE.REF_MULTI ||
                  formState.type === FIELD_TYPE.MASTERSLAVE ||
                  formState.type === FIELD_TYPE.WAREHOUSE_IN_OUT ||
                  formState.type === FIELD_TYPE.RECORD_NO ||
                  formState.type === FIELD_TYPE.ORDER_NO ||
                  formState.type === FIELD_TYPE.ROUTING_OPERATION ||
                  formState.type === FIELD_TYPE.NOT_GOOD_REASON ||
                  formState.type === FIELD_TYPE.NOT_GOOD_GROUP ||
                  formState.type === FIELD_TYPE.SCRAP_REASON ||
                  formState.type === FIELD_TYPE.SCRAP_GROUP ||
                  formState.type === FIELD_TYPE.DEVICE_REF ||
                  formState.type === FIELD_TYPE.DEVICE_REF_MULTI ||
                  formState.type === FIELD_TYPE.DEVICE ||
                  formState.type === FIELD_TYPE.REPORTER ||
                  formState.type === FIELD_TYPE.WAREHOUSE_MANAGER ||
                  formState.type === FIELD_TYPE.PRODUCT ||
                  formState.type === FIELD_TYPE.SCRAP_MATERIAL
                )
              "
            >
              <field-unique-key
                v-show="
                  formState.type !== FIELD_TYPE.BOOLEAN &&
                  formState.type !== FIELD_TYPE.IMAGE &&
                  formState.type !== FIELD_TYPE.ATTACHMENT &&
                  formState.type !== FIELD_TYPE.SIGNATURE &&
                  formState.type !== FIELD_TYPE.OPTION &&
                  formState.type !== FIELD_TYPE.OPTION_MULTI
                "
                :is-tree-model="boolSupportTree"
                :is-disabled="isEdit"
                v-model:type="formState.uniqueConstraint.type"
                v-model:fieldKeys="formState.uniqueConstraint.fieldKeys"
              />
            </template>
            <component
              v-else
              :is="FieldTypes[computedComponentsName]"
              ref="compRef"
              v-model:formState="formState"
              :is-edit="isEdit"
              :isSubModel="isSubModel"
              :boolSupportTree="boolSupportTree"
              :formRef="fieldFormRef"
              :isDataModel="isDataModel"
              :hideUniqueKey="hideUniqueKey"
              :field-type="formState.type"
              :keyList="keyList"
            />
            <a-form-item
              v-if="!isInOnlineForm"
              :label="`${t('sys.description')}`"
              name="description"
            >
              <a-textarea
                v-model:value="formState.description"
                :autoSize="{ minRows: 3, maxRows: 6 }"
                :maxlength="120"
                :placeholder="t('sys.inputText')"
                show-count
              />
            </a-form-item>
          </template>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    <template v-if="!isEdit" #centerFooter>
      <a-button type="primary" @click="handleConfirm">{{ t('sys.confirmAndContinue') }}</a-button>
    </template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, toRaw, nextTick, watch, inject } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormInstance, message } from 'ant-design-vue';
  import { FieldFormState } from '../../../types/entity.d';
  import {
    FIELD_TYPE,
    FIELD_TYPE_BASIC,
    FIELD_TYPE_LOGIC,
    FIELD_TYPE_TRACE,
    FIELD_TYPE_BUSINESS,
    FIELD_TYPE_PRODUCE,
    FIELD_TYPE_MATERIAL,
    FIELD_TYPE_CATEGORY,
    UniqueConstraintType,
    CreateType,
    AggTypes,
  } from '@/enums/appEnum';
  import FieldTypes from '../field-type-form/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { resetReactiveState } from '/@/utils';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { omit, merge, cloneDeep } from 'lodash-es';
  import { postFieldMetaSave } from '/@/apis/gct-apaas/FieldMetaController';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import { postOnlineFormTmplSaveField } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { validateModelName } from '/@/utils/validate';
  import {
    getNeedShowFields,
    getNeedShowCategories,
    isTypeInGroup,
    generateAutoFieldKey,
  } from '../utils';

  const emit = defineEmits(['ok', 'register', 'refresh', 'prev']);

  const TRACE_FIELDS = Object.values(FIELD_TYPE_TRACE);
  const BUSINESS_FIELDS = Object.values(FIELD_TYPE_BUSINESS);
  const MATERIAL_FIELDS = Object.values(FIELD_TYPE_MATERIAL);
  const AUTO_FIELDS = [...TRACE_FIELDS, ...BUSINESS_FIELDS, ...MATERIAL_FIELDS];
  // 拓展字段
  const isExtField = ref(false);

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('f');
  const { keyPad: subKeyPad, keyClip: subKeyClip } = useKeyParser('fm', '');
  const isInOnlineForm = inject<boolean>('isInOnlineForm', false);
  const { appInfo } = useAppInfoStore();

  const props = withDefaults(
    defineProps<{
      isDataModel?: boolean;
      hideUniqueKey?: boolean;
      isSubModel?: boolean;
      dataModelConfirm?: Function;
      nameList?: string[];
      keyList?: string[];
      isRdoModel?: boolean;
      maxSubLevel?: number;
    }>(),
    {
      isDataModel: false,
      hideUniqueKey: false,
      isSubModel: false,
      dataModelConfirm: () => {},
      nameList: [],
      keyList: [],
      isRdoModel: false,
      maxSubLevel: 0,
    },
  );

  const compRef = ref();
  const isUserDefined = ref<boolean>(true); //是否是用户自建字段
  const fieldFormRef = ref<FormInstance>();
  const isEdit = ref(false);
  const boolSupportTree = ref<boolean>(false);
  const activeKey = ref(['1', '2']);
  const history = ref();
  const formStorageByType = ref({});
  const fieldNames = ref<any[]>([]);

  const formState = reactive<FieldFormState>({
    modelKey: '',
    name: '',
    key: '',
    type: '',
    required: 0,
    parentField: 0,
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
    createType: CreateType.USER_DEFINED,
  });

  const autoFieldKey = ref<string>('');

  watch(
    () => formState.type,
    (newV, oldV) => {
      if (!isEdit.value) {
        if (isExtField.value) {
          return formState.key;
        }
        const autoKey = generateAutoFieldKey(newV, AUTO_FIELDS, props.keyList);
        if (autoKey) {
          autoFieldKey.value = autoKey;
        }
      }

      // 切换type做数据缓存
      if (newV && oldV) {
        formStorageByType.value[oldV] = cloneDeep(toRaw(formState));
      }
      if (newV && !isEdit.value) {
        if (formStorageByType.value[newV]) {
          const obj = cloneDeep(formStorageByType.value[newV]);
          delete obj.type; // 防止type赋值再次触发watch
          Object.assign(formState, obj);
        } else {
          nextTick(() => {
            resetFormFields(newV);
          });
        }
      }
      if (
        oldV &&
        ![
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.DEVICE_REF,
          FIELD_TYPE.DEVICE_REF_MULTI,
          FIELD_TYPE.DEVICE,
        ].includes(formState.type)
      ) {
        formState.bindInfo = undefined;
      }
    },
  );

  const nameValidator = async (rule, value) => {
    await validateModelName(rule, value);
    if (fieldNames.value.includes(formState.name)) {
      return Promise.reject(
        t('sys.pageDesigner.fieldRepeatTip', {
          sth: '名称',
        }),
      );
    }
    return Promise.resolve();
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-z0-9_]+$/;
    if (!reg.test(value)) {
      callback(t('sys.model.fieldKeyFormat'));
    }
    callback();
  };

  const fieldKeyValidator = () => {
    const key = keyPrefix.value + formState.key + keySuffix.value;
    if (!isEdit.value && props.keyList.includes(key)) {
      return Promise.reject(
        t('sys.pageDesigner.fieldRepeatTip', {
          sth: '字段KEY',
        }),
      );
    }
    return Promise.resolve();
  };

  const requierdFlag = computed({
    get() {
      return formState.required === 1 ? true : false;
    },
    set(val: boolean) {
      formState.required = val ? 1 : 0;
    },
  });

  const parentFieldFlag = computed({
    get() {
      return formState.parentField === 1 ? true : false;
    },
    set(val: boolean) {
      formState.parentField = val ? 1 : 0;
    },
  });

  const fieldTypeOptions = computed(() => {
    // 定义分类数据映射
    const categoryDataMap = {
      [FIELD_TYPE_CATEGORY.BASIC]: FIELD_TYPE_BASIC,
      [FIELD_TYPE_CATEGORY.LOGIC]: FIELD_TYPE_LOGIC,
      [FIELD_TYPE_CATEGORY.TRACE]: FIELD_TYPE_TRACE,
      [FIELD_TYPE_CATEGORY.BUSINESS]: FIELD_TYPE_BUSINESS,
      [FIELD_TYPE_CATEGORY.MATERIAL]: FIELD_TYPE_MATERIAL,
      [FIELD_TYPE_CATEGORY.PRODUCE]: FIELD_TYPE_PRODUCE,
    };

    // 预计算显示字段和分类
    const NeedShowFields = getNeedShowFields({
      suiteKey: appInfo.suiteKey,
      isSubModel: props.isSubModel,
      isDataModel: props.isDataModel,
      isInOnlineForm,
      maxSubLevel: props.maxSubLevel,
    });

    const Need2ShowCategories = getNeedShowCategories({
      suiteKey: appInfo.suiteKey,
      isInOnlineForm,
    });

    // 生成可见的分类列表
    const visibleCategories = Object.values(FIELD_TYPE_CATEGORY).filter((item) =>
      Need2ShowCategories.includes(item),
    );

    // 构建字段选项
    return visibleCategories
      .map((category) => {
        if (!categoryDataMap[category]) return null;

        // 获取该分类的所有字段
        const fields = Object.entries(categoryDataMap[category]);

        // 转换为选项格式
        const options = fields
          .map(([key, value]) => ({
            label: t(`sys.pageDesigner.fieldCmp.${value}`),
            value,
          }))
          .filter((option: any) => NeedShowFields.includes(option.value));

        return {
          label: t(`sys.model.${category}`),
          options,
        };
      })
      .filter(Boolean); // 过滤掉可能的空值
  });

  const computedComponentsName = computed(() => {
    if (['master_slave'].includes(formState.type)) {
      return (isInOnlineForm ? 'of_' : '') + formState.type;
    } else if (
      [
        FIELD_TYPE.ROUTING_OPERATION,
        FIELD_TYPE.NOT_GOOD_REASON,
        FIELD_TYPE.NOT_GOOD_GROUP,
        FIELD_TYPE.SCRAP_REASON,
        FIELD_TYPE.SCRAP_GROUP,
        FIELD_TYPE.DEVICE_REF,
        FIELD_TYPE.DEVICE_REF_MULTI,
        FIELD_TYPE.DEVICE,
        FIELD_TYPE.PRODUCT,
        FIELD_TYPE.SCRAP_MATERIAL,
      ].includes(formState.type)
    ) {
      return 'business_ref';
    } else {
      return formState.type;
    }
  });

  const isAutoField = computed(
    () => isExtField.value || isTypeInGroup(formState.type, AUTO_FIELDS),
  );

  const getFinalFieldKey = () => {
    if (isAutoField.value) return autoFieldKey.value;
    return isUserDefined.value ? keyPad(formState.key) : formState.key;
  };

  const prepareFormData = () => {
    if (formState.type === FIELD_TYPE.WAREHOUSE_IN_OUT) {
      formState.refModelType = 'WAREHOUSE_IN_OUT';
    }
    return {
      ...cloneDeep(toRaw(formState)), // ! 不深拷贝的话对象引用会被污染
      key: getFinalFieldKey(),
      type:
        formState.type === FIELD_TYPE.WAREHOUSE_IN_OUT ? FIELD_TYPE.MASTERSLAVE : formState.type,
      defaultValue: {
        ...formState.defaultValue,
        value: Array.isArray(formState.defaultValue.value)
          ? formState.defaultValue.value.join(',')
          : formState.defaultValue.value,
      },
      subModelKey: formState.subModelKey ? subKeyPad(formState.subModelKey) : undefined,
      bindInfo: formState.bindInfo ?? '',
    };
  };

  const checkBusinessFieldLimit = () => {
    if (
      !isTypeInGroup(formState.type, [
        ...BUSINESS_FIELDS,
        ...MATERIAL_FIELDS.filter((e) => e !== FIELD_TYPE.WAREHOUSE_IN_OUT),
      ])
    )
      return true;

    if (isEdit.value) return true;

    // 检查当前模型是否已存在相同类型的业务字段
    const existsSameTypeField = props.keyList.some((key) => key.startsWith(formState.type));
    if (existsSameTypeField) {
      message.error(
        t('sys.model.businessFieldOnlyOnePerType', { type: t(`sys.model.${formState.type}`) }),
      );
      return false;
    }

    return true;
  };

  const [registerInner, { closeModal }] = useModalInner((data) => {
    activeKey.value = ['1', '2'];
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    const formData = cloneDeep(data);
    isExtField.value = data.key?.startsWith('ext_');
    isEdit.value = formData.isEdit;
    isUserDefined.value = !isEdit.value
      ? true
      : formData.createType === CreateType.USER_DEFINED && !data.isDataModelBiz;
    fieldNames.value = isEdit.value
      ? props.nameList.filter((i) => i != formData.name)
      : props.nameList;
    boolSupportTree.value = formData.boolSupportTree;
    history.value = formData.history;
    const key =
      isUserDefined.value && !isExtField.value
        ? formData.key
          ? keyClip(formData.key)
          : undefined
        : formData.key;

    const subModelKey =
      isInOnlineForm && formData.bindInfo ? subKeyClip(formData.bindInfo) : undefined;

    formData.defaultValue = formData.defaultValue ?? {
      type: FieldDefaultValueTypeEnum.NONE,
      value: undefined,
    };

    formData.uniqueConstraint = formData.uniqueConstraint ?? {
      type: UniqueConstraintType.NONE,
      fieldKeys: undefined,
    };

    Object.assign(formState, {
      ...omit(formData, ['isEdit', 'boolSupportTree']),
      key,
      subModelKey,
    });

    autoFieldKey.value = formData.key;

    nextTick(() => {
      if (
        !isEdit.value &&
        compRef.value?.initData &&
        typeof compRef.value?.initData === 'function'
      ) {
        Object.assign(formState, compRef.value?.initData());
      }
    });
  };

  const handleClose = (modelKey, fieldType) => {
    keyReset();
    fieldFormRef.value?.resetFields();
    boolSupportTree.value = false;
    isEdit.value = false;
    isUserDefined.value = true;
    resetReactiveState(formState, {
      modelKey: modelKey || '',
      name: '',
      key: '',
      type: fieldType || '',
      required: 0,
      parentField: 0,
      defaultValue: {
        type: FieldDefaultValueTypeEnum.NONE,
        value: undefined,
      },
      uniqueConstraint: {
        type: UniqueConstraintType.NONE,
        fieldKeys: undefined,
      },
      specificConfig: {},
      i18nConfig: '',
      createType: CreateType.USER_DEFINED,
    });
    formStorageByType.value = {};
  };

  // 确认并保存
  const handleConfirm = async () => {
    await fieldFormRef.value?.validate();

    if (!checkBusinessFieldLimit()) return;

    const formData = prepareFormData();

    if (!props.isDataModel) {
      await (isInOnlineForm ? postOnlineFormTmplSaveField(formData) : postFieldMetaSave(formData));
    } else {
      await props.dataModelConfirm?.(formData);
    }
    fieldFormRef.value?.resetFields();
    message.success(t('sys.createSuccess'));
    // handleClose(fromData.modelKey, fromData.type); // 这个方法不能触发watch，需手动重置
    const type =
      formData.refModelType === 'WAREHOUSE_IN_OUT' ? FIELD_TYPE.WAREHOUSE_IN_OUT : formData.type;
    resetFormFields(type);
    emit('refresh', {
      cb: () => {
        const autoKey = generateAutoFieldKey(type, AUTO_FIELDS, props.keyList);

        if (autoKey) {
          autoFieldKey.value = autoKey;
        }
      },
    });
    // closeModal();
    // emit('prev', { ...formState });
  };

  const handleOk = () => {
    fieldFormRef.value?.validate().then(() => {
      if (!checkBusinessFieldLimit()) return;
      const formData = prepareFormData();
      emit('ok', {
        ...formData,
        isEdit: isEdit.value,
      });
    });
  };

  const handleCancel = (e) => {
    closeModal();
    if (e.target.textContent === t('sys.editor.prev')) {
      emit('prev', { ...formState }, history.value);
    }
  };

  // watch(
  //   () => formState.type,
  //   () => {
  // Object.assign(formState, {
  //   ...{
  //     required: 0,
  //     parentField: 0,
  //     description: '',
  //     uniqueConstraint: {
  //       type: UniqueConstraintType.NONE,
  //       fieldKeys: undefined,
  //     },
  //     defaultValue: {
  //       type: FieldDefaultValueTypeEnum.NONE,
  //       value: undefined,
  //     },
  //     specificConfig: {
  //       aggConfig: {
  //         aggFunc: AggTypes.COUNT,
  //       },
  //     },
  //     i18nConfig: '',
  //     bindInfo: undefined,
  //   },
  // });
  //   },
  // );

  const resetFormFields = (type) => {
    Object.assign(formState, {
      ...{
        name: '',
        key: '',
        type,
        required: 0,
        parentField: 0,
        description: '',
        uniqueConstraint: {
          type: UniqueConstraintType.NONE,
          fieldKeys: undefined,
        },
        defaultValue: {
          type: FieldDefaultValueTypeEnum.NONE,
          value: undefined,
        },
        specificConfig: {
          codeVisibleNum: 12,
        },
        i18nConfig: '',
        bindInfo: undefined,
      },
      ...(compRef.value?.initData && typeof compRef.value?.initData === 'function'
        ? compRef.value?.initData()
        : {}),
    });
  };
</script>

<style lang="less" scoped>
  .series {
    :deep(.ant-form-item-label) {
      label {
        display: none;
      }
    }
  }

  :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
    margin-bottom: 12px;
    padding: 0 68px;
  }

  .select-item-tip {
    overflow: hidden;
    color: #bfbfbf;
    font-size: 12px;
    line-height: 1.1;
    word-wrap: break-word;
    white-space: normal;
  }

  :deep(.gct-data-linkage-config) {
    margin-right: 0;
    padding-right: 0;

    .gct-data-linkage-config-model-links__content {
      padding-left: 0;
    }
  }
</style>
