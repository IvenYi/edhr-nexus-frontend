<template>
  <div>
    <div class="w-full flex items-center">
      <a-form-item
        style="width: 30%; margin-right: 10px"
        :label="t('sys.kit.medPro.packageSearch.workOrder')"
        required
      >
        <a-select :options="[]" />
      </a-form-item>
      <a-form-item
        style="width: 30%; margin-right: 10px"
        :label="t('sys.kit.medPro.packageSearch.rulesName')"
        required
      >
        <a-select :options="[]" />
      </a-form-item>
      <a-button type="primary" ghost>
        {{ t('sys.kit.medPro.packageSearch.lock') }}
      </a-button>
    </div>
    <div
      :data-placeholder="!showFields?.length ? t('sys.kit.medPro.selectShowResultFields') : ''"
      :class="{ 'is-empty': !showFields?.length }"
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

<script lang="ts" setup name="gct-package-search-design">
  import { computed, toRefs, ref } from 'vue';
  import { IPackageSearch } from './schema';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps<{ widget: IPackageSearch }>();
  const { maxLength, rowLength } = toRefs(defProps.widget.props);

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
