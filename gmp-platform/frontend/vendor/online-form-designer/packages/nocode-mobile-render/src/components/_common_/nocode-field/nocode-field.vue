<template>
  <van-field
    :class="['nocode-field']"
    ref="fieldRef"
    v-bind="$attrs"
    :label="label"
    :rules="_rules"
    :required="required"
    :placeholder="_placeholder"
    v-model="value"
  >
    <template #label>
      <slot name="label-left"></slot>
      <slot name="label">
        <span class="field-label">{{ label }}</span>
      </slot>
    </template>
    <template v-if="$slots.input2" #input>
      <ValueWrapper :modelValue="value" :placeholder="_placeholder">
        <slot name="input2"></slot>
      </ValueWrapper>
    </template>
    <template #button v-if="modelValue && clearable && !$attrs.readonly && !$attrs.disabled">
      <van-icon name="clear" size="20" color="#c8c9cc" @click.stop="emit('clearValue')" />
    </template>
    <template v-for="name in transferSlotNames" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </van-field>
</template>

<script lang="ts" setup name="nocode-field">
  import { computed, ref, useSlots } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import ValueWrapper from './value-wrapper.vue';
  import { commonUtils } from '@gct/nocode-base';

  const slots = useSlots();

  /** 需要透传的slot名称集合 */
  const transferSlotNames = computed(() => {
    return Object.keys(slots).filter(
      (i) => !['label', 'label-left', 'button', 'input2'].includes(i),
    );
  });

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      modelValue?: any;
      label?: string;
      required?: boolean;
      rules?: any[];
      placeholder?: string;
      clearable?: boolean;
      isSelect?: boolean;
      onChange?: Function;
      /** 禁用验证规则 */
      disableRules?: boolean;
    }>(),
    {
      clearable: true,
      isSelect: false,
      disableRules: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: undefined): void;
    (e: 'clearValue'): void;
  }>();

  const fieldRef = ref();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  const _rules = computed(() => {
    // 表单填报里面校验先去除，会和按钮里的不校验逻辑相违背，统一走校验清单
    if (props.disableRules) {
      return [];
    }

    // 其他需要校验的场景
    const rulesArr = [...(props.rules ?? [])];
    if (props.required) {
      rulesArr.push({
        validator: (val, _rule) => {
          if (commonUtils.isEmptyValue(val)) return t('sys.notEmptySth', { sth: props.label });
          return '';
        },
      });
    }
    return rulesArr;
  });

  const _placeholder = computed(() => {
    return props.placeholder || (props.isSelect ? t('sys.chooseText') : t('sys.inputText'));
  });
</script>

<style lang="less" scoped>
  .nocode-field {
    &:not(.van-field--label-top) {
      :deep(.van-field__label) {
        color: #212528;
        width: 8em;
        margin-right: 8px;
        display: inline-flex;
        align-items: center;
        line-height: 1.5;
      }
    }

    :deep(.van-field__button) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    :deep(.van-field__label--required:before) {
      position: absolute;
      margin-left: -8px;
    }

    /** 超出边界 */
    &.is-out-of-range {
      :deep(.van-field__control) {
        color: #ff4d4f !important;
      }
    }

    /* 禁用态样式 */
    &.van-field--disabled {
      background: #f5f5f5;
      pointer-events: none;

      :deep(.van-field__control) {
        color: var(--van-field-disabled-text-color);
      }
      :deep(.van-field__label) {
        color: var(--van-field-disabled-text-color);
        .field-type-icon {
          color: var(--van-field-disabled-text-color);
        }
      }
    }
  }
</style>
