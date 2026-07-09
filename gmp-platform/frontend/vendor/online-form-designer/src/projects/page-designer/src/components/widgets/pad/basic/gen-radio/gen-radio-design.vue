<template>
  <div class="gen-radio">
    <van-field
      :label-width="
        !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label == 'left'
          ? labelLayout?.width
          : 'auto'
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
        <van-radio-group class="gen-radio" v-model="value" direction="horizontal">
          <van-radio
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
            <!-- {{ item.label }} -->
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts" name="gct-gen-radio">
  import { computed, toRef, ref, inject } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import Taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { uuid2 } from '/@/utils/uuid';
  import { useStyle, transAlign2flex } from '/@page-designer/hooks/useStyle';

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
  const layout: any = inject('form-layout', {});
  const options = toRef(() => {
    const orgOptions = props.widget!.props.options;
    return orgOptions.length ? orgOptions : defaultOptions.value;
  });
  const flexJustify = computed(() => {
    if (contentFont.value?.textAlign) {
      return contentFont.value?.textAlign === 'left'
        ? 'flex-start'
        : contentFont.value?.textAlign === 'center'
          ? 'center'
          : 'flex-end';
    }
    if (layout.value?.inputAlign) {
      return layout.value?.inputAlign === 'left' ? 'flex-start' : 'flex-end';
    }
    return 'flex-start';
  });
</script>
<style scoped lang="less">
  .gen-radio {
    overflow-y: auto;

    :deep(.app-tag-cell-box.van-cell .van-cell__value) {
      & > div {
        display: inline-block;
      }
    }

    :deep(.van-field__label) {
      justify-content: v-bind('labelFont.textAlign');
      min-width: v-bind("!labelLayout?.hasLabelWidth? '30%': 'auto'");
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    :deep(.van-field__body) {
      border-radius: 4px;
      font-size: 14px;

      textarea {
        padding-left: v-bind("layout.inputBg?'12px':''");
        text-align: v-bind("layout.inputAlign||'left'");
      }

      input {
        padding-left: v-bind("layout.inputBg?'12px':''");
        text-align: v-bind("layout.inputAlign||'left'");
      }

      .tag-label-disabled {
        padding-left: v-bind("layout.inputBg?'12px':''");
        opacity: 1;
        color: var(--van-field-input-disabled-text-color);
      }
    }

    :deep(.van-field__body:has(.van-field__control .time-input)) {
      padding: 0;
      background-color: transparent;

      .time-input {
        input {
          width: v-bind("layout.inputBg?'32px':'24px'");
          height: v-bind("layout.inputBg?'32px':'24px'");
          border-width: v-bind("layout.inputBg?'1px':0");
        }

        span {
          line-height: v-bind("layout.inputBg?'32px':'24px'");
        }
      }

      .time-input__null {
        input {
          background-color: v-bind("layout.inputBg?'#f7f7f7':'transparent'");
        }
      }
    }

    :deep(.van-cell__right-icon) {
      display: flex;
      align-items: center;
      height: auto;
      margin-left: 0;
      background-color: v-bind("layout.inputBg?'#f7f7f7':''");
    }

    :deep(.van-cell__value) {
      display: flex;
      align-items: 'center';
      justify-content: v-bind('flexJustify');
      // text-align: v-bind("layout.inputAlign||'left'");
      word-break: break-all;

      & > div {
        width: 100%;
      }
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

  :deep(.van-radio-group) {
    display: flex;
    justify-content: v-bind(
      'transAlign2flex[contentFont.textAlign]||transAlign2flex[layout?.inputAlign]'
    );
    width: 100%;
  }
  // :deep(.van-field__label) {
  //   width: auto;
  // }

  :deep(.van-cell__value) {
    display: flex;
    align-items: 'center';

    & > div {
      width: 100%;
    }

    .tag {
      display: inline-block;
    }
  }
</style>
