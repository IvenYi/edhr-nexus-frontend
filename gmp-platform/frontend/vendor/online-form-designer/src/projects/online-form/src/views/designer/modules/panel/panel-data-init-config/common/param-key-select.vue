<template>
  <div class="param-key-select-item">
    <a-select
      class="custom-select bg-[#f5f5f5]"
      v-model:value="currentParamMapType"
      :bordered="false"
      :options="paramOptions"
      :disabled="disabled"
      @select="onClearItem"
    />
    <div class="split"></div>
    <add-builtin-param-select
      v-if="currentParamMapType === ParamModelTypeEnum.BuiltinParam"
      class="custom-select"
      v-model:value="currentFormKey"
      :disabled="disabled"
    />
    <a-input
      v-else
      class="custom-input"
      v-model:value="currentFormKey"
      placeholder="请输入传参Key"
      :bordered="false"
      :disabled="disabled"
    />
    <span class="blank last">
      <i class="iconfont icon-shanchu primary-gct-hover" @click="onDeleteItem"></i>
    </span>
  </div>
</template>

<script setup lang="ts" name="param-key-select">
  import { computed } from 'vue';
  import { ParamModelTypeEnum } from '@gct/nocode-base';
  import AddBuiltinParamSelect from './add-builtin-param/add-builtin-param-select.vue';

  const paramOptions = [
    {
      label: $t('sys.onlineForm.componentParameters'),
      value: ParamModelTypeEnum.CompParam,
    },
    {
      label: $t('sys.onlineForm.builtInParameters'),
      value: ParamModelTypeEnum.BuiltinParam,
    },
  ];

  const props = withDefaults(
    defineProps<{
      formKey: string | undefined;
      paramMapType: ParamModelTypeEnum | undefined;
      disabled?: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:formKey', value?: string): void;
    (e: 'update:paramMapType', value?: ParamModelTypeEnum): void;
    (e: 'on-clear-item'): void;
    (e: 'on-delete-item'): void;
  }>();

  const currentFormKey = computed({
    get() {
      return props.formKey;
    },
    set(v) {
      emit('update:formKey', v);
    },
  });

  const currentParamMapType = computed({
    get() {
      return props.paramMapType ?? ParamModelTypeEnum.CompParam;
    },
    set(v) {
      emit('update:paramMapType', v);
    },
  });

  const onClearItem = () => emit('on-clear-item');

  const onDeleteItem = () => emit('on-delete-item');
</script>

<style scoped lang="less">
  .param-key-select-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e6e6e6;
    .custom-select {
      flex: 1;
      font-size: 12px;
      overflow: hidden;
      :deep(.ant-select-selector) {
        height: 26px;
        border: none;
        padding: 4px 6px;
        .ant-select-selection-search {
          right: 22px;
          left: 6px;
          .ant-select-selection-search-input {
            height: 26px;
          }
        }
        .ant-select-selection-placeholder {
          line-height: 18px;
          padding-right: 16px;
        }

        .ant-select-selection-item {
          line-height: 18px;
          padding-right: 16px;
        }
      }
      :deep(.ant-select-arrow) {
        right: 6px;
      }

      :deep(.ant-select-disabled) {
        background-color: #f7f8fa;
      }

      &.custom-select-no-arrow {
        :deep(.ant-select-selector) {
          .ant-select-selection-placeholder {
            padding-right: 0;
          }

          .ant-select-selection-item {
            padding-right: 0;
          }
        }
      }
    }

    .custom-input {
      padding: 2px 2px 2px 8px;
      font-size: 12px;
      flex: 1;

      &.ant-input-affix-wrapper-disabled {
        &:hover {
          background-color: #f5f5f5 !important;
        }
      }
      :deep(.ant-input)::placeholder {
        font-size: 12px;
      }
      :deep(.ant-input-suffix) {
        margin-left: 0;
      }
    }

    .split {
      width: 1px;
      height: 26px;
      background-color: #e6e6e6;
      flex-shrink: 0;
    }

    .blank {
      position: relative;
      width: 24px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      font-size: 12px;
      line-height: 1;
      color: #8f8f8f;
      flex-shrink: 0;
      &.first {
        &::before {
          content: '';
          position: absolute;
          width: 1px;
          height: 100%;
          background-color: #e6e6e6;
          right: 0;
        }
      }
      &.last {
        &::before {
          content: '';
          position: absolute;
          width: 1px;
          height: 100%;
          background-color: #e6e6e6;
          left: 0;
        }
      }

      .iconfont {
        line-height: 1;
        font-size: 14px;
        cursor: pointer;
        color: #797a7d;
      }
    }
  }
</style>
