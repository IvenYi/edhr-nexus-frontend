<template>
  <div class="header-action">
    <span class="title">{{ title }}</span>
    <div class="switch-area">
      <span class="check-title">{{
        checkedValue ? t('sys.appDesigner.fieldEnable') : t('sys.appDesigner.fieldUnEnable')
      }}</span>
      <a-switch v-model:checked="checkedValue" />
    </div>
    <!-- <div class="global-switch-area">
      <a-tooltip placement="top">
        <template #title>{{ t('sys.appDesigner.displayGlobalTip') }}</template>
        <info-circle-outlined class="text-[#bfbfbf] pr-4px" style="font-size: 16px" />
      </a-tooltip>
      <span>{{ t('sys.appDesigner.sphereOfIncidence') + '：' }}</span>
      <span class="check-title">{{ t('sys.appDesigner.global') }}</span>
      <a-switch v-model:checked="globalValue" />
    </div> -->
  </div>
</template>
<script setup lang="ts" name="header-action">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  interface Props {
    checked: boolean;
    title: string;
    // global: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits(['update:checked']);

  const checkedValue = computed<boolean>({
    get() {
      return props.checked;
    },
    set(value: boolean) {
      emit('update:checked', value);
    },
  });

  // const globalValue = computed<boolean>({
  //   get() {
  //     return props.global;
  //   },
  //   set(value: boolean) {
  //     emit('update:global', value);
  //   },
  // });
</script>
<style scoped lang="less">
  .header-action {
    display: flex;
    align-items: center;
    line-height: 22px;
    padding-bottom: 16px;
    .title {
      display: inline-block;
      line-height: 22px;
      color: #333;
      font-weight: 500;
    }
    .switch-area {
      position: relative;
      padding-left: 16px;
      display: flex;
      color: #333;
      align-items: center;
      &::before {
        content: '';
        position: absolute;
        width: 1px;
        height: 14px;
        background-color: #eaeaea;
      }
    }
    .check-title {
      line-height: 22px;
      display: inline-block;
      margin-left: 16px;
      margin-right: 8px;
    }
    // .global-switch-area {
    //   margin-left: auto;
    //   display: flex;
    //   align-items: center;
    // }
  }
</style>
