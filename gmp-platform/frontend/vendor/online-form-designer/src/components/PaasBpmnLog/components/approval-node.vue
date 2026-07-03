<template>
  <div ref="approvalNodeRef">
    <div
      class="process-node-title text-[14px] font-500 mb8px ks-row-middle"
      :class="[needSticky && 'sticky-node']"
      :style="{
        '--type-color': '#309C41',
        '--sticky-top': `${titleHeight || 0}px`,
        '--status-color': isCompeleted ? '#3168EC' : '#309C41',
      }"
    >
      <div class="ell ks-col break-all" :title="data.name">{{ data.name }}</div>
      <div v-if="data.startTime" class="text-[#666666] text-[12px] font-400">
        {{ data.startTime }}
        <span
          v-if="approvedList.length > 5"
          class="ml12px text-[var(--ant-primary-color)] cursor-pointer"
          style="display: inline-flex; align-items: center"
          @click="data.expand = !data.expand"
        >
          {{ data.expand ? $t('sys.collapse') : $t('sys.unfold') }}
          <span class="ml4px">
            <up-outlined v-if="data.expand" />
            <down-outlined v-else />
          </span>
        </span>
      </div>
    </div>
    <div class="process-node-content rounded-4px">
      <div
        v-for="(el, j) in approvedList.filter((e, f) => data.expand || f < 5)"
        :key="j"
        class="ks-row mb8px bg-[#FBFBFC] p8px"
      >
        <div class="process-node-content-left mr12px">
          <div class="avatar-wrap w42px">
            <div class="ks-row-center">
              <img
                :src="el.avatar ? '/minio/' + el.avatar : avatarDefault"
                alt=""
                width="32"
                height="32"
                style="border-radius: 50%"
              />
            </div>
            <div
              class="ell text-[12px] text-[#666666] mt4px text-center break-all"
              :title="el.username"
            >
              {{ el.username }}
            </div>
          </div>
        </div>
        <div class="process-node-content-main ks-col">
          <div class="p8px bg-[#FFFFFF] rounded-4px min-h100% pr8px">
            <div class="ks-row text-[14px]">
              <div
                class="mr8px"
                :style="{ wordBreak: 'keep-all', color: approvalColor[el.approval] }"
              >
                {{ $t(`sys.process.paasBpmnButtonEvent.${el.approval}`) }}
              </div>
              <div
                v-show="!hiddenOpinion"
                class="ell-3 ks-col text-[#666666] break-all"
                :title="el.approvalMsg"
              >
                {{ el.approvalMsg }}
              </div>
            </div>
            <div v-if="!hiddenSignature && el.signature" class="ks-row text-[#666666] mt8px">
              <div class="mr2px">{{ $t('sys.model.sign') }}</div>
              <a-image
                v-if="el.signature"
                :width="64"
                :height="36"
                :src="isDesign ? el.signature : `/minio/${el.signature}`"
                :fallback="imageError"
              />
            </div>
            <!-- 加签/转交人 -->
            <UserList
              v-if="el.userList && el.userList?.length"
              class="mt8px"
              :data="el.userList"
              :key="j"
            />
          </div>
        </div>
        <div
          class="bg-[#FFFFFF] pr8px process-node-content-right w148px text-right text-[#8F8F8F] ks-column p8px"
        >
          <div>{{ el.endTime }}</div>
          <div v-if="el.duration" class="ks-col ks-row-end justify-end">
            {{ $t('sys.integration.timeConsuming') }}: {{ el.duration }}
          </div>
        </div>
      </div>
      <!-- 审批中 -->
      <UserList
        v-if="approvingData?.length"
        class="process-node-content bg-[#FBFBFC] rounded-4px p8px"
        :data="approvingData"
        :key="data.key"
        :tagName="$t('sys.process.status.approving')"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import UserList from './user-list.vue';
  import avatarDefault from '../imgs/avatar-default.png';
  import { computed, onMounted, ref } from 'vue';
  import { approvalObserver } from '../hooks/useObserver';
  import imageError from '/@page-designer/assets/image-error.svg';

  const props = defineProps<{
    data: any;
    titleHeight?: number;
    isDesign?: boolean;
    hiddenSignature?: boolean;
    hiddenOpinion?: boolean;
    isCompeleted?: boolean;
  }>();

  const approvalNodeRef = ref();
  const needSticky = ref(false);

  const approvalColor = {
    [ButtonTypeEnum.Approve]: '#309C41',
    [ButtonTypeEnum.Countersign]: '#6931EC',
    [ButtonTypeEnum.Reassign]: '#31B4EC',
    [ButtonTypeEnum.Refuse]: '#DB0000',
    [ButtonTypeEnum.Reject]: '#DB0000',
  };

  const approvedList = computed(() => {
    return props.data.approvalList
      .filter((e) => e.approval)
      .map((e) => {
        if (e.approval === ButtonTypeEnum.Countersign) {
          // 加签
          e.userList = e.countersignUsers.map((e) => {
            return {
              ...e,
              username: e.fullname,
            };
          });
        } else if (e.approval === ButtonTypeEnum.Reassign) {
          e.userList = e.reassigner ? [{ ...e.reassigner, username: e.reassigner?.fullname }] : [];
        }
        try {
          const signature = e.signature ? JSON.parse(e.signature).url : '';
          return { ...e, signature };
        } catch (error) {
          return e;
        }
      });
  });

  const approvingData = computed(() => {
    return props.data.approvalList.filter((e) => !e.approval);
  });

  onMounted(() => {
    if (!props.isDesign) {
      approvalObserver(approvalNodeRef, (isNeed) => {
        needSticky.value = isNeed;
      });
    }
  });
</script>
<style lang="less" scoped>
  .process-node {
    & + .process-node {
      margin-top: 28px;
    }

    &-title {
      position: relative;
      &::before {
        content: ' ';
        display: block;
        width: 6px;
        height: 6px;
        position: absolute;
        top: 7px;
        left: -19px;
        background-color: var(--status-color);
        border-radius: 50%;
        box-shadow: 0 0 0 2px hsl(from var(--status-color) h s 93%);
      }
      &.sticky-node {
        background-color: #ffffff;
        position: sticky;
        top: var(--sticky-top);
        z-index: 9;
      }
    }
  }
  .ell-3 {
    display: -webkit-inline-box;
    display: -moz-inline-box;
    display: inline-flexbox;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    box-orient: 3;
  }

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
  :deep(.ant-image-img) {
    width: 100%;
    height: 100%;
    vertical-align: top;
  }
</style>
