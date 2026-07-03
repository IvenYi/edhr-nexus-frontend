<template>
  <a-dropdown class="add-tmpl-btn" overlay-class-name="add-tmpl-btn__dropdown">
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item
          v-if="c.state.IOTPermission"
          :key="DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION"
        >
          <img :src="svgDevice" class="type-icon" />
          {{ $t('sys.edhr.DeviceLinkTmplTypeEnum.DEVICE_INTERCONNECTION') }}
        </a-menu-item>
        <a-menu-item v-if="c.state.OCRPermission" :key="DeviceLink.TmplTypeEnum.AI_OCR">
          <img :src="svgAI" class="type-icon" />
          {{ $t('sys.edhr.DeviceLinkTmplTypeEnum.AI_OCR') }}
        </a-menu-item>
      </a-menu>
    </template>
    <a-button type="primary" ghost>
      {{ $t('sys.onlineForm.addDataLoadingTemplate') }}
      <DownOutlined />
    </a-button>
  </a-dropdown>
</template>

<script lang="ts" setup name="add-tmpl-btn">
  import { DeviceLink, useFormTmplConfig } from '@gct/nocode-base';
  import svgDevice from '/@/assets/svg/pic-sbhl.svg';
  import svgAI from '/@/assets/svg/pic-aisb.svg';

  const c = useFormTmplConfig().injectController();

  const emit = defineEmits<{
    (e: 'add', type: DeviceLink.TmplTypeEnum): void;
  }>();

  const handleMenuClick = (e) => {
    emit('add', e.key);
  };
</script>

<style lang="scss" scoped>
  .add-tmpl-btn {
    width: 100%;
  }
</style>

<style lang="less">
  .add-tmpl-btn__dropdown {
    .ant-dropdown-menu {
      padding: 4px;
    }
    .type-icon {
      margin-right: 8px;
    }
    .ant-dropdown-menu-item {
      padding: 8px;
      font-weight: 400;
      font-size: 12px;
      color: #1a1d23;
      &:hover {
        background: #f2f5f8;
        border-radius: 4px 4px 4px 4px;
      }

      .ant-dropdown-menu-title-content {
        display: inline-flex;
        align-items: center;
      }
    }
  }
</style>
