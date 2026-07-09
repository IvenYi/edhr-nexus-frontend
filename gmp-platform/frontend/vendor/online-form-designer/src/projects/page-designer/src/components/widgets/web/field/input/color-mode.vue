<!-- eDHR记录本标签需求，后续如果平台上了标签需求，代码可以删除后同步到eDHR -->
<template>
  <div class="color-mode" :class="readonly && 'is-readonly'">
    <g-color-picker :preset="presetColor" :color="currentValue" @update:color="handleUpdateColor">
      <template #icon>
        <div
          :style="{
            width: '24px',
            height: '24px',
            backgroundColor: currentValue,
          }"
        ></div>
      </template>
    </g-color-picker>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { Input } from '/@page-designer/types/web';

  const props = defineProps<{ value?: string; readonly: boolean; widget: Input }>();

  const { edhrDefaultColor } = reactive(props.widget.props);

  const emit = defineEmits(['update:value']);

  const currentValue = computed({
    get() {
      return props.value || edhrDefaultColor || '#fff';
    },
    set(v) {
      emit('update:value', v);
    },
  });

  const handleUpdateColor = (_e, color) => {
    currentValue.value = color;
  };
</script>

<style lang="less" scoped>
  .color-mode {
    vertical-align: middle;
    display: inline-flex;
    align-items: center;

    &.is-readonly {
      pointer-events: none;
    }
  }
</style>
