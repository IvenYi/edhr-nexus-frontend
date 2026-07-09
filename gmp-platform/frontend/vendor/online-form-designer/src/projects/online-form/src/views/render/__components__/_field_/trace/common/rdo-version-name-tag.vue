<template>
  <span class="rdo-version-name-tag-container" :title="title">
    {{ title }}
    <span class="gct-custom-tag" v-if="!!data.default_">
      {{ t('sys.default') }}
    </span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  type DataType = {
    children?: IData[];
    default_?: boolean;
    __LABEL__?: string;
    [key: string]: any;
  };

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      data: DataType;
    }>(),
    {},
  );

  const title = computed(() => props.data.__LABEL__ || '--');
</script>

<style scoped lang="less">
  .rdo-version-name-tag-container {
    .gct-custom-tag {
      color: var(--ant-primary-color);
      cursor: pointer;
    }
  }
</style>
