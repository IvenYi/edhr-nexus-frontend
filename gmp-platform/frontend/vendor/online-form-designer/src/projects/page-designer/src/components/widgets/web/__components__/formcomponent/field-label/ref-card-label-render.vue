<template>
  <tagLayout v-if="!!showLabel.length" :disabled="!!disabled" :labelLayout="labelLayout">
    <template v-if="showTagStyle && tagWidgetStyle?.tagStyleOpen">
      <a-popover
        :trigger="trigger"
        :visible="!!tipMap[i.value]"
        placement="bottomLeft"
        v-for="(i, index) in showLabel"
        :key="index"
        @visibleChange="(v) => visibleChange(v, i)"
        color="#fff"
        overlayClassName="gct-ref-card-popover min-w100px min-h30px max-h96vh"
      >
        <template #content>
          <CardViewRender :id="refCardId" :modelKey="modelKey" :fetch="cardFetch(i.value)" />
        </template>
        <tag :tagStyle="tagWidgetStyle.tagStyle" @mouseup="mouseup(i)">
          <span class="select-text cursor-pointer" :style="getMsgColor" :class="classData">{{
            i.label
          }}</span>
        </tag>
      </a-popover>
    </template>
    <template v-else>
      <template v-for="(i, index) in showLabel" :key="index">
        <span>
          {{ !!index ? '，' : '' }}
        </span>
        <a-popover
          overlayClassName="gct-ref-card-popover min-w100px min-h30px max-h96vh"
          :visible="!!tipMap[i.value]"
          :trigger="trigger"
          color="#fff"
          placement="bottomLeft"
          @visibleChange="(v) => visibleChange(v, i)"
        >
          <template #content>
            <CardViewRender :id="refCardId" :modelKey="modelKey" :fetch="cardFetch(i.value)" />
          </template>
          <span
            @click.stop
            @mouseup="mouseup(i)"
            class="select-text cursor-pointer"
            :style="getMsgColor"
            :class="classData"
          >
            {{ i.label }}
          </span>
        </a-popover>
      </template>
    </template>
  </tagLayout>
  <span v-else>&nbsp;</span>
</template>

<script setup lang="ts">
  import { inject, toRef, computed, reactive } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { schemaToStyle } from '/@page-designer/hooks/useStyle';
  import tag from './tag.vue';
  import tagLayout from './tag-layout.vue';
  import { CARD_TRIGGER_ENUM } from '@gct/runtime';
  import { CardViewRender } from '@gct/runtime-render-web';
  // import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';

  // const PopupContainer = getParentPopupContainer(props);
  export interface Props {
    tagWidgetStyle?: {
      tagStyleOpen: boolean;
      contentFont: LowCodeWidget.FontStyle;
      tagStyle?: LowCodeWidget.TagConfigStyle;
    };
    disabled?: boolean;
    values?: Array<string>;
    label?: Array<string | number>;
    /** 外部控制是否显示标签样式 */
    showTagStyle?: boolean;
    trigger: CARD_TRIGGER_ENUM;
    getCardData: PropType<() => Promise<object>>;
    modelKey: string;
    /**信息卡的id */
    refCardId: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    showTagStyle: true,
  });

  const classData = props.trigger === CARD_TRIGGER_ENUM.HOVER ? 'primary-gct-hover' : 'primary-gct';
  const labelLayout = inject('labelLayout', {});
  const tipMap = reactive({});

  const showLabel = computed(() => {
    const propsLabel = typeof props.label === 'string' ? props.label?.split(',') : props.label;
    const labels = propsLabel ?? [];
    let showMsg = props.values
      ?.filter((_, index) => labels[index])
      .map((i, index) => {
        return { value: i, label: labels[index] };
      });
    return showMsg ?? [];
  });

  const comStyle = toRef(() => {
    const contentFont = props.tagWidgetStyle?.contentFont;
    if (!contentFont) return {};
    return schemaToStyle(contentFont);
  });

  const getMsgColor = toRef(() => {
    if (comStyle.value?.color) {
      return comStyle.value;
    }
    return {
      wordBreak: 'break-all',
      ...comStyle.value,
    };
  });
  const visibleChange = async (visible, row) => {
    tipMap[row.value] = visible;
  };
  function mouseup(row) {
    visibleChange(true, row);
  }
  function cardFetch(id) {
    return props.getCardData.bind(null, id);
  }
</script>
<style lang="less">
  .gct-ref-card-popover {
    overflow-y: auto;
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);

    .ant-popover-inner-content {
      padding: 0;
    }

    .ant-popover-arrow {
      display: none;
    }
  }
</style>
