<template>
  <a-form-item :label="t('受控组件')" name="widgetId">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('受控组件') })"
      v-model:value="formState.widgetId"
      @select="handleSelect"
    >
      <a-select-opt-group v-for="group in formComps" :key="group.id">
        <template #label>
          <span> {{ group.name }} </span>
        </template>
        <a-select-option v-for="item in group.children" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select-opt-group>
    </a-select>
  </a-form-item>

  <a-form-item :label="t('执行动作')" name="action">
    <a-select
      :placeholder="t('sys.pleaseSelectSth', { sth: t('执行动作') })"
      v-model:value="formState.action"
    >
      <a-select-option v-for="item in actions" :key="item.value" :value="item.value">
        {{ item.label }}
      </a-select-option>
    </a-select>
  </a-form-item>

  <control-property v-for="item in dynamicProps" :key="item" :name="item" :form-state="formState" />
</template>

<script lang="ts" setup>
  import { computed, PropType } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWidgetPicker } from '../../hooks/useWidgetPicker';
  import { Control } from '../../types';
  import { widgetActions } from '../../schema/widgetActions';
  import ControlProperty from '../control-property/index.vue';

  const { t } = useI18n();
  const { formComps, widgetIdMap } = useWidgetPicker();

  const props = defineProps({
    formState: {
      type: Object as PropType<Control.WidgetFormComp>,
      default: () => ({}),
    },
  });

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      Object.assign(props.formState, value);
    },
  });

  const actions = computed(() => {
    if (!props.formState.widgetType) return [];
    return widgetActions[props.formState.widgetType] ?? [];
  });

  const dynamicProps = computed(() => {
    const action = actions.value.find((item) => item.value === props.formState.action);
    return action?.dynamicProps ?? [];
  });

  const handleSelect = async (value) => {
    const widget = widgetIdMap.value[value];
    if (!widget) return;
    Object.assign(props.formState, {
      belong: widget.belong,
      widgetType: widget.type,
    });

    if (actions.value.find((item) => item.value === props.formState.action) === undefined) {
      // 切换组件的时候如果不存在当前动作 则清空
      Object.assign(props.formState, { action: undefined });
    }
  };
</script>

<style lang="less" scoped></style>
