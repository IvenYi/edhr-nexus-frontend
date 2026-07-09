<template>
  <form-item :inline="false">
    <template #label>
      <span>{{ t('sys.boolOpt') }}</span>
      <span style="float: right">{{ $t('sys.onlineForm.introduceField') }}</span>
    </template>
    <div class="option-container">
      <div class="option">
        <span class="option__label">
          {{ `${t('sys.real')}` }}
        </span>
        <a-input
          class="option__input"
          size="small"
          :disabled="disabled"
          v-model:value="formState.trueText"
        />
        <a-checkbox class="option__checkbox" :disabled="disabled" v-model:checked="trueEnable" />
      </div>
      <AttachFieldEditor
        class="mt-2px"
        v-if="trueEnable"
        :disabled="disabled"
        v-model:items="formState.trueAttachFields"
      />
    </div>
    <div class="option-container">
      <div class="option">
        <span class="option__label">
          {{ `${t('sys.fake')}` }}
        </span>
        <a-input
          class="option__input"
          size="small"
          :disabled="disabled"
          v-model:value="formState.falseText"
        />
        <a-checkbox class="option__checkbox" :disabled="disabled" v-model:checked="falseEnable" />
      </div>
      <AttachFieldEditor
        class="mt-2px"
        v-if="falseEnable"
        :disabled="disabled"
        v-model:items="formState.falseAttachFields"
      />
    </div>
  </form-item>
  <form-item :label="`${t('sys.defaultValue')}`" :inline="false">
    <a-select
      class="w-full"
      v-model:value="defaultValue"
      size="small"
      :disabled="disabled"
      :options="defaultOptions"
    />
  </form-item>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import AttachFieldEditor from '../common/attach-fields-editor/attach-fields-editor.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.Boolean;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const trueEnable = computed({
    get() {
      return !!formState.value.trueAttachFields;
    },
    set(v) {
      formState.value.trueAttachFields = v ? [] : undefined;
    },
  });
  const falseEnable = computed({
    get() {
      return !!formState.value.falseAttachFields;
    },
    set(v) {
      formState.value.falseAttachFields = v ? [] : undefined;
    },
  });

  // 默认值相关
  const defaultValue = computed({
    get() {
      return `${formState.value.defaultValue}`;
    },
    set(v) {
      let setVal: boolean | null = null;
      switch (v) {
        case 'true':
          setVal = true;
          break;
        case 'false':
          setVal = false;
          break;
        default:
      }
      formState.value.defaultValue = setVal;
    },
  });

  const defaultOptions = computed(() => {
    return [
      { label: t('sys.null'), value: 'null' },
      { label: formState.value.trueText || t('sys.real'), value: 'true' },
      { label: formState.value.falseText || t('sys.fake'), value: 'false' },
    ];
  });
</script>

<style lang="less" scoped>
  .option-container {
    background: #f0f0f0;
    border-radius: 4px 4px 4px 4px;
    padding: 4px;
    margin-bottom: 2px;
  }
  .option {
    display: flex;
    align-items: center;
  }
  .option__label {
    width: 18px;
    flex-shrink: 0;
  }
  .option__checkbox.ant-checkbox-wrapper {
    width: 24px;
    flex-shrink: 0;
    padding-left: 4px;
    :deep(.ant-checkbox-inner) {
      height: 16px;
      width: 16px;
      &::after {
        height: 9.42857px;
        width: 6.314286px;
      }
    }
  }

  .font {
    display: flex;
  }
  .font__item {
    width: 50%;
    &:first-child {
      margin-right: 8px;
    }
    :deep(.form-item__label) {
      margin-right: 6px;
    }
  }
</style>
