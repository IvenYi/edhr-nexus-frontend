<template>
  <div class="select-user-modal__waiting-area">
    <SearchInput v-model:search-value="roleSearchValue" />
    <div class="waiting-area-content">
      <Scrollbar class="px-12px py-8px">
        <a-checkbox-group v-model:value="selectOrgIds" :disabled="readonly" class="w100%">
          <div v-for="(el, i) in searchRoleData" :key="i" class="waiting-area-content-item mb-8px">
            <a-checkbox :value="el.formatId" @change="(e) => onOrgCheck(e, el)">
              <div
                v-if="el.highlightName"
                class="content-item-title gct-text-overflow ks-col pl-8px"
                :title="el.name"
                :innerHTML="el.highlightName"
              ></div>
              <div
                v-else
                :title="el.name"
                class="content-item-title gct-text-overflow ks-col pl-8px"
              >
                {{ el.name }}
              </div>
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="waiting-area-role">
  import { ref, watch, computed } from 'vue';
  import { pick } from 'lodash-es';
  import { Scrollbar } from '/@/components/Scrollbar';
  import SearchInput from './search-input.vue';
  import { highlightName } from '../utils/index';

  const props = defineProps<{
    roleData: any;
    selectRoles: any;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:selectRoles']);

  const roleSearchValue = ref();

  const searchRoleData = computed(() => {
    if (!roleSearchValue.value) {
      return props.roleData;
    }
    return props.roleData
      .map((info) => {
        const hlName = highlightName(info.name, roleSearchValue.value); // 高亮列表名称
        if (hlName) {
          return { ...info, highlightName: hlName };
        }
        return null;
      })
      .filter((i) => i);
  });

  const selectOrgIds = computed(() => {
    return props.selectRoles?.map((item) => item.formatId);
  });

  function onOrgCheck(event, data) {
    const { value, checked } = event.target;
    let selectList = props.selectRoles ?? [];
    if (checked) {
      selectList?.push(pick(data, ['formatId', 'id', 'name']));
    } else {
      selectList = selectList.filter((f) => f.formatId !== value);
    }

    emit('update:selectRoles', selectList);
  }
</script>

<style lang="less">
  @import url('../styles/common.less');
</style>
