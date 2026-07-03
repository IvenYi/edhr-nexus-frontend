<template>
  <div :class="['mobile-edhr-menu']">
    <TreeToolkit :treeVisible="treeVisible" @open="openTreeVisible" />

    <div
      class="mobile-tree-container"
      :style="{ width: treeVisible ? '280px' : '0px', transition: 'width 0.3s' }"
    >
      <div class="content">
        <div class="mobile-tree-title-content">
          <div class="mobile-tree-title" :title="treeTitle">{{ treeTitle }}</div>
          <div class="mobile-action-btn">
            <i
              class="iconfont icon-caidanshouqi1 cursor-pointer"
              @click.stop="closeTreeVisible"
            ></i>
          </div>
        </div>
        <tree-menu
          :wikiTreeData="wikiTreeData"
          :treeSelectDocData="treeSelectDocData"
          @select="onSelect"
          @openInstance="changeInstanceVisible"
        />
      </div>
    </div>

    <ChangeFormInsPopup
      v-model:show="showFormInsPopup"
      :docInstanceList="docInstanceList"
      :selectedId="selectSelfInfo?.id"
      :searchValue="searchValue"
      :showAddBtn="showAddInstanceBtn"
      @search="onSearchInstance"
      @selected="onSelectInstanceItem"
      @create-new-ins="onCreateNewIns"
    />
  </div>
</template>

<script lang="ts" setup name="mobile-edhr-menu">
  import { computed, ref } from 'vue';
  import TreeToolkit from './_common_/tree-toolkit.vue';
  import TreeMenu from './_common_/tree-menu.vue';
  import ChangeFormInsPopup from './form-ins/change-form-ins-popup.vue';
  import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import { FormTypeEnum, type IWikiTreeData } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      tabActiveKey: string;
      searchValue: string;
      /** edhr实例 */
      edhrInstance?: EdhrInstanceResponse;
      /** wiki目录树 */
      wikiTreeData: Array<IWikiTreeData>;
      /** 在线表单实例列表 */
      docInstanceList: Array<OnlineFormInstanceResponse>;
      /** 选择的表单信息 */
      treeSelectDocData: any;
      /** 选择的实例信息 */
      selectSelfInfo: any;
      /** 是否折叠 */
      isCollapse: boolean;
      /** 是否显示新增实例按钮 */
      showAddInstanceBtn?: boolean;
    }>(),
    {
      isCollapse: false,
      showAddInstanceBtn: true,
    },
  );

  const emit = defineEmits<{
    (e: 'update:searchValue', value: any): void;
    (e: 'update:tabActiveKey', value: any): void;
    (e: 'update:treeSelectDocData', value?: any): void;
    (e: 'update:selectSelfInfo', value?: any): void;
    (e: 'createNewIns', description: string): void;
  }>();

  const treeVisible = ref<boolean>(false);
  const showFormInsPopup = ref(false);

  const treeTitle = computed(() => props.edhrInstance?.tmplName || '目录');

  function openTreeVisible() {
    treeVisible.value = true;
  }

  const closeTreeVisible = () => {
    treeVisible.value = false;
    showFormInsPopup.value = false;
  };

  const changeInstanceVisible = (data) => {
    if (props.treeSelectDocData?.id === data.id) {
      showFormInsPopup.value = !showFormInsPopup.value;
      return;
    }
    onSelect(data);
  };

  function onSelect(data) {
    if (props.treeSelectDocData?.id === data.id) return;

    emit('update:treeSelectDocData', data);
    emit('update:selectSelfInfo', null);
    emit('update:tabActiveKey', '2');
    if (
      showFormInsPopup.value &&
      ![FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(data.formType)
    ) {
      showFormInsPopup.value = false;
    }
  }

  function onSearchInstance(value) {
    emit('update:searchValue', value);
  }

  async function onSelectInstanceItem(data) {
    if (props.selectSelfInfo?.id === data.id) {
      return;
    }

    emit('update:selectSelfInfo', data);
    emit('update:tabActiveKey', '2');
  }

  async function onCreateNewIns(description) {
    emit('createNewIns', description);
  }
</script>

<style lang="less" scoped>
  .mobile-edhr-menu {
    position: relative;
    display: flex;
    background-color: #fff;
    .mobile-tree-container {
      position: relative;
      color: rgba(0, 0, 0, 0.6);
      height: auto;
      display: block;
      background: #fff;
      display: flex;
      flex-shrink: 0;
      flex-direction: column;
      min-height: 200px;
      z-index: 1;

      .content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .mobile-tree-title-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;

          &::after {
            content: '';
            position: absolute;
            background-color: #e0e3eb;
            height: 1px;
            bottom: 0;
            left: 0;
            right: 0;
          }

          &::before {
            content: '';
            position: absolute;
            background-color: #e0e3eb;
            height: 1px;
            top: 0;
            left: 0;
            right: 0;
          }

          .mobile-tree-title {
            color: #1a1d23;
            font-size: 16px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 4px;
            line-height: 24px;
            cursor: default;
          }

          .mobile-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            .iconfont {
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 1;
              color: var(--van-primary-color);
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }
  }
</style>
