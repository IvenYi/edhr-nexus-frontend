<template>
  <form-item
    v-if="!isTextOnlineForm"
    :label="t('sys.onlineForm.subTableType.' + type)"
    :inline="false"
  >
    <div class="dynamic-table" v-for="item in tables" :key="item.id">
      <template v-if="item.thName">
        <div class="dynamic-table__header mb-4px">
          <span>{{ item.thName }}</span>
          <i
            v-if="!sheetReadonly"
            class="iconfont icon-shanchu2"
            @click.stop="() => removeThead(item)"
          ></i>
        </div>
        <div class="dynamic-table__link">
          <i class="iconfont icon-lianjie2"></i>
        </div>
      </template>
      <div class="dynamic-table__body">
        <span
          @click="
            () =>
              setPanelData({
                type: panelMap[type],
                refId: item.id,
              })
          "
          >{{ item.name }}</span
        >
        <i
          v-if="!sheetReadonly"
          class="iconfont icon-shanchu2"
          @click.stop="() => removeSubTable(item)"
        ></i>
      </div>
    </div>
    <div v-if="!tables.length" class="flex justify-center color-[#bebdc7]">
      {{ $t('sys.onlineForm.notSetYet') }}{{ t('sys.onlineForm.subTableType.' + type) }}
    </div>
  </form-item>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType, SubTableType } from '/@online-form/views/designer/enums';
  import { ITable } from '/@online-form/views/designer/types';
  import { useI18n } from '/@/hooks/web/useI18n';

  const panelMap = {
    [SubTableType.DEFAULT]: PanelType.DynamicTable,
    [SubTableType.CHECK]: PanelType.CheckTable,
    [SubTableType.FIXED]: PanelType.FixedTable,
    [SubTableType._2D]: PanelType._2DTable,
  };

  withDefaults(
    defineProps<{
      type?: SubTableType;
      tables: ITable[];
    }>(),
    {
      type: SubTableType.DEFAULT,
    },
  );

  const { removeSubTable, removeThead, setPanelData, sheetReadonly, isTextOnlineForm } =
    useSpreadSheet();
  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .dynamic-table {
    padding: 4px 6px 4px 4px;
    background: #f2f4f7;
    border-radius: 4px;
    position: relative;

    &:has(> div.mb-4px) {
      padding-left: 24px;
    }

    &:not(:first-child) {
      margin-top: 6px;
    }

    & > div {
      display: flex;
      align-items: center;
    }
    .dynamic-table__header,
    .dynamic-table__body {
      span {
        height: 26px;
        background: #ffffff;
        border-radius: 4px;
        border: 1px solid #e8ebf0;
        flex: 1;
        color: #212528;
        display: inline-block;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        padding: 0 8px;
      }

      i {
        flex: none;
        color: #797a7d;
        cursor: pointer;
        margin-left: 5px;
      }
    }

    &__link {
      height: 32px;
      width: 16px;
      position: absolute;
      top: 0;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      left: 8px;
      &::before,
      &::after {
        display: block;
        content: '';
        width: 12px;
        height: 10px;
        border-radius: 2px;
        border-left: 1px solid #c3c3c3;
        right: 0;
        position: absolute;
      }
      &::before {
        border-top: 1px solid #c3c3c3;
        top: 0;
      }
      &::after {
        border-bottom: 1px solid #c3c3c3;
        bottom: 0;
      }
      .iconfont {
        display: block;
        transform: rotate(-45deg);
        position: relative;
        left: -4px;
        color: #c3c3c3;
      }
    }
  }
</style>
