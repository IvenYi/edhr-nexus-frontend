<template>
  <div class="relative z-0 h-full flex flex-col">
    <div class="flex-shrink-0 bg-white md:bg-transparent">
      <PageHeader
        :title="props.model?.data?.name || $t('sys.developer.designView.message')"
        :action="{
          name: $t('sys.allRead'),
          disabled: !unreadCount,
          loading: isClearing,
          onClick: handleReadAllClick,
        }"
      />
      <Tabs
        isAlignLeft
        class="-mt-2"
        :options="tabOptions"
        :active="activeTab"
        @change="handleTabChange"
      />
    </div>

    <!-- list -->
    <div class="flex-grow relative z-0 overflow-y-auto">
      <MessageList :type="activeTab" :key="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { putInternalMessageReadAll } from '/@/apis/gct-platform/InternalMessageController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import MessageList from './components/message-list.vue';
  import { MessageType } from '@gct/runtime';
  import PageHeader from '@mobile/components/common/page-header.vue';
  import Tabs from '@mobile/components/common/tabs.vue';
  import { useWorkbenchHooks } from '@mobile/stores/navMenus';

  const DEFAULT_CONTENT_LIST = [MessageType.UNREAD, MessageType.ALL];

  const props = defineProps<{
    model?: {
      data?: {
        name?: string;
        displayContent?: string[];
      };
    };
  }>();

  const { mitt } = useMitt();
  const { navMenus } = useWorkbenchHooks();

  const activeTab = ref<MessageType>(MessageType.UNREAD);
  const isClearing = ref(false);

  const unreadCount = computed(() => {
    return navMenus.value.find((n) => n.to === '/main/message')?.count || 0;
  });

  const tabOptions = computed(() => {
    const visibleTypes = props.model?.data?.displayContent || DEFAULT_CONTENT_LIST;
    return visibleTypes.map((t) => {
      const suffix = t === MessageType.UNREAD ? ` (${unreadCount.value})` : '';
      const label = `${$t(`sys.menu.messageShort.${t}`)}${suffix}`;
      return { label, value: t };
    });
  });

  const handleReadAllClick = () => {
    isClearing.value = true;

    putInternalMessageReadAll()
      .then(() => {
        mitt.emit('read-message-all');
        // mitt.emit('update-message-count');
      })
      .finally(() => {
        isClearing.value = false;
      });
  };

  const handleTabChange = (val: MessageType) => {
    activeTab.value = val;
  };

  watch(
    () => tabOptions.value.length,
    (len) => {
      if (len === 1) {
        activeTab.value = tabOptions.value[0].value as MessageType;
      } else {
        activeTab.value = MessageType.UNREAD;
      }
    },
  );
</script>
