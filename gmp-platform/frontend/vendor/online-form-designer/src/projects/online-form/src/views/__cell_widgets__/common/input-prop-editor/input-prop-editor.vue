<template>
  <form-item :label="`${t('sys.model.inputAttr')}`" class="input-prop">
    <a-checkbox
      class="input-prop__checkbox"
      v-model:checked="_required"
      :disabled="disabledAll || fieldRequired"
      >{{ $t('sys.appDesigner.approval.opinionMode.Required') }}</a-checkbox
    >
    <a-checkbox class="input-prop__checkbox" v-model:checked="_disabled" :disabled="disabledAll">
      {{ $t('sys.disable') }}
    </a-checkbox>
  </form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    required?: boolean;
    disabled?: boolean;
    /** 模型设计中的必填值 */
    fieldRequired: boolean;
    /** 禁止操作 */
    disabledAll: boolean;
  }>();

  const emit = defineEmits(['update:required', 'update:disabled']);

  const _required = computed({
    get() {
      return props.fieldRequired || props.required;
    },
    set(v) {
      emit('update:required', v);
      emit('update:disabled', undefined);
    },
  });

  const _disabled = computed({
    get() {
      return props.disabled;
    },
    set(v) {
      emit('update:required', undefined);
      emit('update:disabled', v);
    },
  });
</script>

<style lang="less" scoped>
  .input-prop__checkbox {
    vertical-align: middle;
    color: #666666;
    &:first-child {
      margin-left: 10px;
    }

    margin-left: 2px;
    font-size: 12px;
    :deep(.ant-checkbox-inner) {
      height: 12px;
      width: 12px;
      &:after {
        height: 7.42857px;
        width: 4.314286px;
      }
    }
  }
</style>
