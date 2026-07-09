<template>
  {{ console.log('user---', userList, tag, tagData) }}
  <div v-if="userList?.length" class="user-avator-list max-h474px overflow-y-auto px16px">
    <div
      v-for="(item, i) in userList"
      :key="i"
      class="user-item bg-[#FBFBFC] rounded-4px p8px ks-row-middle"
    >
      <img
        :src="'/minio/' + item.avatar || avatorDefault"
        width="24"
        height="24"
        style="border-radius: 50%"
      />
      <div class="text-[#474747] ml4px ks-col ell" :title="item.username">
        {{ item.username }}
      </div>
      <div class="text-[#8F8F8F] text-[12px]">{{ item.time }}</div>
    </div>
  </div>
  <div
    v-else
    class="px16px ks-row flex-wrap overflow-hidden max-h372px overflow-y-auto flex-wrap"
    style="row-gap: 8px; column-gap: 8px"
  >
    <div
      v-for="(item, i) in tagData"
      :key="i"
      class="bg-[#FBFBFC] rounded-4px p4px ks-row-middle gap-4px max-w100%"
    >
      <IconNext
        :value="returnIconExtra(item)?.icon"
        :size="16"
        :color="returnIconExtra(item)?.iconColor"
      />
      <div class="ell" :title="item.label">{{ item.label }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import avatorDefault from '/@/assets/images/avator-default.png';
  import { IconNext } from '/@/components/Icon';
  import { DYN_FORMAT_TYPE_ENUM } from '/@/components/SelectUserModal/utils';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { getUserGroupList } from '/@/apis/gct-apaas/UserGroupController';
  import { getDesignerCommonGetVisibleOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { computed, onBeforeMount, ref, watch } from 'vue';
  import { getOrgUserPickerTenantManagementUserListByIds } from '/@/apis/gct-platform/OrgUserPickerController';

  const props = defineProps<{
    userList?: Array<{ username: string; avatar: string; time: string }>;
    tag?: string;
    modelKey?: string;
  }>();

  const tagData = ref<any[]>([]);
  const options = ref<any[]>([]);

  onBeforeMount(async () => {
    if (props.tag) {
      options.value = await getAllData();
      const tags = props.tag?.split(',') || [];
      const userIds = filterUserIds(tags);
      if (userIds.length !== 0) {
        await getAllUsers(userIds);
      }
      tagData.value = options.value.filter((e) => tags.includes(e.value));
      console.log('props', props.tag, options, tagData);
    }
  });

  // tagLable中渲染的图标
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { value } = option;
    let icon, iconColor;
    if (value.includes('ROLE:')) {
      icon = 'icon-jiaose1';
      iconColor = '#00B2F8';
    } else if (value.includes('USER_GROUP:')) {
      icon = 'icon-yonghuzu1';
      iconColor = '#00D627';
    } else if (value.includes('ORG:')) {
      icon = 'icon-bumen1';
      iconColor = '#FF6937';
    } else if (value.includes('USER:')) {
      icon = 'icon-renyuan2';
      iconColor = '#2C71FC';
    } else {
      icon = 'icon-dongtai';
      iconColor = '#B445F5';
    }
    return { icon, iconColor, textColor: '' };
  };

  const getAllData = async () => {
    const [roles, userGroups, depts, fields] = await Promise.all([
      getRoleList(),
      getUserGroupList(),
      getDesignerCommonGetVisibleOrg(),
      getModelFieldsData(),
    ]);
    console.log('get--', roles, userGroups, depts, fields);
    const mapField = (fieldType, typeEnum) =>
      (fields?.[fieldType] ?? []).map((e) => ({
        value: `${typeEnum}:${e.key}`,
        label: e.name,
      }));

    const allData = [
      ...(roles ?? []).map((e) => ({
        ...e,
        value: `ROLE:${e.id}`,
        label: e.name,
        iconExtraProps: {},
      })),
      ...(userGroups ?? []).map((e) => ({
        ...e,
        value: `USER_GROUP:${e.id}`,
        label: e.name,
      })),
      ...(depts ?? []).map((e) => ({
        ...e,
        value: `ORG:${e.id}`,
        label: e.name,
      })),

      ...(depts ?? []).map((e) => ({
        ...e,
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL}:${e.id}`,
        label: e.name,
      })),

      ...mapField(FIELD_TYPE.USER, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS),
      ...mapField(FIELD_TYPE.USER, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER),
      ...mapField(FIELD_TYPE.USER_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS),
      ...mapField(FIELD_TYPE.USER_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER),
      ...mapField(FIELD_TYPE.ORG, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL),
      ...mapField(FIELD_TYPE.ORG_MULTI, DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL),

      {
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_MANAGER}:current`,
        label: '申请人直属上级',
      },
      {
        value: `${DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_DEPT_PRINCIPAL}:current`,
        label: '申请人部门负责人',
      },
    ];

    return allData;
  };

  const filterUserIds = (userIds) => {
    return userIds
      .filter((e) => e.includes(`USER:`) && !options.value.some((f) => f.value === e))
      .map((e) => e.replace(/USER:/, ''));
  };

  // 已选择的用户
  const getAllUsers = async (ids) => {
    const res = (
      (await getOrgUserPickerTenantManagementUserListByIds({ ids: ids.join(',') })) ?? []
    ).map((e) => {
      return { ...e, value: `USER:${e.id}`, label: e.fullname! };
    });
    options.value.push(...res);
  };

  /** 获取字段列表 */
  async function getModelFieldsData() {
    if (!props.modelKey) return [];
    const res = await getFieldMetaList({
      modelKey: props.modelKey,
    });

    if (res) {
      return res
        .filter((item) => {
          return (
            item.type === FIELD_TYPE.USER ||
            item.type === FIELD_TYPE.ORG ||
            item.type === FIELD_TYPE.USER_MULTI ||
            item.type === FIELD_TYPE.ORG_MULTI
          );
        })
        .reduce((acc, item) => {
          if (!acc[item.type!]) {
            acc[item.type!] = [];
          }
          acc[item.type!].push(item);
          return acc;
        }, {});
    }
  }
</script>
<style lang="less" scoped>
  .user-item {
    & + & {
      margin-top: 8px;
    }
  }
</style>
