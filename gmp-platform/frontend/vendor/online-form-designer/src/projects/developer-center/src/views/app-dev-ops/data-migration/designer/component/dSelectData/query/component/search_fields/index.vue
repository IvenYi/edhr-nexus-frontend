<template>
  <component v-model="value" :is="randerRef" :widget="widget" />
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent, computed, reactive } from 'vue';
  import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';

  const SearchInput = defineAsyncComponent(() => import('./search_input.vue'));
  const SearchSelect = defineAsyncComponent(() => import('./search_select.vue'));
  const SearchUserSelect = defineAsyncComponent(() => import('./search_user_select.vue'));
  const SearchSwitch = defineAsyncComponent(() => import('./search_switch.vue'));
  const SearchTime = defineAsyncComponent(() => import('./search_time.vue'));
  const SearchDateTime = defineAsyncComponent(() => import('./search_datetime.vue'));
  const SearchDate = defineAsyncComponent(() => import('./search_date.vue'));
  const SearchRdoSelect = defineAsyncComponent(() => import('./search_rdo_select.vue'));
  const searchCustomSelect = defineAsyncComponent(() => import('./search_custom_select.vue'));

  const WigthMap = {
    SearchInput,
    SearchUserSelect,
    SearchSelect,
    SearchSwitch,
    SearchDateTime,
    SearchDate,
    SearchTime,
    SearchRdoSelect,
    searchCustomSelect,
  };

  const props = defineProps<{ value: any; widget: SearchWidgets }>();
  const { _searchCmpKey } = reactive(props.widget);
  const randerRef = WigthMap[_searchCmpKey];

  const emit = defineEmits(['update:value']);
  const value = computed<any>({
    get() {
      let value = props.value;
      return value;
    },
    set(value) {
      emit('update:value', value);
    },
  });
</script>
<style scoped lang="less"></style>
