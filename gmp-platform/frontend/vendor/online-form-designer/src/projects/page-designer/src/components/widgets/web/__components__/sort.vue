<template>
  <div class="ks-column text-[#d9d9d9]">
    <caret-up-filled
      :style="{ color: modelValue === sortTypeEnum.ASC ? getThemeColor : undefined }"
      class="mb--2px cursor-pointer"
      @click="changeRule(sortTypeEnum.ASC)"
    />
    <caret-down-filled
      :style="{ color: modelValue === sortTypeEnum.DESC ? getThemeColor : undefined }"
      class="mt--2px cursor-pointer"
      @click="changeRule(sortTypeEnum.DESC)"
    />
  </div>
</template>

<script setup lang="ts">
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { sortTypeEnum } from '/@page-designer/enum';

  defineProps<{ modelValue?: sortTypeEnum }>();
  const emit = defineEmits(['sort', 'update:modelValue']);

  const { getThemeColor } = useRootSetting();
  function changeRule(v) {
    emit('update:modelValue', v);
    emit('sort', v);
  }
</script>
<style scoped lang="less"></style>
