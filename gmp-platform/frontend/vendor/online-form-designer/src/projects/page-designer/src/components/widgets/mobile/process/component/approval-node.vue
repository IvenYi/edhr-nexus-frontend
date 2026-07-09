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
      <div class="ell ks-col" :title="data.name">{{ data.name }}</div>
      <div v-if="data.startTime" class="text-[#666666] text-[12px] font-400">
        {{ data.startTime }}
        <span
          v-if="approvedList.length > 5"
          class="ml12px text-[#3168EC] cursor-pointer"
          style="display: inline-flex; align-items: center"
          @click="data.expand = !data.expand"
        >
          {{ data.expand ? $t('sys.collapse') : $t('sys.unfold') }}
          <span class="ml4px">
            <van-icon :name="data.expand ? 'arrow-up' : 'arrow-down'" />
          </span>
        </span>
      </div>
    </div>
    <div class="process-node-content rounded-4px p8px">
      <div
        v-for="(el, j) in approvedList.filter((e, f) => data.expand || f < 5)"
        :key="j"
        class="mb8px bg-[#FBFBFC]"
      >
        <div class="ks-row">
          <div class="process-node-content-left mr8px flex-1">
            <div class="avator-wrap flex">
              <div class="ks-row-center mr-8px">
                <img
                  :src="el.avatar ? MOBILE_MINIO_PATH + el.avatar : avatorDefault"
                  alt=""
                  width="24"
                  height="24"
                  style="border-radius: 50%"
                />
              </div>
              <div
                class="ell text-[12px] text-[#666666] mt4px text-center mr8px mw50px"
                :title="el.username"
              >
                {{ el.username }}
              </div>
              <div
                class="mt4px"
                :style="{ wordBreak: 'keep-all', color: approvalColor[el.approval] }"
              >
                {{ $t(`sys.process.paasBpmnButtonEvent.${el.approval}`) }}
              </div>
            </div>
          </div>
          <div class="pr8px process-node-content-right w148px text-right text-[#8F8F8F] ks-column">
            <div class="ks-col ks-row-end justify-end">
              {{ el.endTime }}
            </div>
          </div>
        </div>

        <div
          v-show="!hiddenOpinion"
          class="rounded-4px min-h100% pt16px relative"
          :class="{ mb24px: el.isOverflowed }"
        >
          <div class="ks-row text-[14px]">
            <div
              class="ell-3 ks-cols text-[#666666]"
              :class="[el.isExpanded ? 'expanded' : '', key + props.key]"
            >
              {{ el.approvalMsg }}
            </div>
          </div>
          <div
            @click="el.isExpanded = !el.isExpanded"
            class="toggle-button mb30px"
            v-if="el.isOverflowed"
          >
            {{ el.isExpanded ? '收起' : '展开' }}
            <van-icon name="arrow-down" v-if="!el.isExpanded" />
            <van-icon name="arrow-up" v-else />
          </div>
        </div>

        <div class="ks-row pt8px">
          <div
            v-if="!hiddenSignature && el.signature"
            class="process-node-content-left mr8px flex-1 text-[#3168EC] ks-col"
            @click="reviewSign(el.signature)"
          >
            {{ $t('sys.pageDesigner.reviewSign') }}
          </div>
          <div v-else class="process-node-content-left mr8px flex-1 text-[#3168EC] ks-col"></div>
          <div class="pr8px process-node-content-right w148px text-right text-[#8F8F8F] ks-column">
            <div v-if="el.duration" class="ks-col ks-row-end justify-end">
              耗时: {{ el.duration }}
            </div>
          </div>
        </div>
        <!-- 加签/转交人 -->
        <div class="ks-row mb8px bg-[#FBFBFC] p8px" v-if="el.userList && el.userList?.length">
          <UserList class="mt8px" :data="el.userList" :key="j" />
        </div>
      </div>
      <!-- 审批中 -->
      <div v-if="approvalData?.length">
        <UserList
          class="process-node-content bg-[#FBFBFC] rounded-4px"
          :data="approvalData"
          :key="data.key"
          :status="'approving'"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ButtonTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';
  import UserList from './user-list.vue';
  import avatorDefault from '/@/assets/images/avator-default.png';
  import { computed, nextTick, onMounted, ref } from 'vue';
  import { showImagePreview } from 'vant';
  import { approvalObserver } from '/@/components/PaasBpmnLog/hooks/useObserver';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const props = defineProps<{
    data: any;
    /** 是否隐藏签名 */
    hiddenSignature?: boolean;
    /** 是否隐藏审批意见 */
    hiddenOpinion?: boolean;
    /** 设计模式 */
    type: string;
    /** 审批状态是否结束 */
    isCompeleted?: boolean;
    titleHeight?: number;
  }>();

  const approvalNodeRef = ref();
  const needSticky = ref(false);
  const textElements = ref([]);

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
        return e;
      });
  });
  console.log('approvedList', approvedList);

  const approvalData = computed(() => {
    return props.data.approvalList.filter((e) => !e.approval);
  });

  const reviewSign = (img) => {
    const imgUrl = JSON.parse(img).url;

    showImagePreview({
      images: [`${MOBILE_MINIO_PATH.value}${imgUrl}`],
      closeable: true,
      showIndex: false,
      overlayStyle: {
        backgroundColor: 'rgba(0,0,0, .45)',
      },
    });
  };

  onMounted(async () => {
    if (props.type === 'render') {
      approvalObserver(approvalNodeRef, (isNeed) => {
        needSticky.value = isNeed;
      });
      await nextTick();
      await getOverflowed();
    }
  });
  const getOverflowed = () => {
    const elements = document.querySelectorAll('.ell-3');
    textElements.value = Array.from(elements);
    if (textElements.value.length > 0) {
      textElements.value.forEach((element, index) => {
        approvedList.value.forEach((p) => {
          if (element.innerText === p.approvalMsg) {
            p.isOverflowed = element?.scrollHeight > element?.clientHeight;
            p.isExpanded = false;
          }
        });
      });
    }
  };
</script>
<style lang="less" scoped>
  .process-node {
    & + .process-node {
      margin-top: 16px;
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
    word-wrap: break-word;
    word-break: break-all;
  }

  .expanded {
    -webkit-line-clamp: initial;
  }

  .toggle-button {
    position: absolute;
    bottom: -50px;
    right: 0;
    color: #3168ec;
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
  .mw50px {
    max-width: 50px;
  }
</style>
