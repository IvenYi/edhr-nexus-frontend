<template>
  <a-form-item
    :label="t('sys.model.aggModal')"
    name="bindInfo"
    :rules="[
      {
        required: true,
        message: t('sys.chooseText') + t('sys.model.aggModal'),
      },
    ]"
  >
    <a-select
      v-model:value="formData.bindInfo"
      :disabled="isEdit"
      :placeholder="t('sys.chooseText')"
      @change="handleModelChange"
      :showSearch="true"
      optionFilterProp="fieldName"
    >
      <a-select-opt-group v-for="(group, index) in options" :key="index">
        <template #label>
          <span>
            {{ group.name }}
          </span>
        </template>
        <a-select-option
          v-for="model in group.children"
          :key="model.key"
          :value="model.key"
          :fieldName="model.name"
          >{{ model.name }}</a-select-option
        >
      </a-select-opt-group>
    </a-select>
    <div v-show="!isEdit" class="tip">{{ t('sys.model.aggModelTip') }}</div>
  </a-form-item>

  <a-form-item
    label="关联字段"
    v-if="formData.bindInfo"
    name="bindFieldKey"
    :rules="[
      {
        required: true,
        message: `${t('sys.chooseText')}关联字段`,
      },
    ]"
  >
    <a-select
      v-model:value="formData.bindFieldKey"
      placeholder="请选择主子关联字段"
      :options="filterMasterSlaveOptions"
      :disabled="isEdit"
    />
  </a-form-item>

  <a-form-item
    :label="t('sys.model.aggTotal')"
    v-if="formData.bindInfo"
    required
    style="margin-bottom: 0"
  >
    <a-row :gutter="10">
      <a-col :span="formData.specificConfig?.aggConfig?.aggFunc === AggTypes.COUNT ? 24 : 10">
        <a-form-item :labelCol="{ span: 0 }">
          <a-select
            v-model:value="formData.specificConfig.aggConfig.aggFunc"
            @change="handleAggTypeChange"
            :disabled="isEdit"
          >
            <a-select-option v-for="value in AggTypes" :key="value" :value="value">
              {{ t('sys.model.' + value) }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="14">
        <a-form-item
          v-if="formData.specificConfig?.aggConfig?.aggFunc !== AggTypes.COUNT"
          :name="['specificConfig', 'aggConfig', 'relationColumns', 0]"
          :labelCol="{ span: 0 }"
          :rules="[
            { required: true, validator: checkField, message: t('sys.model.selectTipaggField') },
          ]"
        >
          <a-select
            v-model:value="formData.specificConfig.aggConfig.relationColumns[0]"
            :placeholder="t('sys.model.selectTipaggField')"
            :options="fieldOptions"
            :disabled="isEdit"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form-item>
  <a-form-item
    :label="`${t('sys.model.decimalDigits')}`"
    :name="['specificConfig', 'digits']"
    :rules="[{ required: true }]"
    v-if="formData.specificConfig?.aggConfig?.aggFunc === AggTypes.AVG"
  >
    <a-input-number
      v-model:value="formData.specificConfig.digits"
      :min="configDigits"
      :precision="0"
      :max="20"
      :placeholder="t('sys.inputText')"
    />
  </a-form-item>
</template>
<script setup lang="ts" name="agg">
  import { PropType, ref, watch, reactive, computed } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { useI18n } from 'vue-i18n';
  import { FormInstance } from 'ant-design-vue';
  import { AggTypes, FIELD_TYPE } from '@/enums/appEnum';
  import { getModelMetaAggModel, getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';

  const emit = defineEmits(['update:formState']);
  const { t } = useI18n();
  const options = ref<any[]>([]);
  // const fieldOptions = ref<any[]>([]);
  const allMasterSlaveOptions = ref<any[]>([]);

  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: () => {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
  });

  const formData = reactive<FieldFormState>(props.formState);
  const configDigits = props.isEdit ? formData.specificConfig.digits : 0;

  const initData = () => {
    return {
      specificConfig: {
        aggConfig: {
          aggFunc: '',
          relationColumns: [],
        },
        digits: 0,
      },
    };
  };

  const cacheAgg = ref<any[]>([]);

  watch(
    () => formData,
    (val) => {
      if (cacheAgg.value.some((e) => e.aggFunc === val.specificConfig?.aggConfig?.aggFunc)) {
        cacheAgg.value.forEach((e) => {
          if (e.aggFunc === val.specificConfig?.aggConfig?.aggFunc) {
            e.bindField = val.specificConfig?.aggConfig?.relationColumns?.[0];
          }
        });
      } else {
        cacheAgg.value.push({
          aggFunc: val.specificConfig?.aggConfig?.aggFunc,
          bindField: val.specificConfig?.aggConfig?.relationColumns?.[0],
        });
      }
      emit('update:formState', val);
    },
    { deep: true },
  );

  watch(
    () => formData.modelKey,
    async (val) => {
      if (val) {
        const res: any = await getModelMetaDetail({ modelKey: val });
        console.log('res', res);
        allMasterSlaveOptions.value = res.fieldMetaList
          .filter((item) => {
            return item.type === FIELD_TYPE.MASTERSLAVE;
          })
          .map((e) => {
            return {
              value: e.key,
              label: e.name,
              bindInfo: e.bindInfo,
            };
          });
      }
    },
    { immediate: true },
  );

  const filterMasterSlaveOptions = computed(() => {
    return allMasterSlaveOptions.value.filter((e) => e.bindInfo === formData.bindInfo);
  });

  const fieldOptions = computed(() => {
    return allFields.value
      .filter((e) => {
        console.log('e', e);
        return (
          (e.mappingType === FIELD_TYPE.INTEGER ||
            e.mappingType === FIELD_TYPE.LONG ||
            e.mappingType === FIELD_TYPE.DECIMAL ||
            ([AggTypes.MAX, AggTypes.MIN].includes(
              formData.specificConfig?.aggConfig?.aggFunc as AggTypes,
            ) &&
              (e.mappingType === FIELD_TYPE.DATE ||
                e.mappingType === FIELD_TYPE.DATE_TIME ||
                e.mappingType === FIELD_TYPE.TIME))) &&
          e.type !== FIELD_TYPE.EXPRESSION
        );
      })
      .map((e) => {
        return {
          value: e.key,
          label: e.name,
        };
      });
  });

  const checkField = () => {
    if (formData.specificConfig?.aggConfig?.relationColumns.length !== 0) return Promise.resolve();
    else return Promise.reject();
  };

  const allFields = ref<any[]>([]);

  // 汇总模型change
  const handleModelChange = async (modelKey) => {
    if (!props.isEdit) {
      // @ts-ignore
      formData.specificConfig.aggConfig.aggFunc = AggTypes.COUNT;
      // @ts-ignore
      formData.specificConfig.aggConfig.relationColumns = [];
      formData.bindFieldKey = undefined;
    }
    const res: any = await getModelMetaDetail({ modelKey });
    allFields.value = res.fieldMetaList;
  };

  const handleAggTypeChange = (val) => {
    if (props.isEdit) return;

    if (val !== AggTypes.AVG) {
      formData.specificConfig.digits = 0;
    }

    const idx = cacheAgg.value.findIndex((e) => e.aggFunc === val);
    // @ts-ignore
    formData.specificConfig.aggConfig.relationColumns =
      idx > -1 ? [cacheAgg.value[idx].bindField] : [];
  };

  // 汇总模型数据源
  const getModelOptions = async () => {
    const res = await getModelMetaAggModel({ modelKey: props.formState.modelKey });
    options.value = (res || []).filter((e) => {
      return e.children?.length;
    });
  };
  getModelOptions();

  if (props.isEdit) {
    handleModelChange(props.formState.bindInfo);
  }

  defineExpose({
    initData,
  });
</script>
<style lang="scss" scoped>
  .tip {
    color: #bfbfbf;
  }
</style>
