<template>
  <div class="gct-bi-data-source-empty">
    <a-empty
      :image="emptyPng"
      :image-style="{
        height: '120px',
      }"
    >
      <template #description>
        <span class="gct-bi-data-source-empty__description">
          还没有创建过数据源，您可以立即开始创建
        </span>
      </template>
      <a-dropdown>
        <a-button type="primary" @click.prevent>
          {{
            t('sys.newSth', {
              sth: t('sys.integration.dataSource'),
            })
          }}
          <DownOutlined />
        </a-button>
        <template #overlay>
          <a-menu @click="onClick">
            <a-menu-item
              :key="item"
              v-for="item in Object.values(DataSourceType).filter((i) => i !== 'FILE')"
            >
              {{ t(`sys.bi.${item.toLowerCase()}Source`) }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </a-empty>

    <a-divider class="gct-bi-data-source-empty__divider">{{ t('sys.bi.quickCreate') }}</a-divider>

    <div class="gct-quick-create">
      <div
        class="gct-quick-create-item"
        v-for="item in Object.values(DataBaseType)"
        :key="item"
        @click="handleQuickCreate(item)"
      >
        {{ t(`sys.integration.db.${item}`) }}
      </div>
    </div>
    <add-modal @register="registerAdd" @ok="handleOk" />
    <ApiSourceModal @register="registerApi" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts" name="BiDataSourceEmpty">
  import emptyPng from '/@bi-designer/assets/empty.png';
  import type { MenuProps } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import AddModal from './list/data-source-modal.vue';
  import { DataBaseType, DataSourceType } from '/@bi-designer/enum/database';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { message } from 'ant-design-vue';
  import ApiSourceModal from './list/api-source-modal.vue';

  const emit = defineEmits(['reset']);

  const { t } = useI18n();

  const [registerAdd, { openModal }] = useModal();
  const [registerApi, { openModal: openApiModal }] = useModal();

  const usePathQuery = usePathQueryStore();

  const onClick: MenuProps['onClick'] = ({ key }) => {
    if (key === DataSourceType.DATABASE) {
      openModal(true, {
        type: 'DB',
        appId: usePathQuery.getAid() || '',
        dbType: undefined,
        aliasName: undefined,
        dbName: undefined,
        url: undefined,
        username: undefined,
        password: undefined,
        maxActive: undefined,
        poolSize: undefined,
        description: undefined,
      });
    } else if (key === DataSourceType.APPLICATION) {
      openModal(true, {
        type: key,
        appId: usePathQuery.getAid() || '',
        aliasName: undefined,
        dsAppId: undefined,
        env: undefined,
        description: undefined,
      });
    } else if (key === DataSourceType.API) {
      openApiModal(true, {
        type: key,
        appId: usePathQuery.getAid() || '',
        aliasName: undefined,
        url: undefined,
        requestType: 'get',
        connType: 0,
        ttl: undefined,
        connectorId: undefined,
        header: [{ key: undefined, value: undefined }],
        query: [{ key: undefined, value: undefined }],
        body: [{ key: undefined, value: undefined }],
        bodyJson: undefined,
        bodyType: 'json',
      });
    }
  };

  const handleQuickCreate = (dbType: DataBaseType) => {
    openModal(true, {
      type: 'DB',
      appId: usePathQuery.getAid() || '',
      dbType,
      aliasName: undefined,
      dbName: undefined,
      url: undefined,
      username: undefined,
      password: undefined,
      maxActive: undefined,
      poolSize: undefined,
      description: undefined,
    });
  };

  const handleOk = () => {
    message.success(t('sys.createSuccess'));
    emit('reset', false);
  };
</script>
<style lang="scss" scoped>
  .gct-bi-data-source-empty {
    padding: 200px 48px 0;
    height: 100%;
    background: #fff;
    margin: 16px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;

    &__description {
      font-weight: 400;
      font-size: 12px;
      color: #8f8f8f;
    }

    &__divider {
      margin: 40px 0 24px;
      font-weight: 400;
      font-size: 14px;
      color: #666666;
    }

    .gct-quick-create {
      display: flex;
      flex-wrap: wrap;
      padding: 0 110px;
      gap: 20px;
      align-items: center;
      justify-content: center;

      .gct-quick-create-item {
        width: calc(25% - 20px);
        max-width: 205px;
        height: 48px;
        border: 1px solid #e8e8e8;
        background-color: #fff;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 400;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
</style>
