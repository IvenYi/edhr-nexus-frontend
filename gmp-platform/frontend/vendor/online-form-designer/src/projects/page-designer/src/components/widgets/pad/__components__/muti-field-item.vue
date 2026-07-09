<template>
  <div v-if="name" class="tag" :style="style" :class="props.config.style.labelType">{{ name }}</div>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { colord } from 'colord';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{ config: any; isDesign: boolean; rowValue?: any }>();
  const Event = getPageEvent();

  const runName = ref();
  onMounted(async () => {
    if (props.config?.event?.name && !props.isDesign) {
      runName.value = await Event.runExportByName(
        props.config?.event?.name,
        props.rowValue,
        props.config?.event?.extraParams,
      );
    }
  });
  const name = computed(() => {
    if (!props.config?.event?.name) return '';
    if (props.isDesign) {
      return '辅助字段';
    }

    return runName.value;
  });

  const style = computed(() => {
    if (props.config.style.labelType.includes('surface_')) {
      return {
        background: props.config.style.color,
        color: '#fff',
      };
    }
    if (props.config.style.labelType.includes('line_dashed_')) {
      return {
        border: `1px dashed ${colord(props.config.style.color).alpha(0.5).toRgbString()}`,
        color: props.config.style.color,
      };
    }
    if (props.config.style.labelType.includes('line_')) {
      return {
        border: `1px solid ${colord(props.config.style.color).alpha(0.5).toRgbString()}`,
        color: props.config.style.color,
      };
    }
    return {
      background: colord(props.config.style.color).alpha(0.1).toRgbString(),
      color: props.config.style.color,
      border: `1px solid ${colord(props.config.style.color).alpha(0.5).toRgbString()}`,
    };
  });
</script>
<style lang="less" scoped>
  .tag {
    display: flex;
    align-items: center;
    height: 22px;
    margin-left: 8px;
    font-size: 12px;
    line-height: 22px;
    white-space: nowrap;
  }

  .radius,
  .surface_radius,
  .line_radius,
  .line_dashed_radius {
    padding-right: 6px;
    padding-left: 6px;
    border-radius: 3px;
  }

  .big_radius,
  .surface_big_radius,
  .line_big_radius {
    padding-right: 8px;
    padding-left: 8px;
    border-radius: 50px;
  }

  .line_status,
  .surface_status,
  .status {
    padding-right: 8px;
    padding-left: 8px;
    border-radius: 11px 3px 3px;
  }
</style>
