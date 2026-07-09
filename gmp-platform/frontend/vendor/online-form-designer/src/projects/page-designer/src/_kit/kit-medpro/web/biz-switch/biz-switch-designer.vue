<template>
  <a-form :layout="layout">
    <a-form-item :labelCol="{ span: 24 }" class="gct-biz-switch">
      <template #label>
        <div :title="label">
          <a-tooltip v-if="!!showExplain">
            <template #title> {{ explain }}</template>
            <question-circle-outlined
              class="explain-icon ml5px color-cyan"
              :style="{ color: 'var(--ant-primary-color)' }"
            />
          </a-tooltip>
          {{ label }}
        </div>
      </template>

      <a-switch v-model:checked="checked" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts" name="gct-biz-switch">
  import { toRefs, ref } from 'vue';
  import { IBizSwitch } from './schema';

  const props = defineProps<{
    widget: IBizSwitch;
  }>();

  const { label, showExplain, explain, layout } = toRefs(props.widget.props);

  const checked = ref<boolean>(false);
</script>

<style scoped lang="less">
  .gct-biz-switch {
    :deep(.ant-form-item-label) {
      padding: 0;
    }
  }
</style>
