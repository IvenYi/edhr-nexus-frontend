<template>
  <div class="btn-item" :style="style">
    <span class="btn-row" :style="svgStyle">
      <SvgIcon :class="['btn-icon']" :size="widget.props.size" :prefix="prefix" :name="name" />
    </span>
    <span class="btn-row" :style="fontStyle">{{ $t(widget.props.title) }}</span>
  </div>
</template>

<script setup lang="ts" name="gct-excute-button">
  import { computed } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { BaseButton } from '/@page-designer/types/mobile';

  const props = defineProps<{ widget: BaseButton }>();

  const prefix = computed(() => {
    const Icon = props.widget.props.icon || 'icon-platform:platform-pad-picigezhi';
    const prefix_ = Icon.split(':')[0];
    const name_ = Icon.split(':')[1];
    return 'icon-' + name_.split('-')[0];
  });

  const name = computed(() => {
    const Icon = props.widget.props.icon || 'icon-platform:platform-pad-picigezhi';
    const name_ = Icon.split(':')[1];
    return name_.replace('platform-', '').replace('medicalCare-', '');
  });

  const style = computed(() => {
    const { contentFont } = props.widget.style;
    const layout = (props.widget.props as any).layout;
    const align = contentFont?.align || 'left';
    const obj: Record<string, any> = {
      flexDirection: layout == 'vertical' ? 'column' : 'row',
    };
    const alignMap = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
      justify: 'space-between',
    };
    if (layout !== 'vertical') {
      obj.alignItems = 'center';
      obj.justifyContent = alignMap[align];
    }
    return obj;
  });

  const svgStyle = computed(() => {
    const { contentFont } = props.widget.style;
    const layout = (props.widget.props as any).layout;
    const align = contentFont?.align || 'left';
    const obj = {
      width: layout == 'vertical' ? '100%' : 'auto',
      textAlign: align,
    };
    return obj;
  });

  const fontStyle = computed(() => {
    const { contentFont } = props.widget.style;
    const layout = (props.widget.props as any).layout;
    const align = contentFont?.align || 'left';
    const obj = {
      width: layout == 'vertical' ? '100%' : 'auto',
      textAlign: align,
      fontWeight: contentFont?.bold ? 'bold' : 'normal',
      fontStyle: contentFont?.italic ? 'italic' : 'normal',
      fontSize: (contentFont?.fontSize || 14) + 'px',
      textDecoration: contentFont?.textDecoration || 'normal',
      color: contentFont?.color || 'rgba(0,0,0,.85)',
    };
    return obj;
  });
</script>

<style scoped lang="less">
  .btn-item {
    display: flex;
    // width: 100%;
    // height: 100%;

    .btn-row {
      // flex: 1;
      // display: flex;
      // align-items: center;
    }
  }
</style>
