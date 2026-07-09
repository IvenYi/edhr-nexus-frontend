<template>
  <a-select
    :allow-clear="clearable === false ? false : true"
    v-model:value="value"
    show-search
    :filter-option="filterOption"
    :placeholder="t('sys.chooseText')"
    size="small"
    @change="handleChange"
  >
    <a-select-option
      :key="widget.id"
      v-for="widget in searchWidgets"
      :value="widget.id"
      :name="`${widget.alias || t(widget.name)} ${widget.id}`"
      >{{ `${widget.alias || t(widget.name)} ${widget.id}` }}
    </a-select-option>
  </a-select>
  <div v-if="tips" class="tooltip">{{ t(tips) }}</div>
</template>

<script setup lang="ts" name="ref-container-search-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { KitType } from '/@page-designer/_kit/enums/index';
  import { findNodeAll } from '/@/utils/helper/treeHelper';

  const { t } = useI18n();
  const { pageJson } = useDesigner();
  const defProps = defineProps(props);

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { clearable, tips } = defProps.propConfig || {};

  const value = computed({
    get() {
      return propValue.value || undefined;
    },
    set(val) {
      propValue.value = val;
    },
  });

  const allPageSearchWidgets = computed(() => {
    console.log('pageJson', pageJson);
    return findNodeAll(pageJson.widgets, (widget) => {
      return [KitType.CONTAINER_SEARCH, 'medpro' + KitType.CONTAINER_SEARCH].includes(widget.type);
    });
  });

  const searchWidgets = computed(() => {
    const { filterFn } = defProps.propConfig;
    if (filterFn && typeof filterFn === 'function') {
      return allPageSearchWidgets.value.filter((item) => filterFn(item));
    } else {
      return allPageSearchWidgets.value;
    }
  });

  const filterOption = (input: string, option: any) => {
    return option.name.includes(input) || option.value.includes(input);
  };
  const handleChange = (val) => {
    const form = searchWidgets.value.find((d) => d.id === val);
    defProps.widget!.props.bindModelKey = form?.props.model;
    defProps.widget!.props.refSearchForm = form?.props.form.id;
    // console.log(val, formWidgets.value);
  };
</script>

<style lang="less" scoped>
  .tooltip {
    color: #c3c3c3;
    font-size: 12px;
  }
</style>
