<template>
  <a-input-number
    :class="ns.b()"
    :disabled="disabled"
    :placeholder="placeholder"
    v-model:value="currentValue"
    size="small"
  >
    <template #addonAfter v-if="isRenderScript">
      <template v-if="isSuperScript">
        <sup :class="ns.e('up-sup')">{{ scriptValue }}</sup>
      </template>
      <template v-if="!isSuperScript">
        <sub :class="ns.e('down-sub')">{{ scriptValue }}</sub>
      </template>
    </template>
  </a-input-number>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { isNil } from 'lodash-es';

  const { t } = useI18n();

  const ns = useNamespace('number-input-ex');

  const props = defineProps<{
    scriptValue?: string;
    isSuperScript?: boolean;
    disabled?: boolean;
    placeholder?: string;
    value?: number;
  }>();

  const isRenderScript = computed(() => {
    return props.scriptValue && !isNil(props.isSuperScript);
  });

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });
</script>

<style lang="scss" scoped>
  @include b(number-input-ex) {
    :deep(.ant-input-number-group-addon) {
      background: #fff;
      padding: 0;
      font-size: 16px;
      padding-left: 2px;
      border: none;
      sub.down-sub {
        bottom: -0.65em;
      }
      sup.up-sup {
        top: -0.7em;
      }
    }
  }
</style>
