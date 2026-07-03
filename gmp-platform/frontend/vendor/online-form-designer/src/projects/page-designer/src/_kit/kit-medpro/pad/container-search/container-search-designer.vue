<template>
  <div
    class="container-search-designer min-h-[48px]"
    :class="{ 'is-empty': !showFields?.length && !justScan }"
    :data-placeholder="!showFields?.length ? t('sys.kit.medPro.selectShowResultFields') : ''"
  >
    <div v-if="justScan">
      <van-search class="quick-search" :placeholder="placeholder">
        <template #left-icon> </template>
        <template #right-icon>
          <div class="flex flex-items-center justify-center">
            <van-icon name="search" color="#000" />
            <i style="font-style: normal" class="px2">|</i>
            <van-icon name="scan" color="var(--van-primary-color)" />
          </div>
        </template>
      </van-search>
    </div>
    <div v-if="showFields?.length">
      <van-search class="quick-search" :placeholder="placeholder">
        <template #left-icon>
          <van-icon
            name="scan"
            color="var(--van-primary-color)"
            v-if="widget.props.scan && scanLeft"
          />
        </template>
        <template #right-icon>
          <div class="flex flex-items-center justify-center">
            <van-icon name="search" color="#000" />
            <i style="font-style: normal" v-if="widget.props.scan && !scanLeft" class="px2">|</i>
            <van-icon
              name="scan"
              color="var(--van-primary-color)"
              v-if="widget.props.scan && !scanLeft"
            />
          </div>
        </template>
      </van-search>

      <div
        class="results-field-container relative px-4 pb-2 grid grid-cols-5 gap-2"
        :style="styleWrap"
      >
        <div class="results-field__item" v-for="field in showFields" :key="field.key">
          {{ field.name }}：<b>{{ field.key }}</b>
        </div>
      </div>

      <div
        :style="styleWrap"
        class="results-field__trigger cursor-pointer pb-2"
        v-if="showTrigger"
        @click="showMore = !showMore"
      >
        <van-icon name="arrow-up" v-if="showMore" />
        <van-icon name="arrow-down" v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="gct-container-search-design">
  import { computed, toRefs, ref } from 'vue';
  import { IContainerSearch } from './schema';
  // @ts-ignore
  import SelectSearchDesign from '/@page-designer/components/widgets/web/other/select-search/select-search-design.vue';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const defProps = defineProps<{ widget: IContainerSearch }>();
  const { placeholder, scanSite, maxLength, rowLength, justScan } = toRefs(defProps.widget.props);

  const showMore = ref<boolean>(false);

  const scanLeft = computed(() => {
    return scanSite.value === 'left';
  });

  const showTrigger = computed(() => {
    return Number(defProps.widget.children[0]?.children?.length) > maxLength.value;
  });

  const fieldWidgets = computed(() => {
    return (
      (defProps.widget.children![0].children ?? []).map((f) => {
        return {
          name: f.fieldName || f?.props?.label || f?.props?.fieldName,
          key: f?.props?.field,
          fieldId: f?.id,
        };
      }) || []
    );
  });

  const showFields = computed(() => {
    return showTrigger.value && !showMore.value
      ? fieldWidgets.value.slice(0, maxLength.value)
      : fieldWidgets.value.slice();
  });

  const styleWrap = computed(() => {
    const style = defProps.widget.style;
    const { enableBGColor, bgColor, color, fontSize } = style as any;
    return {
      fontSize: fontSize ? `${fontSize}px` : '14px',
      color,
      backgroundColor: enableBGColor
        ? 'var(--van-primary-color)'
        : bgColor || 'var(--van-primary-color)',
      gridTemplateColumns: `repeat(${rowLength.value ?? 5}, 1fr)`,
    };
  });
</script>

<style lang="less" scoped>
  .container-search-designer {
    .van-search {
      :deep(.van-search__field) {
        padding: 0 !important;
        padding-right: var(--van-padding-xs) !important;
        align-items: center !important;
      }

      :deep(.van-field__control) {
        text-align: left !important;
      }
    }
  }
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
    margin: 10px 10px 0;
    padding: 8px 10px;
    border-radius: 4px;

    .results-field__item {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .results-field__trigger {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
    margin: 0 10px;
  }
</style>
