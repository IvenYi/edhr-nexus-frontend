<template>
  <DesignerWrapper
    :class="[
      'apaas-si',
      currentDesignMode === DesignMode.CollectView && 'collect-view',
      currentDesignMode === DesignMode.Refer && 'refer-view',
    ]"
  >
    <template #toolbar>
      <toolbar-hook v-if="currentDesignMode !== DesignMode.Refer" />
    </template>
    <template #spreadSheet>
      <spread-sheet :loading="loading" />
    </template>
    <template #toolkit>
      <toolkit-hook :show-fields="showFields" />
    </template>
    <template #panel>
      <panel />
    </template>
  </DesignerWrapper>
</template>

<script setup lang="ts" name="apaas-collect">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { isEmpty } from 'lodash-es';
  import { uploaderFiles } from '/@/utils/file/download';
  import SpreadSheet from '/@online-form/views/designer/modules/sheet.vue';
  import ToolbarHook from '/@online-form/views/designer/modules/toolbar-hook.vue';
  import ToolkitHook from '/@online-form/views/designer/modules/toolkit-hook.vue';
  import Panel from '/@online-form/views/designer/modules/panel.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { usePrint } from '/@online-form/views/designer/hooks/usePrint';
  import { DesignMode } from '/@online-form/views/designer/enums';
  import DesignerWrapper from '/@online-form/views/designer/modules/base/designer-wrapper.vue';

  const props = defineProps<{
    /** 模板id */
    tid: string;
    designMode?: DesignMode;
  }>();

  const LOCAL_PLATFORM_PAAS_SI = 'INTEGRATION_PAAS_SI';
  const router = useRouter();
  const { initialize, loading } = usePrint();

  const {
    doc,
    paper,
    cachePaper,
    isTextOnlineForm,
    globalSubTables,
    save: formSave,
    designMode: currentDesignMode,
    setPlatformType,
    validateImportFile,
    importFileToPaper,
    publish,
    removeThead,
    removeSubTable,
    sheetsHasChanged,
  } = useSpreadSheet();

  setPlatformType(LOCAL_PLATFORM_PAAS_SI as any);

  initialize(props.tid, props.designMode, true);

  const showFields = computed(() => !isEmpty(doc.value) && !isTextOnlineForm.value);

  /**
   * 判断是否需要保存模板
   * @returns true: 需要保存
   * @returns false: 不需要保存
   */
  function verifyTemplateSave() {
    const designerJson = JSON.stringify(paper.value);
    const cache_designerJson = JSON.stringify(cachePaper.value);
    if (designerJson !== cache_designerJson) {
      return true;
    }
    return false;
  }

  async function save() {
    await formSave();
    // 保存完后更新数据，不然数据会异常
    await initialize(props.tid, props.designMode, true);
  }

  /** 保存模板 */
  async function onTemplateSave() {
    await save();
  }

  /** 模拟填报 */
  const onSimulateFill = async () => {
    await save();
    router.push({
      path: '/render/render-mock-apaas',
      query: {
        tid: doc.value.id,
        local: '1',
      },
    });
  };

  /** 导入模板 */
  async function onImportTemplate(payload) {
    const files = await uploaderFiles({
      accept: '.xlsx,.xlsm,.docx,.xls,.doc',
    });
    const file = files[0];
    if (!file || !validateImportFile(file)) return;
    const importPayload =
      payload?.autoDetectFields && /\.(docx?|DOCX?)$/.test(file.name)
        ? { ...payload, withFields: false }
        : payload;
    removeThead();
    for (const item of globalSubTables.value) {
      removeSubTable(item);
    }
    await importFileToPaper(file, importPayload);
  }
  /** 单据发布 */
  async function onPublish() {
    await publish();
  }

  defineExpose({
    verifySave: verifyTemplateSave,
    sheetsHasChanged,
    onSave: onTemplateSave,
    onImportTemplate,
    onSimulateFill,
    onPublish: onPublish,
  });
</script>
<style lang="less">
  @import url('/@online-form/views/designer/styles/designer.less');
  @import url('/@online-form/views/designer/styles/spread-sheet.less');
  @import url('/@online-form/views/designer/styles/panel.less');
  @import url('/@online-form/views/designer/styles/antd.override.less');
  @import url('/@online-form/views/designer/styles/drop-box.less');
  @import url('/@online-form/views/designer/styles/dynamic-area.less');
  @import url('/@online-form/views/designer/styles/hover.less');

  .img-preview {
    z-index: 2000 !important;
  }
</style>
<style lang="less" scoped></style>
