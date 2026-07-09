<template>
  <div class="gct-dynamic-table">
    <van-cell
      class="dynamic-table-title-area"
      center
      title-style="padding-left: 12px"
      :border="false"
    >
      <template #title v-if="widget.props.displayLabelText">
        <div class="gct-dynamic-table--label">
          {{ widget.props.label || globFieldInfo.label }}
        </div>
      </template>
      <!-- <template #value>
        <button-container-design
          :parentWidget="widget"
          :widget="btnGroupWidget"
          :class="[btnGroupWidget.id === selectedWidget.id ? 'is-button-container-selected' : null]"
          @click.stop="setSelectedWidget(btnGroupWidget, scope)"
          :style="btnStyle"
        />
      </template> -->
    </van-cell>
    <div
      class="dynamic-table-fields-area"
      :class="[!subFieldsWidget.length ? 'is-empty' : 'is-data']"
      :data-placeholder="t('sys.pageDesigner.selectSubTableField')"
    >
      <div class="fields-container">
        <van-form
          class="dynamic-table-field-area-form"
          :input-align="widget.props.displayLabelText ? 'right' : 'left'"
          style="height: 100%; min-height: inherit"
          :border="false"
        >
          <widget-wrapper
            v-for="(subField, index) in subFieldsWidget"
            :key="subField.id"
            :widget="subField"
            :parent-list="subFieldsWidget"
            :parent-widget="widget"
            :index-of-parent-list="index"
            :actionTypes="['parent']"
          >
            <component :is="widgetEntry" :widget="subField" v-slot="slotData">
              <component
                :is="getAsyncWidget(subField)"
                :widget="subField"
                :rowReadonly="editMode === SUB_TABLE_EDIT_MODE.MODAL"
                v-bind="slotData || {}"
              />
            </component>
          </widget-wrapper>
          <div v-if="dropFieldsWidget?.children?.length" class="gct-card-footer">
            <!-- <i class="iconfont icon-drag mover cursor-pointer mr8px" style="color: #bfbfbf"></i> -->
            <tableButtons
              :parent-widget="widget"
              :children="dropFieldsWidget.children"
              :visibleButtons="dropFieldsWidget.props.visibleButtons"
            />
            <!-- <div style="flex: 1; pointer-events: none">
              <cardBtn :children="dropFieldsWidget" :visibleButtons="visibleButtons" />
            </div> -->
          </div>
        </van-form>
      </div>
    </div>
    <div v-if="btnGroupWidget?.children?.length" class="pt5px pb5px">
      <groupButtons
        :children="btnGroupWidget.children"
        :parentWidget="widget"
        :visibleButtons="btnGroupWidget.visibleButtons"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-dynamic-table">
  import { inject, computed, toRefs, onMounted, provide } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { SCOPE, SUB_TABLE_EDIT_MODE } from '/@page-designer/enum';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import ButtonContainerDesign from '/@page-designer/components/widgets/mobile/layout/button-container/button-container-design.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import cardBtn from '/@page-designer/components/widgets/mobile/data/card-list/component/card-btn.vue';
  import { useAsyncFieldConfig } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import { MaterialEnum } from '/@/enums/appEnum';
  import groupButtons from '/@page-designer/components/widgets/mobile/__components__/group-buttons/group-buttons-design.vue';
  import tableButtons from '/@page-designer/components/widgets/mobile/__components__/table-buttons/table-buttons-design.vue';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const scope: SCOPE = inject('scope') || SCOPE.PAGE;

  const { t } = useI18n();

  const { labelFont } = useStyle(props.widget);
  const props = defineProps(widgetProps);

  const { visibleButtons, editMode } = toRefs(props.widget.props);

  const { getAsyncWidget, widgetEntry } = useDesigner();

  const { setSelectedWidget, selectedWidget } = useSelectedWidget();

  const btnGroupWidget = computed(() => {
    return props.widget.children![2];
  });

  const subFieldsWidget = computed(() => {
    return props.widget.children![3].children;
  });

  const dropFieldsWidget = computed(() => {
    return props.widget.children![1];
  });

  useAsyncFieldConfig(props.widget);

  const { wrapperStyle: btnStyle } = useStyle(btnGroupWidget.value);
</script>

<style lang="less" scoped>
  .gct-dynamic-table {
    width: 100%;

    .dynamic-table-title-area.van-cell {
      padding: 0;

      :deep(> .van-cell__title) {
        box-sizing: border-box;
        flex: none;
        width: var(--van-field-label-width);
        margin-right: var(--van-field-label-margin-right);
        color: var(--van-field-label-color);
        text-align: left;
        word-wrap: break-word;
        .gct-dynamic-table--label {
          color: v-bind('labelFont.color');
          font-size: v-bind('labelFont.fontSize');
          font-style: v-bind('labelFont.fontStyle');
          font-weight: v-bind('labelFont.fontWeight');
          text-align: v-bind('labelFont?.textAlign');
          text-decoration-line: v-bind('labelFont.textDecorationLine');
        }
      }

      :deep(> .van-cell__value) {
        padding: 1px;
      }
    }

    .is-button-container-selected {
      outline: var(--ant-primary-color) solid 1px;
    }

    :deep(.active) {
      background-color: rgb(13 170 156 / 10%);
    }

    .dynamic-table-fields-area {
      position: relative;
      min-height: 96px;

      .dynamic-table-field-area-form {
        :deep(.van-cell) {
          padding: 4px 0;
        }
      }

      &.is-data {
        padding-top: 6px;
        // background-color: #f9f9f9;
        .fields-container {
          // background-color: #fff;
          padding: 1px;
        }
      }

      &.is-empty {
        margin-top: 2px;

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
          background-color: #f9f9f9;
          color: #bfbfbf;
          pointer-events: none;
        }
      }
    }

    .gct-card-footer {
      display: flex;
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
  }
</style>
