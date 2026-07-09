<template>
  <div>
    <span class="required-icon" v-if="formData.required_ && widget.props.field === 'value_'">
      *
    </span>
    <a-form-item
      ref="dynamicFormValueRef"
      :name="[widget.props.dynamicTableField, index, widget.props.field]"
      :rules="bindValueRules"
      style="width: 100%"
      :class="{
        'dynamic-form-item': true,
        'dynamic-form-item-range':
          (formData.validate_range_ || formData.remind_enabled_) &&
          ['max', 'min'].includes(inputNumberRemindType),
      }"
    >
      <!-- {{ formData }} -->
      <FieldSelect
        v-if="widgetType === FormComponents.Select"
        v-model:value="value"
        :design="false"
        :disabled="disabled"
        :readonly="readonly"
        :fieldType="FIELD_TYPE.REF"
        :type="widget.type"
        :tagStyle="widget.style"
        :options="formData.type_ === 'boolean' ? booleanOpts : options"
        :filterOption="false"
      />
      <FieldRadio
        v-else-if="widgetType === FormComponents.Radio"
        v-model:value="value"
        :disabled="disabled"
        :readonly="readonly"
        :fieldType="FIELD_TYPE.BOOLEAN"
        :tagStyle="widget.style"
        :design="false"
        :options="booleanOpts"
      />
      <image-upload
        v-else-if="widgetType === FormComponents.UploadImage"
        :modelValue="value"
        :isDesign="false"
        :readonly="readonly"
        :disabled="disabled"
        :maxSize="20"
        :maxCount="10"
        :accept="['jpg', 'jpeg', 'bmp', 'png']"
        @update:modelValue="updateValue"
      />
      <FieldUpload
        v-else-if="widgetType === FormComponents.UploadFile"
        :modelKey="modelKey"
        :modelValue="value"
        :isDesign="false"
        :readonly="readonly"
        :disabled="disabled"
        :maxSize="20"
        :maxCount="10"
        hideSwitch
        @update:modelValue="updateValue"
      />
      <component
        v-else-if="
          widgetType === FormComponents.Userpicker || widgetType === FormComponents.Department
        "
        :is="defComponet"
        v-model:modelValue="value"
        :formData="{}"
        :widget="widgetSchema"
        :getPopupContainer="getPopupContainer"
      />
      <a-switch
        :class="readonly ? 'field-boolean--readyonly' : null"
        v-else-if="widgetType === FormComponents.Switch"
        v-model:checked="value"
        :checked-children="formData.true_text_"
        :un-checked-children="formData.false_text_"
        :readonly="readonly"
      />
      <template v-else-if="readonly">
        <FieldReadonly :tagWidgetStyle="widget.style" :label="value" :is-design="false" />
      </template>
      <template v-else>
        <a-input
          v-if="widgetType === FormComponents.Input"
          v-model:value="value"
          :disabled="disabled"
        />
        <div v-if="widgetType === FormComponents.Inputnumber">
          <div
            class="text-10px text-[#666] mt--12px"
            v-if="
              (formData.validate_range_ || formData.remind_enabled_) &&
              ['max', 'min'].includes(inputNumberRemindType)
            "
          >
            <span
              v-if="!isNil(max)"
              :class="{ 'ant-form-item-explain-error': inputNumberRemindType === 'max' }"
            >
              {{ $t('sys.pageDesigner.upperLimit') }}: {{ max }}
            </span>
            <span
              v-if="!isNil(min)"
              :class="{
                ml5px: true,
                'ant-form-item-explain-error': inputNumberRemindType === 'min',
              }"
            >
              {{ $t('sys.pageDesigner.lowerLimit') }} :{{ min }}</span
            >
          </div>
          <a-input-number
            :disabled="disabled"
            :readonly="readonly"
            :precision="
              formData.type_ === 'integer'
                ? 0
                : isNumber(formData.digits_)
                  ? formData.digits_
                  : undefined
            "
            :min="formData.auto_fix_ && formData.validate_range_ ? min : undefined"
            :max="formData.auto_fix_ && formData.validate_range_ ? max : undefined"
            v-model:value="value"
          />
        </div>
        <a-date-picker
          v-if="widgetType === FormComponents.Datepicker"
          v-model:value="value"
          picker="date"
          :format="formData.pattern_ || 'YYYY-MM-DD'"
          valueFormat="YYYY-MM-DD"
        />
        <a-date-picker
          v-if="widgetType === FormComponents.DateTimepicker"
          v-model:value="value"
          :format="formData.pattern_ || 'YYYY-MM-DD HH:mm:ss'"
          valueFormat="YYYY-MM-DD HH:mm:ss"
          :show-time="{ format: formData.pattern_ || 'YYYY-MM-DD HH:mm:ss' }"
        />
      </template>
    </a-form-item>
  </div>
</template>

<script name="gct-dynamic-form-value" setup lang="ts">
  import { computed, toRefs, toRaw, watch, ref, nextTick, onMounted } from 'vue';
  import { FormComponents } from '/@page-designer/enum';
  import FieldSelect from '../../../__components__/formcomponent/FieldSelect';
  import FieldRadio from '../../../__components__/formcomponent/FieldRadio';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { AsyncGctComponents } from '/@page-designer/components/pcModule';
  import FieldReadonly from '../../../__components__/formcomponent/field-readonly.vue';
  import { cloneDeep, isBoolean, isNil, isNumber } from 'lodash-es';
  import { widget as Userpicker } from '../schema/userpicker';
  import { widget as Department } from '../schema/department';
  import { widget as UploadImage } from '../schema/upload-image';
  import { widget as UploadFile } from '../schema/upload-file';
  import { buildShortUUID } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { parseBoolean } from '/@/utils';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ImageUpload } from '/@/components/ImageUpload';
  import { FieldUpload } from '/@/components/FieldUpload';

  const { t } = useI18n();
  const Event = getPageEvent();
  const dynamicFormValueRef = ref();
  const inputNumberRemindType = ref('');

  const props = defineProps<{
    modelValue?: string;
    widget: any;
    formData: Object;
    index: Number;
  }>();
  const defComponet = computed(() => {
    if (widgetSchema.value && widgetSchema.value._plugin) {
      return AsyncGctComponents.getComponentByPluginTag(widgetSchema.value._plugin.key);
    }
    return AsyncGctComponents.getComponentByType(widgetSchema.value?.type as string);
  });
  const getPopupContainer = () => {
    return document.body;
  };
  const emit = defineEmits(['update:modelValue']);
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const { readonly, disabled } = toRaw(props.widget.props);
  const widgetSchema = ref<any>();
  const widgetType = computed(() => {
    let fieldType: FormComponents;
    if (formData.value.type_ === 'boolean') {
      if (formData.value.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else if (formData.value.show_type_ === 'switch') {
        fieldType = FormComponents.Switch;
      } else {
        fieldType = FormComponents.Radio;
      }
    } else if (formData.value.type_ === 'decimal') {
      if (formData.value.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else {
        fieldType = FormComponents.Inputnumber;
      }
    } else if (formData.value.type_ === 'integer') {
      if (formData.value.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else {
        fieldType = FormComponents.Inputnumber;
      }
    } else if (formData.value.type_ === 'string') {
      if (formData.value.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else {
        fieldType = FormComponents.Input;
      }
    } else if (formData.value.type_ === 'user') {
      fieldType = FormComponents.Userpicker;
      widgetSchema.value = cloneDeep(Userpicker);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.USER);
      widgetSchema.value.props.readonly = props.widget.props.readonly;
      widgetSchema.value.props.modelKey = props.widget.props.bindModelKey;
      widgetSchema.value.props.field = 'value_';
      transformI18n(widgetSchema.value.props);
    } else if (formData.value.type_ === 'user_multi') {
      fieldType = FormComponents.Userpicker;
      widgetSchema.value = cloneDeep(Userpicker);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.USER_MULTI);
      widgetSchema.value.props.readonly = props.widget.props.readonly;
      widgetSchema.value.props.modelKey = props.widget.props.bindModelKey;
      widgetSchema.value.props.fieldType = FIELD_TYPE.USER_MULTI;
      widgetSchema.value.props.field = 'value_';
      transformI18n(widgetSchema.value.props);
    } else if (formData.value.type_ === 'org') {
      fieldType = FormComponents.Department;
      widgetSchema.value = cloneDeep(Department);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.ORG);
      widgetSchema.value.props.readonly = props.widget.props.readonly;
      widgetSchema.value.props.modelKey = props.widget.props.bindModelKey;
      widgetSchema.value.props.field = 'value_';
      transformI18n(widgetSchema.value.props);
    } else if (formData.value.type_ === 'date') {
      fieldType = FormComponents.Datepicker;
    } else if (formData.value.type_ === 'date_time') {
      fieldType = FormComponents.DateTimepicker;
    } else if (formData.value.type_ === 'image') {
      fieldType = FormComponents.UploadImage;
      widgetSchema.value = cloneDeep(UploadImage);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.IMAGE);
      widgetSchema.value.props.readonly = props.widget.props.readonly;
      widgetSchema.value.props.modelKey = props.widget.props.bindModelKey;
      widgetSchema.value.props.field = 'value_';
    } else if (formData.value.type_ === 'attachment') {
      fieldType = FormComponents.UploadFile;
      widgetSchema.value = cloneDeep(UploadFile);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.ATTACHMENT);
      widgetSchema.value.props.readonly = props.widget.props.readonly;
      widgetSchema.value.props.modelKey = props.widget.props.bindModelKey;
      widgetSchema.value.props.field = 'value_';
    } else {
      fieldType = FormComponents.Input;
    }
    return fieldType;
  });
  const updateValue = async (fileValue) => {
    value.value = fileValue;
    dynamicFormValueRef.value?.onFieldChange();
  };
  const options = ref([]);
  watch(
    () => formData.value.options_,
    (val) => {
      options.value =
        val &&
        val.split(',').map((d) => {
          return {
            label: d,
            value: d,
          };
        });
    },
    { immediate: true },
  );

  const booleanOpts = computed(() => {
    let options = [
      { label: formData.value.true_text_ || t('sys.true'), value: true },
      { label: formData.value.false_text_ || t('sys.fake'), value: false },
    ];
    if (readonly && value.value !== undefined) {
      options = options.filter((i) => i.value == value.value);
    }
    return options;
  });
  // watch(
  //   [() => formData.value.true_text_, () => formData.value.false_text_],
  //   ([newVal1, newVal2]) => {
  //     booleanOpts.value = [
  //       {
  //         label: newVal1 || '真',
  //         value: true,
  //       },
  //       {
  //         label: newVal2 || '假',
  //         value: false,
  //       },
  //     ];
  //   },
  //   { immediate: true },
  // );
  ///////////有关value_赋值 如果没有值则需要用default_value_赋值
  onMounted(async () => {
    await nextTick();
    if (widgetType.value === FormComponents.Radio || formData.value.type_ === 'boolean') {
      if (isNil(props.modelValue)) {
        if (isBoolean(formData.value.default_value_)) {
          value.value = formData.value.default_value_;
          return;
        }
        value.value = parseBoolean(formData.value.default_value_);
        return;
      }
      value.value = isBoolean(props.modelValue) ? props.modelValue : parseBoolean(props.modelValue);
      return;
    }
    console.log('formData.value.default_value_', formData.value.default_value_);
    console.log('formData.value', formData.value);
    value.value = props.modelValue || formData.value.default_value_;
    return;
  });

  const value = computed<any>({
    get() {
      let val = props.modelValue;
      return val;
    },
    set(v) {
      if (['image', 'attachment'].includes(formData.value.type_) && Array.isArray(v)) {
        v = v ? v.join(',') : '';
      }
      console.log('update-------------', v);
      emit('update:modelValue', v);
    },
  });
  const min = ref<number>();
  const max = ref<number>();
  const precision = ref(0);
  watch(
    () => formData.value.type_,
    (val) => {
      if (val) {
        if (val === 'integer') {
          precision.value = 0;
        }
      }
    },
  );
  watch(
    () => formData.value.digits_,
    (val) => {
      precision.value = formData.value.digits_;
    },
    { immediate: true },
  );

  watch(
    () => formData.value.min_decimal_,
    (val) => {
      if (formData.value.type_ === 'decimal') {
        min.value = val;
      }
    },
    { immediate: true },
  );
  watch(
    () => formData.value.max_decimal_,
    (val) => {
      if (formData.value.type_ === 'decimal') {
        max.value = val;
      }
    },
    { immediate: true },
  );
  watch(
    () => formData.value.min_int_,
    (val) => {
      if (formData.value.type_ === 'integer') {
        min.value = val;
      }
    },
    { immediate: true },
  );
  watch(
    () => formData.value.max_int_,
    (val) => {
      if (formData.value.type_ === 'integer') {
        max.value = val;
      }
    },
    { immediate: true },
  );
  watch(
    () => formData.value.value_,
    (val) => {
      if (formData.value.type_ === 'boolean') {
        formData.value.bool_value_ = val;
      } else if (formData.value.type_ === 'string') {
        formData.value.text_value_ = val;
      } else if (formData.value.type_ === 'integer') {
        formData.value.int_value_ = val;
      } else if (formData.value.type_ === 'decimal') {
        formData.value.double_value_ = val;
      } else if (formData.value.type_ === 'user') {
        formData.value.user_value_ = val;
      } else if (formData.value.type_ === 'org') {
        formData.value.org_value_ = val;
      } else if (formData.value.type_ === 'date') {
        formData.value.date_value_ = val;
      } else if (formData.value.type_ === 'date_time') {
        formData.value.date_time_value_ = val;
      } else if (formData.value.type_ === 'image') {
        formData.value.image_value_ = val;
      } else if (formData.value.type_ === 'attachment') {
        formData.value.attachment_value_ = val;
      }
    },
  );

  const bindValueRules = computed(() => {
    if (props.widget.props.field !== 'value_') {
      return [];
    }
    const rules: any[] = [];
    const { type_, required_, regex_, validate_range_, remind_enabled_ } = formData.value;
    if (required_) {
      rules.push({
        required: true,
        message: t('sys.pageDesigner.cannotBeEmpty'),
      });
    }
    if (type_ === 'boolean') {
      rules.push({
        validator: validateBoolean,
      });
    }
    if (type_ === 'string' && regex_) {
      const regExg = new RegExp(regex_);
      const validator = async (rule, val) => {
        await nextTick();
        if ((required_ || value.value) && !regExg.test(val)) {
          return Promise.reject(t('sys.pageDesigner.string') + t('sys.regError'));
        }
      };
      rules.push({
        validator: validator,
        // message: t('sys.pageDesigner.string') + t('sys.regError'),
      });
    }
    if ((type_ === 'decimal' || type_ === 'integer') && (validate_range_ || remind_enabled_)) {
      rules.push({
        validator: validateNumber,
      });
    }
    return rules;
  });

  function transformI18n(props) {
    const reg = /^\$\{(\S+)\}$/;
    for (const key in props) {
      const value = props[key];
      if (reg.test(value)) {
        props[key] = t(value.match(reg)?.[1]);
      }
    }
  }
  async function validateBoolean() {
    await nextTick();
    const { validate_true_, validate_false_ } = formData.value;
    if (validate_true_ && value.value != true) {
      return Promise.reject(t('sys.pageDesigner.booleanFalseError'));
    }
    if (validate_false_ && value.value != false) {
      return Promise.reject(t('sys.pageDesigner.booleanTrueError'));
    }
  }
  async function validateNumber() {
    await nextTick();
    const {
      min_int_,
      max_int_,
      min_decimal_,
      max_decimal_,
      type_,
      required_,
      validate_range_,
      remind_enabled_,
    } = formData.value;
    let min;
    let max;
    if (type_ === 'integer') {
      min = isNil(min_int_) ? NaN : min_int_;
      max = isNil(max_int_) ? NaN : max_int_;
    }
    if (type_ === 'decimal') {
      min = isNil(min_decimal_) ? NaN : Number(min_decimal_);
      max = isNil(max_decimal_) ? NaN : Number(max_decimal_);
    }
    inputNumberRemindType.value = '';
    if (required_ || value.value || value.value === 0) {
      if (min > value.value) {
        inputNumberRemindType.value = remind_enabled_ ? 'min' : '';
        if (validate_range_) {
          return Promise.reject(t('sys.pageDesigner.inputLessThanLowerError'));
        }
      }
      if (max < value.value) {
        inputNumberRemindType.value = remind_enabled_ ? 'max' : '';
        if (validate_range_) {
          return Promise.reject(t('sys.pageDesigner.inputGreaterThanUpperError'));
        }
      }
    }
  }
  defineExpose({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>

<style lang="less" scoped>
  .dynamic-form-item {
    padding: 0 !important;
    &-range {
      height: 70px;
      padding: 20px 0 !important;

      &.ant-form-item-has-error {
        padding: 16px 0 20px !important;
      }
    }
  }

  .ant-switch {
    &:not(.ant-switch-disabled).field-boolean--readyonly {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .required-icon {
    display: inline-block;
    margin-right: 2px;
    color: #ff4d4f;
    font-family: SimSun, sans-serif;
    font-size: 14px;
    line-height: 1;
  }
</style>
