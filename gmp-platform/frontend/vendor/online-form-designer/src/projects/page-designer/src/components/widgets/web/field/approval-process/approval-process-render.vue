<template>
  <FieldReadonly
    v-if="readonly"
    :label="tagValue"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <template v-else>
    <div class="w100% flex gct-approval-process">
      <a-select
        ref="select"
        v-model:value="value"
        v-model:searchValue="searchValue"
        class="w100%"
        :allowClear="true"
        :placeholder="placeholder"
        :style="computedStyle"
        :disabled="disabled"
        :options="options"
        @change="onChange"
      />
    </div>
  </template>
</template>
<script lang="ts" setup>
  import { ref, toRefs, computed, onMounted } from 'vue';
  import { BizProcess } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import FieldReadonly from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import { schemaToStyle } from '/@page-designer/hooks/useStyle';
  import { getPmProcessDefinitionListAllProcHasPublishedVersion } from '/@/apis/gct-apaas/PmProcessDefinitionController';

  const Event = getPageEvent();

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);

  const props = defineProps<{ widget: BizProcess; rowReadonly?: boolean; modelValue?: string }>();

  const { placeholder, disabled, readonly, fieldType } = toRefs(props.widget.props);

  const options = ref<any>([]);

  const searchValue = ref('');

  const computedStyle = computed(() => {
    const contentFont = props.widget.style?.contentFont;
    if (!contentFont) return {};
    return schemaToStyle(contentFont);
  });

  const getData = async () => {
    const res =
      (await getPmProcessDefinitionListAllProcHasPublishedVersion({
        moduleType: 'approval_process_module',
      })) || [];
    const data = res.reduce((acc, item) => {
      if (item.children?.length) {
        acc.push(...item.children);
      }
      return acc;
    }, []);
    options.value = data.map((item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    console.log(data);
  };

  const onChange = (v) => {
    if (v) {
      Event.runEventByName('afterSelect', props.widget.events, v);
    } else {
      Event.runEventByName('afterClear', props.widget.events);
    }
  };

  const value = computed<any>({
    get() {
      return props.modelValue || undefined;
    },
    set(v) {
      Event.runEventByName('onChange', props.widget.events, v);
      emit('update:modelValue', v || null);
    },
  });

  const tagValue = computed(() => {
    const data = options.value.find((item) => item.value === value.value);
    return data?.label || '';
  });

  onMounted(() => {
    getData();
  });
</script>

<style lang="less" scoped>
  .gct-approval-process {
    align-items: center;

    :deep(.ant-select) {
      flex: 1;
      margin-right: 10px;
    }
  }
</style>
