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
    <a-radio-group
      v-model:value="value"
      @change="changeRadio"
      :defaultValue="checked"
      :disabled="disabled"
    >
      <a-radio :key="index" :value="i.value" v-for="(i, index) in options">
        <Taglabel :tagWidgetStyle="props.widget.style" :label="i.label" :disabled="disabled" />
      </a-radio> </a-radio-group
  ></a-form-item>
</template>

<script name="gct-gen-radio" setup lang="ts">
  import { ref, nextTick, toRaw, reactive, toRefs, inject } from 'vue';
  import { GenRadio } from '/@page-designer/types/web';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import Taglabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { useStyle, transAlign2flex } from '/@page-designer/hooks/useStyle';
  import { IGenRadioComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const Event = getPageEvent();

  const props = defineProps<{ widget: GenRadio }>();
  const { options, checked } = reactive(props.widget.props);
  const { labelFont, wrapperStyle, contentFont }: any = useStyle(props.widget || props);
  // const { onChange, getValue, setValue } = useFormWidget(props, '');
  const { disabled } = toRefs(props.widget.props);
  const value = ref(checked);

  const labelLayout = inject('labelLayout');

  async function changeRadio() {
    await nextTick();
    let data = getOptionValue();
    // onChange(data);
    Event.runEventByName('onChange', props.widget.events, value.value, data);
  }
  /**
   * 获取选中的options
   */
  function getOptionValue() {
    let data = options?.find((i) => i.value === value.value);
    return toRaw(data);
  }

  function getValue() {
    return value.value;
  }

  function setValue(v) {
    value.value = v;
  }

  defineExpose<IGenRadioComponentExpose>({
    getValue,
    setValue,
    getOptionValue,
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
