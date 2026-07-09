<template>
  <a-form-item
    :label="`${t('sys.model.associated')}${t('sys.model.enum')}`"
    name="bindInfo"
    :rules="[
      {
        required: true,
        message: `${t('sys.chooseText')}${t('sys.model.associated')}${t('sys.model.enum')}`,
      },
    ]"
  >
    <a-select
      v-model:value="formData.bindInfo"
      :disabled="isEdit"
      :placeholder="t('sys.chooseText')"
      :showSearch="true"
      optionFilterProp="name"
      @change="onEnumListChange"
    >
      <a-select-option
        v-for="item in enumTypeList"
        :value="item.key"
        :key="item.id"
        :name="item.name"
        >{{ item.name }}</a-select-option
      >
    </a-select>
  </a-form-item>
  <a-form-item :label="t('sys.model.customEnum')">
    <a-switch v-model:checked="customEnumEnabled" />
  </a-form-item>
  <a-form-item
    v-if="customEnumEnabled"
    :label="`${t('sys.model.enumValue')}`"
    :name="['specificConfig', 'customEnumConfig', 'values']"
    :rules="[
      { required: true, message: t('sys.chooseTextTip', { name: t('sys.model.enumValue') }) },
    ]"
  >
    <a-select
      v-model:value="customEnumValues"
      mode="multiple"
      :maxTagCount="5"
      :maxTagTextLength="6"
      allow-clear
      :placeholder="t('sys.chooseText')"
      @deselect="handleCusTomDesselect"
    >
      <template v-for="item in enumValues" :key="item.id">
        <a-select-option :value="item.value">{{ item.text }}</a-select-option>
      </template>
    </a-select>
  </a-form-item>
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'type']" v-show="false">
    <a-input :value="formData.defaultValue.type" />
  </a-form-item>
  <a-form-item :label="`${t('sys.defaultValue')}`" :name="['defaultValue', 'value']">
    <a-select
      v-model:value="formData.defaultValue.value"
      :placeholder="t('sys.chooseText')"
      @change="onSelectChange"
      allowClear
    >
      <a-select-option :value="FieldSysVarDefaultValueEnum.NULL">{{
        t('sys.none')
      }}</a-select-option>
      <a-select-option v-for="item in defaultEnumOptions" :value="item.value" :key="item.id">{{
        item.text
      }}</a-select-option>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="enum">
  import { PropType, watch, reactive, ref, computed } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import {
    FieldDefaultValueTypeEnum,
    FieldSysVarDefaultValueEnum,
  } from '@/projects/app-designer/src/enum';
  import { getEnumModelList } from '/@/apis/gct-apaas/EnumModelController';
  import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
  import { EnumModelFieldResponse, EnumModelResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
  });

  const formData = reactive<FieldFormState>(props.formState);

  const initData = () => {
    return {
      defaultValue: {
        type: FieldDefaultValueTypeEnum.NONE,
      },
      specificConfig: {
        customEnumConfig: {
          enabled: 0,
          values: [],
        },
      },
    };
  };
  const customStorage = ref({});

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  const enumTypeList = ref<EnumModelResponse[]>([]);
  const enumValues = ref<EnumModelFieldResponse[]>([]);

  const customEnumEnabled = computed({
    get() {
      const csEnum: any = formData.specificConfig?.customEnumConfig ?? {};
      return csEnum.enabled ? true : false;
    },
    set(val) {
      const oldObj = {
        defValue: undefined,
        cusEnum: formData.specificConfig.customEnumConfig?.values,
      };
      customStorage.value[val ? 0 : 1] = { ...oldObj };
      const curObj = customStorage.value[val ? 1 : 0];
      const csEnum: any = formData.specificConfig?.customEnumConfig || {};
      formData.specificConfig.customEnumConfig = {
        ...csEnum,
        enabled: val ? 1 : 0,
        values: curObj ? curObj.cusEnum : [],
      };
      formData.defaultValue.value = undefined;
    },
  });
  const customEnumValues = computed({
    get() {
      const csEnum: any = formData.specificConfig?.customEnumConfig ?? {};
      return csEnum.values || [];
    },
    set(val) {
      const csEnum: any = formData.specificConfig?.customEnumConfig || {};
      formData.specificConfig.customEnumConfig = {
        ...csEnum,
        values: val,
      };
    },
  });

  const defaultEnumOptions = computed(() => {
    return customEnumEnabled.value
      ? enumValues.value.filter((e) => customEnumValues.value.some((f) => e.value === f))
      : enumValues.value;
  });

  const handleCusTomDesselect = (value) => {
    if (value === formData.defaultValue.value) {
      formData.defaultValue.value = '';
    }
  };

  //获取枚举类型
  getEnumModelList().then((res) => {
    enumTypeList.value = res!;
  });

  const onSelectChange = (val) => {
    if (val === FieldSysVarDefaultValueEnum.NULL) {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
    } else {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.FIXED;
    }
  };

  const onEnumListChange = (val) => {
    if (val) {
      formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
      formData.defaultValue.value = undefined;
      customStorage.value = {};
      formData.specificConfig.customEnumConfig = {
        enabled: customEnumEnabled.value ? 1 : 0,
        values: [],
      };
    }
  };

  watch(
    () => formData.bindInfo,
    async (val) => {
      if (val) {
        const res = await getEnumModelFieldPageList({
          pageNo: 1,
          pageSize: 10000,
          enumModelKey: val,
        });
        enumValues.value = res?.data!;
      }
    },
    { immediate: true },
  );

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped></style>
