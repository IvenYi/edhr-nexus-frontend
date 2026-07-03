<template>
  <div class="align-group-box">
    <div
      v-for="item in options"
      :key="item.value"
      class="icon-box"
      :class="FontStyleRef.align === item.value ? 'selected' : null"
      @click="changeAlign(item.value)"
    >
      <a-tooltip>
        <template #title>{{ item.label }}</template>
        <span class="iconfont" :class="item.icon"></span>
      </a-tooltip>
    </div>
    <!-- <div
      class="icon-box"
      :class="FontStyleRef.align === 'left' ? 'selected' : null"
      @click="changeAlign('left')"
    >
      <a-tooltip>
        <template #title>{{ t('sys.platform.left') }}</template>
        <align-left-outlined />
      </a-tooltip>
    </div>
    <div
      class="icon-box"
      :class="FontStyleRef.align === 'right' ? 'selected' : null"
      @click="changeAlign('right')"
    >
      <a-tooltip>
        <template #title>{{ t('sys.platform.right') }}</template>
        <align-right-outlined />
      </a-tooltip>
    </div> -->
  </div>
</template>
<script lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
</script>
<script setup lang="ts" name="align-group">
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { computed } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  // const { t } = useI18n();

  const { selectedStyle } = useSelectedWidget();
  const props = defineProps({
    name: {
      type: String,
      default: 'labelFont',
    },
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
    },
    options: {
      type: Array,
      default: () => [
        {
          label: useI18n().t('sys.platform.left'),
          value: 'left',
          icon: 'icon-zuoduiqi',
        },
        {
          label: useI18n().t('sys.platform.center'),
          value: 'center',
          icon: 'icon-juzhongduiqi',
        },
        {
          label: useI18n().t('sys.platform.right'),
          value: 'right',
          icon: 'icon-youduiqi',
        },
        {
          label: useI18n().t('sys.platform.justify'),
          value: 'justify',
          icon: 'icon-liangduanduiqi',
        },
      ],
    },
  });
  const FontStyleRef = computed(() => {
    const defaultFont = {
      align: 'left',
    };
    return selectedStyle.value[props.name] || defaultFont;
  });
  const changeAlign = (align) => {
    FontStyleRef.value.align = align;
    if (!props.widget?.style[props.name]) {
      props.widget!.style[props.name] = { align: FontStyleRef.value.align };
    } else {
      props.widget!.style[props.name].align = FontStyleRef.value.align;
    }
  };
</script>

<style lang="less" scoped>
  .icon-box {
    flex: 1;
    height: 22px;
    line-height: 22px;
    text-align: center;
    cursor: pointer;
    border-radius: 2px;

    .iconfont {
      padding: 3px 4px;
      border-radius: 2px;
      &:hover {
        background-color: #e6e9ef;
      }
    }
  }

  .selected {
    background-color: #ffffff;
  }

  .align-group-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 26px;
    background-color: #f2f4f7;
    margin-bottom: 8px;
    border-radius: 4px;
    padding: 2px;
  }
</style>
