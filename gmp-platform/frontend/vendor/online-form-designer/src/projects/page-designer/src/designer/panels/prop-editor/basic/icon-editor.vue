<template>
  <a-popover v-if="clearable" placement="right">
    <template #content v-if="!!propValue">
      <a @click="cancel">{{ $t('sys.pageDesigner.cancel') }}</a>
    </template>
    <!-- <IconPickerNext v-model:value="propValue" /> -->
    <IconNextPicker
      v-model:value="icon"
      v-model:color="iconColor"
      v-model:background="iconBackground"
      :showColor="showColor"
      :showBackground="showBackground"
      :size="size"
      :style="{
        '--box-size': '40px',
      }"
    />
  </a-popover>
  <IconNextPicker
    v-else
    v-model:value="icon"
    v-model:color="iconColor"
    v-model:background="iconBackground"
    :showColor="showColor"
    :showBackground="showBackground"
    :size="size"
    :style="{
      '--box-size': '40px',
    }"
  />
</template>

<script setup lang="ts" name="icon-editor">
  import { computed, reactive } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { IconNextPicker } from '/@/components/Icon';

  type IconValue = { icon: string; iconColor?: string; iconBackground?: string; iconSize?: string };
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { showColor, showBackground, clearable = true, defaultColor } = propConfig || {};
  const { propValue } = usePropEditor<IconValue>(defProps.propName, defProps.changeCallback);
  const icon = computed({
    get() {
      return propValue.value.icon;
    },
    set(val) {
      propValue.value = { ...propValue.value, icon: val, iconColor: iconColor.value };
    },
  });
  const iconColor = computed({
    get() {
      return propValue.value.iconColor || defaultColor;
    },
    set(val) {
      propValue.value = { ...propValue.value, iconColor: val };
    },
  });
  const iconBackground = computed({
    get() {
      return propValue.value.iconBackground || '#f5f5f5';
    },
    set(val) {
      propValue.value = { ...propValue.value, iconBackground: val };
    },
  });
  const size = computed({
    get() {
      return propValue.value.iconSize || 32;
    },
    set(val) {
      propValue.value = { ...propValue.value, iconSize: val };
    },
  });
  function cancel() {
    propValue.value = { icon: '' };
  }
</script>
