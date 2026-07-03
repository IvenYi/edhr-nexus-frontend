<template>
  <div>
    <van-field
      class="gct-gen-switch"
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
          {{ widget.props.label }}
        </div>
      </template>
      <template #input>
        <div
          style="display: flex; align-items: center"
          v-if="BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
          :style="contentFont"
        >
          <van-switch v-bind="separatorAttr" v-model="exampleValue" size="16px" />
        </div>

        <component
          v-else
          :is="cmp[bindCompStyleType]"
          v-bind="separatorAttr"
          v-model:value="exampleValue"
        />
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts" name="gct-gen-switch">
  import { toRefs, computed, inject } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const layout: any = inject('form-layout', {});

  const props = defineProps(widgetProps);

  const { bindCompStyleType, truelabel, falselabel, defaultValue } = toRefs(props.widget.props);

  const exampleValue = computed(() => {
    return defaultValue.value;
  });

  const { labelFont, contentFont }: any = useStyle(props.widget);

  const formAttr = computed(() => {
    return {
      inputAlign: contentFont.value.textAlign,
    };
  });

  const labelLayout = inject('labelLayout');

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const separatorAttr = computed(() => {
    return {
      design: true,
      fieldType: 'boolean',
      tagStyle: props.widget.style,
      options: [
        { label: truelabel.value, value: true },
        { label: falselabel.value, value: false },
      ],
    };
  });
</script>
<style scoped lang="less">
  .gct-gen-switch {
    :deep(.app-tag-cell-box.van-cell .van-cell__value) {
      & > div {
        display: inline-block;
      }
    }

    :deep(.van-field__label) {
      color: v-bind('labelFont.color');
      justify-content: v-bind('labelFont.textAlign');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    :deep(.van-field__body) {
      padding: v-bind("layout.inputBg && !notNeedBgColor?'10px 0':''");
      border-radius: 4px;
      // background-color: v-bind("layout.inputBg && !notNeedBgColor?'#f7f7f7':''");
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
      text-align: v-bind("layout.inputAlign||'left'");
      word-break: break-all;
      padding-left: v-bind("layout.inputBg?'12px':''");
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
</style>
