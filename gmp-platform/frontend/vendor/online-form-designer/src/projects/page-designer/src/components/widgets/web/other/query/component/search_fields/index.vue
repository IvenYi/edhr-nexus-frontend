<template>
  <component v-model="value" :is="randerRef" :widget="widget" :disabled="widget.props.disabled" />
</template>

<script setup lang="ts">
  import { ref, defineAsyncComponent, computed, reactive, onMounted } from 'vue';
  import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const SearchInput = defineAsyncComponent(() => import('./search_input.vue'));
  const SearchSelect = defineAsyncComponent(() => import('./search_select.vue'));
  const SearchUserSelect = defineAsyncComponent(() => import('./search_user_select.vue'));
  const SearchSwitch = defineAsyncComponent(() => import('./search_switch.vue'));
  const SearchNumberInput = defineAsyncComponent(() => import('./search_number.vue'));
  const SearchTime = defineAsyncComponent(() => import('./search_time.vue'));
  const SearchDateTime = defineAsyncComponent(() => import('./search_datetime.vue'));
  const SearchDate = defineAsyncComponent(() => import('./search_date.vue'));
  const SearchTransaction = defineAsyncComponent(() => import('./search_transaction.vue'));
  const SearchRdoSelect = defineAsyncComponent(() => import('./search_rdo_select.vue'));
  const SearchTmplTreeSelect = defineAsyncComponent(
    () => import('./search_tmpl_tree_select/index.vue'),
  );
  const SearchPrinter = defineAsyncComponent(() => import('./search_printer.vue'));
  const SearchBizProcess = defineAsyncComponent(() => import('./search_biz_process.vue'));
  const SearchSelectRangUser = defineAsyncComponent(
    () => import('./SearchSelectRangUser/index.vue'),
  );
  const SearchSelectDepartment = defineAsyncComponent(() => import('./search_department.vue'));
  const WidgetsMap = {
    SearchInput,
    SearchUserSelect,
    SearchSelect,
    SearchSwitch,
    SearchNumberInput,
    SearchStringNumberInput: SearchNumberInput,
    SearchDateTime,
    SearchDate,
    SearchTime,
    SearchTransaction,
    SearchRdoSelect,
    SearchTmplTreeSelect,
    SearchPrinter,
    SearchBizProcess,
    SearchSelectRangUser,
    SearchSelectDepartment,
  };

  const props = defineProps<{ value: any; widget: SearchWidgets }>();
  useDependency(props.widget, {});
  const { type } = reactive(props.widget);
  const randerRef = computed(() => {
    if ([FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(props.widget.props.fieldType)) {
      return WidgetsMap.SearchSelectDepartment;
    }
    return WidgetsMap[type];
  });

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

  const comWidget = reactive(props.widget);
  onMounted(() => {
    /**应用国际化 */
    if (comWidget.i18n) {
      let i18n = comWidget.i18n;
      for (let k in i18n) {
        let i18nKey = i18n[k];
        i18nKey && (comWidget.props[k] = t(i18nKey));
      }
    }
  });
</script>
<style scoped lang="less"></style>
