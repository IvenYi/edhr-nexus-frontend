<template>
  <a-form
    class="important-pt-24px"
    ref="formRef"
    :model="formState"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 15 }"
    @validate="handleValidate"
  >
    <a-row>
      <a-col :span="12">
        <a-form-item
          :label="$t('sys.pageDesigner.displayStyle')"
          name="type"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: '显示样式' }),
            },
          ]"
        >
          <a-select
            v-model:value="formState.type"
            :options="showTypeOptions"
            @change="handleShowTypeChange"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="itemTypeMap.standard.includes(formState.type!)">
        <a-form-item
          :label="labelAlias.standard"
          name="standard"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: labelAlias.standard }),
            },
          ]"
        >
          <a-input-number size="small" v-model:value="formState.standard" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="itemTypeMap.max.includes(formState.type!)">
        <a-form-item
          :label="labelAlias.upperLimit"
          name="max"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: labelAlias.upperLimit }),
            },
          ]"
        >
          <a-input-number size="small" v-model:value="formState.max" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="itemTypeMap.min.includes(formState.type!)">
        <a-form-item
          :label="labelAlias.lowerLimit"
          name="min"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: labelAlias.lowerLimit }),
            },
            {
              validator: minValidator,
            },
          ]"
        >
          <a-input-number size="small" v-model:value="formState.min" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="itemTypeMap.sameTolerance.includes(formState.type!)">
        <a-form-item
          :label="'公差'"
          name="upperTolerance"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: '公差' }),
            },
          ]"
        >
          <a-input-number size="small" :min="0" v-model:value="sameTolerance" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="itemTypeMap.upperTolerance.includes(formState.type!)">
        <a-form-item
          :label="labelAlias.upperTolerance"
          name="upperTolerance"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: labelAlias.upperTolerance }),
            },
          ]"
        >
          <a-input-number size="small" :min="0" v-model:value="formState.upperTolerance" />
        </a-form-item>
      </a-col>
      <a-col :span="12" v-if="itemTypeMap.lowerTolerance.includes(formState.type!)">
        <a-form-item
          :label="labelAlias.lowerTolerance"
          name="lowerTolerance"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: labelAlias.lowerTolerance }),
            },
          ]"
        >
          <a-input-number size="small" :min="0" v-model:value="formState.lowerTolerance" />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
  <div :class="ns.b('example')">
    {{ $t('sys.onlineForm.example') + '：' }}<RangeLimitShower :value="saveValue" />
  </div>
</template>

<script setup lang="ts">
  import { FormInstance } from 'ant-design-vue';
  import { cloneDeep, defaults, isNil } from 'lodash-es';
  import { computed, inject, reactive, ref, watch } from 'vue';
  import { LabelAlias, SaveDataObj } from './use-rangelimit';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RangeLimitType } from '/@online-form/views/designer/enums';
  import RangeLimitShower from './rangelimit-shower.vue';
  import { useNamespace } from '@gct/runtime';
  import { minus, plus } from '/@/utils/number-util';

  const toleranceTypes = [RangeLimitType.SameTolerance, RangeLimitType.DifferentTolerance];

  const { t } = useI18n();

  const ns = useNamespace('rangelimit-modal');

  /** 字段别名 */
  const defaultLabelAlias = {
    upperLimit: $t('sys.onlineForm.upperLimit'),
    lowerLimit: $t('sys.onlineForm.lowerLimit'),
    standard: $t('sys.onlineForm.standardValue'),
    upperTolerance: $t('sys.onlineForm.upperTolerance'),
    lowerTolerance: $t('sys.onlineForm.lowerTolerance'),
  };

  const showTypeOptions = [
    {
      label: $t('sys.onlineForm.rangeLimitTypeLabel.Range'),
      value: RangeLimitType.Range,
    },
    {
      label: $t('sys.onlineForm.rangeLimitTypeLabel.OnlyUpperLimit'),
      value: RangeLimitType.OnlyUpperLimit,
    },
    {
      label: $t('sys.onlineForm.rangeLimitTypeLabel.OnlyLowerLimit'),
      value: RangeLimitType.OnlyLowerLimit,
    },
    {
      label: $t('sys.onlineForm.rangeLimitTypeLabel.SameTolerance'),
      value: RangeLimitType.SameTolerance,
    },
    {
      label: $t('sys.onlineForm.rangeLimitTypeLabel.DifferentTolerance'),
      value: RangeLimitType.DifferentTolerance,
    },
  ];

  const itemTypeMap = {
    max: [RangeLimitType.Range, RangeLimitType.OnlyUpperLimit],
    min: [RangeLimitType.Range, RangeLimitType.OnlyLowerLimit],
    standard: [RangeLimitType.SameTolerance, RangeLimitType.DifferentTolerance],
    upperTolerance: [RangeLimitType.DifferentTolerance],
    lowerTolerance: [RangeLimitType.DifferentTolerance],
    sameTolerance: [RangeLimitType.SameTolerance],
  };

  const modal = inject<any>('modal');
  const formRef = ref<FormInstance>();
  const props = defineProps<{
    alias?: Partial<LabelAlias>;
    value?: SaveDataObj;
  }>();

  const labelAlias = computed(() => {
    // props.alias || labelAlias;
    return defaults(
      {
        ...(props.alias || {}),
      },
      defaultLabelAlias,
    ) as LabelAlias;
  });

  const formState = reactive<{
    type: RangeLimitType | undefined;
    max: number | undefined;
    min: number | undefined;
    standard: number | undefined;
    upperTolerance: number | undefined;
    lowerTolerance: number | undefined;
  }>({
    type: undefined,
    min: undefined,
    max: undefined,
    standard: undefined,
    upperTolerance: undefined,
    lowerTolerance: undefined,
  });

  const sameTolerance = computed({
    get() {
      return formState.upperTolerance;
    },
    set(v) {
      formState.upperTolerance = v;
      formState.lowerTolerance = v;
    },
  });

  const saveValue = ref<SaveDataObj>();

  const clear = () => {
    formState.min = undefined;
    formState.max = undefined;
    formState.standard = undefined;
    formState.upperTolerance = undefined;
    formState.lowerTolerance = undefined;
    saveValue.value = undefined;
  };

  watch(
    () => props.value,
    (val) => {
      clear();
      if (isNil(val)) {
        formState.type = undefined;
      } else {
        saveValue.value = { ...props.value! };
        formState.type = val.type;
        if (toleranceTypes.includes(val.type)) {
          formState.standard = val.standard;
          formState.lowerTolerance = minus(val.standard!, val.min!);
          formState.upperTolerance = minus(val.max!, val.standard!);
        } else {
          formState.min = val.min;
          formState.max = val.max;
        }
      }
    },
    { immediate: true },
  );

  /**
   * 校验并计算最终保存的值
   */
  const validateAndCalcSaveValue = async (noValidate = false) => {
    try {
      if (!noValidate) {
        await formRef.value?.validate();
      }
      if (toleranceTypes.includes(formState.type!)) {
        saveValue.value = {
          type: formState.type!,
          standard: formState.standard,
          min: minus(formState.standard!, formState.lowerTolerance!),
          max: plus(formState.standard!, formState.upperTolerance!),
        };
      } else {
        saveValue.value = {
          type: formState.type!,
          min: formState.min,
          max: formState.max,
          standard: undefined,
        };
      }
      console.log('validateAndCalcSaveValue', saveValue.value);
    } catch (error) {
      saveValue.value = undefined;
      throw error;
    }
  };

  const handleShowTypeChange = () => {
    clear();
    Object.keys(validateResults).forEach((key) => {
      validateResults[key] = false;
    });
  };

  const minValidator = (_, __, _callback): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isNil(formState.min) && !isNil(formState.max) && formState.min >= formState.max) {
        reject($t('sys.onlineForm.lowerLimitCannotBeLessThanUpperLimit'));
      } else {
        resolve();
      }
    });
  };

  const validateResults = {
    min: false,
    max: false,
    standard: false,
    upperTolerance: false,
    lowerTolerance: false,
  };

  const needFields = {
    [RangeLimitType.SameTolerance]: ['standard', 'upperTolerance'],
    [RangeLimitType.Range]: ['min', 'max'],
    [RangeLimitType.DifferentTolerance]: ['standard', 'upperTolerance', 'lowerTolerance'],
    [RangeLimitType.OnlyLowerLimit]: ['min'],
    [RangeLimitType.OnlyUpperLimit]: ['max'],
  };

  const handleValidate = (name, status: boolean) => {
    if (name === 'type') {
      return;
    }
    if (Object.keys(validateResults).includes(name)) {
      validateResults[name] = status;
      if (status) {
        let isValid = true;
        needFields[formState.type!].find((key) => {
          // 该类型需要显示的属性，且属性是校验失败的
          if (!validateResults[key]) {
            isValid = false;
            return true;
          }
        });
        if (isValid) {
          validateAndCalcSaveValue(true);
        }
      }
    }
  };

  modal.ok = async () => {
    try {
      // 先校验，成功后提交
      await validateAndCalcSaveValue();
      return {
        ok: true,
        data: [cloneDeep(saveValue.value)],
      };
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style lang="scss" scoped>
  @include b(rangelimit-modal-example) {
    padding: 28px;
    font-size: 16px;
    font-weight: 600;
    border-top: 1px solid #e2e2e2;
  }
</style>
