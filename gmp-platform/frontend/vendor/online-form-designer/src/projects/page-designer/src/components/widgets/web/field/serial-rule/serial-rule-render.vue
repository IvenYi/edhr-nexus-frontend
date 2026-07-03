<template>
  <div class="serial render">
    <div class="container min-h-120px rounded-sm">
      <SerialNumberContainer
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :serialConfigValue="value"
        :field="field"
        :isFeild="true"
        :serialValiIds="serialValiIds"
        :increaseHidden="increaseHidden"
        @update:value="handleUpdate"
      />
    </div>
  </div>
</template>

<script name="gct-serial-rule" setup lang="ts">
  import { toRefs, computed, unref } from 'vue';
  import { SerialRule } from '/@page-designer/types/web';
  // import { useI18n } from '/@/hooks/web/useI18n';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import SerialNumberContainer from '/@app-designer/views/model-desginer/entity/components/data-field/field-type-form/serial-number-container.vue';

  const props = defineProps<{ modelValue?: string; widget: SerialRule; formData: Object }>();
  const { field, readonly, disabled, required, increaseHidden } = toRefs(props.widget.props);
  // const { createMessage } = useMessage();
  // const { t } = useI18n();
  const emit = defineEmits(['update:modelValue', 'saveTableRow', 'register']);

  const value = computed<any>({
    get() {
      return props.modelValue ? JSON.parse(props.modelValue) : null;
    },
    set(value: string[]) {
      emit('update:modelValue', JSON.stringify(value));
    },
  });

  const serialValiIds = computed(() => {
    return props.formData?.['_SERIAL_RULE_VALIDATE_'] || [];
  });

  // const serialModalOk = (config) => {
  //   const { modelKey, ruleConfig } = unref(value);
  //   if (
  //     !config.isEdit &&
  //     config.type === 'increase' &&
  //     ruleConfig.findIndex((rule) => rule.type === 'increase') > -1
  //   ) {
  //     createMessage.warning(t('sys.appDesigner.increaseRepeat'));
  //     return;
  //   }
  //   if (config.isEdit) {
  //     const configList = ruleConfig.map((rule) => {
  //       if (rule.id == config.id) {
  //         return { ...config };
  //       }
  //       return rule;
  //     });
  //     value.value = { modelKey, ruleConfig: configList };
  //   } else {
  //     value.value = { modelKey, ruleConfig: [...ruleConfig, config] };
  //   }
  // };

  const handleUpdate = (val) => {
    value.value = val;
    emit('update:modelValue', JSON.stringify(val));
  };
</script>

<style lang="less" scoped>
  .serial {
    // overflow-x: auto;
    .container {
      min-width: 550px;

      .title {
        background-color: #fafafa;
        font-size: 14px;

        .txt-disabled {
          color: rgb(0 0 0 / 25%);
        }

        .serial-btns {
          color: #666;
          font-size: 18px;

          &.icon-disabled {
            color: rgb(0 0 0 / 25%);

            span {
              cursor: default;
            }
          }

          span {
            padding: 0 4px;
          }
        }
      }
    }
  }

  :deep(.serial-disabled .seriesItem .fieldName) {
    color: #ccc;
  }
</style>
