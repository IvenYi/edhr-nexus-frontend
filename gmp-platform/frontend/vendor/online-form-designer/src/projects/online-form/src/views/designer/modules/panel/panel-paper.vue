<template>
  <div class="panel-document">
    <form-item
      :label="$t('sys.onlineForm.canvasOrientation')"
      :inline="false"
      class="important-mt-0"
    >
      <div class="orientation-options mt-4px">
        <button
          type="button"
          class="orientation-card"
          :class="{ 'orientation-card--active': paper.orientation === Orientation.Portrait }"
          :disabled="sheetReadonly"
          @click="setOrientation(Orientation.Portrait)"
        >
          <div class="orientation-card__preview">
            <PortraitIcon />
          </div>
          <div class="orientation-card__label">
            {{ $t('sys.appDesigner.printDesign.form.portrait') }}
          </div>
        </button>
        <button
          type="button"
          class="orientation-card"
          :class="{ 'orientation-card--active': paper.orientation === Orientation.Landscape }"
          :disabled="sheetReadonly"
          @click="setOrientation(Orientation.Landscape)"
        >
          <div class="orientation-card__preview">
            <LandscapeIcon />
          </div>
          <div class="orientation-card__label">
            {{ $t('sys.appDesigner.printDesign.form.landscape') }}
          </div>
        </button>
      </div>
    </form-item>

    <form-item :label="$t('sys.onlineForm.marginSetting')" :inline="false">
      <padding-setting :padding="paper.padding" :disabled="sheetReadonly" class="mt-4px" />
    </form-item>

    <form-item :label="$t('sys.onlineForm.header')" class="justify-between">
      <div class="flex justify-end">
        <a-switch size="small" :disabled="sheetReadonly" v-model:checked="paper.paperHeader" />
      </div>
    </form-item>
    <form-item :label="$t('sys.footer')" class="justify-between">
      <div class="flex justify-end">
        <a-switch size="small" :disabled="sheetReadonly" v-model:checked="paper.paperFooter" />
      </div>
    </form-item>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import LandscapeIcon from '/@online-form/views/designer/icons/landscape.vue';
  import PortraitIcon from '/@online-form/views/designer/icons/portrait.vue';
  import PaddingSetting from '/@online-form/views/designer/modules/base/padding-setting.vue';

  const { paper, sheetReadonly } = useSpreadSheet();
  const Orientation = {
    Portrait: 'portrait',
    Landscape: 'landscape',
  } as const;

  type OrientationValue = (typeof Orientation)[keyof typeof Orientation];

  const setOrientation = (orientation: OrientationValue) => {
    if (sheetReadonly.value) return;
    paper.value.orientation = orientation;
  };
</script>

<style lang="less" scoped>
  .panel-document {
    padding: 6px 12px 12px;
  }

  .orientation-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .orientation-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 8px 9px;
    border: 0;
    border-radius: 8px;
    background: #f7f9fc;
    cursor: pointer;
    appearance: none;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;

    &:hover:not(:disabled) {
      background: #f1f7ff;
      transform: translateY(-1px);
    }

    &__preview {
      height: 48px;
      width: 100%;
      min-width: 0;
      border-radius: 7px;
      border: 1px solid #d4e0ed;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #ffffff 0%, #f4f8fc 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    &__label {
      margin-top: 8px;
      color: #1f2937;
      font-size: 12px;
      line-height: 18px;
      font-weight: 500;
    }

    &--active {
      background: #edf6ff;
      box-shadow: inset 0 0 0 1px rgba(22, 135, 232, 0.18);
    }

    &--active &__preview {
      border-color: #1687e8;
      background: #ffffff;
      box-shadow:
        0 6px 14px rgba(22, 135, 232, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    &--active :deep(svg) path {
      color: #1687e8;
    }
  }
</style>
