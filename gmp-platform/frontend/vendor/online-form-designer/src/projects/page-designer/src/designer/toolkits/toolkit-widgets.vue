<template>
  <ScrollContainer>
    <div class="designer-widgets">
      <div class="pt12px pl12px pr12px widgets-search">
        <a-input v-model:value="searchValue" placeholder="搜索名称" @pressEnter="searchToolkit">
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <a-collapse v-model:activeKey="activeKey" ghost>
        <template #expandIcon="{ isActive }">
          <caret-right-outlined :rotate="isActive ? 90 : 0" />
        </template>

        <a-collapse-panel v-for="c in filterToolkitWidgets" :key="c.categoryName">
          <template #header>
            <div class="ell" :title="t(c.categoryName)"> {{ t(c.categoryName) }}</div>
          </template>
          <VueDraggable
            v-if="isNewDesigner !== true"
            :list="c.list"
            :group="{
              name: subTableModalState
                ? 'gct-sub-table-modal'
                : modalDesignState
                ? 'gct-modal'
                : 'gct',
              pull: onPull,
              put: false,
            }"
            :sort="false"
            ghost-class="widget-item--ghost"
            draggable=".widget-item--draggable"
            :clone="cloneWidget"
            item-key="type"
            :move="checkWidgetMove"
            @start="(e) => onDragStart(e, c)"
            @end="onDragEnd"
          >
            <template #item="{ element }">
              <div class="designer-widget-item widget-item--draggable" :data-cmpType="element.type">
                <i class="iconfont" :class="element.icon || 'icon-zidingyi'"></i>
                <span class="item-info" :title="t(element?.displayName || element.name)">{{
                  t(element?.displayName || element.name)
                }}</span>
              </div>
            </template>
          </VueDraggable>
          <div v-if="isNewDesigner === true" :class="ns.b('group')" @click.stop>
            <Vue3DndMaterialItem
              v-for="(item, i) in c.list"
              :key="item.type"
              :group="DESIGN_TYPE"
              :index="i"
              :item="item"
              :config="dragOption"
              :clone="cloneWidget"
              class="designer-widget-item widget-item--draggable"
              :data-cmpType="item.type"
            >
              <i v-if="!item._plugin" class="iconfont" :class="item.icon || 'icon-zidingyi'"></i>
              <span v-else>
                <img class="widget-item-icon" :src="'/minio/' + item._plugin.icon" />
              </span>
              <span
                class="item-info"
                :title="
                  item._plugin
                    ? item._plugin.name
                    : item._plugin
                    ? item._plugin.name
                    : t(item?.displayName || item.name)
                "
              >
                {{ item._plugin ? item._plugin.name : t(item?.displayName || item.name) }}
              </span>
            </Vue3DndMaterialItem>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </ScrollContainer>
</template>

<script lang="ts" setup name="toolkit-widgets">
  import { ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import VueDraggable from 'vuedraggable';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import {
    useDesigner,
    useDesignerController,
    isNewDesigner,
  } from '/@page-designer/hooks/useDesigner';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { cloneWidget } from '/@page-designer/schema/utils';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ScrollContainer } from '/@/components/Container';
  import { FormComponents } from '/@page-designer/enum';
  import { clone, has } from 'lodash-es';
  import { Vue3DndMaterialItem } from '../components/vue3-dnd-material-item/vue3-dnd-material-item';
  import { IVue3DndItemOptions } from '../interface';
  import { DESIGN_TYPE } from '../../constant';

  const viewC = useDesignerController();

  const { t } = useI18n();
  const { toolkitWidgets, changeToolkitWidgets } = useToolkit();
  const { checkWidgetMove, modalDesignState, subTableModalState } = useDesigner();
  const { selectedRef } = useSelectedWidget();
  const searchValue = ref();
  const ns = useNamespace('toolkit-widgets');
  const filterToolkitWidgets = ref();
  const dragOption: IVue3DndItemOptions = {
    mode: 'create',
    isDrop: false,
  };

  const searchToolkit = () => {
    if (!searchValue.value) {
      filterToolkitWidgets.value = toolkitWidgets.value;
      return;
    }
    filterToolkitWidgets.value = toolkitWidgets.value
      .map((i) => {
        if ($t(i.categoryName, null).includes(searchValue.value)) {
          return i;
        }
        if (i.list && i.list.length) {
          return {
            ...i,
            list: i.list.filter((e) => {
              return $t(e.name, null).includes(searchValue.value);
            }),
          };
        }
      })
      .filter((p) => p?.list.length);
  };

  const activeKey = ref<string[]>([]);
  watch(
    () => toolkitWidgets.value,
    () => {
      activeKey.value = toolkitWidgets.value.map((item) => item.categoryName);
      searchToolkit();
    },
    { immediate: true },
  );

  const onDragStart = (evt, c) => {
    const { oldIndex } = evt;
    const item = clone(c.list[oldIndex]);
    viewC.setDragData(item);
  };

  const onDragEnd = () => {
    viewC.setDragData(null);
  };

  watch(
    [() => selectedRef.value, subTableModalState],
    ([info, modalState]) => {
      changeToolkitWidgets({ data: info, modalState });
    },
    {
      immediate: true,
    },
  );

  const onPull = (_a, _b, source) => {
    if (
      _a &&
      _a.el &&
      has(_a.el.dataset, 'informid') &&
      [FormComponents.Form, FormComponents.RdoForm, FormComponents.MedProRdoForm].includes(
        source.dataset.cmptype,
      )
    ) {
      console.log('表单不能嵌套');
      return false;
    }
    return 'clone';
  };
</script>

<style lang="less" scoped>
  .item-info {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-item-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  .designer-widgets {
    .widgets-search {
      .ant-input-affix-wrapper {
        color: rgba(0, 0, 0, 0.85);
      }
    }
    :deep(.designer-widget-item),
    .designer-widget-item {
      display: inline-flex;
      align-items: center;
      width: calc((100% - 8px) / 2);
      height: 32px;
      margin-bottom: 8px;
      padding: 10px 8px;
      transition: all 0.3s;
      border: 1px solid @gct-input-border-color;
      border-radius: 4px;
      background-color: rgb(255 255 255 / 80%);
      color: @gct-text-main-color;
      font-size: 12px;
      line-height: 1em;
      cursor: pointer;
      .iconfont {
        margin-right: 5px;
        color: #797a7d;
        font-size: 16px;
      }

      &:hover {
        border-color: var(--ant-primary-color);
        background-color: #fff;
        // background-color: rgba(from var(--ant-primary-2) r g b / 70%);
        color: var(--ant-primary-color);

        .iconfont {
          color: var(--ant-primary-color);
        }
      }

      &:nth-child(odd) {
        margin-right: 8px;
      }
    }

    .ant-collapse {
      :deep(.ant-collapse-header) {
        padding-bottom: 8px !important;

        &:hover {
          color: var(--ant-primary-color);
        }
      }

      :deep(.ant-collapse-header[aria-expanded='true']) {
        font-weight: bold;
      }
    }

    :deep(.ant-collapse > .ant-collapse-item > .ant-collapse-header) {
      padding: 16px 12px 12px;
    }

    :deep(.ant-collapse-content > .ant-collapse-content-box) {
      padding: 0 12px;
    }
  }
</style>
