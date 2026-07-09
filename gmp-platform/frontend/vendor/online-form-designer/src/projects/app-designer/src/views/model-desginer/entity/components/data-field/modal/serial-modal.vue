<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.model.addSection')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="seriesForm"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.model.sectionType')" name="type" :rules="[{ required: true }]">
        <a-select
          v-model:value="formState.type"
          style="width: 100%"
          :disabled="isIncrease"
          @change="handleTypeChange"
        >
          <template v-for="item in filterTypeEnum" :key="item">
            <a-select-option :value="TypeEnum[item]">{{ t(`sys.model.${item}`) }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <template v-if="formState.type === TypeEnum.FIXED">
        <a-form-item
          :label="t('sys.model.fixed')"
          :name="['config', 'value']"
          :rules="[{ required: true }]"
        >
          <a-input
            v-model:value="formState.config.value"
            :palceholder="t('sys.model.PleaseInputFixedValue')"
          />
        </a-form-item>
      </template>
      <!-- 填充符 -->
      <template v-if="formState.type === TypeEnum.PLACEHOLDER">
        <a-form-item
          :label="t('sys.model.modelFields')"
          :name="['config', 'modelKey']"
          :rules="[{ required: true }]"
        >
          <a-select v-model:value="formState.config.modelKey" style="width: 100%">
            <a-select-option v-for="item in fieldList" :value="item.key" :key="item.key">{{
              item.name
            }}</a-select-option>
          </a-select>
        </a-form-item>
      </template>
      <!-- 日期 -->
      <template v-if="formState.type === TypeEnum.DATE">
        <a-form-item
          :label="t('sys.model.argument')"
          :name="['config', 'patternType']"
          :rules="[{ required: true }]"
        >
          <a-select
            v-model:value="formState.config.patternType"
            style="width: 100%"
            @change="changePatternType"
          >
            <template v-for="(_item, key) in PatternEnum" :key="key">
              <a-select-option :value="key">{{ t(PatternEnum[key]) }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item
          v-show="formState.config.patternType === 'CUSTOM'"
          :label="t('sys.customize')"
          :name="['config', 'pattern']"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.config.pattern" />
        </a-form-item>
      </template>
      <!-- 自增 -->
      <template v-if="formState.type === TypeEnum.INCREASE">
        <a-form-item
          :label="t('sys.model.minimumLengthLimit')"
          :name="['config', 'minLength']"
          :rules="[{ required: true }]"
        >
          <a-input
            v-model:value="formState.config.minLength"
            :placeholder="t('sys.model.PleaseSettingMinimumLength')"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.model.startingSequenceNumber')"
          :name="['config', 'from']"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.config.from" />
        </a-form-item>
        <a-form-item
          :label="t('sys.model.placeholder')"
          :name="['config', 'padding']"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.config.padding" />
        </a-form-item>
        <a-form-item
          :label="t('sys.model.step')"
          :name="['config', 'step']"
          :rules="[{ required: true }]"
        >
          <a-input-number v-model:value="formState.config.step" :precision="0" />
        </a-form-item>
      </template>
      <!-- 字母 -->
      <template v-if="formState.type === TypeEnum.LETTER">
        <a-form-item
          :label="t('sys.model.format')"
          :name="['config', 'upper']"
          :rules="[{ required: true }]"
        >
          <a-select v-model:value="formState.config.upper" style="width: 100%">
            <template v-for="(i, key) in letters" :key="key">
              <a-select-option :value="i.value">{{ t(i.label) }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </template>
      <template v-if="formState.type === TypeEnum.PLACEHOLDER || formState.type === TypeEnum.DATE">
        <a-form-item :label="t('sys.model.reset')" :name="['config', 'reset']">
          <a-checkbox v-model:checked="formState.config.reset" />
        </a-form-item>
      </template>
      <template v-if="formState.type === TypeEnum.DATE && formState.config.reset">
        <a-form-item :label="t('sys.model.resetCondition')" :name="['config', 'condition']">
          <a-select v-model:value="formState.config.condition" style="width: 100%">
            <template v-for="item in ResetConditionEnum" :key="item">
              <a-select-option :value="ResetConditionEnum[item]">{{
                t(`sys.${item}`)
              }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </template>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import {
    PatternEnum,
    ResetConditionEnum,
    SerialListType,
    TypeEnum,
  } from '../../../constant/serial';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EnumModelResponse } from '/@/apis/gct-apaas/model';
  import { resetReactiveState } from '/@/utils';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { buildShortUUID } from '/@/utils/uuid';
  import { omit } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  const emit = defineEmits(['ok', 'register']);
  const { createMessage } = useMessage();
  const isEdit = ref(false);
  const letters = ref([
    { value: 0, label: 'sys.model.lowercase' },
    { value: 1, label: 'sys.model.uppercase' },
  ]);
  const modelKey = ref();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (!data) {
      return;
    }
    if (data.serial?.id) {
      isEdit.value = true;
    }
    Object.assign(formState, data.serial);
    /**区域类型为填充符时参数模型赋值并进行数据查询 */
    modelKey.value = data?.modelKey;
    data?.modelKey && onDataReceive(data);
  });

  async function onDataReceive(data) {
    const res = await getFieldMetaList({ modelKey: data.modelKey });
    fieldList.value = res!;
  }

  const { t } = useI18n();
  const seriesForm = ref<FormInstance>();
  const formState = reactive<SerialListType>({
    id: '',
    type: TypeEnum.FIXED,
    config: {
      value: '',
      modelKey: '',
      pattern: 'yyyyMMdd',
      patternType: 'yyyyMMdd',
      condition: ResetConditionEnum.YEAR,
      minLength: 0,
      from: 0,
      padding: '',
      reset: false,
      step: 1,
    },
  });
  const fieldList = ref<EnumModelResponse[]>([]);

  const isIncrease = computed(() => {
    return isEdit.value && formState.type === TypeEnum.INCREASE;
  });

  const filterTypeEnum = computed(() => {
    if (isIncrease.value) {
      return TypeEnum;
    }

    return omit(TypeEnum, 'INCREASE');
  });

  const handleClose = () => {
    isEdit.value = false;
    resetReactiveState(formState, {
      id: '',
      type: TypeEnum.FIXED,
      config: {
        value: '',
        modelKey: '',
        pattern: 'yyyyMMdd',
        patternType: 'yyyyMMdd',
        condition: ResetConditionEnum.YEAR,
        minLength: 0,
        from: 0,
        padding: '',
        reset: false,
        step: 1,
      },
    });
  };

  const handleOk = () => {
    seriesForm.value?.validate().then(() => {
      let params = { ...formState };
      if (!isEdit.value) {
        params = { ...formState, id: buildShortUUID() };
      }
      emit('ok', { ...params, isEdit: isEdit.value });
      closeModal();
    });
  };

  const changePatternType = (value, option) => {
    if (value === 'CUSTOM') {
      formState.config.pattern = '';
    } else {
      formState.config.pattern = option.key;
    }
    console.log(value, option);
  };

  const handleTypeChange = (value) => {
    if (value === TypeEnum.PLACEHOLDER && !modelKey.value) {
      createMessage.warning(t('sys.model.modelConfigIsRequiredBeforeAddPlaceholder'));
    }
  };
</script>

<style lang="less" scoped></style>
