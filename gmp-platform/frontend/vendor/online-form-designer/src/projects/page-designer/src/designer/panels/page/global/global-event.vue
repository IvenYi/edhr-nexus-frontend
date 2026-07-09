<template>
  <div class="page-event-wrap">
    <a-dropdown>
      <template #overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item
            v-for="item in pageEvent"
            :key="item.name"
            :disabled="!isEmpty(pageJson.globalEvents[item.name])"
          >
            <div style="text-align: center">{{ t(`${item.title}`) }}</div>
          </a-menu-item>
        </a-menu>
      </template>
      <a-button type="primary" style="width: 200px">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.pageDesigner.newEvents') }}
        <down-outlined />
      </a-button>
    </a-dropdown>
    <div style="padding: 0 12px; width: 100%">
      <template v-for="eventType in Object.keys(pageJson.globalEvents)" :key="eventType">
        <a-card
          size="small"
          :title="t(`sys.pageDesigner.${eventType}`)"
          style="width: 100%; margin-top: 12px"
        >
          <template #extra>
            <delete-outlined @click="handleDelEvent(eventType)" class="primary-gct" />
          </template>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <a-button
              type="link"
              @click="handleEditEvent(eventType, pageJson.globalEvents[eventType])"
            >
              {{ eventType }}
            </a-button>
            <setting-outlined
              @click="handleEditEvent(eventType, pageJson.globalEvents[eventType])"
              class="primary-gct"
            />
          </div>
        </a-card>
      </template>
    </div>
  </div>
  <global-event-modal @register="register" @ok="handleOk" />
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useGlobal } from '/@page-designer/hooks/useGlobal';
  import { useModal } from '/@/components/Modal';
  import { isEmpty } from 'lodash-es';
  import GlobalEventModal from '../modals/global-event-modal.vue';
  import { buildRunJs } from '/@/utils/transform-js';

  const { pageJson } = useDesigner();
  const { queryInfo, gEvent, updateInfo } = useGlobal();
  const { t } = useI18n();
  const [register, { openModal, closeModal }] = useModal();
  const pageEvent = [
    {
      name: 'pageMounted',
      title: 'sys.pageDesigner.pageMounted',
    },
    {
      name: 'pageActivated',
      title: 'sys.pageDesigner.pageActivated',
    },
    {
      name: 'pageDestroyed',
      title: 'sys.pageDesigner.pageDestroyed',
    },
  ];
  const handleMenuClick = async (e) => {
    const event = gEvent.value.find((event) => event.key === e.key);
    pageJson.globalEvents[e.key] = event!.id;
  };
  const handleDelEvent = (type) => {
    delete pageJson.globalEvents[type];
  };
  const handleEditEvent = async (eventType, id) => {
    const data = await queryInfo(id);
    let code = '';
    if (data?.length! > 0) {
      try {
        code = data![0].configJson ? JSON.parse(data![0].configJson).js : '';
      } catch (error) {
        code = data![0].configJson || '';
      }
    }
    openModal(true, {
      eventType,
      code,
    });
  };
  const handleOk = async (data) => {
    await updateInfo(pageJson.globalEvents[data.eventType], {
      configJson: JSON.stringify({ js: data.code, runJs: buildRunJs(data.code, false) }),
    });
    closeModal();
  };
</script>

<style lang="less" scoped>
  .page-event-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
