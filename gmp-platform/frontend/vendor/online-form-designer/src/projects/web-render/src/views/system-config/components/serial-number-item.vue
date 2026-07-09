<template>
  <div :class="['series-item-wrapper', { 'series-disable': !isShow }]">
    <i class="iconfont icon-drag mover"></i>
    <div class="serial-item-container flex">
      <template v-if="fieldName === TypeEnum.INCREASE">
        <div
          class="flex flex-col mr-8px"
          :class="{ 'serial-num-no-error': minLength != undefined && minLength != null }"
        >
          <div class="tit">{{ t('sys.model.minimumLengthLimit') }}</div>
          <a-form-item-rest>
            <a-input-number v-model:value="minLength" :precision="0" :min="0" />
          </a-form-item-rest>
        </div>
        <div
          class="flex flex-col mr-8px"
          :class="{ 'serial-num-no-error': from != undefined && from != null }"
        >
          <div class="tit">{{ t('sys.model.startingSequenceNumber') }}</div>
          <a-form-item-rest>
            <a-input-number v-model:value="from" :precision="0" :min="0" />
          </a-form-item-rest>
        </div>
        <div class="flex flex-col mr-8px" :class="{ 'serial-num-no-error': padding }">
          <div class="tit">{{ t('sys.model.placeholder') }}</div>
          <a-form-item-rest>
            <a-input v-model:value="padding" />
          </a-form-item-rest>
        </div>
        <div class="flex flex-col mr-8px" :class="{ 'serial-num-no-error': step }">
          <div class="tit">{{ t('sys.model.step') }}</div>
          <a-form-item-rest>
            <a-input-number v-model:value="step" :precision="0" />
          </a-form-item-rest>
        </div>
        <div class="flex flex-col mr-10px serial-num-no-error">
          <div class="tit">{{ t('sys.model.endSerialNumber') }}</div>
          <a-form-item-rest>
            <a-input-number v-model:value="to" :precision="0" :min="0" />
          </a-form-item-rest>
        </div>
        <a-tooltip overlayClassName="serial-increase-tooltip">
          <template #title>
            <div class="tip-item" v-for="(str, index) in explain" :key="index">{{ str }}</div>
          </template>
          <question-circle-outlined style="margin-top: 20px; color: #c3c3c3; line-height: 30px" />
        </a-tooltip>
      </template>
      <template v-else>
        <div class="serial-num-no-error">
          <a-form-item-rest>
            <a-select
              style="width: 100px; margin-right: 8px"
              v-model:value="configValue.type"
              :disabled="isIncrease"
              @change="handleTypeChange"
            >
              <template v-for="item in filterTypeEnum" :key="item">
                <a-select-option :value="TypeEnum[item]">{{
                  t(`sys.model.${item}`)
                }}</a-select-option>
              </template>
            </a-select>
          </a-form-item-rest>
        </div>
        <template v-if="configValue.type === TypeEnum.FIXED">
          <div
            :class="{
              'serial-num-no-error': fixedValue || !serialValiIds?.includes(itemConfig.id),
            }"
          >
            <a-form-item-rest>
              <a-input
                style="width: 310px"
                v-model:value="fixedValue"
                :placeholder="t('sys.pageDesigner.inputplaceholder')"
              />
            </a-form-item-rest>
          </div>
        </template>
        <!-- 填充符 -->
        <template v-if="configValue.type === TypeEnum.PLACEHOLDER">
          <data-field-cascader
            :class="{
              'serial-num-no-error':
                configValue.config.modelKey || !serialValiIds?.includes(itemConfig.id),
            }"
            ref="fieldCascaderRef"
            style="width: 310px; margin-right: 8px"
            v-model:value="configValue.config.modelKey"
            :modelKey="modelKey"
            :isFeild="isFeild"
            @update:value="handleUpdate"
          />
        </template>
        <!-- 日期 -->
        <template v-if="configValue.type === TypeEnum.DATE">
          <div
            :class="{
              'serial-num-no-error':
                configValue.config.patternType || !serialValiIds?.includes(itemConfig.id),
            }"
          >
            <a-form-item-rest>
              <a-select
                v-model:value="configValue.config.patternType"
                @change="changePatternType"
                :style="dateSelectStyle"
              >
                <template v-for="(_item, key) in PatternEnum" :key="key">
                  <a-select-option :value="key">{{ t(PatternEnum[key]) }}</a-select-option>
                </template>
              </a-select>
            </a-form-item-rest>
          </div>
          <div
            :class="{ 'serial-num-no-error': pattern || !serialValiIds?.includes(itemConfig.id) }"
          >
            <a-form-item-rest>
              <a-input
                v-show="configValue.config.patternType === 'CUSTOM'"
                v-model:value="pattern"
                :style="dateSelectStyle"
                :placeholder="t('sys.inputText')"
              />
            </a-form-item-rest>
          </div>
        </template>
        <!-- 字母 -->
        <template v-if="configValue.type === TypeEnum.LETTER">
          <div
            :class="{
              'serial-num-no-error':
                configValue.config.upper || !serialValiIds?.includes(itemConfig.id),
            }"
          >
            <a-form-item-rest>
              <a-select
                v-model:value="configValue.config.upper"
                @change="handleValChange"
                style="width: 310px"
              >
                <template v-for="(item, index) in letters" :key="item.value + '_' + index">
                  <a-select-option :value="item.value">{{ t(item.label) }}</a-select-option>
                </template>
              </a-select>
            </a-form-item-rest>
          </div>
        </template>
      </template>

      <template v-if="configValue.type === TypeEnum.DATE && configValue.config.reset">
        <div
          :class="{
            'serial-num-no-error':
              configValue.config.condition || !serialValiIds?.includes(itemConfig.id),
          }"
        >
          <a-form-item-rest>
            <a-select
              v-model:value="configValue.config.condition"
              @change="handleValChange"
              :style="dateSelectStyle"
            >
              <template v-for="item in ResetConditionEnum" :key="item">
                <a-select-option :value="ResetConditionEnum[item]">{{
                  t(`sys.${item}`)
                }}</a-select-option>
              </template>
            </a-select>
          </a-form-item-rest>
        </div>
      </template>

      <template v-if="[TypeEnum.PLACEHOLDER, TypeEnum.DATE].includes(configValue.type)">
        <a-form-item-rest>
          <a-checkbox
            style="width: 70px; line-height: 30px"
            @change="handleValChange"
            v-model:checked="configValue.config.reset"
            >{{ t('sys.reset') }}</a-checkbox
          >
        </a-form-item-rest>
      </template>
    </div>
    <div class="action" @click="handleDelete">
      <delete-outlined v-if="fieldName !== TypeEnum.INCREASE && isShow" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import {
    PatternEnum,
    ResetConditionEnum,
    SerialListType,
    TypeEnum,
  } from '/@app-designer/views/model-desginer/entity/constant/serial';
  import { omit } from 'lodash-es';
  import type { CSSProperties } from 'vue';
  import DataFieldCascader from '/@app-designer/views/model-desginer/entity/components/data-field/components/data-field-cascader.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { message } from 'ant-design-vue';

  const { t } = useI18n();
  const letters = ref([
    { value: 0, label: 'sys.model.lowercase' },
    { value: 1, label: 'sys.model.uppercase' },
  ]);
  const isEdit = ref(false);
  const explain = ref<any[]>([
    t('sys.platform.serialNumber.minLength'),
    t('sys.platform.serialNumber.startNumber'),
    t('sys.platform.serialNumber.fillChar'),
    t('sys.platform.serialNumber.step'),
    t('sys.platform.serialNumber.endNumber'),
  ]);

  const emit = defineEmits(['del', 'update:itemConfig']);
  const props = defineProps<{
    fieldName: string;
    isShow: boolean;
    itemConfig: SerialListType;
    modelKey?: string;
    isFeild: boolean;
    required?: boolean;
    serialValiIds?: any[];
  }>();
  const fieldCascaderRef = ref();

  const isIncrease = computed(() => {
    return isEdit.value && configValue.value.type === TypeEnum.INCREASE;
  });

  const filterTypeEnum = computed(() => {
    if (isIncrease.value) {
      return omit(TypeEnum, 'PLACEHOLDER');
    }
    return omit(TypeEnum, 'INCREASE', 'PLACEHOLDER');
  });

  const minLength = computed({
    get() {
      return props.itemConfig.config.minLength;
    },
    set(value) {
      configValue.value.config.minLength = value || 0;
      emit('update:itemConfig', configValue.value);
    },
  });

  const from = computed({
    get() {
      return props.itemConfig.config.from;
    },
    set(value) {
      configValue.value.config.from = value || 0;
      emit('update:itemConfig', configValue.value);
    },
  });

  const to = computed({
    get() {
      return props.itemConfig.config.to;
    },
    set(value) {
      configValue.value.config.to = value === null ? undefined : value;
      emit('update:itemConfig', configValue.value);
    },
  });

  const padding = computed({
    get() {
      return props.itemConfig.config.padding;
    },
    set(value) {
      configValue.value.config.padding = value;

      emit('update:itemConfig', configValue.value);
    },
  });

  const step = computed({
    get() {
      return props.itemConfig.config.step;
    },
    set(value) {
      if (value === 0) {
        message.error(t('sys.platform.serialNumber.stepError'));
        return;
      }
      configValue.value.config.step = value || 1;
      emit('update:itemConfig', configValue.value);
    },
  });

  const fixedValue = computed({
    get() {
      return props.itemConfig.config.value;
    },
    set(value) {
      configValue.value.config.value = value;
      emit('update:itemConfig', configValue.value);
    },
  });

  const pattern = computed({
    get() {
      return props.itemConfig.config.pattern;
    },
    set(value) {
      configValue.value.config.pattern = value;
      emit('update:itemConfig', configValue.value);
    },
  });

  const configValue = computed<SerialListType>({
    get() {
      return props.itemConfig;
    },
    set(value) {
      emit('update:itemConfig', value);
    },
  });

  const handleUpdate = (value) => {
    configValue.value.config.modelKey = value;
    configValue.value.config.descName = fieldCascaderRef.value?.feildCascaderName;
    emit('update:itemConfig', configValue.value);
  };

  const dateSelectStyle = computed<CSSProperties>(() => {
    const patternType = configValue.value.config.patternType;
    const reset = configValue.value.config.reset;
    let width = 310;
    if (patternType === 'CUSTOM' && reset) {
      width = 98;
    } else if (patternType !== 'CUSTOM' && !reset) {
      width = 310;
    } else {
      width = 150;
    }
    return { width: `${width}px`, marginRight: '8px', background: '#fff' };
  });

  const handleDelete = () => {
    emit('del');
  };

  const handleTypeChange = (value) => {
    if (value === TypeEnum.LETTER) {
      configValue.value.config.upper = 1;
    }
    configValue.value.type = value;
    emit('update:itemConfig', configValue.value);
  };

  const changePatternType = (value, option) => {
    if (value === 'CUSTOM') {
      configValue.value.config.pattern = '';
    } else {
      configValue.value.config.pattern = option.key;
    }
    console.log(value, option);
    emit('update:itemConfig', configValue.value);
  };

  const handleValChange = () => {
    emit('update:itemConfig', configValue.value);
  };
</script>

<style lang="less" scoped>
  .series-item-wrapper {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 6px 8px 6px 6px;
    border-radius: 4px;
    background: #f2f4f7;
    user-select: none;

    &.series-disable {
      pointer-events: none;
    }

    .mover {
      position: absolute;
      bottom: 10px;
      left: 6px;
      color: #96a0b5;
      font-size: 16px;
      cursor: pointer;
    }

    .field-name {
      padding-left: 20px;
      color: #333;
    }

    .serial-item-container {
      width: 100%;
      padding-left: 24px;

      .tit {
        padding-left: 6px;
        color: #c3c3c3;
        font-size: 12px;
        line-height: 18px;
      }

      .tip {
        color: #c3c3c3;
      }
    }

    .action {
      margin-right: 2px;
      color: #797a7d;

      &:hover {
        color: #ff4d4f;
        cursor: pointer;
      }
    }

    &:hover {
      border-color: var(--ant-primary-color);

      .field-name,
      .mover {
        color: var(--ant-primary-color);
      }
    }
  }

  :deep(.ant-input-number) {
    background: #fff !important;
  }

  :deep(.ant-input-affix-wrapper) {
    background: #fff !important;
  }

  :deep(.ant-select .ant-select-selector) {
    background: #fff !important;
  }
</style>
<style lang="less">
  .serial-increase-tooltip {
    max-width: 320px;

    .ant-tooltip-arrow {
      .ant-tooltip-arrow-content {
        background: #fff;
      }
    }

    .ant-tooltip-inner {
      padding: 12px;
      background: #fff;
      color: inherit;
    }

    .tip-item {
      position: relative;
      margin-bottom: 8px;
      padding-left: 12px;
      color: #797a7d;
      font-size: 12px;
      line-height: 18px;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 4px;
        height: 4px;
        transform: translate(0, -50%);
        border-radius: 2px;
        background: var(--ant-primary-color);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .ant-form-item-has-error {
    .serial-num-no-error {
      .ant-input-number,
      .ant-input-affix-wrapper,
      .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
        border-color: #e8ebf0 !important;
      }

      .ant-input-number-focused,
      .ant-input-number:focus,
      .ant-input-affix-wrapper-focused,
      .ant-input-affix-wrapper:focus,
      .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-focused
        .ant-select-selector,
      .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input).ant-select-open
        .ant-select-selector {
        border-color: var(--ant-primary-color) !important;
        box-shadow: none;
      }
    }
  }
</style>
