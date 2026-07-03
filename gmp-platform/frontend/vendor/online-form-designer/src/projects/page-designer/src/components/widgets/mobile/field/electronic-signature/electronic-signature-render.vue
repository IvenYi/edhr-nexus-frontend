<template>
  <vantField :props="widget.props" :style="widget.style">
    <template #input>
      <van-image
        :src="value"
        class="w160px h90px"
        v-if="value"
        fit="contain"
        :error-icon="ErrorThumbnail"
      />
    </template>
  </vantField>
</template>

<script name="gct-textarea" setup lang="ts">
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { Textarea } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import ErrorThumbnail from '/@/assets/images/error.svg';
  const props = defineProps<{ modelValue?: string; widget: Textarea }>();
  const emit = defineEmits(['update:modelValue']);
  const { value } = useFormWidget(props, emit);
</script>
<style scoped lang="less"></style>
