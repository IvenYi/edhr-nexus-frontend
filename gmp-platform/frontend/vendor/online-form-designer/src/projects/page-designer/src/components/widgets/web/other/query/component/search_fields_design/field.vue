<template>
  <tagelabel v-if="widget.props.readonly" :type="widget.props.fieldType" :isDesign="true" />
  <a-select
    v-else-if="!widget.props.readonly && selectList.includes(widget.type)"
    :placeholder="widget.props.placeholder"
  />
  <a-input v-else :placeholder="widget.props.placeholder" />
</template>

<script setup lang="ts">
  import tagelabel from '../../../../__components__/formcomponent/field-label/taglabel.vue';
  import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
  import { SearchComponents } from '/@/projects/page-designer/src/enum';
  import { watch, onMounted } from 'vue';
  import { isArray } from '/@/utils/is';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';

  const props = defineProps<{ widget: SearchWidgets }>();
  const selectList = [
    SearchComponents.SearchSelect,
    SearchComponents.SearchUserSelect,
    SearchComponents.SearchRdoSelect,
    SearchComponents.SearchTransaction,
    SearchComponents.SearchTmplTreeSelect,
    SearchComponents.SearchPrinter,
  ];
  watch(
    () => props.widget.props.multiple,
    (n, o) => {
      if (o === undefined) return;
      if (
        n === true &&
        props.widget.props.defaultValue &&
        !isArray(props.widget.props.defaultValue)
      ) {
        props.widget.props.defaultValue = [props.widget.props.defaultValue];
      } else if (n === false) {
        props.widget.props.defaultValue = undefined;
      }
    },
  );

  onMounted(async () => {
    if (props.widget.type === SearchComponents.SearchRdoSelect) {
      const bindModelKey = props.widget.props.bindModelKey;
      const { specificConfig } = (await getModelMetaDetail({ modelKey: bindModelKey })) || {};
      props.widget.props.rdoUniqueFieldKey = specificConfig?.rdoUniqueFieldKey || 'name_';
    }
  });
</script>
<style scoped lang="less"></style>
