<template>
  <van-checkbox-group v-if="props.multiple" v-model="selectUserIds">
    <van-cell-group inset>
      <van-cell v-for="(item, index) in props.userSource" clickable :key="index">
        <template #title>
          <van-checkbox shape="square" :name="item.id" @click.stop="checkChange(item)">
            <div class="flex">
              <div class="item flex items-center pl-12px pr-12px">
                <van-image width="48" height="48" :src="MOBILE_MINIO_PATH + item.avatar" />
              </div>
              <div class="flex item-info org-name">
                <div class="w100% flex">
                  <div class="mr-8px ell">{{ item.fullname }}</div>
                  <div class="zhanghao ell">{{ item.username }}</div>
                </div>
                <span class="dept ell">{{ item.orgNames }}</span>
              </div>
            </div>
          </van-checkbox>
        </template>
      </van-cell>
    </van-cell-group>
  </van-checkbox-group>
  <van-radio-group v-else v-model="selectUserIds[0]">
    <van-cell-group inset>
      <van-cell v-for="(item, index) in props.userSource" clickable :key="index">
        <template #title>
          <van-radio :name="item.id" @click.stop="checkChange(item)">
            <div class="flex">
              <div class="item flex items-center pl-12px pr-12px">
                <van-image width="48" height="48" :src="MOBILE_MINIO_PATH + item.avatar" />
              </div>
              <div class="flex item-info org-name">
                <div class="w100% flex">
                  <div class="mr-8px ell">{{ item.fullname }}</div>
                  <div class="zhanghao ell">{{ item.username }}</div>
                </div>
                <span class="dept ell">{{ item.orgNames }}</span>
              </div>
            </div>
          </van-radio>
        </template>
      </van-cell>
    </van-cell-group>
  </van-radio-group>
</template>
<script setup lang="ts">
  import { computed, inject, ref } from 'vue';
  import { pick } from 'lodash-es';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const props = withDefaults(
    defineProps<{
      userSource: any;
      selectUser?: any[];
      multiple: boolean;
    }>(),
    {},
  );

  const ok = inject('ok');

  const emit = defineEmits(['update:selectUser']);

  const selectUserIds = computed(() => {
    return props.selectUser?.map((item) => item.id) || [];
  });

  const checkChange = (item) => {
    if (props.multiple) {
      let selectList = props.selectUser ?? [];
      if (selectUserIds.value.includes(item.id)) {
        selectList = selectList.filter((f) => f.id !== item.id);
      } else {
        selectList?.push(pick(item, ['id', 'fullname']));
      }
      emit('update:selectUser', selectList);
    } else {
      let selectList: any = [];

      selectList = [pick(item, ['id', 'fullname'])];

      emit('update:selectUser', selectList);
      setTimeout(() => {
        ok();
      }, 100);
    }
  };
</script>
<style lang="less" scoped>
  .item-info {
    flex-direction: column;
  }
  .org-name {
    word-wrap: break-word; /* 旧版属性，部分浏览器支持 */
    overflow-wrap: break-word; /* 标准属性，应优先使用 */
    max-width: calc(100% - 63px);
    .zhanghao {
      max-width: 78px;
      min-width: 50px;
    }
  }
  :deep(.van-cell__title) {
    width: 100%;
  }
  :deep(.van-checkbox__label) {
    max-width: calc(100% - 21px);
  }
  :deep(.van-radio__label) {
    max-width: calc(100% - 21px);
  }
</style>
