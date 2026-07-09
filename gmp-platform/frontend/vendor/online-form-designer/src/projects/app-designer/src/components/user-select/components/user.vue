<template>
  <div class="100%">
    <div class="user-list">
      <a-checkbox-group v-if="multiple" v-model:value="selectUserIds" class="w100%">
        <div
          v-for="(item, index) in props.userSource"
          :key="index"
          class="mb-8px pl-8px pt-4px pb-4px w100%"
          :class="selectUserIds.includes(item.id) ? 'user-select' : ''"
        >
          <a-checkbox :value="item.id" @change="(e) => checkChange(e, item)">
            <div class="item flex items-center w100%">
              <Avatar :size="30" style="margin: 0 8px" :src="transformUrl(item.avatar)" />
              <div class="flex item-info">
                <div class="flex">
                  <div class="mr-8px ell full-name">{{ item.fullname }}</div>
                  <div class="ell user-name">{{ item.username }}</div>
                </div>
                <span class="dept ell">{{ item.orgNames }}</span>
              </div>
            </div>
          </a-checkbox>
        </div>
      </a-checkbox-group>
      <a-radio-group v-else v-model:value="selectUserIds[0]" class="w100%">
        <div
          v-for="(item, index) in props.userSource"
          :key="index"
          class="mb-8px pl-8px pt-4px pb-4px w100%"
          :class="selectUserIds.includes(item.id) ? 'user-select' : ''"
        >
          <a-radio :value="item.id" @change="(e) => checkChange(e, item)">
            <div class="item flex items-center w100%">
              <Avatar :size="30" style="margin: 0 8px" :src="transformUrl(item.avatar)" />
              <div class="flex item-info">
                <div class="flex">
                  <div class="mr-8px ell full-name">{{ item.fullname }}</div>
                  <div class="ell user-name">{{ item.username }}</div>
                </div>
                <span class="dept ell">{{ item.orgNames }}</span>
              </div>
            </div>
          </a-radio>
        </div>
      </a-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { pick } from 'lodash-es';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { Avatar } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      userSource: any;
      selectUser?: any[];
      multiple: boolean;
    }>(),
    {},
  );

  const emit = defineEmits(['update:selectUser']);

  const selectUserIds = computed(() => {
    return props.selectUser?.map((item) => item.id) || [];
  });

  const checkChange = (event, item) => {
    if (props.multiple) {
      const { value, checked } = event.target;
      let selectList = props.selectUser ?? [];
      if (checked) {
        selectList?.push(pick(item, ['id', 'fullname']));
      } else {
        selectList = selectList.filter((f) => f.id !== value);
      }
      emit('update:selectUser', selectList);
    } else {
      let selectList: any = [];

      selectList = [pick(item, ['id', 'fullname'])];

      emit('update:selectUser', selectList);
    }
  };
</script>

<style lang="less" scoped>
  .user-select {
    background: #e6eefe;
  }
  .user-list {
    .avatar {
      display: flex;
      align-items: center;
    }

    .item-info {
      vertical-align: middle;
      flex-direction: column;
      max-width: calc(100% - 50px);

      .user-name {
        max-width: 65px;
      }
      .full-name {
        // max-width: calc(100% - 138px);
      }
      .dept {
        font-size: 12px;
        color: #8f8f8f;
      }
    }
  }
  :deep(.ant-checkbox + span) {
    display: inline-block;
    width: 100%;
  }
  :deep(.ant-radio + span) {
    display: inline-block;
    width: 100%;
  }

  .selct-user {
    height: 13vh;
    margin: 16px 0;
    overflow: scroll;
  }
  :deep(.ant-checkbox-wrapper) {
    align-items: center;
    width: calc(100% - 8px);
  }

  :deep(.ant-radio-wrapper) {
    align-items: center;
    width: calc(100% - 8px);
  }
</style>
