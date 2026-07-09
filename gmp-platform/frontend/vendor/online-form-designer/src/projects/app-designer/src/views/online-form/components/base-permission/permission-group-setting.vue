<template>
  <div class="permission-group-setting">
    <div>
      <a-button type="primary" @click="addNew">
        {{ $t('sys.edhr.addPermissionGroup') }}
      </a-button>
    </div>
    <PermissionItem
      class="mt-12px"
      v-for="(item, index) in groupList"
      :key="index"
      :value="item"
      :validateItem="() => validateItems(item, index)"
      @change="handleChangeData"
      @delete="onDelete(index)"
      @copy="onCopy(index)"
    />
  </div>
</template>

<script lang="ts" setup name="permission-group-setting">
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import { cloneDeep, omit } from 'lodash-es';
  import { ref, toRaw, watch } from 'vue';
  import { FormTmpPermissionConfig } from './type';
  import PermissionItem from './permission-item.vue';
  import { now } from './util';
  import { message } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      templateInfo: OnlineFormTmplResponse;
      isChanged: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:isChanged', isChanged: boolean): void;
  }>();

  /** 权限分组列表 */
  const groupList = ref<FormTmpPermissionConfig[]>([]);

  watch(
    () => props.templateInfo.permissionConfig,
    async () => {
      groupList.value = props.templateInfo.permissionConfig
        ? JSON.parse(props.templateInfo.permissionConfig)
        : [];
    },
    { immediate: true, deep: true },
  );

  function sortList(list) {
    return list.sort((a, b) => {
      // 先比较权限等级，再比较修改时间
      if (a.permissionLevel !== b.permissionLevel) {
        return b.permissionLevel - a.permissionLevel;
      }
      return (
        (b.modifyTime ? new Date(b.modifyTime).getTime() : 0) -
        (a.modifyTime ? new Date(a.modifyTime).getTime() : 0)
      );
    });
  }

  const handleChangeData = () => {
    groupList.value = sortList(groupList.value);
    emit('update:isChanged', true);
  };
  /** 新增权限组 */
  const addNew = () => {
    groupList.value.unshift({
      name: '',
      permissionLevel: 0,
      desc: '',
      memberPermissionSelect: 0,
      memberPermission: undefined,
      fieldPermissionSelect: 0,
      fieldPermission: undefined,
      modifyTime: now(),
      _isEditing: true,
      _isNew: true,
    });
    handleChangeData();
  };
  /** 删除权限组 */
  const onDelete = (index: number) => {
    groupList.value.splice(index, 1);
    handleChangeData();
  };

  /** 复制权限组 */
  const onCopy = (index: number) => {
    const item = cloneDeep(toRaw(groupList.value[index]));
    item.name = `${item.name}-copy`;
    item.modifyTime = now();
    groupList.value.splice(index + 1, 0, item);
    message.success($t('sys.pageDesigner.copySuccess'));
    handleChangeData();
  };

  const hasEdit = () => {
    return groupList.value.some((i) => i._isEditing);
  };

  const validateItems = (item, idx) => {
    return !groupList.value.some((e, i) => e.name === item.name && i !== idx);
  };

  const getSaveData = () => {
    return JSON.stringify(toRaw(groupList.value).map((i) => omit(i, '_isEditing')));
  };

  defineExpose({ getSaveData, hasEdit });
</script>

<style lang="scss" scoped>
  .permission-group-setting {
  }
</style>
