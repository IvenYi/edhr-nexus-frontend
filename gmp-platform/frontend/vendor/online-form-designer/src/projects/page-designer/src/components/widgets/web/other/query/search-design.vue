<template>
  <div
    class="borderbox"
    :class="[isEmpty && 'is-empty']"
    :data-placeholder="
      !widget.props.model && !(fieldWidgets!.length - 1)
        ? t('sys.pageDesigner.selectAssociatedModel')
        : !(fieldWidgets!.length - 1)
          ? t('sys.pageDesigner.selectFilterItem')
          : ''
    "
  >
    <a-form ref="formRef" :model="formState">
      <div class="gct-search-widget p1px" :style="formStyle">
        <draggable
          v-if="!isNewDesigner"
          :group="{
            pull: false,
          }"
          class="widget-drag"
          v-model="fieldWidgets"
          ghost-class="widget-item--ghost"
          :animation="300"
          filter=".widget-drag-item-search-btn"
          item-key="id"
        >
          <template #item="{ element, index }">
            <div
              class="widget-drag__item relative"
              :data-cmpType="element.type"
              :class="{
                'widget-drag-item-search-btn': element.id === 'searchBtn',
                active: element.id === selectedRef.id,
              }"
              :style="{
                display:
                  !expand && index > maxLength - 1 && element.id !== 'searchBtn'
                    ? 'none'
                    : 'inline-block',
              }"
            >
              <widget-wrapper
                v-if="!(!expand && index > maxLength - 1 && element.id !== 'searchBtn')"
                :widget="element"
                :parentWidget="widget"
                :parentList="widget.children"
                :index-of-parent-list="index"
                :isReadonly="element.id === 'searchBtn'"
                @select="onSelect"
              >
                <!-- 查询按钮 -->
                <div
                  v-if="element.id === 'searchBtn'"
                  :style="{
                    'justify-content': alignment,
                  }"
                  class="box-border button-area pb10px"
                  @click="setSelectedWidget(widget)"
                >
                  <a-button class="mr8px">{{ t('sys.reset') }}</a-button>
                  <a-button type="primary">{{ t('sys.query') }}</a-button>
                  <a-tooltip v-if="customHeader">
                    <template #title>{{ t('sys.pageDesigner.filterItemsManage') }}</template>
                    <span class="custom-filter-icon ml-6px">
                      <i class="iconfont icon-shezhi"></i>
                    </span>
                  </a-tooltip>
                  <div
                    class="button-toggle ml-8px"
                    v-if="isShowExpand"
                    @click.stop="expand = !expand"
                  >
                    {{ expand ? t('sys.collapse') : t('sys.unfold') }}
                    <up-outlined v-if="expand" />
                    <down-outlined v-else />
                  </div>
                </div>
                <!-- widget-entry -->
                <component v-else :is="widgetEntry" :widget="element">
                  <!-- widget -->
                  <div
                    class="inline-block box-border search-item pt10px pb10px"
                    :class="selectedRef.id === element.id && 'is-selected'"
                  >
                    <a-form-item
                      :name="element.props.field"
                      :label="
                        element.props.displayLabelText ? element.props.label || element.alias : ''
                      "
                      style="pointer-events: none"
                    >
                      <searcfield :widget="element" />
                    </a-form-item>
                  </div>
                </component>
              </widget-wrapper>
            </div>
          </template>
        </draggable>
        <SearchDesign2
          v-if="isNewDesigner"
          :widget="widget"
          :expand="expand"
          :btnWidth="btnItemWidth"
          :data-placeholder="
            !widget.props.model && !(fieldWidgets!.length - 1)
              ? t('sys.pageDesigner.selectAssociatedModel')
              : !(fieldWidgets!.length - 1)
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
          <template #item="args">
            <slot name="item" v-bind="args"></slot>
          </template>
          <template #content="{ element }">
            <a-form-item
              :key="element.id"
              :name="element.props.field"
              :label="element.props.displayLabelText ? element.props.label || element.alias : ''"
            >
              <searcfield :widget="element" />
            </a-form-item>
          </template>
          <template #searchBtn>
            <div
              :style="{
                'justify-content': alignment,
                display: 'inline-flex',
              }"
              class="box-border button-area pb10px widget-drag-item-search-btn"
            >
              <a-button class="mr8px">{{ t('sys.reset') }}</a-button>
              <a-button type="primary">{{ t('sys.query') }}</a-button>
              <a-tooltip v-if="customHeader">
                <template #title>{{ t('sys.pageDesigner.filterItemsManage') }}</template>
                <span class="custom-filter-icon ml-6px">
                  <i class="iconfont icon-shezhi"></i>
                </span>
              </a-tooltip>
              <div class="button-toggle ml-8px" v-if="isShowExpand" @click.stop="expand = !expand">
                {{ expand ? t('sys.collapse') : t('sys.unfold') }}
                <up-outlined v-if="expand" />
                <down-outlined v-else />
              </div>
            </div>
          </template>
        </SearchDesign2>
      </div>
    </a-form>
  </div>
</template>

<script name="gct-search" setup lang="ts">
  import { ref, toRefs, reactive, computed } from 'vue';
  import { Search } from '/@page-designer/types/web';
  import type { FormInstance } from 'ant-design-vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import draggable from 'vuedraggable';
  import searcfield from './component/search_fields_design/index.vue';
  import { SearchDesign2 } from './search-design2';
  import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
  import { forEachRight } from 'lodash-es';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { SearchComponents } from '/@page-designer/enum';

  const { t } = useI18n();
  const { widgetEntry } = useDesigner();

  const { setSelectedWidget, selectedRef } = useSelectedWidget();
  const props = defineProps<{ widget: Search; isNewDesigner: boolean }>();
  const { alignment, customHeader, rowLength, maxLength } = toRefs(props.widget.props);
  const fieldWidgets = computed({
    get() {
      forEachRight(props.widget.children, (item, index) => {
        if ([FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(item.props.fieldType)) {
          /**老数据处理 */
          item.type = SearchComponents.SearchUserSelect;
        }
        if (item.props && item.props.displayLabelText === undefined) {
          item.props.displayLabelText = true;
        }
        initFieldWidgetRuntime(item, true)
          .then((fieldInfo) => {
            item.alias = item.props.label || fieldInfo?.name;
          })
          .catch((err) => {
            //通过倒序遍历删除 不存在的字段
            props.widget?.children?.splice(index, 1);
          });
      });
      return [
        ...(props.widget.children || []),
        { type: 'showSearchBtn', id: 'searchBtn', isReadonlyWidget: true },
      ];
    },
    set(list) {
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.children = list.filter((i) => i.props);
    },
  });

  const formRef = ref<FormInstance>();
  const formState = reactive({});
  const expand = ref<boolean>(false);

  const formStyle = computed(() => {
    if (props.isNewDesigner) {
      return {
        '--search-design-line-display-count': rowLength.value,
        '--drag-item-btn-width': `${btnItemWidth.value}%`,
      };
    }
    return {
      '--drag-item-width': `${itemWidth.value}%`,
      '--drag-item-btn-width': `${btnItemWidth.value}%`,
    };
  });

  const isEmpty = computed(() => {
    return !props.widget.props.model || !(fieldWidgets.value!.length - 1);
  });

  const itemWidth = computed(() => {
    if (isEmpty.value) {
      return 100;
    }
    return 100 / rowLength.value;
  });

  const btnItemWidth = computed(() => {
    return !isEmpty.value
      ? (rowLength.value - (filterList.value.length % rowLength.value)) * itemWidth.value
      : 100;
  });

  const isShowExpand = computed(() => {
    return fieldWidgets.value!.length - 1 > maxLength.value;
  });

  const filterList = computed(() => {
    const list =
      isShowExpand.value && !expand.value
        ? fieldWidgets.value!.slice(0, maxLength.value)
        : fieldWidgets.value!.slice(0, -1);
    return list;
  });

  const onSelect = (widget) => {
    widget.props.modeldata = props.widget.props.modeldata;
  };

  defineExpose({});
</script>

<style lang="less" scoped>
  .gct-search-widget,
  :deep(.gct-search-widget) {
    min-height: 56px;
    background-color: transparent;
    line-height: 1;
  }

  :deep(.gct-vue3-dnd-item) {
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }

  .borderbox {
    position: relative;
    border: 2px dashed #dbdbdb;

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
        font-size: 14px;
        pointer-events: none;
      }
    }

    .search-item {
      position: relative;
      width: 100%;

      :deep(.ant-form-item) {
        padding: 0 !important;
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
      }
    }
  }

  :deep(.widget-drag) {
    margin-right: -5px;
    margin-left: -5px;
    border: 1px solid transparent;
    border-bottom: 0;

    .widget-drag__item.active {
      z-index: 999;
    }

    .widget-drag__item,
    .widget-drag-item-search-btn {
      display: inline-block;
      box-sizing: border-box;
      padding-right: 5px;
      padding-left: 5px;
    }

    .widget-drag__item {
      width: var(--drag-item-width);
    }

    .widget-drag-item-search-btn {
      width: var(--drag-item-btn-width);

      .wrapper-full {
        visibility: hidden;
      }
    }
  }
</style>
