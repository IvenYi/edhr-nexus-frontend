<template>
  <div class="btn-item" :style="style" @click="click">
    <div class="btn-row" :style="svgStyle">
      <van-image
        fit="cover"
        :width="widget.props.size"
        :height="widget.props.size"
        :src="getIconUrl(prefix, name)"
      />
    </div>
    <div class="btn-name" :style="fontStyle">{{ $t(widget.props.title) }}</div>
  </div>
</template>

<script setup lang="ts" name="gct-excute-button">
  import { reactive, ref, computed } from 'vue';
  import { showToast } from 'vant';
  import { SvgIcon } from '/@/components/Icon';
  import { BaseButton } from '/@page-designer/types/mobile';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { calcStyle } from '/@page-designer/utils';

  const props = defineProps<{ widget: BaseButton }>();

  const prefix = computed(() => {
    const Icon = props.widget.props.icon || 'icon-platform:platform-pad-picigezhi';
    const name_ = Icon.split(':')[1];
    return name_.split('-')[0];
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
      ...calcStyle(props.widget.style),
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
      height: props.widget.props.size + 'px',
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

  const Event = getPageEvent();
  async function click() {
    try {
      await Event.runEventByName('onClick', props?.widget?.events || {});
    } catch (error) {
      error && typeof error === 'string' && showToast(error);
    }
  }

  defineExpose({});

  const getIconUrl = (prefix: string, name: string) => {
    try {
      // 注意：这里路径必须是相对当前文件的静态路径，不能用 @
      return new URL(`../../../../../../../assets/icons/${prefix}/${name}.svg`, import.meta.url)
        .href;
    } catch {
      return '';
    }
  };
</script>

<style scoped lang="less">
  .btn-item {
    cursor: pointer;
    display: flex;

    .btn-row {
      overflow: hidden;
    }

    .btn-name {
      min-width: 80px;
    }
  }
</style>
