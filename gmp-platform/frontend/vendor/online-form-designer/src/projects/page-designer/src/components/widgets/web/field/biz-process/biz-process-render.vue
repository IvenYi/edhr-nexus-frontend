<template>
  <FieldReadonly
    v-if="readonly"
    :label="tagValue"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <template v-else>
    <div class="w100% flex gct-biz-process">
      <a-tree-select
        v-model:value="value"
        v-model:searchValue="searchValue"
        :placeholder="placeholder"
        :disabled="disabled"
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
      <a-button
        type="primary"
        ghost
        size="small"
        shape="circle"
        :title="t('sys.pageDesigner.showBizPreview')"
        v-if="computedShowPreview"
        @click="showBizProcessModal"
      >
        <template #icon>
          <i class="iconfont icon-jiedian"></i>
        </template>
      </a-button>
      <a-modal v-model:visible="bizProcessModalOpen" title="查看工作流" width="80%" :footer="null">
        <div class="mt-20px" style="height: 600px">
          <PaasBpmnDiagram :onlyFlow="true" :id="value" />
        </div>
      </a-modal>
    </div>
  </template>
</template>
<script lang="ts" setup>
  import { ref, toRefs, computed, onMounted, toRaw, nextTick } from 'vue';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BizProcess } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import FieldReadonly from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import PaasBpmnDiagram from '/@page-designer/_kit/kit-medpro/web/biz-process/components/process-design/index.vue';
  import { schemaToStyle } from '/@page-designer/hooks/useStyle';
  import { getPmProcessDefinitionListAllProcHasPublishedVersion } from '/@/apis/gct-apaas/PmProcessDefinitionController';

  const { t } = useI18n();

  const Event = getPageEvent();

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);

  const props = defineProps<{ widget: BizProcess; rowReadonly?: boolean; modelValue?: string }>();

  const { placeholder, disabled, readonly, fieldType, showPreview } = toRefs(props.widget.props);

  const computedShowPreview = computed(() => {
    return showPreview?.value;
  });

  const options = ref<TreeSelectProps['treeData']>([]);

  const searchValue = ref('');

  const bizProcessModalOpen = ref<boolean>(false);

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

  async function showBizProcessModal() {
    if (value.value) {
      bizProcessModalOpen.value = true;
      await nextTick();
    }
  }

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
