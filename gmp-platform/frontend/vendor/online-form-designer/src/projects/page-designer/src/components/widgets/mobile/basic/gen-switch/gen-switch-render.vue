<template>
  <div class="gen-switch">
    <van-field
      class="gct-gen-switch"
      :label="widget.props.label"
      v-bind="formAttr"
      :clickable="BindCmpStyleEnum.CMP_SELECT_LIST === bindCompStyleType"
      @click="showPopup"
      :label-width="
        !!labelLayout?.hasLabelWidth && labelLayout?.layout?.label == 'left'
          ? labelLayout?.width
          : ''
      "
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
          :style="contentFont"
          v-if="BindCmpStyleEnum.CMP_BOOLEAN === bindCompStyleType"
        >
          <van-switch v-bind="separatorAttr" v-model="value" size="16px" @change="onChange" />
        </div>

        <component
          v-else
          :is="cmp[bindCompStyleType]"
          v-bind="separatorAttr"
          v-model:value="value"
          v-model:showPop="showPop"
          @change="onChange"
          @confirm="onChange"
        />
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts" name="gct-gen-switch">
  import { ref, toRefs, computed, inject } from 'vue';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/mobile/__components__';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IMobGenSwitchComponentExpose } from '/@/projects/page-designer/src/interface/mobile';

  const layout: any = inject('form-layout', {});
  const Event = getPageEvent();
  const props = defineProps<{
    widget: any;
  }>();

  const { bindCompStyleType, truelabel, falselabel, defaultValue, disabled } = toRefs(
    props.widget.props,
  );

  const value = ref(defaultValue.value);

  const cmp = {
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const separatorAttr = computed(() => {
    return {
      disabled: disabled?.value,
      fieldType: 'boolean',
      tagStyle: props.widget.style,
      options: [
        { label: truelabel.value, value: true },
        { label: falselabel.value, value: false },
      ],
    };
  });
  const labelLayout = inject('labelLayout');
  const { labelFont, contentFont }: any = useStyle(props.widget);

  const formAttr = computed(() => {
    return {
      inputAlign: contentFont.value.textAlign,
    };
  });

  const onChange = async (val) => {
    let value = val;
    if (bindCompStyleType.value === BindCmpStyleEnum.CMP_CHECKBOX) {
      value = Boolean(val[0]);
    }
    Event.runEventByName('onChange', props.widget.events, value);
  };

  const showPop = ref<boolean>(false);
  const showPopup = () => {
    if (BindCmpStyleEnum.CMP_SELECT_LIST === bindCompStyleType?.value) {
      showPop.value = true;
    }
  };
  defineExpose<IMobGenSwitchComponentExpose>({
    getValue() {
      return value.value;
    },
    setValue(v) {
      console.log(v);
      value.value = v;
    },
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
      justify-content: v-bind('labelFont.textAlign');
      color: v-bind('labelFont.color');
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
      padding-left: v-bind("layout.inputBg?'12px':''");
      text-align: v-bind("layout.inputAlign||'left'");
      word-break: break-all;
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
  .gen-switch {
    overflow-y: auto;
  }
</style>
