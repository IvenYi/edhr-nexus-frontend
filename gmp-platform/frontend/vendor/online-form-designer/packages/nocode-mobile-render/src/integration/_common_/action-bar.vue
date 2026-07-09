<template>
  <div class="action-bars">
    <!-- <van-button class="action-btn" type="default" @click="onActionBarClickItem('dhr-log')">
      DHR操作日志
    </van-button> -->
    <van-button class="action-btn" type="default" @click="onActionBarClickItem('link-list')">
      关联列表
    </van-button>
    <van-popover v-model:show="showPopover" placement="bottom" :show-arrow="false">
      <div class="action-nav-bar-buttons">
        <div v-for="btn in actionButtons" :key="btn.type" class="nav-bar-button-item">
          <van-button class="nav-bar-button" @click="onActionBarClickItem(btn.type)">
            <gct-icon class="nav-bar-icon" :value="btn.icon" :size="26" />
            <div class="nav-bar-title">{{ btn.name }}</div>
          </van-button>
        </div>
      </div>

      <template #reference>
        <van-button class="action-btn" type="default" icon-position="right">
          <template #icon
            ><i
              class="iconfont"
              :class="showPopover ? 'icon-arrow_up_pad' : 'icon-arrow_down_pad'"
            ></i></template
          >更多
        </van-button>
      </template>
    </van-popover>

    <OtherListPopup
      v-model:show="showOtherListPopup"
      :title="title"
      :otherList="sourceList"
      :selectedId="otherInfoId"
      @selected="onSelectFormItem"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { GctPopup } from '@mobile/utils/popup';
  import OtherListPopup from '../other-list/other-list-popup.vue';
  import EdhrInsRelationPopup from '../form-ins/edhr-ins-relation/edhr-ins-relation-popup.vue';
  import { EdhrInstanceResponse } from '/@/apis/gct-apaas/model';

  type ButtonType = 'appendix' | 'release' | 'txn' | 'rework' | 'link';

  interface ActionButton {
    name: string;
    icon: string;
    type: ButtonType;
  }

  const actionButtons: ActionButton[] = [
    { name: '附录', icon: 'icon-preset:edhr-zhankaifulu', type: 'appendix' },
    { name: '放行单', icon: 'icon-preset:edhr-fangxingdan', type: 'release' },
    { name: '事务', icon: 'icon-preset:edhr-shiwu', type: 'txn' },
    { name: '返工', icon: 'icon-preset:edhr-fangong', type: 'rework' },
    { name: '关联', icon: 'icon-preset:edhr-guanlian', type: 'link' },
  ];

  const props = defineProps<{
    /** edhr实例 */
    edhrInstance?: EdhrInstanceResponse;
    tabActiveKey: string;
    /** 放行单列表 */
    releaseList: any;
    /** eDHR附录 */
    appendixList: any;
    /** 事务列表 */
    transactionList: any;
    /** 返工列表 */
    reworkList: any;
    /** 关联列表 */
    linkList: any;
    /** 选择的放行单实例信息 */
    selectReleaseInfo: any;
    /** 选择的附录实例信息 */
    selectAppendixInfo: any;
    /** 选择的事务实例信息 */
    selectTransactionInfo: any;
    /** 选择的返工实例信息 */
    selectReworkInfo: any;
    /** 选择的关联实例信息 */
    selectLinkInfo: any;
  }>();

  const emit = defineEmits<{
    (e: 'update:tabActiveKey', value: any): void;
    (e: 'update:selectReleaseInfo', value?: any): void;
    (e: 'update:selectAppendixInfo', value?: any): void;
    (e: 'update:selectTransactionInfo', value?: any): void;
    (e: 'update:selectReworkInfo', value?: any): void;
    (e: 'update:selectLinkInfo', value?: any): void;
  }>();

  const showPopover = ref(false);
  const showOtherListPopup = ref(false);
  const currentBarType = ref<ButtonType | ''>('');

  const title = computed(() => {
    const map: Record<ButtonType, string> = {
      appendix: '附录列表',
      release: '放行单列表',
      txn: '事务列表',
      rework: '返工列表',
      link: '关联列表',
    };
    return currentBarType.value ? map[currentBarType.value] : '';
  });

  const sourceList = computed(() => {
    const map: Record<ButtonType, any> = {
      appendix: props.appendixList,
      release: props.releaseList,
      txn: props.transactionList,
      rework: props.reworkList,
      link: props.linkList,
    };
    return currentBarType.value ? map[currentBarType.value] : [];
  });

  const otherInfoId = computed(() => {
    const map: Record<ButtonType, any> = {
      appendix: props.selectAppendixInfo?.id,
      release: props.selectReleaseInfo?.id,
      txn: props.selectTransactionInfo?.id,
      rework: props.selectReworkInfo?.id,
      link: props.selectLinkInfo?.id,
    };
    return currentBarType.value ? map[currentBarType.value] : '';
  });

  function onActionBarClickItem(what: 'dhr-log' | 'link-list' | ButtonType) {
    if (what === 'dhr-log') {
      return;
    }

    if (what === 'link-list') {
      GctPopup.open(EdhrInsRelationPopup, {
        edhrInsId: props.edhrInstance?.id,
      });
      return;
    }

    currentBarType.value = what;
    showPopover.value = false;
    showOtherListPopup.value = true;
  }

  function handleChangeContentTab(key: string, data: any) {
    emit('update:tabActiveKey', key);

    const keyMap: Record<string, string> = {
      '1': 'update:selectReleaseInfo',
      '3': 'update:selectAppendixInfo',
      '4': 'update:selectTransactionInfo',
      '5': 'update:selectReworkInfo',
      '6': 'update:selectLinkInfo',
    };
    const emitKey = keyMap[key];
    if (emitKey) emit(emitKey, data);
  }

  function onSelectFormItem(data: any) {
    const typeMap: Record<ButtonType, string> = {
      appendix: '3',
      release: '1',
      txn: '4',
      rework: '5',
      link: '6',
    };
    const key = currentBarType.value ? typeMap[currentBarType.value] : '';
    if (key) handleChangeContentTab(key, data);

    currentBarType.value = '';
  }
</script>

<style scoped lang="less">
  .action-bars {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    .action-btn {
      height: 40px;
    }
  }

  .action-nav-bar-buttons {
    display: flex;
    flex-direction: column;
    width: 88px;

    .nav-bar-button-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-top: 1px solid #e0e3eb;

      &:first-child {
        border-top: none;
      }
    }

    .nav-bar-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      padding: 16px;
      border: none;
      width: 100%;
      height: 100%;

      .nav-bar-title {
        color: #5a5f6b;
        margin-top: 6px;
        line-height: 18px;
        text-align: center;
      }
    }
  }
</style>
