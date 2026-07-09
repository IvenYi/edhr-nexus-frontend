<template>
  <a-form ref="fieldConfigJsonRef" autocomplete="off">
    <div class="import-mode mt24px">
      <div class="title py4px">{{ t('sys.pageDesigner.importMode') }}</div>
      <div class="mt8px bg-[#FBFBFC] pt16px pb1px px12px">
        <a-form-item :label="t('sys.pageDesigner.importMode')" name="duplicateKeyUpdate">
          <a-checkbox-group v-model:value="exportModel">
            <a-checkbox
              :value="ImportModeEnum.NEW"
              :disabled="exportModel.length === 1 && exportModel[0] === ImportModeEnum.NEW"
            >
              {{ t(`sys.app.importMode.${ImportModeEnum.NEW}`) }}
            </a-checkbox>
            <a-checkbox
              :value="ImportModeEnum.UPDATE"
              :disabled="exportModel.length === 1 && exportModel[0] === ImportModeEnum.UPDATE"
            >
              {{ t(`sys.app.importMode.${ImportModeEnum.UPDATE}`) }}
            </a-checkbox>
            <a-checkbox
              :value="ImportModeEnum.NEW_UPDATE"
              :disabled="exportModel.length === 1 && exportModel[0] === ImportModeEnum.NEW_UPDATE"
            >
              {{ t(`sys.app.importMode.${ImportModeEnum.NEW_UPDATE}`) }}
            </a-checkbox>
          </a-checkbox-group>
          <div class="text-[#8F8F8F] mt4px">
            <info-circle-outlined class="mr4px" />
            {{ t('sys.app.importModeTip') }}
          </div>
        </a-form-item>
      </div>
    </div>
  </a-form>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { ImportModeEnum } from '../../../type';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '../hook/useDesigner';

  const { exportModel } = useDesigner();
  const { t } = useI18n();
  const fieldConfigJsonRef = ref();
</script>
<style lang="less" scoped>
  .title {
    display: flex;
    align-items: center;
    font-size: 16px;
    &::before {
      content: ' ';
      display: block;
      width: 3px;
      height: 16px;
      background-color: var(--ant-primary-color);
      margin-right: 8px;
    }
  }

  :deep(.ant-form-item-label > label) {
    width: 118px;
    display: block;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
    text-overflow: ellipsis;
    // line-height: 32px;
    position: relative;
    padding-right: 14px;

    &::after {
      content: ':';
      position: absolute;
      top: 0;
      right: 0;
    }
  }
</style>
