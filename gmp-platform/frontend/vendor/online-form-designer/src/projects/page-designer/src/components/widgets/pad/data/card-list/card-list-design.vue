<template>
  <div v-if="widget.props.model" class="gct-crad-list p1px">
    <div class="gct-card-item">
      <div class="gct-card-selection" v-if="rowSelection">
        <van-radio-group v-if="rowSelectionType === selectionTypeEnums.SingleChoice" shape="dot">
          <van-radio icon-size="16px" />
        </van-radio-group>
        <van-checkbox
          v-else-if="rowSelectionType === selectionTypeEnums.MultipleChoice"
          icon-size="16px"
          shape="square"
        />
      </div>
      <div
        class="gct-card-container gct-border-dashed"
        :class="{
          'w-full': !rowSelection,
          'has-children': hasChildren,
        }"
      >
        <div class="gct-card" :style="styleWrap">
          <div class="gct-card-content">
            <div v-if="showTitle" class="gct-card-header">
              <van-row>
                <van-col span="12" class="gct-card-header-left header-item">
                  <slot
                    :dragPlaceholder="$t('sys.pageDesigner.selectCmpFieldTip')"
                    :parentWidget="widget"
                    :children="widget.children[0].children"
                    :config="{ direction: 'horizontal', onDrop: handleDropAdd }"
                  ></slot>
                </van-col>
                <van-col span="12" class="textR gct-card-header-right header-item">
                  <van-form
                    :label-align="layout?.label"
                    :input-align="layout?.inputAlign"
                    required="auto"
                    style="height: 100%"
                  >
                    <slot
                      :dragPlaceholder="$t('sys.pageDesigner.selectCmpFieldTip')"
                      :parentWidget="widget"
                      :children="widget.children[1].children"
                      :config="{ direction: 'horizontal', onDrop: handleDropAdd }"
                    ></slot>
                  </van-form>
                </van-col>
              </van-row>
            </div>
            <div class="gct-card-main" :style="styleAttr">
              <van-form
                :label-align="layout?.label"
                :input-align="layout?.inputAlign"
                required="auto"
                :label-width="labelLayout.width"
                style="height: 100%; min-height: inherit"
                :class="[(!widget.props.model || !widget.children?.length) && 'is-empty']"
              >
                <slot
                  :dragPlaceholder="$t('sys.pageDesigner.selectCmpFieldTip')"
                  :parentWidget="widget"
                  :children="widget.children[2].children"
                  :config="{ direction: 'horizontal', onDrop: handleDrop }"
                ></slot>
              </van-form>
            </div>
          </div>
          <div v-if="draggable || children[3].children!.length" class="gct-card-footer">
            <DesignTableColumnButtons
              :buttons="children[3].children"
              :visible-buttons="visibleButtons"
              :parentWidget="widget"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="p10px h100px ks-row-center-middle bg-[#FCFCFD] gct-border-dashed" v-else>
    <span class="text-[#C3C3C3] text-14px">
      {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
    >
  </div>
</template>
<script setup lang="ts" name="card-list-design">
  import { toRefs, provide, computed, toRef, watch } from 'vue';
  import { CardList } from '/@page-designer/types/mobile';
  import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';
  import { LowCodeWidget } from '@gct/runtime';
  import { IDropItem } from '/@/projects/page-designer/src/designer/interface';
  import { useDesignerController } from '/@/projects/page-designer/src/hooks/useDesigner';
  import { selectionTypeEnums } from '/@/enums/appEnum';
  import { DesignTableColumnButtons } from '../data-table/component/design-table-buttons/design-table-column-buttons';

  const props = defineProps<{ widget: CardList; isNewDesigner: boolean }>();
  const { children } = toRefs(props.widget);
  const { clearSelectInfo, loadObjInfo } = useModelField();

  const { draggable, hasLabelWidth, labelType, labelWidth, overLabelDisplay, visibleButtons } =
    toRefs(props.widget.props);
  const layout = toRef(() => props.widget.props.layout || {});
  provide('form-layout', layout);

  const hasChildren = computed(() => {
    return (
      children.value[0]?.children?.length ||
      children.value[1]?.children?.length ||
      children.value[2]?.children?.length
    );
  });

  const c = useDesignerController();

  const labelLayout = toRef(() => {
    const width =
      layout?.value.label === 'left' && !!hasLabelWidth?.value
        ? labelWidth?.value + (labelType?.value == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: layout?.value,
      hasLabelWidth: hasLabelWidth?.value,
      overLabelDisplay: overLabelDisplay?.value,
    };
  });

  provide('labelLayout', labelLayout);

  watch(
    () => props.widget.props.model,
    (v) => {
      clearSelectInfo();
      if (v) {
        loadObjInfo(v!, {
          formId: props.widget.id,
          childParentModelKey: props.widget.props.refParentModelkey,
        });
      }
    },
  );

  const handleDragAdded = ({ evt, list }) => {
    const obj = list[evt.newIndex];
    obj.props.required = false;
    obj.props.readonly = true;
    list.splice(0, list.length, obj);
    c.force();
  };

  const handleDrag = ({ evt, list }) => {
    const idx = evt.newIndex;
    list[idx].props.required = false;
    list[idx].props.readonly = true;
  };

  const handleDropAdd = (item: IDropItem, widgets: LowCodeWidget.BasicSchema[]) => {
    const obj = widgets[item.index];
    obj.props.required = false;
    obj.props.readonly = true;
    widgets.splice(0, widgets.length, obj);
  };

  const handleDrop = (item: IDropItem, widgets: LowCodeWidget.BasicSchema[]) => {
    const idx = item.index;
    widgets[idx].props.required = false;
    widgets[idx].props.readonly = true;
  };

  const showTitle = computed(() => {
    return props.widget.props.showTitle;
  });
  // 是否开启数据选择
  const rowSelection = computed(() => {
    return props.widget.props.rowSelection;
  });
  // 数据选择模式
  const rowSelectionType = computed(() => {
    return props.widget.props.rowSelectionType;
  });

  const styleAttr = computed(() => {
    const style = props.widget.style;
    return {
      paddingRight: (style.paddingRight || 0) + 'px',
      paddingBottom: (style.paddingBottom || 0) + 'px',
      paddingLeft: (style.paddingLeft || 0) + 'px',
      paddingTop: (style.paddingTop || 0) + 'px',
    };
  });
  const styleWrap = computed(() => {
    const style = props.widget.style;
    return {
      marginTop: (style.marginTop || 0) + 'px',
      marginRight: (style.marginRight || 0) + 'px',
      marginBottom: (style.marginBottom || 0) + 'px',
      marginLeft: (style.marginLeft || 0) + 'px',
      backgroundColor: !style.backgroundColor ? '' : style.backgroundColor + ' !important',
      height: style.height ? style.height + 'px' : 'auto',
      borderLeft: `${style.borderLeft?.borderWidth}px ${style.borderLeft?.borderStyle} ${style.borderLeft?.borderColor} !important`,
      borderRight: `${style.borderRight?.borderWidth}px ${style.borderRight?.borderStyle} ${style.borderRight?.borderColor} !important`,
      borderBottom: `${style.borderBottom?.borderWidth}px ${style.borderBottom?.borderStyle} ${style.borderBottom?.borderColor} !important`,
      borderTop: `${style.borderTop?.borderWidth}px ${style.borderTop?.borderStyle} ${style.borderTop?.borderColor} !important`,
      borderTopRightRadius: !style.borderTopRightRadius
        ? ''
        : style.borderTopRightRadius + 'px !important',
      borderTopLeftRadius: !style.borderTopLeftRadius
        ? ''
        : style.borderTopLeftRadius + 'px !important',
      borderBottomRightRadius: !style.borderBottomRightRadius
        ? ''
        : style.borderBottomRightRadius + 'px !important',
      borderBottomLeftRadius: !style.borderBottomLeftRadius
        ? ''
        : style.borderBottomLeftRadius + 'px !important',
    };
  });
  // ! 组件是否在 form表单中
  provide('inFormId', props.widget.id);
</script>
<style lang="scss" scoped>
  .gct-crad-list {
    height: 100%;
    overflow: auto;
    background-color: #fff;
    // min-height: 169px;
  }

  .gct-card {
    overflow: hidden;
    box-shadow: 0 4px 16px 0 rgb(0 0 0 / 5%);
  }

  .gct-card-header-right {
    position: relative;

    .van-cell__value.van-field__value {
      text-align: right;
    }

    &::before {
      content: '';
      position: absolute;
      z-index: 99;
      left: 0;
      height: 100%;
      border-left: 1px dashed #b7bcc6;
    }
  }

  .gct-card-item {
    display: flex;
    height: 100%;
    background-color: #fff;

    .gct-card-container {
      display: flex;
      flex-flow: column;
      width: calc(100% - 50px);

      &.w-full {
        width: 100%;
      }
    }

    .gct-card-selection {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;

      .van-checkbox,
      .van-radio {
        padding: 16px 4px;
      }
    }

    .gct-card-content {
      flex-grow: 1;
    }

    // margin-bottom: 10px;
    .gct-card-header {
      overflow: hidden;
      border-bottom: 1px dashed #b7bcc6;
      background-color: #fcfcfd;

      .header-item {
        min-height: 40px;
      }
    }

    .gct-card-main {
      height: auto;
      min-height: 127px;
      // .widget-drag-wrap {
      //   overflow-y: visible;
      // }
    }
  }

  .gct-card-footer {
    display: flex;
    justify-content: end;
    padding: 8px 12px;

    .footer-btn-wrap {
      display: flex;
      flex: 1;
      flex-direction: row-reverse;
    }

    .btn-more {
      margin-left: 8px;
      line-height: 32px;
    }
  }

  .textR {
    text-align: right;
  }

  :deep(.van-field) {
    padding: 12px 14px;
  }

  :deep(.van-cell) {
    background: inherit;
  }

  :deep(.gct-vue3-dnd-container.is-not-children) {
    border: 2px solid transparent;
  }

  .has-children {
    padding: 16px;

    :deep(.gct-vue3-dnd-container, .is-not-children) {
      background-color: #fff;
    }

    .gct-card-header {
      border-bottom: 1px dashed #e0e3eb;

      .gct-card-header-right {
        &::before {
          border-left: 1px dashed #e0e3eb;
        }
      }
    }
  }
</style>
