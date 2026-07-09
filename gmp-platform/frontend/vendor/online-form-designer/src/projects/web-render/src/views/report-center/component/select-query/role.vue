<template>
  <div class="select-main">
    <div class="pl12px pr12px">
      <a-input v-model:value="searchValue" :placeholder="t('sys.searchText')" />
    </div>
    <div class="role-area">
      <div v-for="(el, i) in tobeSelectOptions" :key="i" class="select-item pl-12px pr-12px">
        <div
          v-if="el.highlightName"
          class="content-item-title gct-text-overflow ks-col pl-8px"
          :title="el.name"
          :innerHTML="el.highlightName"
          @click="selectRole(el)"
        ></div>
        <div
          v-else
          :title="el.name"
          @click="selectRole(el)"
          class="content-item-title gct-text-overflow ks-col pl-8px"
        >
          {{ el.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="role">
  import { computed, onMounted, ref } from 'vue';
  import { getRoleList } from '/@/apis/gct-apaas/RoleController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { highlightName } from '/@/components/SelectUserModal/utils';

  const props = defineProps<{
    value: string;
  }>();

  const emit = defineEmits(['update:value', 'changeOptions']);

  const { t } = useI18n();
  const roleData = ref<any[]>([]);
  const searchValue = ref();

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
      return roleData.value
        .map((info) => {
          const hlName = highlightName(info.name, searchValue.value); // 高亮列表名称
          if (hlName) {
            return { ...info, highlightName: hlName };
          }
          return null;
        })
        .filter((i) => i);
    }
    return roleData.value;
  });

  // 获取所有的角色
  const getRoleData = async () => {
    roleData.value = ((await getRoleList()) ?? []).map((e) => {
      return {
        ...e,
        formatId: `ROLE:${e.id}`,
      };
    });
  };

  const selectRole = (el) => {
    emit('changeOptions', el);

    emit('update:value', el.formatId);
  };

  onMounted(() => {
    getRoleData();
  });
</script>
<style lang="less" scoped>
  .select-main {
    height: 400px;
    overflow: auto;
  }
  .select-item {
    padding: 10px 16px;
    display: flex;
    &:hover {
      background-color: hsl(from var(--ant-primary-color) h s 98%);
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

  .user-select {
    background: #e6eefe;
  }
  .role-area {
    max-height: 300px;
    overflow-y: scroll;
  }
</style>
