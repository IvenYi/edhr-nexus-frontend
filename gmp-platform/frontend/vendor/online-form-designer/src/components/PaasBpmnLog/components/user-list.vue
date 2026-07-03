<template>
  <div>
    <div
      class="user-list ks-row-middle cursor-pointer flex-wrap"
      @click="data.length > 3 && (expand = true)"
    >
      <div
        v-for="(user, u) in data?.filter((e, i) => expand || i < 3)"
        :key="u"
        class="user-list-item border w76px p4px ks-row-middle"
      >
        <img
          :src="user.avatar ? '/minio/' + user.avatar : avatarDefault"
          width="20"
          height="20"
          style="border-radius: 50%"
        />
        <div class="ml8px ell" :title="user.username" style="line-height: 20px">
          {{ user.username }}
        </div>
      </div>
      <template v-if="data?.length > 3 && !expand">
        <div
          class="rounded-50% border w28px h28px ks-row-center-middle text-[var(--ant-primary-color)]"
        >
          +{{ data.length - 3 }}
        </div>
        <div class="text-[#8F8F8F] ml4px mr12px">...</div>
      </template>
      <div
        v-if="tagName"
        class="text-[#3168EC] text-[12px] px4px rounded-4px"
        :style="{
          backgroundColor: 'hsl(from #3168EC h s 92%)',
        }"
      >
        {{ tagName }}
      </div>
    </div>
    <div v-if="expand" class="mt8px primary-gct ks-row">
      <span class="cursor-pointer" @click="expand = !expand">
        {{ $t('sys.collapse') }} <up-outlined />
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import avatarDefault from '../imgs/avatar-default.png';

  defineProps<{
    data: any[];
    tagName?: string;
  }>();

  const expand = ref(false);
</script>
<style lang="less" scoped>
  .border {
    border: 1px solid #f0f0f0;
  }
  .user-list {
    row-gap: 8px;
    &-item {
      border-radius: 28px;
      margin-right: 16px;
    }
  }
</style>
