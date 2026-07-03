<template>
  <events-modal
    @register="eventRegister"
    @ok="handleEventOk"
    @afterClose="afterClose"
    :hiddenEventCategory="[EventCategory.INNER, EventCategory.LO]"
  />
</template>

<script setup lang="ts">
  import { useModal } from '/@/components/Modal';
  import EventsModal from './events-modal.vue';
  import { ref, reactive, watchEffect, computed } from 'vue';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { EventCategory } from '/@page-designer/enum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { destroyVm } = defineProps<{
    destroyVm: Function;
  }>();
  const hiddenEventCategory = ref<EventCategory[]>([]);
  const { mitt } = useMitt();
  const { pageJson } = useDesigner();
  const [eventRegister, { openModal, closeModal }] = useModal();
  const evenData = reactive({
    eventType: '',
    params: [],
  });
  const handleEventOk = (eventData) => {
    initOrUpdateEvents(eventData, [...evenData.params, 'extParams']);
  };
  var eventCallback: (data: any) => void;
  /**添加或者修改组件中的events */
  const initOrUpdateEvents = (eventData, params) => {
    const { event, eventCategory } = eventData;
    //如果是自定义动作JS
    if (eventCategory === EventCategory.JS) {
      //如果是新建函数
      mitt.emit('new-event', { methodName: event.methodName, params });
      mitt.emit('get-schema-code');
    } else if (event.eventCategory === EventCategory.LO) {
      //如果是新建函数
      if (event.isNew) {
        mitt.emit('new-event', { methodName: event.methodName, params });
        mitt.emit('get-schema-code');
      }
    } else {
      //TODO:如果是内置动作
    }
    closeModal();
    eventCallback({ event, eventCategory });
  };

  const handleOpenEvent = (e, callback) => {
    evenData.eventType = e.eventType;
    evenData.params = e.params;
    hiddenEventCategory.value = e.hiddenEventCategory;
    openModal(true, { eventType: e.eventType });
    eventCallback = callback;
  };
  function afterClose() {
    destroyVm();
  }
  defineExpose({
    handleOpenEvent,
  });
</script>
<style scoped lang="less"></style>
