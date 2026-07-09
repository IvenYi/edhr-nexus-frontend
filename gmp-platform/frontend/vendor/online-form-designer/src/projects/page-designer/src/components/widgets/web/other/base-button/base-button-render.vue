<template>
  <a-button :size="size" :type="type" :danger="danger">
    <template #icon>
      <IconNext
        v-if="hasIcon"
        :size="16"
        :value="icon"
        :style="{
          marginRight: hasText ? '4px' : 0,
          '--color': 'inherit',
          lineHeight: '1',
          verticalAlign: 'text-bottom',
        }"
      />
    </template>
    {{ hasText ? label : '' }}
  </a-button>
</template>
<script setup lang="ts" name="base-button-render">
  import { toRefs } from 'vue';
  import { BaseButton } from '/@page-designer/types/web';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  const props = defineProps<{ widget: BaseButton }>();
  const { hasIcon, hasText, icon, label, size, type, danger } = toRefs(props.widget.props);
</script>
<style lang="scss" scoped></style>
