<template>
  <basic-page :use-bg-color="true">
    <div class="section-header p-24px flex-none bg-[#ffffff]">
      <h2 class="text-16px lh-[24px] color-[#000] font-500 mb-4px">{{
        t('sys.menu.messageTemplateManagement')
      }}</h2>
      <p class="text-14px lh-[18px] color-[#797A7D] mb-0">{{
        t('sys.integration.messageTemplateManagementTip')
      }}</p>
    </div>
    <div class="tab-wrapper">
      <a-tabs
        v-model:activeKey="activeKey"
        :style="{
          '--height': tabContentHeight + 'px',
        }"
        animated
      >
        <a-tab-pane
          :key="opt.value"
          :tab="t(opt.i18n) + '(' + messageSettingTypedCount[opt.dataKey] + ')'"
          v-for="opt in MessageTemplateOptions"
        >
          <div style="text-align: right">
            <a-button type="primary" @click="handleAdd"
              ><plus-outlined />{{ t('sys.add') }}</a-button
            >
          </div>

          <div v-if="messageSettingTypedCount[opt.dataKey] > 0" class="template-card__list pt-16px">
            <div
              v-for="n in messageSettingTypedList[opt.value]"
              :key="n.key"
              class="template-card__item"
            >
              <div class="template-card__header">
                <div class="template-card__icon">
                  <icon :icon="opt.icon + '|svg'" :size="24" />
                </div>
                <div class="template-card__name" :title="t(opt.i18n)">{{ t(opt.i18n) }}</div>
              </div>
              <!-- <div class="template-card__desc" :title="n.remark">{{ n.remark }}</div> -->
              <div class="mt-20px flex template-card__btn-box">
                <span class="template-card__desc">
                  <span class="color-[#666]">名称：</span>
                  {{ n.name }}
                </span>
                <a-button type="link" @click="handleSetting(n)">{{
                  t('sys.integration.clickToConfig')
                }}</a-button>
              </div>
              <a-dropdown>
                <div class="template-card__more p-6px h-32px">
                  <more-outlined :rotate="90" :style="{ fontSize: '20px', color: '#333' }" />
                </div>
                <template #overlay>
                  <a-menu @click="({ key }) => handleDropdownClick(n, key)">
                    <a-menu-item :key="CardDropdownEnum.Test">{{ t('sys.test') }}</a-menu-item>
                    <a-menu-item :key="CardDropdownEnum.Delete">
                      <span class="error-gct">{{ t('sys.delete') }}</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
          <div class="pt-10vh" v-else>
            <a-empty />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <email-modal @register="register" @refresh="handleRefresh" />
    <third-modal @register="registerThird" @refresh="handleRefresh" />
    <message-test-modal @register="registerMessgeTest" />
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, watch, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWindowSizeFn } from '@vben/hooks';
  import Icon from '/@/components/Icon/Icon.vue';
  import { Modal } from 'ant-design-vue';
  import { MessageTemplateEnum, MessageTemplateOptions, CardDropdownEnum } from './enum';
  import {
    getMessageSettingGetTypeCount,
    getMessageSettingList,
    deleteMessageSetting,
  } from '/@/apis/gct-platform/MessageSettingController';
  import type {
    MessageSettingCountResponse,
    MessageSettingResponse,
  } from '/@/apis/gct-platform/model';
  import { useModal } from '/@/components/Modal';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import EmailModal from './modals/email-modal.vue';
  import ThirdModal from './modals/third-modal.vue';
  import MessageTestModal from './modals/message-test-modal.vue';

  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const [registerThird, { openModal: openThirdModal }] = useModal();
  const [registerMessgeTest, { openModal: openMessageTestModal }] = useModal();
  const { t } = useI18n();
  const activeKey = ref(MessageTemplateOptions[0].value);
  const messageSettingTypedCount: MessageSettingCountResponse = reactive({
    dingTalkCount: 0,
    emailCount: 0,
    feishuCount: 0,
    wxWorkCount: 0,
  });
  const messageSettingTypedList: Record<MessageTemplateEnum, MessageSettingResponse[]> = reactive({
    [MessageTemplateEnum.EMAIL]: [],
    [MessageTemplateEnum.DING_TALK]: [],
    [MessageTemplateEnum.WX_WORK]: [],
    [MessageTemplateEnum.FEISHU]: [],
  });

  getMessageSettingTypedCount();

  const tabContentHeight = ref(100);
  onMounted(() => {
    calcHeight();
  });
  /**
   * 计算tab内容区域高度
   */
  const calcHeight = () => {
    setTimeout(() => {
      const outerHeight = document
        .querySelector('.basic-page__body')
        ?.getBoundingClientRect().height;
      const innerHeight = document.querySelector('.section-header')?.getBoundingClientRect().height;
      if (!outerHeight || !innerHeight) return;
      console.log(outerHeight, innerHeight);
      tabContentHeight.value = outerHeight - innerHeight - 46 - 40 - 16 - 36;
    }, 100);
  };
  useWindowSizeFn(calcHeight);

  watch(
    activeKey,
    () => {
      getMessageSettingTypedList();
    },
    {
      immediate: true,
    },
  );

  /**
   * 获取统计数据
   */
  function getMessageSettingTypedCount() {
    getMessageSettingGetTypeCount().then((res) => {
      Object.assign(messageSettingTypedCount, res);
    });
  }

  /**
   * 获取当前tab对应列表并更新数量
   */
  async function getMessageSettingTypedList() {
    const type = activeKey.value;
    const res = await getMessageSettingList({
      type,
    });
    messageSettingTypedList[type] = res ?? [];
    // 更新tab数据
    const opt = MessageTemplateOptions.find((item) => item.value === type);
    if (!opt) return;
    messageSettingTypedCount[opt.dataKey] = messageSettingTypedList[type].length;
  }

  const handleAdd = () => {
    if (activeKey.value === MessageTemplateEnum.EMAIL) {
      openModal(true, { edit: false });
    } else {
      openThirdModal(true, {
        edit: false,
        record: {
          type: activeKey.value,
        },
      });
    }
  };

  const handleSetting = (data: MessageSettingResponse) => {
    if (activeKey.value === MessageTemplateEnum.EMAIL) {
      openModal(true, {
        edit: true,
        record: data,
      });
    } else {
      openThirdModal(true, {
        edit: true,
        record: data,
      });
    }
  };

  const handleRefresh = () => {
    getMessageSettingTypedList();
  };

  const handleDropdownClick = (data: MessageSettingResponse, key: CardDropdownEnum) => {
    switch (key) {
      case CardDropdownEnum.Delete:
        Modal.confirm({
          title: t('sys.sureToDelete'),
          icon: createVNode(ExclamationCircleOutlined),
          okText: t('sys.ok'),
          cancelText: t('sys.cancel'),
          async onOk() {
            await deleteMessageSetting({
              ids: data.id!,
            });
            createMessage.success(t('sys.operationSuccess'));
            getMessageSettingTypedList();
          },
          onCancel() {},
        });
        break;
      case CardDropdownEnum.Test:
        openMessageTestModal(true, {
          id: data.id,
          type: activeKey.value,
        });
        break;
      default:
        break;
    }
  };
</script>

<style lang="less" scoped>
  .section-header {
    border-bottom: 1px solid #e0e3ea;
  }
  .tab-wrapper {
    margin: 20px;
    background: #fafafa;
  }
  .ant-tabs {
    flex: 1;
    :deep(.ant-tabs-nav) {
      background-color: #fff;
      padding-left: 24px;
      margin-bottom: 0;
    }
    :deep(.ant-tabs-content-holder) {
      padding: 20px 20px 0;
      border: 1px solid #f0f0f0;
      border-top-width: 0;
      border-radius: 0 0 4px 4px;
    }
  }

  .template-card {
    &__list {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      height: var(--height);
      align-content: start;
      overflow-y: auto;
    }

    &__item {
      background-color: #fff;
      padding: 16px;
      border-radius: 4px;
      transition: all 0.3s;
      position: relative;
      border: 1px solid #e0e0e0;
      &:hover {
        border-color: #fff;
        box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.12);
      }
    }

    &__header {
      display: flex;
      align-items: center;
    }

    &__icon {
      height: 24px;
      width: 24px;
    }

    &__name {
      font-weight: bold;
      font-size: 16px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-left: 8px;
      padding-right: 15px;
      line-height: 24px;
    }

    &__btn-box {
      width: 100%;
      display: flex;
      justify-content: space-between;
      background: #fafafa;
      border-radius: 4px;
      border: 1px solid #f0f0f0;
      padding: 6px 0 6px 12px;
      .ant-btn {
        visibility: hidden;
      }
      &:hover {
        border-color: var(--ant-primary-color);
        .ant-btn {
          visibility: visible;
        }
      }
    }

    &__desc {
      flex: 1;
      // color: #666;
      font-size: 14px;
      line-height: 32px;
      // height: 40px;
      // display: -webkit-box;
      // -webkit-line-clamp: 1;
      // -webkit-box-orient: vertical;
      // overflow: hidden;
      // word-break: break-all;
      // margin-top: 6px;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__more {
      position: absolute;
      font-weight: bold;
      top: 10px;
      right: 12px;
      cursor: pointer;
    }
  }
</style>
