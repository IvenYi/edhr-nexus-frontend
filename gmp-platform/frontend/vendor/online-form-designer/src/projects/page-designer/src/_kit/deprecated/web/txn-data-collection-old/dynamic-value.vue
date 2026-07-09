<template>
  <a-form-item
    ref="dynamicValueRef"
    :name="[index, 'value_']"
    label=" "
    :colon="false"
    :rules="bindValueRules"
    style="width: 100%"
  >
    <image-upload
      v-if="widgetType === FormComponents.UploadImage"
      :modelValue="value"
      :isDesign="false"
      :readonly="readonly"
      :disabled="false"
      :maxSize="20"
      :maxCount="10"
      :accept="['jpg', 'jpeg', 'bmp', 'png']"
      @update:modelValue="updateValue"
    />
    <FieldUpload
      v-else-if="widgetType === FormComponents.UploadFile"
      hideSwitch
      :modelValue="value"
      :isDesign="false"
      :readonly="readonly"
      :disabled="false"
      :maxSize="20"
      :maxCount="10"
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
    <span v-else-if="props.readonly">{{ formateReadonlyValue(value) }}</span>
    <a-select
      v-else-if="widgetType === FormComponents.Select"
      v-model:value="value"
      :options="formData.type_ === 'boolean' ? booleanOpts : options"
    />
    <a-radio-group v-else-if="widgetType === FormComponents.Radio" v-model:value="value">
      <a-radio v-for="option in booleanOpts" :value="option.value" :key="String(option.value)">
        {{ option.label }}
      </a-radio>
    </a-radio-group>

    <a-switch
      v-else-if="widgetType === FormComponents.Switch"
      v-model:checked="value"
      :checked-children="formData.true_text_"
      :un-checked-children="formData.false_text_"
    />

    <a-input v-else-if="widgetType === FormComponents.Input" v-model:value="value" />
    <div v-else-if="widgetType === FormComponents.Inputnumber">
      <div
        class="text-10px text-[#666] mt--10px"
        v-if="formData.validate_range_ || formData.remind_enabled_"
      >
        <span
          v-if="max !== undefined"
          :class="{ 'ant-form-item-explain-error': inputNumberRemindType === 'max' }"
        >
          {{ $t('sys.pageDesigner.upperLimit') }}: {{ max }}
        </span>
        <span
          v-if="min !== undefined"
          :class="{ ml5px: true, 'ant-form-item-explain-error': inputNumberRemindType === 'min' }"
        >
          {{ $t('sys.pageDesigner.lowerLimit') }} :{{ min }}</span
        >
      </div>
      <a-input-number
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
      v-else-if="widgetType === FormComponents.Datepicker"
      v-model:value="value"
      picker="date"
      :format="formData.pattern_ || 'YYYY-MM-DD'"
      :valueFormat="'YYYY-MM-DD'"
    />
    <a-date-picker
      v-else-if="widgetType === FormComponents.DateTimepicker"
      v-model:value="value"
      :format="formData.pattern_ || 'YYYY-MM-DD HH:mm:ss'"
      :valueFormat="'YYYY-MM-DD HH:mm:ss'"
      :show-time="{ format: formData.pattern_ || 'YYYY-MM-DD HH:mm:ss' }"
    />
  </a-form-item>
</template>

<script setup lang="ts">
  import { FormComponents, FIELD_TYPE } from '@gct/runtime';
  import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { buildShortUUID } from '/@/utils/uuid';
  import { widget as Userpicker } from './schema/userpicker';
  import { widget as Department } from './schema/department';
  import { widget as UploadImage } from './schema/upload-image';
  import { widget as UploadFile } from './schema/upload-file';
  import { AsyncGctComponents } from '/@page-designer/components/pcModule';
  import { ImageUpload } from '/@/components/ImageUpload';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { cloneDeep, isBoolean, isNil, isNumber } from 'lodash-es';
  import { parseBoolean } from '/@/utils';

  const { t } = useI18n();
  const dynamicValueRef = ref();
  const inputNumberRemindType = ref('');

  const getPopupContainer = () => {
    return document.body;
  };
  const props = defineProps<{
    modelValue?: string;
    formData: any;
    index: number;
    readonly: boolean;
  }>();
  const { formData } = toRefs<{ [key: string]: any }>(props);

  const defComponet = computed(() =>
    AsyncGctComponents.getComponentByType(widgetSchema.value?.type as string),
  );

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
      widgetSchema.value.props.readonly = props.readonly;
      widgetSchema.value.props.modelKey = 'em_data_collection_entry';
      widgetSchema.value.props.field = 'value_';
      transformI18n(widgetSchema.value.props);
    } else if (formData.value.type_ === 'org') {
      fieldType = FormComponents.Department;
      widgetSchema.value = cloneDeep(Department);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.ORG);
      widgetSchema.value.props.readonly = props.readonly;
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
      widgetSchema.value.props.modelKey = 'em_data_collection_entry';
      widgetSchema.value.props.field = 'value_';
      widgetSchema.value.props.readonly = props.readonly;
    } else if (formData.value.type_ === 'attachment') {
      fieldType = FormComponents.UploadFile;
      widgetSchema.value = cloneDeep(UploadFile);
      widgetSchema.value.id = buildShortUUID(FIELD_TYPE.ATTACHMENT);
      widgetSchema.value.props.modelKey = 'em_data_collection_entry';
      widgetSchema.value.props.field = 'value_';
      widgetSchema.value.props.readonly = props.readonly;
    } else {
      fieldType = FormComponents.Input;
    }
    return fieldType;
  });
  const updateValue = async (fileValue) => {
    value.value = fileValue;
    dynamicValueRef.value?.onFieldChange();
  };
  const booleanOpts = computed(() => {
    return [
      {
        label: formData.value.true_text_ || t('sys.real'),
        value: true,
      },
      {
        label: formData.value.false_text_ || t('sys.fake'),
        value: false,
      },
    ];
  });
  const options = computed(() => {
    const opt = formData.value.options_;
    return (
      opt &&
      opt.split(',').map((d) => {
        return {
          label: d,
          value: d,
        };
      })
    );
  });
  const min = computed(() => {
    if (formData.value.type_ === 'decimal') {
      return formData.value.min_decimal_;
    } else if (formData.value.type_ === 'integer') {
      return formData.value.min_int_;
    }
    return undefined;
  });
  const max = computed(() => {
    if (formData.value.type_ === 'decimal') {
      return formData.value.max_decimal_;
    } else if (formData.value.type_ === 'integer') {
      return formData.value.max_int_;
    }
    return undefined;
  });
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
    console.log('props.modelValue', props.modelValue);
    value.value = props.modelValue || formData.value.default_value_;
    return;
  });
  const emit = defineEmits(['update:modelValue']);
  const value = computed<any>({
    get() {
      let val = props.modelValue;
      return val;
    },
    set(v) {
      if (
        [FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT].includes(formData.value.type_) &&
        Array.isArray(v)
      ) {
        v = v ? v.join(',') : '';
      }
      console.log('update-------------', v);
      emit('update:modelValue', v);
    },
  });
  const bindValueRules = computed(() => {
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
      return Promise.reject('该布尔值不能为假');
    }
    if (validate_false_ && value.value != false) {
      return Promise.reject('该布尔值不能为真');
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
          return Promise.reject('输入值小于设定下限');
        }
      }
      if (max < value.value) {
        inputNumberRemindType.value = remind_enabled_ ? 'max' : '';
        if (validate_range_) {
          return Promise.reject('输入值大于设定上限');
        }
      }
    }
  }

  function formateReadonlyValue(val) {
    const { type_ } = formData.value;
    if (type_ === 'boolean') {
      return val?.toString() === 'true' ? formData.value.true_text_ : formData.value.false_text_;
    }
    return value.value;
  }

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
</script>

<style lang="less" scoped>
  .ant-switch {
    &:not(.ant-switch-disabled).field-boolean--readyonly {
      opacity: 0.5;
      pointer-events: none;
    }
  }
  .required-icon {
    color: #ff4d4f;
    display: inline-block;
    font-family: SimSun, sans-serif;
    font-size: 14px;
    line-height: 1;
    margin-right: 2px;
  }
</style>
