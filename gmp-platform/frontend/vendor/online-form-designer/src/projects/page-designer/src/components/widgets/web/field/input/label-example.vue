<!-- eDHR记录本标签需求，后续如果平台上了标签需求，代码可以删除后同步到eDHR -->
<template>
  <span class="tag label-ellipsis" :class="getTagClass">
    <span class="select-text" :style="msgColor"> {{ showLabel || '&nbsp;' }}</span>
  </span>
</template>

<script setup lang="ts">
  import { toRef, reactive, onBeforeMount, computed } from 'vue';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { TagTypeEnum } from '/@page-designer/enum';
  import { Input } from '/@page-designer/types/web';
  import { type RetrunList } from '/@page-designer/components/widgets/hooks/hooks';
  import { useStorage } from '@vueuse/core';

  const props = defineProps<{
    widget: Input;
    formData?: any;
    label?: string;
    value?: string;
    options?: RetrunList[];
  }>();

  const {
    edhrIsExample,
    edhrLabelExampleRefForm,
    edhrLabelNameField,
    edhrLabelStyleField,
    edhrLabelStyleColorField,
    edhrLabelNameColorField,
  } = reactive(props.widget.props);

  const storageOptions = useStorage('labelExampleOptions', [] as RetrunList[], sessionStorage);

  const cacheOptions = computed(() => {
    const stored = storageOptions.value || [];
    const merged = [...stored];

    props.options?.forEach((option) => {
      if (!merged.find((item) => item.value === option.value)) {
        merged.push(option);
      }
    });

    return merged;
  });

  const cacheLabelData = computed(() => {
    const option = cacheOptions.value?.find((it) => it.value === props.value);
    return option?._item;
  });
  const labelFormData = toRef(() => {
    if (!edhrLabelExampleRefForm && props.formData) {
      return props.formData;
    }
    if (edhrLabelExampleRefForm) {
      return formMap.value[edhrLabelExampleRefForm];
    }
    if (cacheLabelData.value) {
      return cacheLabelData.value;
    }
    return {};
  });

  const showLabel = toRef(() => {
    let showMsg = labelFormData.value?.[edhrLabelNameField] ?? '';
    const defaultMsg = props.label ?? '';

    return showMsg || defaultMsg + '';
  });

  const tagType = toRef(() => {
    return labelFormData.value?.[edhrLabelStyleField] || TagTypeEnum.RADIUS;
  });
  const tagStyleColor = toRef(() => {
    return labelFormData.value?.[edhrLabelStyleColorField] || '#026ac8';
  });

  const getTagClass = toRef(() => {
    return `tag-${tagType.value} ${edhrIsExample ? 'is-example' : ''}`;
  });

  const msgColor = toRef(() => {
    return {
      color: labelFormData.value?.[edhrLabelNameColorField] || '#fff',
    };
  });
  async function cacheAllOptions() {
    if (props.options && props.options.length) {
      const existingOptions = storageOptions.value || [];

      props.options.forEach((option) => {
        const exists = existingOptions.find((item) => item.value === option.value);
        if (!exists) {
          existingOptions.push(option);
        }
      });

      storageOptions.value = existingOptions;
    }
  }

  onBeforeMount(async () => {
    props.value && (await cacheAllOptions());
  });
</script>

<style scoped lang="less">
  .label-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    &.is-example {
      min-width: 120px;
      max-width: 120px;
      padding: 8px 6px;
      text-align: center;
    }
  }
  .tag {
    padding: 4px 6px;
    line-height: 1;

    & + & {
      margin-left: 5px;
    }

    &-radius {
      border-radius: 2px;
      background: v-bind('tagStyleColor');
    }

    &-linear_radius {
      border: 1px solid v-bind('tagStyleColor');
      border-radius: 2px;
    }

    &-big_radius {
      border-radius: 100px;
      background: v-bind('tagStyleColor');
    }

    &-linear_big_radius {
      border: 1px solid v-bind('tagStyleColor');
      border-radius: 100px;
    }

    &-dashed_radius {
      border: 1px dashed v-bind('tagStyleColor');
      border-radius: 2px;
    }

    &-status {
      border-radius: 10px 2px 2px;
      background: v-bind('tagStyleColor');
    }
  }
</style>
