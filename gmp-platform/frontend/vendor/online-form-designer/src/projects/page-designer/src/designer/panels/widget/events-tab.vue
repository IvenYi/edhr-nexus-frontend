<template>
  <div class="event-wrap">
    <a-collapse v-model:activeKey="activeKey" :bordered="false" expandIconPosition="right" ghost>
      <template #expandIcon>
        <down-outlined class="collapse-icon-down" />
      </template>
      <a-collapse-panel key="event" :header="t(`sys.pageDesigner.event`)">
        <a-dropdown>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item
                v-for="item in eventOptions"
                :key="item.name"
                :disabled="Object.keys(selectedEvents).includes(item.name)"
              >
                <div style="text-align: center">{{ t(`${item.title}`) }}</div>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button style="width: 224px">
            {{ t('sys.pageDesigner.newEvents') }}
            <down-outlined />
          </a-button>
        </a-dropdown>
        <template v-for="event in Object.keys(selectedEvents)" :key="event">
          <a-card
            size="small"
            :title="t(`sys.pageDesigner.${event}`)"
            style="width: 100%; margin-top: 12px"
          >
            <template #extra>
              <a-tooltip placement="top">
                <template #title>{{ $t('sys.edit') }}</template>
                <edit-outlined @click="handleEditEvent(event)" class="primary-gct" />
              </a-tooltip>
              <a-popconfirm
                placement="topLeft"
                :title="$t('sys.pageDesigner.areYouSureToDelete')"
                :okText="t('sys.okText')"
                @confirm="handleDelEvent(event)"
              >
                <a-tooltip placement="top">
                  <template #title>{{ $t('sys.delete') }}</template>
                  <delete-outlined class="primary-gct" />
                </a-tooltip>
              </a-popconfirm>
            </template>
            <div style="display: flex; align-items: center; justify-content: space-between">
              <div v-if="Array.isArray(selectedEvents[event])">
                <div v-for="item in selectedEvents[event]" style="color: #8b8d91">{{
                  t((item as LowCodeWidget.InnerEvents).title)
                }}</div>
              </div>
              <a
                v-else
                class="mr-4px flex ks-row-middle overflow-hidden h-32px text-12px"
                @click.prevent="handleFocusJS(selectedEvents[event])"
              >
                <span class="ell" :title="(selectedEvents[event] as LowCodeWidget.JsEvent).name">
                  {{ (selectedEvents[event] as LowCodeWidget.JsEvent).name }}
                </span>
              </a>
            </div>
          </a-card>
        </template>
      </a-collapse-panel>
    </a-collapse>

    <events-modal @register="eventRegister" @ok="handleEventOk" />
  </div>
</template>

<script setup lang="ts">
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { DownOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import EventsModal from './event-modules/events-modal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Ref, inject, ref, computed } from 'vue';
  import { EventCategory } from '/@page-designer/enum';
  import { cloneDeep } from 'lodash-es';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { openLoEditorDrawer } from '/@/components/Lo';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { mitt } = useMitt();
  const { t } = useI18n();
  const { selectedAllEvents, selectedEvents, selectedRef } = useSelectedWidget();
  const [eventRegister, { openModal, closeModal }] = useModal();
  const { setLo, getLo, unbindLoByWidgetId } = useDesigner();
  const isWidgetItem: Ref<boolean> = inject('isWidgetItem') || ref(false);
  const eventOptions = computed(() => {
    return selectedAllEvents.value.filter((i) => !i.hidden || !i.hidden(selectedRef.value));
  });
  const eventType = ref<string>('');
  const activeKey = ref(['event']);
  const handleMenuClick = (e) => {
    eventType.value = e.key;
    openModal(true, { eventType: eventType.value });
  };
  const handleEventOk = (event) => {
    initOrUpdateEvents(event);
  };
  /**添加或者修改组件中的events */
  const initOrUpdateEvents = (eventData) => {
    const { event, eventCategory } = eventData;
    //如果是自定义动作JS
    if (eventCategory === EventCategory.JS) {
      //如果是新建函数
      if (event.isNew) {
        const params = initParmas(eventType.value);
        mitt.emit('new-event', { methodName: event.methodName, params });
        mitt.emit('get-schema-code');
      }
      selectedEvents.value = {
        ...selectedEvents.value,
        [eventType.value]: { name: event.methodName, extraParams: event.extParams },
      };
    } else if (eventCategory === EventCategory.LO) {
      //如果是新建函数
      if (event.isNew) {
        const eventnode = selectedAllEvents.value.find((d) => {
          return eventType.value === d.name;
        });
        setLo(event.methodName, {
          name: event.methodName,
          title: event.methodTitle,
          runtimeJs: `function ${event.methodName}() {}`,
          bindTo: selectedRef.value.id,
          parameter: [...eventnode?.params, 'extraParams'],
        });
      } else {
        setLo(event.methodName, {
          title: event.methodTitle,
          bindTo: selectedRef.value.id,
        });
      }
      selectedEvents.value = {
        ...selectedEvents.value,
        [eventType.value]: {
          type: EventCategory.LO,
          name: event.methodName,
          extraParams: event.extParams,
        },
      };
    } else {
      //如果是内置动作
      selectedEvents.value = {
        ...selectedEvents.value,
        [eventType.value]: event,
      };
    }
    closeModal();
  };
  /**
   * 根据selectedAllEvents动态生成参数
   */
  const initParmas = (eventType) => {
    const event = selectedAllEvents.value.find((d) => {
      return eventType === d.name;
    });
    return `${event?.params.join(',')}${event?.params.length ? ',' : ''}${
      isWidgetItem.value ? 'rowData,index,' : ''
    }extParams`;
  };

  const handleEditEvent = (eType) => {
    eventType.value = eType;
    const event = selectedEvents.value[eType];
    if (Array.isArray(event)) {
      openModal(true, { eventCategory: EventCategory.INNER, event, isEdit: true });
    } else if (event.type === EventCategory.LO) {
      const { extraParams, name } = event;
      openModal(true, {
        eventCategory: EventCategory.LO,
        eventType: eType,
        name,
        extraParams,
        isEdit: true,
      });
    } else {
      const { extraParams, name } = event;
      openModal(true, {
        eventCategory: EventCategory.JS,
        eventType: eType,
        name,
        extraParams,
        isEdit: true,
      });
    }
  };
  const handleDelEvent = (eventType) => {
    const newEvents = cloneDeep(selectedEvents.value);
    if (newEvents[eventType].type === EventCategory.LO) {
      unbindLoByWidgetId(selectedRef.value.id!);
    }
    delete newEvents[eventType];
    selectedEvents.value = newEvents;
  };
  /**foucs在JS编辑器里面的代码 */
  const handleFocusJS = (event: LowCodeWidget.JsEvent | LowCodeWidget.LoInterface) => {
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
  .event-wrap {
    position: absolute;
    inset: 37px 0 0;
    overflow: hidden auto;
  }

  .collapse-icon-down {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
    font-size: 16px !important;
  }

  .ant-collapse-item-active {
    .collapse-icon-down {
      transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
    }
  }

  :deep(.ant-collapse-item:first-child .ant-collapse-header) {
    border-top: 0;
  }

  :deep(.ant-collapse-header) {
    padding: 8px 12px !important;
    border-top: 1px solid @gct-modal-border-color;
    background-color: #f2f4f7;
    color: #212528 !important;
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.ant-collapse-content-box) {
    padding: 12px !important;
    padding-bottom: 4px !important;
  }

  .primary-gct {
    margin-left: 8px;
    color: #9b9c9e !important;

    &:hover {
      color: var(--ant-primary-color) !important;
    }
  }

  :deep(.ant-card-head) {
    background-color: #f2f4f7;
  }
</style>
