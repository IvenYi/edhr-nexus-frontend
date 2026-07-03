<template>
  <div :class="ns.b('wrap')">
    <div :class="ns.b('head')">
      <a-input
        v-model:value="searchKey"
        ref="inputRef"
        :class="ns.be('head', 'search')"
        placeholder="搜索关联模型名称"
        allow-clear
        @pressEnter="handleSearch"
      >
        <template #prefix>
          <i class="iconfont icon-sousuo1"></i>
        </template>
      </a-input>

      <a-button type="primary" :class="ns.be('head', 'btn')" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        {{ t('sys.new') }}
      </a-button>
    </div>
    <div :class="ns.b('container')">
      <div v-if="searchList.length" :class="ns.be('container', 'list')">
        <div v-for="item in searchList" :key="item.id" :class="ns.be('container', 'list-item')">
          <PermScopeConfig
            :key="item.id + '_view'"
            :mode="'view'"
            :bindModelKey="item.modelKey"
            :bindModelName="item.modelName"
            :permissionEnabled="item.permissionEnabled"
            :items="item.linkageItems"
          />
          <a-dropdown placement="bottomRight">
            <div :class="['more-icon', 'ml-4px', 'px-5px', 'h-32px']"> ... </div>
            <template #overlay>
              <a-menu @click="({ key }) => handleMenuClick(item, key)">
                <a-menu-item key="edit">{{ t('sys.edit') }}</a-menu-item>
                <a-menu-item key="delete" style="color: #f54547">{{ t('sys.delete') }}</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
      <div v-else :class="ns.be('container', 'empty')">
        <div :class="ns.be('container', 'empty-box')">
          <img :src="picNodataBig" alt="暂无数据" />
          <p class="mt-16px">{{ t('sys.appDesigner.noData') }}</p>
        </div>
      </div>
    </div>
  </div>
  <perm-scope-model @register="register" @ok="handleOk" />
</template>

<script setup lang="ts" name="perm-scope">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useNamespace } from '@gct/runtime';
  import picNodataBig from '/@app-designer/assets/image/pic_nodata_big.png';
  import permScopeModel from './components/perm-scope-model.vue';
  import {
    getModelPermissionRelationList,
    deleteModelPermissionRelation,
  } from '/@/apis/gct-apaas/ModelPermissionRelationController';
  import { message, Modal } from 'ant-design-vue';
  import { PermScopeConfig } from './components/perm-scope-config/perm-scope-config';
  import { linkageItem } from './components/perm-scope-config/type';

  const { t } = useI18n();
  const ns = useNamespace('perm-scope');
  const [register, { openModal }] = useModal();

  const searchKey = ref('');
  const permConfigList = ref<any[]>([]);
  const searchList = ref<any[]>([]);

  // const searchList = computed(() => {
  //   if (!searchKey.value?.trim()) {
  //     return permConfigList.value;
  //   }
  //   return permConfigList.value?.filter((i) => i.modelName.indexOf(searchKey.value?.trim()) > -1);
  // });

  const handleSearch = () => {
    if (!searchKey.value?.trim()) {
      searchList.value = permConfigList.value;
    }
    searchList.value = permConfigList.value?.filter(
      (i) => i.modelName?.toLowerCase().indexOf(searchKey.value?.trim()?.toLowerCase()) > -1,
    );
  };

  const handleAdd = () => {
    openModal(true, {
      isEdit: false,
    });
  };

  const handleEdit = (record) => {
    openModal(true, {
      isEdit: true,
      record,
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('sys.sureToDo'),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        await deleteModelPermissionRelation({ id: record.id });
        message.success(t('sys.delSuccess'));
        getList();
      },
      onCancel: () => {},
    });
  };

  const getList = async () => {
    const res = (await getModelPermissionRelationList()) || [];
    permConfigList.value = res?.map((item) => {
      return {
        ...item,
        linkageItems: item.configJson?.map((i) => {
          return {
            ...i,
            value: i.fieldKey,
            label: i.fieldName,
          } as linkageItem;
        }),
      };
    });
    handleSearch();
  };

  const handleOk = async (data) => {
    console.log('handleOk---------', data);
    permConfigList.value = [];
    getList();
  };

  const handleMenuClick = (item, key) => {
    if (key === 'edit') {
      handleEdit(item);
    } else if (key === 'delete') {
      handleDelete(item);
    }
  };

  watch(
    () => searchKey.value,
    (val) => {
      if (!val) {
        handleSearch();
      }
    },
  );

  onMounted(async () => {
    getList();
  });
</script>

<style lang="scss" scoped>
  @include b(perm-scope-wrap) {
    padding-top: 12px;
    height: 100%;
  }
  @include b(perm-scope-head) {
    display: flex;
    justify-content: space-between;
    @include e(search) {
      width: 220px;
    }
  }
  :deep(.ant-input-affix-wrapper) {
    padding: 2px 11px;
  }
  @include b(perm-scope-container) {
    padding-top: 16px;
    height: calc(100% - 44px);
    @include e(list) {
      overflow-y: auto;
      height: calc(100% - 10px);
      @include e(list-item) {
        padding-top: 32px;
        padding-bottom: 8px;
        position: relative;
        background: #f6f8fa;
        border-radius: 4px;
        margin-bottom: 12px;
        &:last-child {
          margin-bottom: 0;
        }
        .more-icon {
          position: absolute;
          top: 4px;
          right: 12px;
          cursor: pointer;
          width: 24px;
          height: 24px;
          line-height: 18px;
          text-align: center;
          border-radius: 4px;
          color: #8b8b8b;
          &:hover {
            color: #1a1d23;
            background: #e8eaee;
          }
        }
      }
      @include e(empty) {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
      }
      @include e(empty-box) {
        text-align: center;
        color: #a6a6a6;
        img {
          width: 140px;
        }
      }
    }
  }
</style>
