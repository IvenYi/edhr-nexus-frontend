<template>
  <a-form-item>
    <template #label v-if="displayLabelText !== false">
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
    <a-checkbox-group v-model:value="value" @change="changeCheckbox" :disabled="disabled">
      <a-checkbox
        v-for="(item, index) in options"
        :key="item.value + '_' + index"
        :value="item.value"
      >
        <Taglabel :tagWidgetStyle="props.widget.style" :label="item.label" :disabled="disabled" />
      </a-checkbox> </a-checkbox-group
  ></a-form-item>
</template>

<script setup lang="ts" name="gct-gen-checkbox">
  import { ref, reactive, toRaw, nextTick, toRefs, inject } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { GenCheckbox } from '/@page-designer/types/web';
  import Taglabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { useStyle, transAlign2flex } from '/@page-designer/hooks/useStyle';
  import { IGenCheckboxComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = defineProps<{ widget: GenCheckbox }>();
  const { options, checked, displayLabelText } = reactive(props.widget.props);
  const { labelFont, wrapperStyle, contentFont }: any = useStyle(props.widget || props);
  const { disabled } = toRefs(props.widget.props);
  // const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const value = ref(checked);

  const labelLayout = inject('labelLayout');

  /**
   * 获取选中的options
   */
  function getOptionValue() {
    return options?.filter((val) => value.value?.includes(val.value)).map((i) => toRaw(i));
  }

  async function changeCheckbox() {
    await nextTick();
    let data = getOptionValue();
    Event.runEventByName('onChange', props.widget.events, value.value, data);
  }

  defineExpose<IGenCheckboxComponentExpose>({
    getOptionValue,
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
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

  :deep(.ant-checkbox-group) {
    display: flex;
    justify-content: v-bind('transAlign2flex[contentFont.textAlign]');
    width: 100%;
  }
</style>
