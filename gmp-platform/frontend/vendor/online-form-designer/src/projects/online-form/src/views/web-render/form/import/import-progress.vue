<template>
  <div :class="['import-progress', resultStatus ? `import-progress--${resultStatus}` : '']">
    <img v-if="resultStatus === 'success'" :src="ProgressSuccess" />
    <img v-else-if="resultStatus === 'warning'" :src="ProgressWarning" />
    <a-progress v-else :width="112" type="circle" :percent="percent" />
    <div class="import-progress__message">{{ message }}</div>
  </div>
</template>

<script lang="ts" setup name="import-progress">
  import ProgressSuccess from '/@/assets/svg/progress-success.svg';
  import ProgressWarning from '/@/assets/svg/progress-warning.svg';

  const props = withDefaults(
    defineProps<{
      percent?: number;
      message: string;
      resultStatus?: 'success' | 'warning';
    }>(),
    {
      percent: 0,
    },
  );
</script>

<style lang="less" scoped>
  .import-progress {
    text-align: center;
    padding-top: 84px;
    padding-bottom: 32px;
    &__message {
      margin-top: 16px;
      font-weight: 500;
      font-size: 16px;
      color: #1a1d23;
    }

    &--warning {
      --ant-success-color: #ff792e;
      :deep(.ant-progress-circle .ant-progress-text) {
        font-size: 24px;
      }
    }
  }
</style>
