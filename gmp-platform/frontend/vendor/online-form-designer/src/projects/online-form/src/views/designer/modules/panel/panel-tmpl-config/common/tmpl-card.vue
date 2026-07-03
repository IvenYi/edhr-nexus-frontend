<template>
  <div class="tmpl-card">
    <div class="tmpl-card__header">
      <div class="flex items-center">
        <div class="tmpl-card__icon">
          <i :class="`${type2Icon[props.type]}`" class="text-14px!"></i>
        </div>
        <div class="tmpl-card__title">
          {{ type2Title[props.type] }}
        </div>
      </div>
      <RemoveIcon @click="emit('remove')" />
    </div>
    <div class="tmpl-card__body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup name="tmpl-card">
  import { DeviceLink } from '@gct/nocode-base';
  import { RemoveIcon } from '/@online-form/components/ui';

  const props = withDefaults(
    defineProps<{
      type: DeviceLink.TmplTypeEnum;
    }>(),
    {},
  );

  const type2Icon = {
    [DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION]: 'gct-iconfont icon-icon_shebeihulian',
    [DeviceLink.TmplTypeEnum.AI_OCR]: 'gct-iconfont icon-icon_AIshibie',
  };

  const type2Title = {
    [DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION]: $t(
      'sys.edhr.DeviceLinkTmplTypeEnum.DEVICE_INTERCONNECTION',
    ),
    [DeviceLink.TmplTypeEnum.AI_OCR]: $t('sys.edhr.DeviceLinkTmplTypeEnum.AI_OCR'),
  };

  const emit = defineEmits<{
    (e: 'remove'): void;
  }>();
</script>

<style lang="scss" scoped>
  .tmpl-card {
    background: #ffffff;
    box-shadow: 0px 2px 12px -2px rgba(0, 0, 0, 0.08);
    border-radius: 6px 6px 6px 6px;

    &__header {
      border-bottom: 1px solid #f2f5f8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 34px;
      padding: 0 3px 0 8px;
    }

    &__icon {
      font-size: 14px;
      color: #026ac8;
      margin-right: 4px;
      line-height: 1;
    }

    &__title {
      font-weight: 600;
      font-size: 12px;
      color: #1a1d23;
    }

    &__title {
      font-weight: 600;
      font-size: 12px;
      color: #1a1d23;
    }
  }
</style>
