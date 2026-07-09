<template>
  <div v-if="readonly">
    <FieldReadonly
      :tagWidgetStyle="widget.style"
      :type="fieldType"
      :isDesign="false"
      :label="readyonlyValue"
    />
    <a-tag v-if="default_" class="rdo-tag ml8px">{{ t('sys.default') }}</a-tag>
  </div>
  <div v-else class="ks-row">
    <a-input-group compact class="ks-col">
      <a-form-item style="width: calc(100% - 120px)" :name="field">
        <a-input
          ref="rdoInputRef"
          :disabled="disabled || _disabledName"
          @change="onChange"
          v-bind="separatorAttr"
          v-model:value="name_"
          style="height: 32px"
          :maxlength="200"
        />
      </a-form-item>
      <a-form-item name="version_" style="width: 120px">
        <a-input
          :disabled="disabled"
          @change="onChange"
          :placeholder="t('sys.appDesigner.version')"
          v-model:value="version_"
          style="height: 32px"
          :maxlength="20"
        />
      </a-form-item>
      <!-- <a-button>
        <template #icon>
          <a-checkbox @change="onChange" v-model:checked="default_" :disabled="disabled"
        /></template>
      </a-button> -->
    </a-input-group>
    <div class="checkbox-wrap">
      <a-checkbox @change="onChange" v-model:checked="default_" :disabled="disabled" />
      <span class="ml6px">{{ t('sys.setDefault') }}</span>
    </div>
  </div>
</template>

<script name="gct-rdo-input" setup lang="ts">
  import { ref, computed, reactive, nextTick, toRefs, onMounted, inject } from 'vue';
  import { Input } from '/@page-designer/types/web';
  import type { InputProps } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Form } from 'ant-design-vue';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';

  const { t } = useI18n();
  const formItemContext = Form.useInjectFormItemContext();
  const props = defineProps<{ widget: Input; formData: any; disabled?: boolean }>();
  const Event = getPageEvent();
  const formData = ref(props.formData);
  const {
    getFocus,
    placeholder,
    clearable,
    fieldType,
    field = 'name_',
    modelKey,
  } = reactive(props.widget.props);
  const { labelFont }: any = useStyle(props.widget);
  const { readonly } = toRefs(props.widget.props);

  const rdoInputRef = ref();

  const _disabledName = inject('_disabled_rdoname', false);
  onMounted(async () => {
    if (getFocus && rdoInputRef.value && rdoInputRef.value.input) {
      rdoInputRef.value.input?.focus();
    }
  });

  const separatorAttr = computed(() => {
    let attr: InputProps = {
      placeholder,
      allowClear: clearable,
    };
    return attr;
  });

  const name_ = computed({
    get() {
      return formData.value[field];
    },
    set(value: string) {
      formData.value[field] = value.replace(':', '');
    },
  });
  const version_ = computed({
    get() {
      return formData.value.version_;
    },
    set(value: string) {
      formData.value.version_ = value.replace(':', '');
    },
  });
  const default_ = computed({
    get() {
      return !!formData.value.default_;
    },
    set(value: boolean) {
      formData.value.default_ = value;
    },
  });

  const readyonlyValue = computed(() => {
    return `${name_.value}:${version_.value}`;
  });

  async function onChange(e) {
    formItemContext.onFieldChange();
    await nextTick();
    Event.runEventByName(
      'onChange',
      props.widget.events,
      {
        [field]: name_.value,
        default_: default_.value,
        version_: version_.value,
      },
      formData.value,
    );
  }
  defineExpose({});
</script>

<style lang="less" scoped>
  .ant-input-group {
    // :deep(.ant-input-affix-wrapper),
    // :deep(.ant-input) {
    //   border-radius: 0;
    // }

    :deep(.ant-form-item) {
      margin-bottom: 0;

      &:first-child {
        .ant-input-affix-wrapper {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      &:last-child {
        .ant-input-affix-wrapper {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }

  .rdo-input--readyonly {
    opacity: 0.8;
    pointer-events: none;

    .rdo-input-text {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
  }

  .rdo-input--disabled {
    color: rgb(0 0 0 / 25%);

    .rdo-input-text {
      color: rgb(0 0 0 / 25%);
    }
  }

  :deep(.ant-form-item) {
    padding: 0;
  }

  .checkbox-wrap {
    height: 32px;
    margin-left: 8px;
    color: #3d3d3e;
    line-height: 32px;
  }

  .rdo-tag {
    border: none;
    background-color: rgba(from var(--ant-primary-color) r g b / 8%) !important;
    color: var(--ant-primary-color);
  }
</style>
