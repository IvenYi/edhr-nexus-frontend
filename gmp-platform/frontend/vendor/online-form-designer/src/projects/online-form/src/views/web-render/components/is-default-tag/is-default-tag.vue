<template>
  <a-tag :class="ns.b()" :color="isDefault ? 'processing' : 'default'">
    {{ isDefault ? t('sys.default') : t('sys.false') }}
  </a-tag>
</template>

<script lang="ts" setup name="is-default-tag">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  const { t } = useI18n();
  const ns = useNamespace('is-default-tag');

  const props = withDefaults(
    defineProps<{
      value: any;
    }>(),
    {},
  );

  const isDefault = computed(() => {
    return !!props.value;
  });
</script>

<style lang="scss" scoped>
  $is-default-tag: ();

  @include b(is-default-tag) {
    @include set-component-css-var(is-default-tag, $is-default-tag);

    &.ant-tag-default {
      color: #8f8f8f;
    }
  }
</style>
