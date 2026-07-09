<template>
  <van-image
    :src="value"
    class="w64px h32px"
    :error-icon="ErrorThumbnail"
    v-if="value"
    fit="contain"
  />
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
