<template>
  <tagLayout v-if="!!showLabel.length" :disabled="!!disabled" :labelLayout="labelLayout">
    <template v-if="tagWidgetStyle?.tagStyleOpen">
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
          <img :src="imgSrc" />
        </template>
        <tag :tagStyle="tagWidgetStyle.tagStyle" @mouseup.stop="mouseup(i)">
          <span class="select-text cursor-pointer" :style="getMsgColor" :class="classData">{{
            i.label
          }}</span>
        </tag>
      </a-popover>
    </template>
    <template v-else>
      <template v-for="(i, index) in showLabel" :key="index">
        <span> {{ !!index ? '，' : '' }} </span>
        <a-popover
          overlayClassName="gct-ref-card-popover min-w100px min-h30px max-h96vh"
          :visible="!!tipMap[i.value]"
          :trigger="trigger"
          color="#fff"
          placement="bottomLeft"
          @visibleChange="(v) => visibleChange(v, i)"
        >
          <template #content>
            <img :src="imgSrc" />
          </template>
          <span
            @click.stop
            @mouseup.stop="mouseup(i)"
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
  import { inject, toRef, computed, reactive, ref } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { schemaToStyle } from '/@page-designer/hooks/useStyle';
  import tag from './tag.vue';
  import tagLayout from './tag-layout.vue';
  import { CARD_TRIGGER_ENUM } from '@gct/runtime';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { getCommonInfoCardGetById } from '/@/apis/gct-apaas/CommonInfoCardController';

  export interface Props {
    tagWidgetStyle?: {
      tagStyleOpen: boolean;
      contentFont: LowCodeWidget.FontStyle;
      tagStyle?: LowCodeWidget.TagConfigStyle;
    };
    disabled?: boolean;
    trigger: CARD_TRIGGER_ENUM;
    modelKey: string;
    /**信息卡的id */
    refCardId: string;
    type: FIELD_TYPE;
  }

  const props = defineProps<Props>();
  const imgSrc = ref('');
  const classData = toRef(() =>
    props.trigger === CARD_TRIGGER_ENUM.HOVER ? 'primary-gct-hover' : 'primary-gct',
  );
  const labelLayout = inject('labelLayout', {});
  const tipMap = reactive({});

  const showLabel = computed(() => {
    const example = props.type ? transformField2Component(props.type).example : [];
    // 样例文本转为国际化文本
    const showMsg = example
      ? typeof example === 'string'
        ? [$t(example)]
        : example.map((e) => $t(e))
      : [];
    return showMsg.map((i) => {
      return { value: i, label: i };
    });
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
    if (visible) {
      const data = await getCommonInfoCardGetById({
        id: props.refCardId,
        modelKey: props.modelKey,
        type: 'CARD',
      });
      imgSrc.value = data.screenShoot;
      console.log(imgSrc.value);
    }
    tipMap[row.value] = visible;
  };
  function mouseup(row) {
    visibleChange(true, row);
  }
</script>
<style lang="less">
  .gct-ref-card-popover {
    box-shadow: 0 2px 6px 0 rgb(0 0 0 / 10%);

    .ant-popover-inner-content {
      padding: 0;
    }

    .ant-popover-arrow {
      display: none;
    }
  }
</style>
