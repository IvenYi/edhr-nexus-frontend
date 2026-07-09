<template>
  <a-form-item>
    <template #label v-if="props.widget.props.displayLabelText!==false">
      <div
        :title="props.widget.props.label"
        :class="
          !!labelLayout?.hasLabelWidth && labelLayout?.layout == 'horizontal'
            ? labelLayout?.overLabelDisplay == 'ellipsis'
              ? 'label-ellipsis'
              : 'label-wrap'
            : ''
        "
      >
        {{ props.widget.props.label }}
      </div>
    </template>
    <div
      :class="{
        'gct-gen-switch': true,
        'gct-gen-switch-right': isAlignedRight,
        'gct-gen-switch-justify': isJustified,
      }"
    >
      <component
        :disabled="disabled"
        :is="cmp[bindCompStyleType]"
        v-bind="separatorAttr"
        v-model:value="value"
        v-model:checked="value"
        @change="onChange"
      />
    </div>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-gen-switch">
  import { toRefs, computed, ref, inject } from 'vue';
  import { Switch } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import {
    FieldSelect,
    FieldRadio,
    FieldCheckbox,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Switch as SwitchType } from '/@page-designer/types/web';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { IGenSwitchComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const Event = getPageEvent();

  const props = defineProps<{ widget: SwitchType }>();

  const { bindCompStyleType, truelabel, falselabel, defaultValue, disabled } = toRefs(
    props.widget.props,
  );

  const labelLayout = inject('labelLayout');

  const { labelFont, contentFont }: any = useStyle(props.widget);

  const isAlignedRight = computed(() => {
    return contentFont.value.textAlign === 'right';
  });

  const isJustified = computed(() => {
    return contentFont.value.textAlign === 'justify';
  });

  const value = ref(defaultValue.value);

  const cmp = {
    [BindCmpStyleEnum.CMP_BOOLEAN]: Switch,
    [BindCmpStyleEnum.CMP_SELECT_LIST]: FieldSelect,
    [BindCmpStyleEnum.CMP_RADIO]: FieldRadio,
    [BindCmpStyleEnum.CMP_CHECKBOX]: FieldCheckbox,
  };

  const separatorAttr = computed(() => {
    return {
      fieldType: 'boolean',
      tagStyle: props.widget.style,
      options: [
        { label: truelabel.value, value: true },
        { label: falselabel.value, value: false },
      ],
    };
  });

  const onChange = (val) => {
    let value = val;
    if (bindCompStyleType.value === BindCmpStyleEnum.CMP_CHECKBOX) {
      value = Boolean(val[0]);
    }
    Event.runEventByName('onChange', props.widget.events, value);
  };
  defineExpose<IGenSwitchComponentExpose>({
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

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.ant-form-item-control) {
    align-items: v-bind('contentFont.textAlign');
    text-align: v-bind('contentFont.textAlign');

    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        .ant-input,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }

  .gct-gen-switch {
    display: flex;

    &-right {
      justify-content: flex-end;
    }

    &-justify {
      justify-content: space-between;
    }
  }

  :deep(.ant-switch) {
    min-width: 32px;
    height: 20px;
    line-height: 20px;

    .ant-switch-handle {
      top: 4px;
      left: 4px;
      width: 12px;
      height: 12px;
    }

    &.ant-switch-checked {
      .ant-switch-handle {
        top: 3px;
        left: calc(100% - 16px);
        width: 14px;
        height: 14px;
      }
    }
  }
</style>
