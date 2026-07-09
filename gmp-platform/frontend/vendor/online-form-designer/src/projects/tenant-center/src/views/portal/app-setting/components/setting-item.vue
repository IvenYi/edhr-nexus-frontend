<template>
  <div class="flex">
    <span class="mr-12px flex-none">{{ title }}</span>
    <div class="flex">
      <div class="setting-item" v-for="item in items" :key="item.id">
        <i
          v-if="
            [SettingItemTypeEnum.ADMIN, SettingItemTypeEnum.VISIBILITY_USER].includes(item.type as SettingItemTypeEnum)
          "
          class="iconfont icon-a-Accountnumber"
        ></i>
        <i v-else class="iconfont icon-file"></i>
        {{ item.name }}
        <close-outlined v-if="!disabled" @click="handleDelete(item)" />
      </div>
      <a-button v-if="!disabled" size="small" type="primary" ghost @click="handleAdd">
        <plus-outlined /> 添加</a-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue';
  import type { AppSettingDtoArray } from '/@/apis/gct-platform/model';
  import { postAppSettingSaveSettingBatch } from '/@/apis/gct-platform/AppSettingController';
  import { SettingModule, SettingItemTypeEnum } from '../types';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { useModalPicker } from '/@/components/UserPick';

  const { openPickerByUser, openPicker, openPickerByDept } = useModalPicker();
  const props = defineProps<{
    disabled: boolean;
    module: SettingModule;
    type: SettingItemTypeEnum | SettingItemTypeEnum[];
    title: string;
    items: AppSettingDtoArray[];
  }>();

  const emit = defineEmits(['ok']);

  const handleTagDelete = inject('handleTagDelete') as (id) => void;
  const appId = inject('appId') as string;

  const handleDelete = (item) => {
    handleTagDelete(item.id);
  };

  const handleAdd = async () => {
    if (props.module === SettingModule.ADMIN) {
      openPickerByUser({
        userIds: props.items.map((item) => item.relationId!),
        callback: async (value) => {
          await postAppSettingSaveSettingBatch(
            value.map((item) => ({
              appId,
              relationId: item,
              type: props.type as SettingItemTypeEnum,
            })),
          );
          emit('ok');
        },
      });
    } else if (props.module === SettingModule.APP_ACCESS) {
      openPicker({
        userIds: props.items
          .filter((i) => i.type === SettingItemTypeEnum.VISIBILITY_USER)
          .map((item) => item.relationId!),
        deptIds: props.items
          .filter((i) => i.type === SettingItemTypeEnum.VISIBILITY_ORGANIZATION)
          .map((item) => item.relationId!),
        callback: async (value) => {
          const { deptIds, userIds } = value;
          const userArr = userIds.map((item) => ({
            appId,
            relationId: item,
            type: props.type[0] as SettingItemTypeEnum,
          }));
          const deptArr = deptIds.map((item) => ({
            appId,
            relationId: item,
            type: props.type[1] as SettingItemTypeEnum,
          }));
          await postAppSettingSaveSettingBatch([...userArr, ...deptArr]);
          emit('ok');
        },
      });
    } else if (props.module === SettingModule.APP_INNER_ORG) {
      openPickerByDept({
        deptIds: props.items.map((item) => item.relationId!),
        callback: async (dept) => {
          const deptArr = dept.map((item) => ({
            appId,
            relationId: item,
            type: props.type as SettingItemTypeEnum,
          }));
          await postAppSettingSaveSettingBatch([...deptArr]);
          emit('ok');
        },
      });
    }
  };
</script>

<style lang="less">
  .setting-item {
    display: inline-flex;
    align-items: center;
    height: 24px;
    margin-right: 6px;
    padding: 0 8px;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    opacity: 1;
    line-height: 1;

    .iconfont {
      margin-right: 3px;
    }

    .icon-a-Accountnumber {
      color: #bfbfbf;
    }

    .icon-file {
      color: #fcc12b;
    }

    svg {
      margin-left: 3px;
      color: #bfbfbf;
      font-size: 12px;
      cursor: pointer;
    }
  }

  .ant-btn {
    border-radius: 2px;
  }
</style>
