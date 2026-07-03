<template>
  <div>
    <div
      class="user-list ks-row-middle cursor-pointer flex-wrap"
      @click="expand = true"
      :class="!props.status ? 'bg-[#ffffff]' : ''"
    >
      <div
        v-for="(user, u) in data?.filter((e, i) => expand || i < 4)"
        :key="u"
        class="user-list-item p4px mr8px mw60px"
      >
        <img
          :src="user.avatar ? MOBILE_MINIO_PATH + user.avatar : avatorDefault"
          width="32"
          height="32"
          style="border-radius: 50%"
        />
        <div class="mt4px ell text-[#666666]" :title="user.username" style="line-height: 20px">
          {{ user.fullname || user.username }}
        </div>
      </div>
      <template v-if="data?.length > 4 && !expand">
        <div class="ks-column items-center">
          <div class="rounded-50% border w32px h32px ks-row-center-middle text-[#3168EC]">
            +{{ data?.length - 4 }}
          </div>
          <div class="text-[#3168EC] ml4px mt6px">{{ $t('sys.reviewAll') }}</div>
        </div>
      </template>
      <div v-if="expand" class="mt8px primary-gct ks-row mr8px">
        <span class="cursor-pointer" @click.stop="expand = !expand">
          {{ $t('sys.collapse') }}
        </span>
      </div>
      <div v-if="props.status">
        <van-tag color="#D6E1FF" text-color="#3168EC" type="primary">
          {{ $t('sys.process.status.approving') }}
        </van-tag>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import avatorDefault from '/@/assets/images/avator-default.png';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const props = defineProps<{
    data: any[];
    status?: string;
  }>();

  const expand = ref(false);
</script>
<style lang="less" scoped>
  .border {
    border: 1px solid #f0f0f0;
  }
  .user-list {
    row-gap: 8px;
    .user-list-item {
      display: inline-block;
      text-align: center;
    }
  }
  .mw60px {
    max-width: 60px;
  }
</style>
