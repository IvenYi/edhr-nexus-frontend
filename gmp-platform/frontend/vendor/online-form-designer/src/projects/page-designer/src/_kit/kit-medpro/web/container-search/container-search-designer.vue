<template>
  <div>
    <div class="w-full flex items-center" v-if="quickSearchFields?.length">
      <a-form-item
        :style="computedShowWorkflow ? 'width:95%;margin-right:10px' : 'width:100%'"
        :label="widget.props.title"
        :required="required"
      >
        <a-select :options="[]" :placeholder="placeholder">
          <template #suffixIcon>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-select>
      </a-form-item>
      <a-button type="link" ghost v-if="computedShowWorkflow">
        <template #icon>
          <SvgIcon name="WORKFLOW-view" size="24" />
        </template>
      </a-button>
    </div>
    <div
      :data-placeholder="
        !showFields?.length
          ? t('sys.kit.medPro.selectShowResultFields')
          : !quickSearchFields?.length
          ? t('sys.pageDesigner.selectQuickSearchFields')
          : ''
      "
      :class="{ 'is-empty': !showFields?.length || !quickSearchFields?.length }"
      class="results-field-container relative p-2 grid grid-cols-5 gap-2 min-h-[48px]"
      :style="{ 'grid-template-columns': `repeat(${rowLength ?? 5}, 1fr)` }"
    >
      <div v-for="field in showFields" :key="field.key">
        <span title="field.fieldId">{{ field.name }}: {{ field.key }}</span>
      </div>

      <div
        class="results-field__trigger cursor-pointer"
        v-if="showTrigger"
        @click="showMore = !showMore"
      >
        <span class="mr-1">{{ showMore ? t('sys.collapse') : t('sys.unfold') }}</span>
        <up-outlined v-if="showMore" />
        <down-outlined v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="gct-container-search-design">
  import { computed, toRefs, ref } from 'vue';
  import { IContainerSearch } from './schema';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';

  const { t } = useI18n();

  const defProps = defineProps<{ widget: IContainerSearch }>();
  const { placeholder, quickSearchFields, required, maxLength, rowLength, txnType } = toRefs(
    defProps.widget.props,
  );

  const showMore = ref<boolean>(false);

  const showTrigger = computed(() => {
    return (
      Number(defProps.widget.children[1]?.children?.length) > rowLength.value ||
      Number(defProps.widget.children[1]?.children?.length) > maxLength.value
    );
  });

  const fieldWidgets = computed(() => {
    return (
      (defProps.widget.children![1].children ?? []).map((f) => {
        return {
          name: f.fieldName || f?.props?.label || f?.props?.fieldName,
          key: f?.props?.field,
          fieldId: f?.id,
        };
      }) || []
    );
  });

  const computedShowWorkflow = computed(() => {
    return ['em_txn_move', 'em_txn_move_in'].includes(txnType?.value);
  });

  const showFields = computed(() => {
    const maxNumber = Math.min(maxLength.value, rowLength.value);
    return showTrigger.value && !showMore.value
      ? fieldWidgets.value.slice(0, maxNumber)
      : fieldWidgets.value.slice();
  });
</script>

<style lang="less" scoped>
  .is-empty {
    &::before {
      content: attr(data-placeholder);
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #5d6474;
      font-size: 14px;
      background-color: #fbfbfc;
    }
  }

  .results-field-container {
    background: #f7f8fa;
    border-radius: 4px;

    .results-field__trigger {
      position: absolute;
      z-index: 20;
      right: 10px;
      top: 8px;
      color: var(--ant-primary-color);
    }
  }
</style>
