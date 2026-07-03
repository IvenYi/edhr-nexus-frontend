<template>
  <div class="-mx-3 bg-[#f5f6f7]" :style="{ height: height || '722px' }">
    <div class="relative z-0 h-full flex flex-col">
      <div class="flex-shrink-0 bg-white">
        <PageHeader
          renderAsPDA
          :title="props.model?.data?.name || $t('sys.developer.designView.message')"
          :action="{
            name: $t('sys.allRead'),
            disabled: !unreadCount,
            loading: isClearing,
            onClick: handleReadAllClick,
          }"
        />
        <Tabs isAlignLeft class="-mt-2" :options="tabOptions" :active="activeTab" />
      </div>

      <!-- list -->
      <div class="flex-grow relative z-0 overflow-y-auto">
        <van-list class="p-3" style="min-height: calc(100% - 4rem)" :finished="true">
          <div
            v-for="row in rowList"
            :key="row.id"
            class="mb-3 p-3 bg-white rounded-lg active:bg-[#E8EBF0]"
          >
            <!-- message header -->
            <div class="flex items-center">
              <!-- icon -->
              <div
                class="flex-shrink-0 flex justify-center items-center relative z-0 w-8 h-8 bg-center bg-cover bg-no-repeat"
                :style="{
                  backgroundImage: `url(${row.supportProcess ? svgStamp : svgBell})`,
                }"
              >
                <dot
                  v-if="!row.read"
                  class="absolute z-10 -top-1 -right-1 w-3 h-3 border-2 border-solid border-white rounded-full bg-[#F54547]"
                />
              </div>
              <!-- title -->
              <div class="flex-grow ml-3 mr-5 text-black font-600 truncate">
                {{ row.appName }}
              </div>
              <!-- time -->
              <div class="flex-shrink-0 text-xs text-gray-500">
                {{ row.createTime }}
              </div>
            </div>

            <!-- message content -->
            <div class="mt-2 py-1 text-base text-[#5A5F6B] whitespace-pre-line">
              {{ row.content }}
            </div>

            <!-- detail -->
            <div
              v-if="row.supportProcess && row.supportJump"
              class="primary-color text-sm text-right cursor-pointer"
            >
              {{ $t('sys.viewDetails') }}
            </div>
          </div>
        </van-list>

        <!-- 仅展示半年 -->
        <div class="relative z-10 flex justify-center">
          <van-divider class="w-2/3" contentPosition="center">
            <span class="text-sm">{{ $t('sys.menu.messageTips') }}</span>
          </van-divider>
        </div>
      </div>
    </div>
  </div>
</template>
<script name="DesignMessageComponent" setup lang="ts">
  import { MessageType } from '@gct/runtime';
  import { computed, toRefs } from 'vue';
  import { nodeContainerProps } from '../../../props';
  import PageHeader from '@mobile/components/common/page-header.vue';
  import Tabs from '@mobile/components/common/tabs.vue';
  import svgBell from '@mobile/assets/svg-icons/icon-message-bell.svg';
  import svgStamp from '@mobile/assets/svg-icons/icon-message-stamp.svg';

  const DEFAULT_CONTENT_LIST = [MessageType.UNREAD, MessageType.ALL];

  const props = defineProps(nodeContainerProps);
  const { displayContent } = toRefs(props.data.data);

  const _displayContent = computed(() => {
    const list = [...displayContent.value];
    list.sort((a, b) => (a > b ? -1 : 1));
    return list;
  });

  const rowList = [
    {
      id: 1,
      appName: '系统消息',
      content: '各位同事:为提升系统体验，内部运营管理系统.. ',
      read: 0,
      createTime: '2024-10-24 08:00:00',
    },
    {
      id: 2,
      appName: '系统消息',
      content: '各位同事:为提升系统体验，内部运营管理系统.. ',
      read: 0,
      createTime: '2024-10-24 08:00:00',
    },
    {
      id: 3,
      appName: '审批流程',
      content: '批次0001已经进站工序OP001，请关注！ ',
      read: 0,
      createTime: '2024-10-24 08:00:00',
      supportProcess: 1,
      supportJump: true,
    },
  ];

  const tabOptions = computed(() => {
    const visibleTypes = _displayContent.value || DEFAULT_CONTENT_LIST;
    return visibleTypes.map((t) => {
      const suffix = t === MessageType.UNREAD ? ` (3)` : '';
      const label = `${$t(`sys.menu.messageShort.${t}`)}${suffix}`;
      return { label, value: t };
    });
  });

  const activeTab = computed(() => {
    return _displayContent.value[0];
  });

  const height = computed(() => {
    return props.data.data.height;
  });
</script>
