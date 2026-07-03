<template>
  <div class="gen-checkbox">
    <van-field
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
        <van-checkbox-group
          v-model="value"
          shape="square"
          direction="horizontal"
          @change="changeCheckbox"
          :disabled="disabled"
        >
          <van-checkbox
            class="mb-6px"
            v-for="(item, index) in options"
            :key="item.value + '_' + index"
            :name="item.value"
            icon-size="16px"
          >
            <Taglabel
              :tagWidgetStyle="props.widget.style"
              :label="item.label"
              :disabled="disabled"
            />
          </van-checkbox>
        </van-checkbox-group>
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts" name="gct-gen-checkbox">
  import { ref, reactive, toRefs, nextTick, inject, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { GenCheckbox } from '/@page-designer/types/mobile';
  import Taglabel from '../../__components__/taglabel.vue';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { IMobGenCheckboxComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const props = defineProps<{ widget: GenCheckbox }>();
  const { options, checked } = reactive(props.widget.props);
  const { disabled } = toRefs(props.widget.props);
  const { labelFont, contentFont }: any = useStyle(props.widget || props);
  const Event = getPageEvent();
  const value: any = ref(checked);
  const formAttr = computed(() => {
    return {
      inputAlign: contentFont.value.textAlign,
    };
  });
  const labelLayout = inject('labelLayout');
  async function changeCheckbox() {
    await nextTick();
    Event.runEventByName('onChange', props.widget.events, value.value);
  }

  defineExpose<IMobGenCheckboxComponentExpose>({
    getValue() {
      return value.value;
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less">
  :deep(.van-checkbox__label) {
    text-align: left;
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

  :deep(.van-checkbox .van-checkbox__icon .van-icon) {
    border-radius: 2px;
  }

  .label-ellipsis {
    overflow: visible;
  }
  .gen-checkbox {
    overflow-y: auto;
  }
</style>
