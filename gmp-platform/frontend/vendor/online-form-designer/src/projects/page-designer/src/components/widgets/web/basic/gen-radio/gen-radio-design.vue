<template>
  <a-form-item>
    <template #label v-if="props.widget.props.displayLabelText !== false">
      <div
        :title="props.widget.props.title"
        :class="
          !!labelLayout?.hasLabelWidth && labelLayout?.layout == 'horizontal'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis-i'
              : 'label-wrap'
            : ''
        "
      >
        {{ props.widget.props.title }}
      </div>
    </template>
    <a-radio-group v-model:value="value">
      <a-radio :value="item.value" v-for="(item, index) in options" :key="item.value + '_' + index">
        <Taglabel
          :tagWidgetStyle="props.widget.style"
          :label="item.label"
          :disabled="props.widget.props.disabled"
        />
      </a-radio> </a-radio-group
  ></a-form-item>
</template>

<script setup lang="ts" name="gct-gen-radio">
  import { computed, toRef, ref, inject } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import Taglabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { uuid2 } from '/@/utils/uuid';
  import { useStyle, transAlign2flex } from '/@page-designer/hooks/useStyle';

  const props = defineProps(widgetProps);
  const value = computed(() => props.widget!.props.checked);
  const { labelFont, wrapperStyle, contentFont }: any = useStyle(props.widget || props);
  const defaultOptions: any = ref([
    { label: '选项一', value: uuid2(16, 16) },
    { label: '选项二', value: uuid2(16, 16) },
    { label: '选项三', value: uuid2(16, 16) },
  ]);

  const labelLayout = inject('labelLayout');

  const options = toRef(() => {
    const orgOptions = props.widget!.props.options;
    return orgOptions.length ? orgOptions : defaultOptions.value;
  });
</script>
<style scoped lang="less">
  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    &:has(div.label-wrap) {
      overflow: visible;
      word-break: break-all;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis-i {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.ant-radio-group) {
    display: flex;
    justify-content: v-bind('transAlign2flex[contentFont.textAlign]');
    width: 100%;
  }
</style>
