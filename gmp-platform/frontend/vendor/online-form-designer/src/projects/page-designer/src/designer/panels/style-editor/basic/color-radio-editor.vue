<template>
  <div>
    <a-radio-group
      v-model:value="defineMode"
      :disabled="(propConfig.disabled as Function)?.(widget)"
      size="small"
    >
      <a-radio v-for="(opt, index) in options" :value="opt.value" :key="index">
        <div class="flex items-center">
          <span>{{ t(opt.label) }}</span>
          <g-color-picker
            class="ml-1"
            v-if="opt.value === DefineMode.CUSTOM"
            :preset="presetColor"
            :color="bgColor"
            @update:color="handleUpdateColor"
          >
            <template #icon>
              <div
                :style="{
                  width: '16px',
                  height: '16px',
                  backgroundColor: bgColor,
                  borderRadius: '4px',
                }"
              ></div>
            </template>
          </g-color-picker>
        </div>
      </a-radio>
    </a-radio-group>
  </div>
</template>

<script setup lang="ts" name="color-radio-editor">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { props, presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  enum DefineMode {
    /** 用户设定 */
    CUSTOM = 'custom',
    /** 系统跟随 */
    SYSTEM = 'system',
  }

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { selectedStyle } = useSelectedWidget();

  const handleUpdateColor = (_e, color) => {
    bgColor.value = color;
  };
  const options = computed(() => {
    const colorList = [
      {
        label: t('sys.pageDesigner.fixedColor'),
        value: DefineMode.CUSTOM,
      },
      {
        label: t('sys.pageDesigner.coloringThemeColor'),
        value: DefineMode.SYSTEM,
      },
    ];
    return colorList || defProps.editor._config?.options;
  });

  const defineMode = computed({
    get() {
      return selectedStyle.value[defProps.editor.name]?.defineMode || DefineMode.CUSTOM;
    },
    set(value) {
      if (selectedStyle.value[defProps.editor.name]) {
        selectedStyle.value[defProps.editor.name].defineMode = value;
      } else {
        selectedStyle.value[defProps.editor.name] = {
          defineMode: value,
        };
      }
    },
  });

  const bgColor = computed({
    get() {
      return selectedStyle.value[defProps.editor.name]?.color;
    },
    set(value) {
      if (selectedStyle.value[defProps.editor.name]) {
        selectedStyle.value[defProps.editor.name].color = value;
      } else {
        selectedStyle.value[defProps.editor.name] = {
          color: value,
        };
      }
    },
  });
</script>
