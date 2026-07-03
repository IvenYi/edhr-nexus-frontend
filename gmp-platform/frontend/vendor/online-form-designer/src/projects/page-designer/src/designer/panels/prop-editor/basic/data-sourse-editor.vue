<template>
  <div class="source bg-[#F6F8FA] px8px pt8px pb12px">
    <div class="h28px ks-row-middle" v-if="propValue"> 自定义数据源 </div>
    <div class="h28px ks-row-middle" v-else>添加数据源</div>
    <div class="h28px mt4px">
      <div class="h100% bg-[#fff] px8px ks-row-middle data-area" @click="openEvent">
        <div class="ks-col flex overflow-hidden items-center">
          <!-- <a-button type="link" @click="handleFocusJS"> {{ propValue.name }}</a-button> -->
          <a class="ell" v-if="propValue" @click.prevent="handleFocusJS" :title="propValue.name">
            {{ propValue.name }}
          </a>
          <span v-else class="text-[#C6C6C6] text-[12px]">请输入</span>
        </div>
        <setting-outlined v-show="propValue" class="primary-gct ml8px" @click="openEvents" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="data-sourse-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useEventPicker } from '/@page-designer/designer/panels/widget/event-modules/functional';
  import { EventCategory } from '/@page-designer/enum';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { openLoEditorDrawer } from '/@/components/Lo';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const defProps = defineProps(props);
  const { openPickerEvent } = useEventPicker();
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { setLo, getLo, unbindLoByWidgetId } = useDesigner();
  const { mitt } = useMitt();
  const openEvent = () => {
    if (propValue.value) return;
    openEvents();
  };
  function openEvents() {
    openPickerEvent({
      eventType: 'datasource',
      params: ['queryData', 'formData'],
      hiddenEventCategory: [EventCategory.INNER],
    }).then((res) => {
      propValue.value = {
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
</script>

<style lang="less" scoped>
  .source {
    border-radius: 4px;
    color: #1a1d23;
    font-size: 12px;

    i {
      font-size: 12px !important;
    }
  }

  .data-area {
    border: 1px solid #e0e3eb;
    border-radius: 4px;
  }
</style>
