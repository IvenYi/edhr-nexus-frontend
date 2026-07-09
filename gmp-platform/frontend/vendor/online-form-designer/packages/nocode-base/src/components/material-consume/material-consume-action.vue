<template>
  <div v-if="isEditing" class="material-consume-action-bar">
    <div class="sub-table-btn btn-confirm" @click="handleConfirm">
      <i class="iconfont icon-tijiao1"></i>
    </div>
  </div>
  <a-popover
    v-if="showScanBtn"
    placement="bottomLeft"
    ref="tooltipRef"
    overlayClassName="material-consume-action-popover"
  >
    <template #content>
      <a-menu @click="handleMenuClick">
        <a-menu-item v-for="item in showMenus" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </template>
    <div class="material-consume-action-bar">
      <div class="sub-table-btn">
        <i class="iconfont icon-saoyisao"></i>
      </div>
    </div>
  </a-popover>
</template>

<script lang="ts" setup name="material-consume-action">
  import { IMaterialConsumeData } from '../../hooks';
  import { MaterialConsumeActionType } from './types';
  import { reactive, computed, watch, onMounted, ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      showBom?: boolean;
      showScanBtn?: boolean;
      rowData: IMaterialConsumeData;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'doAction', action: string, row: IMaterialConsumeData): void;
  }>();

  const isEditing = computed(() => {
    return !props.rowData.is_confirmed_;
  });

  const AllMenus = Object.values(MaterialConsumeActionType).map((e) => ({
    key: e,
    label: $t(`sys.edhr.materialConsumeAction.${e}`),
  }));

  const showMenus = computed(() => {
    return AllMenus.filter((e) => {
      // 确认单独化
      if (e.key === MaterialConsumeActionType.CONFIRM) {
        return false;
      }
      // if (!props.showBom && e.key === MaterialConsumeActionType.VIEW_BOM) {
      //   return false;
      // }
      return true;
    });
  });

  const handleMenuClick = (e) => {
    emit('doAction', e.key, props.rowData);
  };

  const handleConfirm = () => {
    emit('doAction', MaterialConsumeActionType.CONFIRM, props.rowData);
  };
</script>

<style lang="less" scoped>
  .material-consume-action-bar {
    margin-left: 4px;
    .sub-table-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid #026ac8;
      color: #026ac8;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0px 4px 4px 0px rgba(143, 143, 143, 0.25);
      &:hover {
        background: rgba(2, 106, 200, 0.16);
      }

      .iconfont {
        line-height: 1;
        font-size: 14px;
      }

      &.quick-fill-btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &.btn-confirm {
        border-color: #48c65c;
        color: #48c65c;
        &:hover {
          background: rgba(72, 198, 92, 0.16);
        }
      }
    }
  }
</style>

<style lang="less">
  .material-consume-action-popover {
    padding-top: 0 !important;

    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner-content {
      padding: 4px;
      .ant-menu-inline,
      .ant-menu-vertical,
      .ant-menu-vertical-left {
        border: 0;
      }

      .ant-menu-vertical > .ant-menu-item {
        height: 32px;
        line-height: 32px;
        margin: 0;
        padding: 0 5px;
        &:hover {
          background: rgba(2, 106, 200, 0.1);
          border-radius: 4px 4px 4px 4px;
          font-weight: 500;
        }
      }
    }
  }
</style>
