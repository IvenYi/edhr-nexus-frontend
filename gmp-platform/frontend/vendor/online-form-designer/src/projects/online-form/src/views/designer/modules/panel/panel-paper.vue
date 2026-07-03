<template>
  <div class="panel-document">
    <div class="pl-12px pr-12px pt-20px pb-20px">
      <form-item
        :label="$t('sys.appDesigner.printDesign.form.name2')"
        :inline="false"
        class="important-mt-0"
      >
        <span class="color-[#212528] text-12px lh-[18px]">{{ doc.name }}</span>
      </form-item>
      <form-item class="mt-16px" :label="$t('sys.dataSet.modelName')" :inline="false">
        <span class="color-[#212528] text-12px lh-[18px]">{{ doc.modelName }}</span>
      </form-item>
    </div>

    <div class="h-1px bg-[#E0E3EA]"></div>

    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.pageDesigner.pageProp')">
        <form-item
          :label="$t('sys.onlineForm.paperProperties')"
          :inline="false"
          class="important-mt-0"
        >
          {{ doc.paperSize === 'CUSTOM' ? $t('sys.customize') : doc.paperSize }} ({{
            doc.width
          }}mm*{{ doc.height }}mm)
        </form-item>

        <form-item :label="$t('sys.onlineForm.pageOrientation')" :inline="false" class="mt-12px">
          <a-radio-group
            class="radio-group__orientation important-mt-4px"
            v-model:value="paper.orientation"
            :disabled="sheetReadonly"
          >
            <label>
              <div>
                <PortraitIcon />
              </div>
              <a-radio :value="Orientation.Portrait">
                {{ $t('sys.appDesigner.printDesign.form.portrait') }}
              </a-radio>
            </label>
            <label>
              <div>
                <LandscapeIcon />
              </div>
              <a-radio :value="Orientation.Landscape">
                {{ $t('sys.appDesigner.printDesign.form.landscape') }}
              </a-radio>
            </label>
          </a-radio-group>
        </form-item>

        <form-item :label="$t('sys.onlineForm.marginSetting')" :inline="false">
          <padding-setting :padding="paper.padding" :disabled="sheetReadonly" class="mt-4px" />
        </form-item>

        <form-item :label="$t('sys.onlineForm.header')" class="justify-between">
          <div class="flex justify-end">
            <a-switch size="small" :disabled="sheetReadonly" v-model:checked="paper.paperHeader" />
          </div>
        </form-item>
        <form-item :label="$t('sys.footer')" class="justify-between">
          <div class="flex justify-end">
            <a-switch size="small" :disabled="sheetReadonly" v-model:checked="paper.paperFooter" />
          </div>
        </form-item>
        <form-item
          v-if="!isTextOnlineForm"
          :label="$t('sys.onlineForm.formHeader')"
          :inline="false"
        >
          <div v-if="paper.thead?.thName" class="dynamic-table">
            <div class="dynamic-table__header">
              <span>{{ paper.thead?.thName }}</span>
              <i
                v-if="!sheetReadonly"
                class="iconfont icon-shanchu2"
                @click.stop="() => removeThead()"
              ></i>
            </div>
          </div>
          <div v-else class="flex justify-center color-[#bebdc7]">
            {{ $t('sys.onlineForm.noHeaderSetYet') }}
          </div>
        </form-item>

        <SubTableList :type="SubTableType.DEFAULT" :tables="dynamicTables" />
        <SubTableList :type="SubTableType.FIXED" :tables="fixedTables" />
        <SubTableList :type="SubTableType._2D" :tables="_2DTables" />
        <!-- <SubTableList :type="SubTableType.CHECK" :tables="checkTables" /> -->
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { SubTableType } from '/@online-form/views/designer/enums';
  import LandscapeIcon from '/@online-form/views/designer/icons/landscape.vue';
  import PortraitIcon from '/@online-form/views/designer/icons/portrait.vue';
  import PaddingSetting from '/@online-form/views/designer/modules/base/padding-setting.vue';
  import SubTableList from './comps/sub-table-list.vue';
  import { ref, computed } from 'vue';

  const { paper, removeThead, doc, sheetReadonly, isTextOnlineForm, globalSubTables } =
    useSpreadSheet();
  const Orientation = {
    Portrait: 'portrait',
    Landscape: 'landscape',
  } as const;

  const dynamicTables = computed(() => {
    return globalSubTables.value.filter((item) => item.type === SubTableType.DEFAULT);
  });
  const fixedTables = computed(() => {
    return globalSubTables.value.filter((item) => item.type === SubTableType.FIXED);
  });
  const _2DTables = computed(() => {
    return globalSubTables.value.filter((item) => item.type === SubTableType._2D);
  });
  const activeCollapse = ref(['1', '2', '3']);
</script>

<style lang="less" scoped>
  .radio-group {
    &__orientation {
      display: flex;
      justify-content: space-between;
      & > label {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;

        & > div {
          height: 48px;
          width: 102px;
          border-radius: 4px;
          border: 1px solid #e8ebf0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }

        &:has(:checked) > div {
          border-color: var(--ant-primary-color);
        }
        &:has(:checked) :deep(svg) path {
          color: var(--ant-primary-color);
        }
      }
    }
  }

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
