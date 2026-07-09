<template>
  <form-item :class="[ns.b()]" :label="$t('sys.onlineForm.prefixOrSuffix')" :inline="false">
    <div :class="ns.b('item')">
      <span :class="ns.be('item', 'label')">{{ $t('sys.onlineForm.prefix') }}</span>
      <a-textarea
        :class="[ns.be('item', 'value')]"
        v-model:value="_prefix"
        :placeholder="t('sys.inputText')"
        :disabled="disabled"
        show-count
        :maxlength="120"
      />
    </div>
    <div :class="ns.b('item')">
      <span :class="ns.be('item', 'label')">{{ $t('sys.onlineForm.suffix') }}</span>
      <a-textarea
        :class="[ns.be('item', 'value')]"
        v-model:value="_suffix"
        :placeholder="t('sys.inputText')"
        :disabled="disabled"
        show-count
        :maxlength="120"
      />
    </div>
  </form-item>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';

  const { t } = useI18n();

  const ns = useNamespace('affix-editor');

  const props = defineProps<{
    prefix?: string;
    suffix?: string;
    disabled: boolean;
  }>();

  const emit = defineEmits(['update:prefix', 'update:suffix']);

  const _prefix = computed({
    get() {
      return props.prefix;
    },
    set(v) {
      emit('update:prefix', v);
    },
  });

  const _suffix = computed({
    get() {
      return props.suffix;
    },
    set(v) {
      emit('update:suffix', v);
    },
  });
</script>

<style lang="scss" scoped>
  @include b(affix-editor-item) {
    display: flex;
    background: #f0f0f0;
    border-radius: 4px 4px 4px 4px;
    padding: 4px;
    &:first-child {
      margin-bottom: 2px;
    }

    @include e(label) {
      color: #666666;
      font-size: 12px;
      margin: 4px 4px 4px 0;
    }
    @include e(value) {
      flex-grow: 1;
      &::after {
        color: #cccccc;
        font-size: 12px;
        bottom: 4px;
      }
    }
  }
</style>
