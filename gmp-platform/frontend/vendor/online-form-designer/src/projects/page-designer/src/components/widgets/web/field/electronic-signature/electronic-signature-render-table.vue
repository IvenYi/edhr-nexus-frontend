<template>
  <a-image
    width="64px"
    height="36px"
    :src="value"
    v-if="value"
    :fallback="ErrorThumbnail"
    class="object-contain"
  >
    <template #previewMask> <span class="iconfont icon-fangdajing"></span> </template>
  </a-image>
</template>

<script name="gct-textarea" setup lang="ts">
  import { computed, reactive } from 'vue';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { Textarea } from '/@page-designer/types/web';
  import ErrorThumbnail from '/@/assets/images/error.svg';
  const props = defineProps<{ modelValue?: string; widget: Textarea }>();
  const emit = defineEmits(['update:modelValue']);
  const { value } = useFormWidget(props, emit);
</script>
<style scoped lang="less"></style>
