<template>
  <div class="h-full ks-column overflow-hidden">
    <div v-show="type !== Fixed_Btns_Keys.Relate" class="text-right mb16px">
      {{ $t('sys.edhr.onlyCurrentSelectedData') }}
      <a-switch v-model:checked="onlyChecked" />
    </div>
    <div class="ks-col overflow-hidden" :style="{ width: `${width ?? 0}px` }">
      <TreeComp
        v-if="type === Fixed_Btns_Keys.Relate"
        :tableClass="tableClass"
        v-model:data="tableData"
        :height="height"
        :columns="columns"
      />
      <TableComp
        v-else
        :tableClass="tableClass"
        v-model:data="tableData"
        :height="height"
        :onlyChecked="onlyChecked"
        :columns="columns"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useEdhrSummary } from '../../hook/useEdhrSummary';
  import TableComp from './table.vue';
  import TreeComp from './tree.vue';
  import { Fixed_Btns_Keys } from '../constant';

  const props = defineProps<{
    columns: any[];
    data: any[];
    tableClass?: string;
    height?: number;
    width?: number;
    type: Fixed_Btns_Keys;
  }>();

  const { selectedTreeNode } = useEdhrSummary();

  const onlyChecked = ref(false);

  const tableData = computed(() => {
    const tmplId = selectedTreeNode.value.form_tmpl_id_;
    if (onlyChecked.value && tmplId) {
      return props.data.filter(
        (e) => tmplId === e.form_tmpl_id_ || e.form_tmpl_id_?.startsWith(`${tmplId}:`),
      );
    } else if (onlyChecked.value && !tmplId) return [];
    else return props.data;
  });
</script>
