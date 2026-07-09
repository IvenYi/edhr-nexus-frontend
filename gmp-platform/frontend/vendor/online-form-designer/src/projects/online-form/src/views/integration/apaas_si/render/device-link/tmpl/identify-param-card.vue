<template>
  <div class="identify-param-card">
    <FormItem class="w-1px flex-grow-1" isFirst :label="$t('sys.onlineForm.promptWords')">
      <template #label>
        {{ $t('sys.onlineForm.promptWords')
        }}<IconTooltip class="ml-4px" :content="AITooltips.identifyParam.content" />：
      </template>
      <a-input v-model:value="formState.prompt" :placeholder="$t('sys.inputText')" />
    </FormItem>
    <div class="w-24px"></div>
    <FormItem
      class="w-1px flex-grow-1"
      isFirst
      :label="$t('sys.onlineForm.formFields') + '：'"
      required
      :name="['identifyParams', index, 'formField']"
      :rules="rules"
    >
      <FormFieldSelect v-model="formState.formField" />
    </FormItem>
    <div class="w-32px ml-18px">
      <RemoveIcon
        class="identify-param-card__remove"
        v-if="showRemove"
        @click="emit('remove', index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="identify-param-card">
  import { AITooltips, DeviceLink } from '@gct/nocode-base';
  import { computed } from 'vue';
  import { FormFieldSelect } from '/@online-form/components/form-field';
  import { IconTooltip, RemoveIcon } from '/@online-form/components/ui';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  const rules = [
    {
      required: true,
      message: $t('sys.onlineForm.pleaseSelectFormField'),
      trigger: ['change', 'blur'],
    },
  ];

  const props = withDefaults(
    defineProps<{
      params: DeviceLink.AIOcrTmplIdentifyParams;
      index: number;
      showRemove?: boolean;
    }>(),
    {
      params: undefined,
    },
  );

  const formState = computed({
    get() {
      return props.params;
    },
    set(v) {
      Object.assign(props.params, v);
    },
  });

  const emit = defineEmits<{
    (e: 'remove', index: number): void;
  }>();
</script>

<style lang="less" scoped>
  .identify-param-card {
    background: #f7f8fa;
    border-radius: 4px 4px 4px 4px;
    padding: 8px 9px 8px 16px;
    display: flex;
    justify-items: center;
    align-items: center;
    position: relative;

    & ~ & {
      margin-top: 4px;
    }

    // 隐藏表单字段的校验信息
    :deep(.form-item) {
      margin-top: 0 !important;
    }

    :deep(.ant-form-item-with-help .ant-form-item-explain) {
      display: none;
    }

    :deep(.form-item__label) {
      padding-right: 5px;
    }

    &__title {
      font-weight: 400;
      font-size: 12px;
      color: #1a1d23;
    }

    &__remove.remove-icon {
      width: 32px;
      height: 32px;

      &:hover {
        background: #e8eaee;
      }
      :deep(.gct-iconfont) {
        font-size: 18px;
      }
    }
  }
</style>
