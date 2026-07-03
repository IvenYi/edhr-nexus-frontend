<template>
  <div class="position-relative">
    <div v-if="propValue.length < 4" class="position-absolute add" @click="addRow">
      <i class="gct-iconfont icon-btn_add"></i>
      添加下一行
    </div>
    <draggable
      :list="propValue"
      handle=".cursor-move"
      :animation="200"
      chosen-class="drawing-chosen"
      drag-class="drawing-drag"
      item-key="id"
      class="field-list"
      @change="emitCache"
    >
      <template #item="{ element, index }">
        <div class="field-setting mt8px flex">
          <span
            class="icon-drag iconfont mr4px cursor-move text-[#C3C3C3] primary-gct-hover"
          ></span>
          <div style="flex: 1; width: calc(100% - 16px)">
            <div class="flex justify-between mb4px">
              <span>添加数据源</span>
              <i
                v-if="propValue.length > 1"
                class="gct-iconfont icon-icon_shanchu"
                @click="deleteField(index)"
              ></i>
            </div>
            <div
              class="h28px mb8px bg-[#fff] px8px ks-row-middle data-area"
              @click="openEvent(element)"
            >
              <div class="ks-col flex overflow-hidden items-center">
                <!-- <a-button type="link" @click="handleFocusJS"> {{ propValue.name }}</a-button> -->
                <a
                  class="ell"
                  v-if="element.event?.name"
                  @click.prevent="handleFocusJS"
                  :title="element.event?.name"
                >
                  {{ element.event?.name }}
                </a>
                <span v-else class="text-[#C6C6C6] text-[12px]">请输入</span>
              </div>
              <setting-outlined
                v-show="element.event?.name"
                class="primary-gct ml8px"
                @click="openEvents(element)"
              />
            </div>
            <div class="mb4px">样式设置</div>
            <a-row>
              <a-col :span="19">
                <a-select
                  :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                  v-model:value="element.style.labelType"
                  :options="options"
                  style="width: 100%"
                  option-label-prop="title"
                >
                  <template #option="{ value, label, group }">
                    <div class="display-tag-opt" :title="label">
                      <div v-if="!group" class="tag-icon" :class="value"></div>
                      {{ label }}
                    </div>
                  </template>
                </a-select>
              </a-col>
              <a-col :span="5" class="text-right">
                <g-color-picker
                  :preset="presetColor"
                  :color="element.style.color"
                  @update:color="(e, h) => handleUpdateColor(h, element)"
                >
                  <template #icon>
                    <div
                      :style="{
                        width: '24px',
                        height: '24px',
                        backgroundColor: element.style.color,
                      }"
                    ></div>
                  </template>
                </g-color-picker>
              </a-col> </a-row
          ></div>
        </div>
      </template>
    </draggable>
  </div>
</template>
<script setup lang="ts" name="multi-field-config-editor">
  import { ref, reactive, toRef, computed, watch, h } from 'vue';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { EventCategory, tagEnum, ProgressTypeEnum } from '/@page-designer/enum';
  import { DisplayTagTypeEnum } from '@gct/runtime';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import draggable from 'vuedraggable';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { useEventPicker } from '/@page-designer/designer/panels/widget/event-modules/functional';
  import { openLoEditorDrawer } from '/@/components/Lo';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { setLo, getLo, unbindLoByWidgetId } = useDesigner();
  const { openPickerEvent } = useEventPicker();
  const { mitt } = useMitt();
  const { emitCache } = useDesigner();
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const propConfig = reactive(defProps.propConfig);
  const options = [
    {
      label: '线面结合',
      group: true,
      options: [
        {
          value: DisplayTagTypeEnum.RADIUS,
          label: '圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon radius' }),
            h('span', '圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.BIG_RADIUS,
          label: '大圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon big_radius' }),
            h('span', '大圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.STATUS,
          label: '状态标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon status' }),
            h('span', '状态标签'),
          ]),
        },
      ],
    },
    {
      label: '面性',
      group: true,
      options: [
        {
          value: DisplayTagTypeEnum.SURFACE_RADIUS,
          label: '圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon surface_radius' }),
            h('span', '圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.SURFACE_BIG_RADIUS,
          label: '大圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon surface_big_radius' }),
            h('span', '大圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.SURFACE_STATUS,
          label: '状态标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon surface_status' }),
            h('span', '状态标签'),
          ]),
        },
      ],
    },
    {
      label: '线性',
      group: true,
      options: [
        {
          value: DisplayTagTypeEnum.LINE_RADIUS,
          label: '圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon line_radius' }),
            h('span', '圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.LINE_BIG_RADIUS,
          label: '大圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon line_big_radius' }),
            h('span', '大圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.LINE_DASHED_RADIUS,
          label: '虚线圆角标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon line_dashed_radius' }),
            h('span', '虚线圆角标签'),
          ]),
        },
        {
          value: DisplayTagTypeEnum.LINE_STATUS,
          label: '状态标签',
          title: h('div', { class: 'display-tag-opt' }, [
            h('div', { class: 'tag-icon line_status' }),
            h('span', '状态标签'),
          ]),
        },
      ],
    },
  ];
  if (!propValue.value || !propValue.value.length) {
    propValue.value = [
      {
        event: undefined,
        style: {
          labelType: DisplayTagTypeEnum.RADIUS,
          color: '#1990FF',
        },
      },
    ];
  }

  const handleUpdateColor = (color, element) => {
    element.style.color = color;
  };

  const openEvent = (element) => {
    if (element?.event?.name) return;
    openEvents(element);
  };

  function openEvents(element) {
    openPickerEvent({
      eventType: 'datasource',
      params: ['queryData', 'formData'],
      hiddenEventCategory: [EventCategory.INNER],
    }).then((res) => {
      element.event = {
        type: res.eventCategory,
        name: res.event.methodName,
        extraParams: res.event.extParams,
      };
      if (res.eventCategory === EventCategory.LO) {
        setLo(res.event.methodName, {
          name: res.event.methodName,
          title: res.event.methodTitle,
          runtimeJs: `function ${res.event.methodName}() {}`,
          bindTo: defProps.widget?.id,
          parameter: ['queryData', 'formData', 'extraParams'],
        });
      }
    });
  }

  /**foucs在JS编辑器里面的代码 */
  const handleFocusJS = () => {
    const event = propValue.value as LowCodeWidget.JsEvent;
    if (event.type === EventCategory.LO) {
      openLoEditorDrawer({
        data: getLo(event.name),
        callback(value) {
          setLo(event.name, value);
        },
      });
    } else {
      mitt.emit('focus-js', event.name);
    }
  };

  /** 添加字段 */
  const addRow = () => {
    propValue.value.push({
      event: undefined,

      style: {
        labelType: DisplayTagTypeEnum.RADIUS,
        color: '#1990FF',
      },
    });
  };

  /** 删除字段 */
  const deleteField = (index) => {
    propValue.value = propValue.value.filter((p, i) => i !== index);
  };
</script>
<style lang="less">
  .display-tag-opt {
    display: flex;
    align-items: center;

    .tag-icon {
      width: 28px;
      height: 16px;
      margin-right: 10px;
    }

    .radius {
      border: 1px solid rgb(25 144 255 / 50%);
      border-radius: 3px;
      background: rgb(25 144 255 / 10%);
    }

    .big_radius {
      border: 1px solid rgb(25 144 255 / 50%);
      border-radius: 50px;
      background: rgb(25 144 255 / 10%);
    }

    .status {
      border: 1px solid rgb(25 144 255 / 50%);
      border-radius: 11px 3px 3px;
      background: rgb(25 144 255 / 10%);
    }

    .surface_radius {
      border-radius: 3px;
      background-color: #1990ff;
    }

    .line_radius {
      border: 1px solid rgb(25 144 255 / 50%);
      border-radius: 3px;
    }

    .surface_big_radius {
      border-radius: 50px;
      background-color: #1990ff;
    }

    .line_big_radius {
      border: 1px solid rgb(25 144 255 / 50%);
      border-radius: 50px;
    }

    .line_dashed_radius {
      border: 1px dashed rgb(25 144 255 / 50%);
      border-radius: 3px;
    }

    .line_status {
      border: 1px solid rgb(25 144 255 / 50%);
      border-radius: 11px 3px 3px;
    }

    .surface_status {
      border-radius: 11px 3px 3px;
      background-color: #1990ff;
    }
  }

  .circle {
    width: 20px;
    height: 20px;
    border: 4px solid var(--ant-primary-color);
    border-radius: 100%;
  }

  .line {
    width: 20px;
    height: 4px;
    background-color: var(--ant-primary-color);
  }
</style>
<style lang="less" scoped>
  .add {
    top: -28px;
    right: 0;
    color: var(--ant-primary-color);
    cursor: pointer;
  }

  .field-setting {
    padding: 8px 8px 8px 4px;
    border-radius: 4px;
    background: #f6f8fa;
  }

  .data-area {
    border: 1px solid #e0e3eb;
    border-radius: 4px;
  }

  .icon-drag {
    margin-top: -3px;
  }
  :deep(.ant-select-item-option-grouped) {
    padding-left: 12px;
  }
</style>
