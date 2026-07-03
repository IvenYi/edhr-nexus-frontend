<template>
  <a-row :gutter="[16, 0]">
    <a-col :span="12">
      <div class="select-wrap h100%">
        <div class="select-header">
          <div class="header-title">
            <a-checkbox
              v-model:checked="checkAll"
              :indeterminate="indeterminate"
              @change="onCheckAllChange"
            >
              {{ t('sys.pageDesigner.ToBeSelect') }}
            </a-checkbox>
          </div>
          <div>
            <span class="text-[#212528]">{{ value.length }}</span>
            /
            <span class="text-[#797A7D]">{{ roleData.length }}</span>
          </div>
        </div>
        <div class="select-main">
          <div class="pl12px pr12px pt12px">
            <a-input v-model:value="searchValue" :placeholder="t('sys.searchText')" />
          </div>
          <a-checkbox-group v-model:value="checkedList" style="width: 100%">
            <div v-for="(el, i) in tobeSelectOptions" :key="i" class="select-item">
              <a-checkbox :value="el.formatId">
                <div :title="el.name" class="gct-text-overflow ks-col">
                  {{ el.name }}
                </div>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </div>
    </a-col>
    <a-col :span="12">
      <div class="select-wrap h100%">
        <div class="select-header">
          <div class="header-title">
            {{ t('sys.selected') }}：
            <span class="text-[#797A7D] ml4px">{{ selectedOptions.length }}</span>
          </div>
          <div class="cursor-pointer primary-gct" @click="checkedList = []">
            {{ t('sys.pageDesigner.deleteAll') }}
          </div>
        </div>
        <div class="select-main pt8px pb16px">
          <div
            v-for="(el, i) in selectedOptions"
            :key="i"
            class="selected-item ks-row p2px pl16px pr16px mt8px"
          >
            <div class="gct-text-overflow ks-col">{{ el.name }}</div>
            <i
              class="iconfont icon-shanchu2 cursor-pointer error-gct-hover text-[#333333]"
              @click="checkedList = checkedList.filter((e) => e !== el.formatId)"
            ></i>
          </div>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script setup lang="ts" name="role">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits(['update:value']);
  const { t } = useI18n();

  const props = defineProps<{
    value: Array<any>;
    ignoreCase?: number;
  }>();

  const indeterminate = ref(false),
    checkAll = ref(false),
    searchValue = ref();
  const roleData = ref<any[]>([]);

  const checkedList = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  // 动态切换全选的选中状态
  watch(checkedList, (val) => {
    changeCheckAllStatus(val);
  });

  // 动态切换全选的选中状态
  watch(searchValue, () => {
    changeCheckAllStatus(checkedList.value);
  });

  const changeCheckAllStatus = (list) => {
    const searchAndChecked = tobeSelectOptions.value.filter((e) => list.includes(e.formatId));
    indeterminate.value =
      !!searchAndChecked.length && searchAndChecked.length < tobeSelectOptions.value.length;
    checkAll.value = searchAndChecked.length === tobeSelectOptions.value.length;
  };

  // 根据搜索内容过滤待选区数据
  const tobeSelectOptions = computed(() => {
    const searchVal = searchValue.value?.trim();
    if (searchVal) {
      if (props.ignoreCase) {
        return roleData.value?.filter((e: any) =>
          e.name?.toLocaleLowerCase().includes(searchVal.toLocaleLowerCase()),
        );
      } else {
        return roleData.value?.filter((e: any) => e.name?.includes(searchVal));
      }
      // return roleData.value.filter((e: any) =>
      //   e.name?.toLocaleLowerCase().includes(searchValue.value.trim()),
      // );
    }
    return roleData.value;
  });

  const selectedOptions = computed(() => {
    return roleData.value.filter((e: any) => props.value.some((f) => f === e.formatId));
  });

  onMounted(() => {
    getRoleData();
  });

  const onCheckAllChange = (e) => {
    indeterminate.value = false;
    const list = cloneDeep(props.value);
    const ids = tobeSelectOptions.value.map((e: any) => e.formatId);
    const data = e.target.checked
      ? [...new Set([...list, ...ids])]
      : list.filter((e) => !ids.includes(e));
    emit('update:value', data);
  };

  // 获取所有的角色
  const getRoleData = async () => {
    roleData.value = ((await getRoleList()) ?? []).map((e) => {
      return {
        ...e,
        formatId: `ROLE:${e.id}`,
      };
    });
  };
</script>
<style lang="less" scoped>
  .select-wrap {
    border-left: 1px solid #e8ebf0;
    border-right: 1px solid #e8ebf0;
    border-bottom: 1px solid #e8ebf0;
  }
  .select-header {
    padding: 10px 16px;
    border-top: 1px solid #e8ebf0;
    border-bottom: 1px solid #e8ebf0;
    background-color: #f2f4f7;
    display: flex;
    .header-title {
      flex: 1;
    }
  }
  .select-main {
    height: 400px;
    overflow: auto;
  }
  .select-item {
    padding: 10px 16px;
    display: flex;
    & + .select-item {
      border-top: 1px solid #e0e3ea;
    }

    :deep(.ant-checkbox-wrapper) {
      width: 100%;
      overflow: hidden;

      & > span:last-child {
        flex: 1;
        overflow: hidden;
      }
    }
  }
</style>
