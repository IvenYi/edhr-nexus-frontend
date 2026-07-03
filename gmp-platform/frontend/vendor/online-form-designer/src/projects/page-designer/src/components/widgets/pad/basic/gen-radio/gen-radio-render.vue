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
        <van-radio-group
          v-model="value"
          direction="horizontal"
          @change="changeRadio"
          :disabled="disabled"
        >
          <van-radio
            shape="dot"
            :key="index"
            :name="i.value"
            icon-size="16px"
            v-for="(i, index) in options"
          >
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
  import { useStyle, transAlign2flex } from '/@page-designer/hooks/useStyle';
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
  const layout: any = inject('form-layout', {});

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
      text-align: v-bind("layout.inputAlign||'left'");
      word-break: break-all;

      & > div {
        width: 100%;
      }
    }
  }

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

  // :deep(.van-field__label) {
  //   width: auto;
  // }
  :deep(.van-radio-group) {
    display: flex;
    justify-content: v-bind(
      'transAlign2flex[contentFont.textAlign]||transAlign2flex[layout?.inputAlign]'
    );
    width: 100%;
  }

  :deep(.van-cell) {
    background: transparent;
  }

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
