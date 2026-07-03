<template>
  <div class="image-data__wrapper">
    <div class="setting-row flex-col">
      <div class="sub-title mb-2px">{{ t('sys.appDesigner.icon') }}</div>
      <div class="sub-content">
        <IconNextPicker
          v-model:value="iconProps.value"
          show-color
          show-background
          v-model:color="iconProps.logoColor"
          v-model:background="iconProps.logoBgColor"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup name="icon-style">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IconNextPicker } from '/@/components/Icon';
  import { ref, watch } from 'vue';

  const { t } = useI18n();
  const emit = defineEmits(['changeEvent']);
  const props = defineProps(['icon', 'logoColor', 'logoBgColor']);

  const iconProps = ref({
    value: props.icon,
    logoColor: props.logoColor,
    logoBgColor: props.logoBgColor,
  });
  watch(
    () => iconProps.value,
    (val) => {
      iconProps.value = val;
      emit('changeEvent', iconProps.value);
    },
    { immediate: true, deep: true },
  );
</script>
