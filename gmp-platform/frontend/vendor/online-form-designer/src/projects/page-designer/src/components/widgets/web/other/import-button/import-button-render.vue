<template>
  <div class="inline-block align-middle">
    <basicButton
      v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
      @click="onclick"
      :loading="loading"
      v-bind="basic"
      dropdown
      @dropdown="download"
    >
      {{ title }}
      <template #icon>
        <a-tooltip title="下载模板">
          <vertical-align-bottom-outlined />
        </a-tooltip>
      </template>
      <Modal v-model:visible="visible" :footer="null" title="导入失败">
        <a-table :dataSource="dataSource" :pagination="false" size="small">
          <a-table-column key="index" title="表格序号" data-index="index" width="60" />
          <a-table-column key="error" title="导入失败原因" data-index="error">
            <template #default="{ text: error }">
              <a-tag color="error" v-for="(tag, index) in error" :key="index">{{ tag }}</a-tag>
            </template>
          </a-table-column>
        </a-table>
      </Modal>
    </basicButton>
    <!-- 新版本的BaseButton -->
    <div class="ks-row-middle">
      <baseButton
        :widget="widget"
        class="import-base-btn"
        v-if="!Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
        v-bind="widget.props"
        @click="onclick"
      />
      <a-tooltip placement="bottom" title="下载模板">
        <baseButton
          :widget="widget"
          class="import-download"
          v-if="!Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
          v-bind="{
            ...widget.props,
            hasText: false,
            hasIcon: true,
            icon: 'icon-daoru',
            title: '',
          }"
          :style="{
            '--line-height':
              widget.props.type === 'link' ||
              (widget.props.enableCustomColor && whiteColor.includes(widget.props.backgroundColor!))
                ? '16px'
                : '100%',
            '--download-border-color': lineBgColor,
          }"
          @click="download"
        />
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-import-button">
  import { ref, reactive, computed } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { ExportButton } from '/@page-designer/types/web';
  import { Modal } from 'ant-design-vue';
  import { uploaderFiles, downloadByUrl } from '/@/utils/file/download';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { getExcelTmplDetail } from '/@/apis/gct-apaas/ExcelTmplController';
  import basicButton from '../../__components__/basic_button.vue';
  import baseButton from '../../__components__/base_button.vue';
  import { ImportModal } from './import-modal/import-modal';
  import { ImportLoading } from './import-loading/import-loading';
  import { EntityModelCategoryEnum, EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
  import { useI18n } from 'vue-i18n';
  import { useTheme } from '/@/hooks/web/useTheme';

  const { themeVars } = useTheme();

  const { t } = useI18n();

  const props = defineProps<{ widget: ExportButton }>();
  const { title, templateKey, model, basic, modeldata, timeout, refTable } = reactive(
    props.widget.props,
  );

  const whiteColor = ['#FFFFFF', '#ffffff', '#fff', '#FFF'];
  const lineBgColor = computed(() => {
    const { type, enableCustomColor, backgroundColor, fontColor } = props.widget.props;
    if (type === 'link') return !enableCustomColor ? themeVars.primaryColor : fontColor;
    else if (type === 'primary' || (enableCustomColor && !whiteColor.includes(backgroundColor!)))
      return '#fff';
    else if (enableCustomColor && whiteColor.includes(backgroundColor!)) return fontColor;
    else return '#E8EBF0';
  });

  const importData = {
    key: model,
    action: modeldata?.modelType === EntityModelTypeEnum.RDO ? 'rdoImport' : 'import',
    modelCategory: modeldata?.modelCategory || EntityModelCategoryEnum.ENTITY,
  };
  const Event = getPageEvent();
  const loading = ref(false);
  const visible = ref(false);
  const dataSource = ref([]);
  async function onclick() {
    loading.value = true;
    const [file] = await uploaderFiles({ accept: '.xlsx' });
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tmplKey', templateKey);
    formData.append('startRowNo', '3');
    formData.append('headerRowNo', '2');
    await Event.runEventByName('beforeImport', props.widget.events);
    const res = await gct.openUtil.modal(
      ImportModal,
      {},
      {
        title: t('sys.pageDesigner.importDataFromExcel'),
        height: 520,
        width: 640,
        okText: t('sys.pageDesigner.nextStep'),
      },
    );
    if (res.ok && res.data) {
      const data = res.data[0];
      if (data) {
        formData.append('importInvalidate', data.mode);
        await gct.openUtil.modal(
          ImportLoading,
          { importEvent: () => importEvent(formData) },
          {
            title: t('sys.pageDesigner.importDataFromExcel'),
            showFooter: false,
            wrapClassName: 'import-button-state-modal',
            height: 520,
            width: 640,
          },
        );
      }
    }
    await Event.runEventByName('afterImport', props.widget.events);
    if (refTable) {
      Event.getComponent(refTable)?.reload();
    }
    loading.value = false;
  }
  const importEvent = (formData, params: IData = {}) => {
    if (!templateKey) return {};
    return Event.context.$httpBizService(importData, formData, params, {
      transferToConfig: {
        timeout: timeout * 1000,
        headers: {
          'Content-Type': 'multipart/form-data;charset=UTF-8',
        },
      },
    });
  };
  async function download() {
    console.log('download');
    if (!templateKey) return;
    loading.value = true;
    try {
      let { filePath, name: fileName } = await getExcelTmplDetail({
        modelKey: model,
        key: templateKey,
      });
      const url = transformUrl(filePath);
      downloadByUrl({ url, fileName: fileName + '.xlsx' });
    } catch (error) {}
    loading.value = false;
  }
  defineExpose({});
</script>
<style scoped lang="less">
  .square {
    height: 72px !important;
  }

  .download {
    padding: 4px 8px;
  }

  .import-base-btn {
    :deep(.ant-btn) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right-color: transparent;
    }
  }

  .import-download {
    position: relative;

    :deep(.ant-btn) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left-color: transparent;
      // border-left-color: var(--download-border-color);
    }

    &::before {
      content: '';
      display: block;
      position: absolute;
      z-index: 1;
      top: 50%;
      left: 0;
      width: 1px;
      height: var(--line-height);
      transform: translateY(-50%);
      background-color: var(--download-border-color);
    }
  }
</style>
