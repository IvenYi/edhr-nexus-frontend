<template>
  <template v-if="readonly">
    <taglabel
      v-if="tagValue"
      :label="tagValue"
      :type="fieldType"
      :tagWidgetStyle="widget.style"
      :isDesign="false"
    />
    <span v-else>{{ emptyDisplayValue }}</span>
  </template>

  <template v-else>
    <div class="w100% flex gct-biz-process">
      <a-tree-select
        v-model:value="value"
        v-model:searchValue="searchValue"
        :placeholder="placeholder"
        :disabled="disabled || !!useMore"
        :readonly="readonly"
        show-search
        class="w100%"
        :style="computedStyle"
        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
        allow-clear
        :tree-data="options"
        tree-node-filter-prop="label"
        @change="onChange"
      >
        <template #title="{ label }">
          <template
            v-for="(fragment, i) in label
              ?.toString()
              ?.split(new RegExp(`(?<=${searchValue})|(?=${searchValue})`, 'i'))"
          >
            <span
              v-if="fragment?.toLowerCase() === searchValue?.toLowerCase()"
              :key="i"
              style="color: #08c"
            >
              {{ fragment }}
            </span>
            <template v-else>{{ fragment }}</template>
          </template>
        </template>
      </a-tree-select>
      <moreOption
        :disabled="disabled"
        @clear="$emit('update:modelValue', null)"
        v-model:useMore="useMore"
        v-model:ope="ope"
        :moreOptions="moreOptions"
        :label="label || fieldName"
        @change="emit('tableSearch')"
      />
    </div>
  </template>
</template>
<script lang="ts" setup>
  import { ref, toRefs, computed, onMounted, toRaw } from 'vue';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { SearchBizProcess } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import { schemaToStyle } from '/@page-designer/hooks/useStyle';
  import { getPmProcessDefinitionListAllProcHasPublishedVersion } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import moreOption from '../more_option.vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const Event = getPageEvent();

  const emit = defineEmits(['update:modelValue', 'saveTableRow', 'tableSearch']);

  const props = defineProps<{
    widget: SearchBizProcess;
    rowReadonly?: boolean;
    modelValue?: string;
  }>();

  const {
    placeholder,
    disabled,
    readonly,
    fieldType,
    moreOptions,
    label,
    ope,
    useMore,
    fieldName,
  } = toRefs(props.widget.props);

  const options = ref<TreeSelectProps['treeData']>([]);

  const searchValue = ref('');

  const computedStyle = computed(() => {
    const contentFont = props.widget.style?.contentFont;
    if (!contentFont) return {};
    return schemaToStyle(contentFont);
  });

  const getData = async () => {
    const data =
      (await getPmProcessDefinitionListAllProcHasPublishedVersion({
        moduleType: 'biz_process_module',
      })) || [];
    options.value = formatData(data);
  };

  const formatData = (data: any) => {
    const options: any = [];
    if (data) {
      for (let folder of data) {
        const item: any = {
          value: folder.id,
          name: folder.name,
          label: folder.name,
          disabled: true,
          children: [],
        };
        if (folder.children!.length > 0) {
          for (let i of folder.children!) {
            const obj = {
              id: i.id,
              label: i.name,
              value: i.key,
            };
            item.children.push(obj);
          }
        }
        options.push(item);
      }
    }
    return options;
  };

  function findTreeDataById(leafValue: string, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (leafValue === nodes[i].value) {
        return nodes[i];
      }
      if (nodes[i].children) {
        let findResult = findTreeDataById(leafValue, nodes[i].children);
        if (findResult) {
          return findResult;
        }
      }
    }
  }

  const onChange = (v) => {
    if (v) {
      Event.runEventByName(
        'afterSelect',
        props.widget.events,
        v,
        findTreeDataById(v, options.value),
      );
    } else {
      Event.runEventByName('afterClear', props.widget.events);
    }
  };

  const value = computed<any>({
    get() {
      return props.modelValue || undefined;
    },
    set(v) {
      Event.runEventByName('onChange', props.widget.events, v, findTreeDataById(v, options.value));
      emit('update:modelValue', v || null);
    },
  });

  const tagValue = computed(() => {
    const data = toRaw(findTreeDataById(value.value, options.value));
    return data?.label || '';
  });

  onMounted(() => {
    getData();
  });
</script>

<style lang="less" scoped>
  .gct-biz-process {
    align-items: center;
    :deep(.ant-select) {
      flex: 1;
      margin-right: 10px;
    }
  }
</style>
