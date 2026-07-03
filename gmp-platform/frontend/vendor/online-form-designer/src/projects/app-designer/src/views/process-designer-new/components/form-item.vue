<template>
  <div
    :class="[
      'form-item ',
      isFirst ? 'mt-0' : 'mt-12px',
      inline ? 'form-inline' : '',
      inline && colon && label && 'colon',
    ]"
  >
    <div class="form-item__label">
      <slot name="label">
        <span v-if="isRequired" class="error-gct">*</span>
        {{ label }}
        <a-tooltip>
          <template #title>
            {{ tooltip }}
          </template>
          <i
            v-if="tooltip"
            class="iconfont icon-assist text-[#C3C3C3] cursor-pointer relative top-1px"
          ></i>
        </a-tooltip>
      </slot>
    </div>
    <a-form-item v-bind="$attrs" class="form-item__content overflow-hidden">
      <slot> </slot>
    </a-form-item>
  </div>
</template>

<script setup lang="ts" name="form-item">
  import { computed } from 'vue';
  import type { Rule } from 'ant-design-vue/es/form';

  const props = withDefaults(
    defineProps<{
      label?: string;
      inline?: boolean;
      isFirst?: boolean;
      rules?: Rule[];
      required?: boolean;
      tooltip?: string;
      colon?: boolean;
    }>(),
    {
      inline: true,
      isFirst: false,
      colon: true,
    },
  );

  const isRequired = computed(() => {
    return props.required || props.rules?.some((rule) => rule.required);
  });
</script>

<style scoped lang="less">
  .form-item {
    line-height: 18px;

    & + & {
      margin-top: 8px;
    }

    &__label {
      color: #252525;
      font-size: 12px;
      flex: none;

      .icon-assist {
        font-size: 14px;
      }
    }

    &__content {
      font-size: 12px;
      flex: 1;
      margin-bottom: 0;
    }

    &.form-inline {
      display: flex;
      flex-direction: row;
      align-items: center;

      &.colon .form-item__label {
        &::after {
          content: ':';
          position: relative;
          top: -0.5px;
          margin: 0 6px 0 2px;
        }
      }
    }

    &:not(.form-inline) &__label {
      margin-bottom: 4px;
    }
  }

  :deep(.ant-form-item-control-input) {
    min-height: 18px;
    color: #666666;
  }
</style>
