<template>
  <div class="gct-pad-search-warp">
    <van-form
      class="gct-pad-search"
      :class="[(!widget.props.model || !widget.children?.length) && 'is-empty']"
      :data-placeholder="
        !widget.props.model && !widget.children?.length
          ? t('sys.pageDesigner.selectAssociatedModel')
          : !widget.children?.length
            ? t('sys.pageDesigner.selectFilterItem')
            : ''
      "
      :style="{
        '--van-cell-vertical-padding': '10px',
        '--van-cell-horizontal-padding': '10px',
        '--search-design-line-display-count': safeRowLength,
      }"
    >
      <SearchDesign2
        :widget="widget"
        :expand="expand"
        :btnWidth="btnItemWidth"
        :data-placeholder="
          !widget.props.model && !widget.children?.length
            ? t('sys.pageDesigner.selectAssociatedModel')
            : !widget.children?.length
              ? t('sys.pageDesigner.selectFilterItem')
              : ''
        "
      >
        <template #container="args">
          <slot name="container" v-bind="args"></slot>
        </template>
        <template #widgets="args">
          <slot name="widgets" v-bind="args"></slot>
        </template>
        <template #content="{ element }">
          <search-field-design
            v-model:value="formState[element.id]"
            :key="element.id"
            :widget="element"
            :labelWidth="labelWidthByColumn[element.id] || 0"
            :isFirstInRow="isFirstInRow(element.id)"
          />
        </template>
        <template #searchBtn>
          <div
            :style="{
              'justify-content': alignment,
              display: 'inline-flex',
              'flex-grow': '1',
            }"
            class="box-border button-area widget-drag-item-search-btn"
          >
            <van-button class="reset-btn" size="small">{{ t('sys.reset') }}</van-button>
            <van-button class="query-btn" type="primary" size="small">{{
              t('sys.query')
            }}</van-button>
            <div v-if="customHeader" class="custom-filter-icon ml-6px">
              <i class="iconfont icon-shezhi"></i>
            </div>
            <div class="button-toggle ml-12px" v-if="isShowExpand" @click.stop="expand = !expand">
              {{ expand ? t('sys.collapse') : t('sys.unfold') }}
              <van-icon :name="expand ? 'arrow-up' : 'arrow-down'" />
            </div>
          </div>
        </template>
      </SearchDesign2>
    </van-form>
  </div>
</template>
<script setup lang="ts" name="gct-pad-search">
  import { computed, reactive, toRefs, ref } from 'vue';
  import { Search } from '/@page-designer/types/pad';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SearchFieldDesign from './component/design/search-field-design';
  import { SearchDesign2 } from './search-design2';
  import { measureTexts } from '@gct/runtime';

  const { t } = useI18n();

  const props = defineProps<{ widget: Search; isNewDesigner: boolean }>();
  const { customHeader, rowLength, maxLength, alignment } = toRefs(props.widget.props);

  // 保底行列数，避免 rowLength 未设置或为 0 导致除零与死循环
  const safeRowLength = computed(() => {
    const n = Number(rowLength?.value ?? 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  });

  const expand = ref<boolean>(false);

  const fieldWidgets = computed({
    get() {
      return props.widget.children || [];
    },
    set(list) {
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.children = list.filter((i) => i.props);
    },
  });

  const formState = reactive({});

  const isEmpty = computed(() => {
    return !props.widget.props.model || !fieldWidgets.value.length;
  });

  const itemWidth = computed(() => {
    if (isEmpty.value) {
      return 100;
    }
    return 100 / safeRowLength.value;
  });

  const isShowExpand = computed(() => {
    return fieldWidgets.value.length > maxLength.value;
  });

  const filterList = computed(() => {
    const list =
      isShowExpand.value && !expand.value
        ? fieldWidgets.value.slice(0, maxLength.value)
        : fieldWidgets.value.slice();
    return list;
  });

  const btnItemWidth = computed(() => {
    if (isEmpty.value) return 100;
    // 取余为 0 时应当为 0 列剩余宽度，否则会得到 100%
    const remainder = filterList.value.length % safeRowLength.value;
    const slots = (safeRowLength.value - remainder) % safeRowLength.value;
    return slots * itemWidth.value;
  });

  /**
   * 计算每一列的标签最大宽度
   * 根据 rowLength 将字段分组，计算每组中标签的最大宽度
   */
  const labelWidthByColumn = computed(() => {
    const widthMap: Record<string, number> = {};

    if (isEmpty.value || !fieldWidgets.value.length) {
      return widthMap;
    }

    // 获取当前显示的字段列表（考虑展开/折叠状态）
    const currentList = filterList.value;

    // 按列分组计算最大宽度
    const columnGroups: string[][] = [];
    for (let i = 0; i < currentList.length; i += safeRowLength.value) {
      const group = currentList
        .slice(i, i + safeRowLength.value)
        .map((widget) => widget.props.label || widget.props.fieldName || '');
      columnGroups.push(group);
    }

    // 计算每列的最大宽度
    for (let colIndex = 0; colIndex < safeRowLength.value; colIndex++) {
      const columnTexts = columnGroups.map((group) => group[colIndex]).filter((text) => text); // 过滤掉空字符串

      if (columnTexts.length > 0) {
        const textResults = measureTexts(columnTexts, {
          fontSize: 15,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
        });
        // 限制最大宽度不超过 90px
        const maxWidth = Math.min(90, Math.max(...textResults.map((result) => result.width), 0));

        // 为每列的字段设置相同的宽度
        columnGroups.forEach((group, rowIndex) => {
          const widget = currentList[rowIndex * safeRowLength.value + colIndex];
          if (widget) {
            widthMap[widget.id] = maxWidth;
          }
        });
      }
    }

    return widthMap;
  });

  /**
   * 判断指定元素是否为行的第一个
   * @param elementId 元素ID
   */
  const isFirstInRow = (elementId: string) => {
    if (isEmpty.value || !fieldWidgets.value.length) {
      return false;
    }

    // 获取当前显示的字段列表（考虑展开/折叠状态）
    const currentList = filterList.value;
    const elementIndex = currentList.findIndex((widget) => widget.id === elementId);

    if (elementIndex === -1) {
      return false;
    }

    // 判断是否为行的第一个：索引对每行元素个数取余为0
    return elementIndex % safeRowLength.value === 0;
  };
</script>
<style scoped lang="less">
  .gct-pad-search-warp {
    border: 2px dashed #dbdbdb;
    .gct-pad-search {
      position: relative;
      min-height: 68px;
      // background-color: #fafafa;

      &.is-empty {
        &::before {
          content: attr(data-placeholder);
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #fbfbfc;
          color: #5d6474;
          pointer-events: none;
        }
      }
    }

    .search-item {
      position: relative;
      width: 100%;
      margin: 2px 0;

      &.is-selected {
        outline: 1px solid var(--ant-primary-color);
      }
    }

    .button-area {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;

      .custom-filter-icon {
        display: inline-flex;
        position: relative;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        background-color: #f5f5f5;
        color: #999;
        font-size: 14px;

        > .iconfont {
          line-height: 1;
        }
      }

      .button-toggle {
        position: relative;
        transition: all 0.3s;
        color: var(--ant-primary-color);
        cursor: pointer;
        width: 80px;
        height: 36px;
        font-size: 15px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        padding-left: 12px;
        padding-right: 16px;
        margin-right: -16px;
        gap: 3px;
      }
    }

    .reset-btn {
      margin-right: 12px;
    }

    .widget-drag-item-search-btn {
      margin-top: 6px;
      margin-bottom: 6px;
      height: 36px;
    }
  }

  :deep(.widget-drag) {
    border: 2px solid transparent;
  }
</style>
