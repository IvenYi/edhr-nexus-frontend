<template>
  <div class="select-main">
    <div class="pl12px pr12px">
      <a-input v-model:value="searchValue" :placeholder="t('sys.searchText')" />
    </div>
    <div class="user-area">
      <div
        v-for="(item, index) in tobeSelectOptions"
        :key="index"
        class="mb-8px pl-8px pt-4px pb-4px w100%"
        :class="selectedKeys.includes(item.id) ? 'user-select' : ''"
      >
        <div class="item flex items-center w100%" @click="selectUser(item)">
          <Avatar :size="30" style="margin: 0 8px" :src="transformUrl(item.avatar)" />
          <div class="flex item-info">
            <div class="flex name-flex w100%">
              <div
                v-if="item.highlightName"
                class="content-item-title gct-text-overflow ks-col"
                :title="item.fullname"
                :innerHTML="item.highlightName"
              ></div>
              <div
                v-else
                :title="item.fullname"
                class="content-item-title gct-text-overflow ks-col"
              >
                {{ item.fullname }}
              </div>
              <div class="ell user-name">{{ item.username }}</div>
            </div>
            <span class="dept ell">{{ item.orgNames }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="user">
  import { computed, onMounted, ref } from 'vue';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getDesignerCommonGetVisibleOrg,
    getDesignerCommonGetVisibleUserAndVisibleOrgUser,
  } from '/@/apis/gct-apaas/DesignerCommonController';
  import { PickerOrgDTO } from '/@/apis/gct-apaas/model';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { Avatar } from 'ant-design-vue';
  import { highlightName } from '/@/components/SelectUserModal/utils';

  const props = defineProps<{
    value: string;
  }>();

  const emit = defineEmits(['update:value', 'changeOptions']);

  const { t } = useI18n();
  const userData = ref<any[]>([]);
  const searchValue = ref();
  /** 部门树信息 */
  const orgData = ref<PickerOrgDTO[]>([]);
  /** 所有部门id */
  const getOrgList = ref<Array<string>>([]);
  const selectedKeys = computed({
    get() {
      return props.value || '';
    },
    set(val) {
      emit('update:value', val);
    },
  });
  // 根据搜索内容过滤待选区数据
  const tobeSelectOptions = computed(() => {
    if (searchValue.value?.trim()) {
      return userData.value
        .map((info) => {
          const hlName = highlightName(info.name, searchValue.value); // 高亮列表名称
          if (hlName) {
            return { ...info, highlightName: hlName };
          }
          return null;
        })
        .filter((i) => i);
    }
    return userData.value;
  });

  /** 获取所有的部门 */
  async function getOrgData() {
    const data = (await getDesignerCommonGetVisibleOrg()) ?? [];
    orgData.value = data;
    getOrgList.value = data.map((e) => {
      return e.id;
    });
  }

  // 获取所有的角色
  const getUserData = async () => {
    userData.value = (
      (await getDesignerCommonGetVisibleUserAndVisibleOrgUser({
        orgIds: getOrgList.value.join(','),
        userName: searchValue.value,
        pageNo: 1,
        pageSize: 999999999,
      })) ?? []
    ).map((e) => {
      return {
        ...e,
        formatId: `USER:${e.id}`,
        name: e.fullname,
      };
    });
  };

  const selectUser = (el) => {
    emit('changeOptions', el);

    emit('update:value', el.formatId);
  };

  onMounted(async () => {
    await getOrgData();
    await getUserData();
  });
</script>
<style lang="less" scoped>
  .select-main {
    overflow: auto;
  }
  .user-select {
    background: #e6eefe;
  }
  .avatar {
    display: flex;
    align-items: center;
  }
  .item {
    &:hover {
      background-color: hsl(from var(--ant-primary-color) h s 98%);
    }
  }

  .item-info {
    vertical-align: middle;
    flex-direction: column;
    width: calc(100% - 70px);

    .user-name {
      max-width: 65px;
      min-width: 40px;
      text-align: right;
    }
    .full-name {
      // max-width: calc(100% - 138px);
    }
    .dept {
      font-size: 12px;
      color: #8f8f8f;
    }
  }
  .name-flex {
    justify-content: space-between;
  }
  .selct-user {
    height: 13vh;
    margin: 16px 0;
    overflow: scroll;
  }
  .user-area {
    max-height: 300px;
    overflow-y: scroll;
  }
</style>
