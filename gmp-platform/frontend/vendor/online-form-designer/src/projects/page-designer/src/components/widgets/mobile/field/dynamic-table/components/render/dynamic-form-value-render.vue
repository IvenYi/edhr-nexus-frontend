<template>
  <component
    :is="defComponet"
    :widget="widgetSchema"
    :useSwitchComp="widgetConfig?.useSwitchComp"
    :dyn-options="widgetConfig?.useSwitchComp ? filterOptions : booleanOpts"
    :validateRange="validateRange ?? false"
    v-model:modelValue="value"
  />
</template>

<script setup lang="ts" name="gct-dynamic-form-value">
  import { computed, toRefs, toRaw, watch, ref, onMounted, nextTick } from 'vue';
  import { LowCodeWidget } from '/@/projects/page-designer/src/types/widget-basic-types';
  import { isBoolean, isNil, pick } from 'lodash-es';
  import { AsyncGctComponents } from '/@page-designer/components/mobileModule';
  import { getDynCompParams, IDynConfig } from '../../__utils__/dynamic.logic';
  import useDynamic from '../../__utils__/useDynamic';
  import { FormComponents } from '/@/projects/page-designer/src/enum';
  import { parseBoolean } from '/@/utils';

  const props = defineProps<{
    modelValue?: string;
    widget: any;
    formData: Object;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const { formData } = toRefs<{ [key: string]: any }>(props);

  const widgetSchema = ref<LowCodeWidget.BasicSchema>();
  const widgetConfig = ref<IDynConfig>();

  const { validateRange, options, booleanOpts, getWatchCallback, valueCorrect } = useDynamic();

  const defComponet = computed(() => {
    if (widgetSchema.value && widgetSchema.value._plugin) {
      return AsyncGctComponents.getComponentByPluginTag(widgetSchema.value._plugin.key);
    }
    return AsyncGctComponents.getComponentByType(widgetSchema.value?.type as string);
  });

  const sourceWidget = computed(() => {
    return {
      ...pick(props.widget, ['id', 'materialType', 'preLocation']),
      ...pick(props.widget.props, [
        'displayLabelText',
        'field',
        'fieldId',
        'fieldType',
        'fieldName',
        'modelKey',
        'bindModelKey',
        'readonly',
        'required',
      ]),
    };
  });

  let watchers = [];
  watch(
    [() => formData.value.type_, () => formData.value.show_type_],
    ([newType, newShowType]) => {
      const params = getDynCompParams(sourceWidget.value, newType, newShowType);
      widgetSchema.value = params.widget;
      widgetConfig.value = params.config;
      stopWatchers(watchers);
      watchers = createWatchers();
    },
    {
      immediate: true,
    },
  );
  ///////////有关value_赋值 如果没有值则需要用default_value_赋值
  onMounted(async () => {
    await nextTick();
    if (widgetSchema.value?.type === FormComponents.Radio || formData.value.type_ === 'boolean') {
      if (isNil(props.modelValue)) {
        if (isBoolean(formData.value.default_value_)) {
          // emit('update:modelValue', formData.value.default_value_);
          value.value = formData.value.default_value_;
          return;
        }
        // emit('update:modelValue', parseBoolean(formData.value.default_value_));
        value.value = parseBoolean(formData.value.default_value_);
        return;
      }
      // emit(
      //   'update:modelValue',
      //   isBoolean(props.modelValue) ? props.modelValue : parseBoolean(props.modelValue),
      // );
      value.value = isBoolean(props.modelValue) ? props.modelValue : parseBoolean(props.modelValue);
      return;
    }
    // emit('update:modelValue', props.modelValue || formData.value.default_value_);

    if (
      formData.value.show_type_ === 'select' &&
      widgetConfig.value?.useSwitchComp &&
      formData.value.default_value_
    ) {
      if (filterOptions.value.some((item) => item.value === formData.value.default_value_)) {
        value.value = props.modelValue || formData.value.default_value_ || undefined;
      } else {
        value.value = props.modelValue || undefined;
      }
    } else {
      value.value = props.modelValue || formData.value.default_value_ || undefined;
    }
  });
  const value = computed<any>({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });

  watch(
    () => formData.value.value_,
    (val) => {
      if (widgetConfig.value?.infValKey) {
        formData.value[widgetConfig.value.infValKey] = val;
      }
    },
  );

  const filterOptions = computed(() => {
    return options.value.filter((item: any) => valueCorrect(formData, item.value));
  });

  function createWatchers() {
    const newWatchers: any = [];
    (widgetConfig.value?.watchs ?? []).forEach((flag) => {
      const callback = getWatchCallback(flag);
      const watcher: any = watch(
        () => formData.value[flag],
        (newValue, oldValue) => {
          callback?.(newValue, widgetSchema.value);
        },
        {
          immediate: true,
        },
      );
      newWatchers.push(watcher);
    });
    return newWatchers;
  }

  function stopWatchers(watchers) {
    watchers.forEach((watcher) => {
      watcher();
    });
  }
</script>
<style lang="less" scoped>
  .dyn-form-value {
    padding: 4px 10px !important;
    background-color: #f7f8fa;
  }
</style>
