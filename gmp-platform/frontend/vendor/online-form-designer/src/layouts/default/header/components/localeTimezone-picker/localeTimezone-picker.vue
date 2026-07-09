<template>
  <div class="relative" ref="LocaleTimezoneRef">
    <a-popover
      trigger="click"
      @visible-change="handleVisibleChange"
      v-model:visible="popoverVisible"
      overlay-class-name="locale-timezone__overlay popover-overlay"
      :get-popup-container="() => LocaleTimezoneRef"
    >
      <template #content>
        <div class="p-12px text-[#797A7D]">
          <div class="flex">
            <div class="flex-1">
              <div class="mb-4px">{{ t('sys.i18n.language') }}</div>
              <locale-picker ref="localePickerRef" />
            </div>
            <div class="flex-1 ml-6px">
              <div class="mb-4px">{{ t('sys.timezone') }}</div>
              <timezone-picker ref="timezonePickerRef" />
            </div>
          </div>
          <a-button class="mt-12px" block @click="confirm" type="primary">{{
            t('sys.okText')
          }}</a-button>
        </div>
      </template>

      <a-tooltip
        placement="bottom"
        v-model:visible="tooltipVisible"
        :overlay-class-name="popoverVisible ? 'important-display-[none]' : ''"
      >
        <template #title>
          <span>{{ $t('sys.languageTimezone') }}</span>
        </template>
        <div class="icon-wrapper">
          <i class="iconfont icon-guojihua"></i>
        </div>
      </a-tooltip>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import LocalePicker from './locale-picker.vue';
  import TimezonePicker from './timezone-picker.vue';

  const { t } = useI18n();
  const timezonePickerRef = ref();
  const localePickerRef = ref();

  const LocaleTimezoneRef = ref();

  const popoverVisible = ref<boolean>(false);
  const tooltipVisible = ref<boolean>(false);

  const confirm = async () => {
    timezonePickerRef.value.setTimezone();
    await localePickerRef.value.setLocale();
    window.location.reload();
  };

  function handleVisibleChange(value) {
    if (!value) return;
    timezonePickerRef.value && timezonePickerRef.value.reload();
    localePickerRef.value && localePickerRef.value.reload();
  }
</script>

<style lang="less">
  @import url('/@/layouts/platform/style/icon-wrapper.less');
  @import url('/@/layouts/platform/style/popover-overlay.less');

  .locale-timezone__overlay.popover-overlay {
    padding-top: 0 !important;
  }
</style>
