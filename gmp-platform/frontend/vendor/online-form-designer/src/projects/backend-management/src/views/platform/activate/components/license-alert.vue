<template>
  <div v-for="(expireMsg, idx) in props.message" :key="idx" class="mb12px">
    <a-alert
      v-if="expireMsg && expireMsg.type == 0"
      :message="`${getModuleName(expireMsg)}${
        expireMsg.category === 'module'
          ? ''
          : expireMsg.category == 'system'
          ? t('sys.license.system')
          : t('sys.license.additional')
      }${
        expireMsg.category === 'module'
          ? t('sys.license.moduleInfoMessage', {
              day: expireMsg.expireDays,
              module: getModuleName(expireMsg),
            })
          : t('sys.license.platInfoMessage', { day: expireMsg.expireDays })
      }`"
      type="info"
      show-icon
    >
      <template #icon>
        <img :src="alertInfo" alt="" />
      </template>
    </a-alert>
    <a-alert
      v-if="expireMsg && expireMsg.type == 1"
      :message="`${getModuleName(expireMsg)}${
        expireMsg.category === 'module'
          ? ''
          : expireMsg.category == 'system'
          ? t('sys.license.system')
          : t('sys.license.additional')
      }${t('sys.license.expire')}，${
        expireMsg.category === 'module'
          ? t('sys.license.moduleWarnMessage', {
              module: getModuleName(expireMsg),
            })
          : t('sys.license.pleaseAddActivate')
      }`"
      closable
      @close="emit('close', expireMsg.id)"
      show-icon
      type="warning"
    >
      <template #icon>
        <img :src="alertWarn" alt="" />
      </template>
    </a-alert>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import alertInfo from '/@/assets/svg/icon-alert-info.svg';
  import alertWarn from '/@/assets/svg/icon-alert-warn.svg';

  const { t } = useI18n();

  const props = defineProps<{ message: Array }>();

  const emit = defineEmits(['close']);

  const getModuleName = (message) => {
    if (message.productType === 'BI') {
      return '【BI】';
    } else if (message.productType === 'IOT') {
      return '【设备互联】';
    } else if (message.productType === 'OCR') {
      return '【OCR图像识别】';
    }
    return '【平台】';
  };
</script>
<style lang="less" scoped>
  :deep(.ant-alert) {
    border-radius: 4px;
  }

  :deep(.ant-alert-icon) {
    margin-top: 2px;
  }
</style>
