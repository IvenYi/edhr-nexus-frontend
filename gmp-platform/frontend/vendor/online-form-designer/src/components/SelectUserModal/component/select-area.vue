<template>
  <div class="select-area-wrapper">
    <Scrollbar class="px-12px py-12px">
      <template v-if="users.length">
        <div class="select-title">{{ $t('sys.user') }}</div>
        <div class="select-content">
          <div class="select-content-item" v-for="useItem of users" :key="useItem.formatId">
            <span class="gct-text-overflow" :title="useItem.name">{{ useItem.fullname }}</span>
            <CloseOutlined
              v-if="!readonly"
              class="ml-6px icon-close primary-gct-hover"
              @click="onClose('users', useItem)"
            />
          </div>
        </div>
      </template>

      <template v-if="orgs.length">
        <div class="select-title">{{ $t('sys.pageDesigner.dept') }}</div>
        <div class="select-content">
          <div class="select-content-item" v-for="orgItem of orgs" :key="orgItem.formatId">
            <span class="gct-text-overflow" :title="orgItem.name">{{ orgItem.name }}</span>
            <CloseOutlined
              v-if="!readonly"
              class="ml-6px icon-close primary-gct-hover"
              @click="onClose('orgs', orgItem)"
            />
          </div>
        </div>
      </template>

      <template v-if="roles.length">
        <div class="select-title">{{ $t('sys.role') }}</div>
        <div class="select-content">
          <div class="select-content-item" v-for="roleItem of roles" :key="roleItem.formatId">
            <span class="gct-text-overflow" :title="roleItem.name">{{ roleItem.name }}</span>
            <CloseOutlined
              v-if="!readonly"
              class="ml-6px icon-close primary-gct-hover"
              @click="onClose('roles', roleItem)"
            />
          </div>
        </div>
      </template>

      <template v-if="ugs.length">
        <div class="select-title">{{ $t('sys.userGroup') }}</div>
        <div class="select-content">
          <div class="select-content-item" v-for="ugItem of ugs" :key="ugItem.formatId">
            <span class="gct-text-overflow" :title="ugItem.name">{{ ugItem.name }}</span>
            <CloseOutlined
              v-if="!readonly"
              class="ml-6px icon-close primary-gct-hover"
              @click="onClose('userGroups', ugItem)"
            />
          </div>
        </div>
      </template>
      <template v-if="dyns.length">
        <div class="select-title">{{ $t('sys.pageDesigner.dynamic') }}</div>
        <div class="select-content">
          <div class="select-content-item" v-for="dynsItem of dyns" :key="dynsItem.formatId">
            <span
              class="gct-text-overflow"
              :title="showDynamicTitle(dynsItem.formatId, dynsItem.name)"
              >{{ showDynamicTitle(dynsItem.formatId, dynsItem.name) }}</span
            >
            <CloseOutlined
              v-if="!readonly"
              class="ml-6px icon-close primary-gct-hover"
              @click="onClose('dynamics', dynsItem)"
            />
          </div>
        </div>
      </template>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts" name="waiting-area-select-area">
  import { computed } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { filterDynFormatTypes, showDynamicTitle } from '../utils/index';

  const props = defineProps<{
    selectMap: any;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update-select-value']);

  const users = computed<any>({
    get() {
      return props.selectMap.users ?? [];
    },
    set(value: string) {},
  });

  const orgs = computed<any>({
    get() {
      return props.selectMap.orgs ?? [];
    },
    set(value: string) {},
  });

  const roles = computed<any>({
    get() {
      return props.selectMap.roles ?? [];
    },
    set(value: string) {},
  });

  const ugs = computed<any>({
    get() {
      return props.selectMap.userGroups ?? [];
    },
    set(value: string) {},
  });

  const dyns = computed<any>({
    get() {
      return (props.selectMap.dynamics ?? []).filter(
        (item) => !filterDynFormatTypes.includes(item.formatId),
      );
    },
    set(value: string) {},
  });

  function onClose(key, item) {
    emit('update-select-value', key, item);
  }
</script>

<style scoped lang="less">
  .select-area-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .select-title {
      margin-top: 8px;
      color: #8f8f8f;
      font-size: 12px;
      line-height: 18px;

      &:first-child {
        margin-top: 0;
      }
    }

    .select-content {
      display: grid;
      grid-gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(66px, 1fr));
      padding: 8px 0;

      .select-content-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px;
        border-radius: 4px;
        background: #f7f8fa;
        color: #474747;
        font-size: 12px;
        line-height: 18px;

        .anticon.anticon-close {
          color: #797a7d;
          cursor: pointer;
        }
      }
    }
  }
</style>
