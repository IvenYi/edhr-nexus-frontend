<template>
  <div class="fields-preview webkit-ellipsis--2">
    <div v-for="label in fieldLabels" :key="label" class="fields-preview__item ellipsis">
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts" setup name="fields-preview">
  import { useFormModel } from '@gct/nocode-base';
  import { computed } from 'vue';

  const c = useFormModel().injectController();
  const props = withDefaults(
    defineProps<{
      /** 字段的key */
      fields?: string[];
    }>(),
    {
      fields: () => [],
    },
  );

  const fieldLabels = computed(() => {
    return props.fields.map((key) => {
      const [model, filed] = key.split('.');
      return c.findField(model, filed)?.name || filed;
    });
  });
</script>

<style lang="less" scoped>
  .fields-preview {
    &__item {
      display: inline-block;
      background: #f2f5f8;
      border-radius: 3px 3px 3px 3px;
      font-weight: 400;
      font-size: 12px;
      color: #5a5f6b;
      line-height: 18px;
      padding: 4px 8px;
      margin-top: 1px;
      margin-right: 8px;
    }
  }
</style>
