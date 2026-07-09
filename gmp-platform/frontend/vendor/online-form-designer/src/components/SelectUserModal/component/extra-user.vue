<template>
  <div class="select-user-modal__waiting-area">
    <div class="waiting-area-content">
      <Scrollbar class="px-12px py-16px">
        <a-checkbox-group v-model:value="selectUserIds" :disabled="readonly" class="w100%">
          <div class="content-item-extra-user-area">
            <div v-for="(el, i) in useData" :key="i" class="waiting-area-content-item">
              <a-checkbox class="!w-auto" :value="el.formatId" @change="(e) => onUserCheck(e, el)">
                <div class="content-item-title gct-text-overflow pl-4px" :title="el.fullname">
                  {{ el.fullname }}</div
                >
              </a-checkbox>
            </div>
          </div>
        </a-checkbox-group>
      </Scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts" name="waiting-area-extra-user">
  import { ref, watch, computed } from 'vue';
  import { pick } from 'lodash-es';
  import { Scrollbar } from '/@/components/Scrollbar';

  import type { PickerUserDTO } from '/@/apis/gct-platform/model';

  type UserDTO = PickerUserDTO & { formatId: string };

  const props = defineProps<{
    useData: UserDTO[];
    selectUsers?: any[];
    multiple: boolean;
    readonly?: boolean;
  }>();

  const emit = defineEmits(['update:selectUsers']);

  const selectUserIds = computed(() => {
    return props.selectUsers?.map((item) => item.formatId);
  });

  function onUserCheck(event, data) {
    if (props.multiple) {
      const { value, checked } = event.target;
      let selectList = props.selectUsers ?? [];
      if (checked) {
        selectList?.push(pick(data, ['formatId', 'id', 'fullname']));
      } else {
        selectList = selectList.filter((f) => f.formatId !== value);
      }
      emit('update:selectUsers', selectList);
    } else {
      const { value, checked } = event.target;
      let selectList: any = [];

      if (checked) {
        selectList = [pick(data, ['formatId', 'id', 'fullname'])];
      }

      emit('update:selectUsers', selectList);
    }
  }
</script>

<style scoped lang="less">
  .content-item-extra-user-area {
    display: grid;
    grid-column-gap: 8px;
    grid-row-gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));

    :deep(.ant-checkbox-wrapper) {
      margin-right: 0 !important;
      .content-item-title {
        color: #212528 !important;
      }
    }
  }
</style>
