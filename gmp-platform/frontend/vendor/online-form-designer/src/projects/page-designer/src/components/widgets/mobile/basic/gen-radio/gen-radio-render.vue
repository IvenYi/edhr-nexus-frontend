<template>
  <div class="gen-radio">
    <van-field
      class="gen-radio"
      :label-width="
        !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label == 'left'
          ? labelLayout?.width
          : ''
      "
      v-bind="formAttr"
    >
      <template #label v-if="props.widget.props.displayLabelText !== false">
        <div
          class="w-full"
          :style="labelFont"
          :class="
            !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label === 'left'
              ? labelLayout?.overLabelDisplay == 'ellipsis'
                ? 'label-ellipsis-i'
                : 'label-wrap'
              : ''
          "
        >
          {{ widget.props.title }}
        </div>
      </template>
      <template #input>
        <van-radio-group
          v-model="value"
          direction="horizontal"
          @change="changeRadio"
          :disabled="disabled"
        >
          <van-radio :key="index" :name="i.value" icon-size="16px" v-for="(i, index) in options">
            <Taglabel :tagWidgetStyle="props.widget.style" :label="i.label" :disabled="disabled" />
          </van-radio> </van-radio-group
      ></template>
    </van-field>
  </div>
</template>

<script name="gct-gen-radio" setup lang="ts">
  import { computed, toRef, ref, inject } from 'vue';
  import { GenRadio } from '/@page-designer/types/mobile';
  import Taglabel from '../../__components__/taglabel.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { IMobGenRadioComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ widget: GenRadio }>();
  const { options, checked } = reactive(props.widget.props);
  const { labelFont, contentFont }: any = useStyle(props.widget || props);
  const { disabled } = toRefs(props.widget.props);
  const Event = getPageEvent();
  const value = ref(checked);

  async function changeRadio(key) {
    Event.runEventByName('onChange', props.widget.events, key);
  }

  const formAttr = computed(() => {
    return {
      inputAlign: contentFont.value.textAlign,
    };
  });

  const labelLayout = inject('labelLayout');
  function getValue() {
    return value.value;
  }
  function setValue(v) {
    value.value = v;
  }
  defineExpose<IMobGenRadioComponentExpose>({ getValue, setValue });
</script>
<style scoped lang="less">
  // :deep(.van-radio__label) {
  //   text-align: left;
  // }

  .gen-radio.van-cell {
    &::after {
      border: 0;
    }
  }

  .label-ellipsis-i {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-wrap {
    word-break: break-all;
    white-space: wrap;
  }

  .label-ellipsis {
    overflow: visible;
  }
  .gen-radio {
    overflow-y: auto;
  }
</style>
