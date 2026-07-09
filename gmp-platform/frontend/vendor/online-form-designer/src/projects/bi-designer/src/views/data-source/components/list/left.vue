<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('title-container')]">
      <span :class="[ns.e('title')]">{{ $t('sys.pageDesigner.dataResource') }}</span>
      <a-dropdown>
        <a-button type="link" :class="[ns.e('add')]" @click.prevent>
          {{
            $t('sys.newSth', {
              sth: $t('sys.pageDesigner.dataResource'),
            })
          }}
          <DownOutlined />
        </a-button>
        <template #overlay>
          <a-menu @click="handleAddDatabase">
            <a-menu-item
              :key="item"
              v-for="item in Object.values(DataSourceType).filter((i) => i !== 'FILE')"
            >
              {{ t(`sys.bi.${item.toLowerCase()}Source`) }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div :class="[ns.e('content-container')]">
      <div :class="[ns.e('search-container')]">
        <a-input
          :class="[ns.e('search-input')]"
          v-model:value="searchKey"
          :placeholder="t('sys.searchText') + $t('sys.pageDesigner.dataResource')"
          allowClear
        >
          <template #prefix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
      </div>
      <div
        :class="[ns.be('database-list', 'item'), ns.is('active', activeKey === item.id)]"
        v-for="item in computedDatabaseList"
        :key="item.id"
        @click="handleSelect(item.id)"
      >
        <span>
          {{ item.aliasName }}
        </span>

        <a-dropdown>
          <EllipsisOutlined class="button-icon" />

          <template #overlay>
            <a-menu @click="({ key }) => handleDatabaseClick(key, item)">
              <a-menu-item :key="MenuClickEvent.EDIT">
                {{ t('sys.edit') }}
              </a-menu-item>
              <a-menu-item :key="MenuClickEvent.DELETE">
                {{ t('sys.delete') }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
    <add-modal @register="registerAdd" @ok="getDatabase" />
    <ApiSourceModal @register="registerApi" @ok="getDatabase" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch, computed, createVNode } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import {
    getDatabaseList,
    deleteDatabaseRemoveDatabase,
  } from '/@/apis/gct-platform/DatabaseController';
  import { useModal } from '/@/components/Modal';
  import AddModal from './data-source-modal.vue';
  import ApiSourceModal from './api-source-modal.vue';
  import { DataSourceType, MenuClickEvent } from '/@bi-designer/enum/database';
  import { Modal, message } from 'ant-design-vue';
  import { EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';

  const ns = useNamespace('data-source-layout');
  const { t } = useI18n();
  const usePathQuery = usePathQueryStore();

  const [registerAdd, { openModal }] = useModal();
  const [registerApi, { openModal: openApiModal }] = useModal();

  const emit = defineEmits(['changeDatasource', 'reset']);

  const searchKey = ref();

  const activeKey = ref();

  const databaseList = ref<any>([]);

  const computedDatabaseList = computed(() => {
    return searchKey.value
      ? databaseList.value.filter((item) => {
          return item.aliasName.includes(searchKey.value) || item.id === searchKey.value;
        })
      : databaseList.value;
  });

  const handleSelect = (id) => {
    activeKey.value = id;
  };

  const handleAddDatabase = ({ key }) => {
    if (key === DataSourceType.DATABASE) {
      openModal(true, {
        type: key,
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

  const handleParams = (data) => {
    if (data) {
      const params = Object.keys(data)?.map((key) => {
        return {
          key: key,
          value: data[key],
        };
      });
      return params;
    } else {
      return [{ key: undefined, value: undefined }];
    }
  };

  const handleDatabaseClick = (key, item) => {
    if (key === MenuClickEvent.EDIT) {
      if (item.type === DataSourceType.API) {
        const apiConfig = JSON.parse(item?.apiConfig || '{}');
        openApiModal(true, {
          type: item.type,
          appId: item.appId,
          aliasName: item.aliasName,
          url: item.url,
          id: item.id,
          ...apiConfig,
          header: handleParams(apiConfig.header),
          query: handleParams(apiConfig.query),
          body:
            apiConfig.bodyType == 'json' ? handleParams(undefined) : handleParams(apiConfig.body),
          bodyJson: apiConfig.bodyType == 'json' ? apiConfig.body : undefined,
        });
      } else {
        openModal(true, {
          ...item,
        });
      }
    } else if (key === MenuClickEvent.DELETE) {
      Modal.confirm({
        title: t('sys.sureToDelete'),
        icon: createVNode(ExclamationCircleOutlined),
        okText: t('sys.ok'),
        cancelText: t('sys.cancel'),
        onOk() {
          deleteDatabaseRemoveDatabase({ id: item.id }).then(() => {
            message.success(t('sys.delSuccess'));
            if (item.id === activeKey.value) {
              activeKey.value = '';
            }
            getDatabase();
          });
        },
        onCancel() {},
      });
    }
  };

  const getDatabase = async () => {
    const res = await getDatabaseList({ appId: usePathQuery.getAid() || '' });
    databaseList.value = res ?? [];
    if (databaseList.value?.length && !activeKey.value) {
      activeKey.value = databaseList.value?.[0].id;
      emit('reset', false);
    } else if (!databaseList.value?.length) {
      emit('reset', true);
    }
  };

  onMounted(async () => {
    await getDatabase();
  });

  watch(
    () => activeKey.value,
    (val) => {
      console.log(val, 'val');
      const type = databaseList.value?.find((i) => i.id == val)?.type;
      emit('changeDatasource', val, type);
    },
  );
</script>
<style lang="scss" scoped>
  $data-source-layout: (
    height: 100%,
    width: 222px,
  );

  @include b(data-source-layout) {
    @include set-component-css-var(data-source-layout, $data-source-layout);
    height: getCssVar(data-source-layout, height);
    width: getCssVar(data-source-layout, width);
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    border-right: 1px solid #eaedf1;

    :deep(.ant-dropdown-menu-item) {
      padding: 5px 20px;
    }

    @include e(search-container) {
      padding: 16px;
    }
    @include e(search-input) {
      line-height: 22px;
      padding-left: 16px;
    }

    @include e(title-container) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
    }

    @include e(title) {
      font-weight: 500;
      color: #000000;
    }

    @include e(add) {
      color: var(--ant-primary-color);
      line-height: 20px;
      padding: 0;
      height: 36px;
      > .icon-plus,
      > span {
        vertical-align: middle;
      }
      .icon-plus {
        font-size: 12px;
        margin-right: -4px;
      }
    }

    @include e(content-container) {
      flex-grow: 1;
      border-top: 1px solid #eaedf1;
      // padding: 8px 0 0;
      overflow: auto;
    }
  }

  @include b(data-source-layout-database-list) {
    @include e(item) {
      line-height: 24px;
      padding: 6px 16px;
      font-size: 14px;
      color: #6a717d;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .button-icon {
        display: none;
      }

      @include when(active) {
        background: #f7f8fa;

        .button-icon {
          display: block;
        }
      }
    }
  }
</style>
