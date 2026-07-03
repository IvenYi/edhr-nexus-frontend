<template>
  <div>
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
          class="gen-checkbox"
          v-model="value"
          shape="square"
          direction="horizontal"
        >
          <van-checkbox
            class="mb-5px tag"
            v-for="(item, index) in options"
            :key="item.value + '_' + index"
            :name="item.value"
            icon-size="16px"
          >
            <Taglabel
              :tagWidgetStyle="props.widget.style"
              :label="item.label"
              :disabled="props.widget.props.disabled"
            />
          </van-checkbox>
        </van-checkbox-group>
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts" name="gct-gen-checkbox">
  import { computed, toRef, ref, inject } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import Taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { uuid2 } from '/@/utils/uuid';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const props = defineProps(widgetProps);
  const { labelFont, contentFont }: any = useStyle(props.widget || props);
  const value = computed(() => props.widget!.props.checked);
  const defaultOptions: any = ref([
    { label: '选项一', value: uuid2(16, 16) },
    { label: '选项二', value: uuid2(16, 16) },
    { label: '选项三', value: uuid2(16, 16) },
  ]);
  const formAttr = computed(() => {
    return {
      inputAlign: contentFont.value.textAlign,
    };
  });

  const labelLayout = inject('labelLayout');
  const options = toRef(() => {
    const orgOptions = props.widget!.props.options;
    return orgOptions.length ? orgOptions : defaultOptions.value;
  });
</script>
<style scoped lang="less">
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
</style>
