<template>
  <g-color-picker :preset="presetColor" :color="propValue" @update:color="handleUpdateColor">
    <template #icon>
      <div
        :style="{
          width: '22px',
          height: '22px',
          backgroundColor: propValue,
          borderRadius: '4px',
        }"
      ></div>
    </template>
  </g-color-picker>
</template>

<script setup lang="ts" name="button-color-editor">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { presetColor, btnTypeColor, shadeColor } from '/@page-designer/hooks/useStyleEditor';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { watch, toRefs, onMounted } from 'vue';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { widget } = toRefs(defProps);

  watch(
    () => [
      widget?.value?.props.type,
      widget?.value?.props.danger,
      widget?.value?.props.enableCustomColor,
    ],
    () => {
      propValue.value = getColor();
    },
  );

  onMounted(() => {
    propValue.value = propValue.value || getColor();
  });

  function getColor() {
    const findItem: any = btnTypeColor.find(
      (i) => i.type === widget?.value?.props.type && i.danger === widget?.value?.props.danger,
    );
    const colorString: any = findItem[defProps.propName!] || '';
    let defautColor = colorString;
    if (defautColor.indexOf('--ant') > -1) {
      const element: any = document.querySelector(':root');
      defautColor = getComputedStyle(element).getPropertyValue(colorString);
    }
    if (defautColor.indexOf('rgb') > -1) {
      defautColor = shadeColor(defautColor);
    }
    return defautColor;
  }

  const handleUpdateColor = (_e, color) => {
    propValue.value = color;
  };
</script>

<style lang="less" scoped></style>
