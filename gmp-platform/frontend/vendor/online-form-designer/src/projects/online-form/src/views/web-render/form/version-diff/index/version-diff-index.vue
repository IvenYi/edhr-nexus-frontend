<template>
  <div :class="['version-diff-index']">
    <div class="version-diff-index__header ks-row-middle px16px">
      <div>
        <left-outlined class="mr16px back-icon" @click="onBack" />
        <span class="version-diff-index__header-title">{{ compareVersion?.name }}</span>
      </div>
      <div class="ks-row justify-end gap-12px">
        <a-button @click="openCustomCompare">{{ $t('sys.webRender.customCompare') }}</a-button>
        <a-button type="primary" @click="openVersionHistory">
          {{ $t('sys.webRender.versionList') }}
        </a-button>
      </div>
    </div>
    <div :class="['version-diff-index__content']">
      <div :class="['version-diff-index__content-left']">
        <div v-if="baseVersion" class="version-diff-index__version-wrapper">
          <div class="version-diff-index__version-wrapper-title">
            {{ $t('sys.onlineForm.baseVersion') }}{{ baseVersion.version }}
          </div>
          <div class="version-diff-index__version-wrapper-content">
            <PreviewIframe
              class="w-full h-full"
              ref="baseSheet"
              :id="baseVersion.id"
              @sheetChange="onBaseSheetChange"
            />
          </div>
        </div>
        <div v-if="compareVersion" class="version-diff-index__version-wrapper">
          <div class="version-diff-index__version-wrapper-title">
            {{ $t('sys.onlineForm.comparisonVersion') }}{{ compareVersion.version }}
          </div>
          <div class="version-diff-index__version-wrapper-content">
            <DiffSheet
              class="w-full h-full"
              ref="compareSheet"
              :id="compareVersion.id"
              :tmpl="compareVersion"
              :selectedCell="selectedCell"
              @sheetChange="onCompareSheetChange"
            />
          </div>
        </div>
      </div>
      <div v-if="!noDesignDiff" :class="['version-diff-index__content-right']">
        <div class="ks-column overflow-hidden h100%">
          <FieldDiffTabs
            v-if="versionDiffData.length"
            v-model:value="selectedTab"
            :options="versionDiffData"
          />
          <fieldDiffList
            :selectedValue="selectedField"
            :data="selectedTabList"
            class="ks-col"
            @change="changeSelectedField"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="version-diff-index">
  import { reactive, computed, watch, onMounted, ref, watchEffect } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import PreviewIframe from '../iframe/preview-iframe.vue';
  import DiffSheet from '../sheet/diff-sheet.vue';
  import { useVersionDiff } from './use-version-diff';
  import FieldDiffTabs from '../field-diff/field-diff-tabs.vue';
  import fieldDiffList from '../field-diff/field-diff-list.vue';

  const props = defineProps<{
    modal: IModal;
    id: string;
  }>();

  const {
    init,
    baseVersion,
    compareVersion,
    noDesignDiff,
    openCustomCompare,
    openVersionHistory,
    versionDiffData,
    selectedField,
    changeSelectedField,
  } = useVersionDiff();

  const selectedTab = ref<any>('all');
  const baseSheet = ref<any>();
  const compareSheet = ref<any>();
  const selectedCell = computed(() => {
    return selectedField.value?.cellInfo;
  });

  const selectedTabList = computed(() => {
    return versionDiffData.value.find((item) => item.value === selectedTab.value)?.options || [];
  });

  onMounted(() => {
    init(props.id);
  });

  const onBack = async () => {
    props.modal.dismiss();
  };

  // 分页切换联动
  const onBaseSheetChange = (e): void => {
    console.log('version-diff-index onBaseSheetChange', e);
    compareSheet.value?.setActiveSheet(e.to);
  };

  const onCompareSheetChange = (e): void => {
    console.log('version-diff-index onCompareSheetChange', e);
    baseSheet.value?.setActiveSheet(e.to);
  };
</script>

<style lang="less" scoped>
  .version-diff-index {
    height: 100%;
    &__header {
      background: #ffffff;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &-title {
        font-weight: 500;
        font-size: 14px;
        color: #1a1d23;
      }
    }
    &__content {
      height: calc(100% - 64px);
      width: 100%;
      display: flex;

      &-left {
        display: flex;
        padding: 16px;
        flex-grow: 1;
        width: 1px;
        height: 100%;
        background: #e6e7ea;
        gap: 16px;

        > * {
          background: #ffffff;
          height: 100%;
          width: 1px;
          flex-grow: 1;
        }
      }

      &-right {
        height: 100%;
        width: 290px;
        background-color: #f9fafb;
      }
    }

    &__version-wrapper {
      &-title {
        line-height: 40px;
        font-weight: 500;
        font-size: 14px;
        color: #1a1d23;
        padding-left: 16px;
        border-bottom: 1px solid #e0e3eb;
      }
      &-content {
        height: calc(100% - 41px);
        width: 100%;
      }
    }
  }
</style>
