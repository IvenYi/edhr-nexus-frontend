<template>
  <a-radio-group
    :disabled="disabled"
    :value="props.value"
    :class="[ns.b(), ns.m(type), ns.m(direction)]"
    @update:value="onValueUpdate"
  >
    <a-radio v-for="option in options" :key="`${option.value}`" :value="option.value">
      <i
        v-if="type === 'icon' || type === 'icon-label'"
        :class="`iconfont ${option.icon}`"
        :title="option.label"
      ></i>
      <template v-if="type != 'icon'">
        {{ option.label }}
      </template>
    </a-radio>
  </a-radio-group>
</template>

<script lang="ts" setup>
  import { useNamespace } from '@gct/runtime';

  import { Orientation } from '@gct/nocode-base';

  const ns = useNamespace('radio');

  type OptionValue = string | boolean | number | null | undefined;

  const props = withDefaults(
    defineProps<{
      disabled?: boolean;
      value?: OptionValue;
      options: Array<{ label: string; value: OptionValue; icon?: string }>;
      type?: 'checkbox' | 'radio' | 'icon' | 'icon-label';
      direction?: Orientation;
    }>(),
    {
      value: undefined,
      type: 'radio',
      direction: Orientation.Landscape,
    },
  );

  const emit = defineEmits(['update:value']);
  const onValueUpdate = (value: string | boolean | number) => {
    emit('update:value', value);
  };
</script>

<style lang="scss" scoped>
  @include b(radio) {
    @include m(checkbox) {
      :deep(.ant-radio) {
        .ant-radio-inner {
          border-radius: 0;
          &::after {
            //禁用radio的
            margin: 0;
            border-radius: 0;
            background-color: transparent;
            // 补充checkbox的
            position: absolute;
            top: 50%;
            inset-inline-start: 21.5%;
            width: 5.7142857142857135px;
            height: 9.142857142857142px;
            border: 2px solid var(--ant-primary-color);
            border-top: 0;
            border-inline-start: 0;
            opacity: 0;
          }
        }

        &.ant-radio-checked {
          .ant-radio-inner {
            &::after {
              opacity: 1;
              transform: rotate(45deg) scale(1) translate(-50%, -50%);
              transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
            }
          }
        }
      }
    }

    @include m(portrait) {
      display: flex;
      flex-direction: column;
    }
  }

  .#{bem(radio, '', icon)},
  .#{bem(radio, '', icon-label)} {
    :deep(.ant-radio) {
      display: none;
    }
    :deep(.ant-radio-wrapper-checked) {
      color: var(--ant-primary-color);
    }
    :deep(.ant-radio-wrapper) {
      i {
        vertical-align: middle;
      }
    }
    :deep(span.ant-radio + *) {
      padding: 0;
    }
  }

  .#{bem(radio, '', icon-label)} {
    :deep(.ant-radio-wrapper) {
      i {
        margin-right: 6px;
      }
    }
  }
</style>
