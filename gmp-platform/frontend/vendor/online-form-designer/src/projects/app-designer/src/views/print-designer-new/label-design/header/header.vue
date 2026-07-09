<template>
  <div class="designer-header">
    <a-breadcrumb>
      <a-breadcrumb-item>{{ labelInfo?.categoryName }}</a-breadcrumb-item>
      <a-breadcrumb-item> {{ labelInfo?.name }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="designer-header__actions">
      <a-button @click="print">
        <printer-outlined />
        {{ t('sys.printTest') }}
      </a-button>
      <a-button type="primary" @click="save(true)">
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.saveText') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { labelInfo, usePage } from '../hooks/usePage';
  import { putLabelUpdateDesigner } from '/@/apis/gct-apaas/LabelController';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePrinter } from '/@/hooks/develop/usePrinter';
  import { cloneDeep, isEmpty } from 'lodash-es';
  import { IFieldCOnfig } from './test-var-modal';

  import TestVarModal from './test-var-modal.vue';

  import { useDesigner } from '../hooks/useDesigner';
  import { PRINT_ELE_TYPE } from '../constants/CommonPrintElems';
  import { IModal } from '@gct/runtime';
  import html2canvas from 'html2canvas';
  import domtoimage from 'dom-to-image';
  import { postFileResourceBase64Upload } from '/@/apis/gct-apaas/FileResourceController';

  const { printLabelKey } = usePrinter();
  const { createMessage } = useMessage();
  const { project, loadLabelDesignHistoryList } = usePage();
  const { selectedPage, selectedElements, isModal } = useDesigner();
  const { t } = useI18n();

  const emit = defineEmits<{
    (e: 'toggleLoading', value: boolean): void;
  }>();

  const print = async () => {
    const varMap = isHaveVar();
    const testVar: any = {};
    if (varMap && varMap.length > 0) {
      // 过滤出除去固定数据变量的参数
      const arr = varMap.filter((_) => {
        return _.valType !== 'FIXED';
      });
      // 如果没有除去固定变量外的，则直接请求不弹窗
      if (arr.length === 0) {
        varMap.forEach((_) => {
          testVar[_.key] = _.defaultVal;
        });
      } else {
        selectedElements.value = [];
        const data = cloneDeep(selectedPage.value);
        isModal.value = true;
        const res = await gct.openUtil.modal<IModal>(
          TestVarModal,
          { fieldConfig: arr, data },
          {
            width: 800,
            height: 600,
            title: t('sys.printTest'),
            okText: t('sys.ok2'),
          },
        );
        if (res && res.ok && res.data) {
          console.log('testVar', testVar, res.data);
          Object.assign(testVar, res.data);
          isModal.value = false;
        } else {
          isModal.value = false;
          return;
        }
      }
    }
    // 先保存再出发预览，否则后台拿到的数据逻辑不对
    await save(false);
    printLabelKey(
      labelInfo.value?.key,
      {},
      {
        testVar,
        printType: labelInfo.value?.printType,
      },
    );
  };

  const save = async (flag) => {
    if (isHaveEmptyImg()) {
      createMessage.warning(t('sys.printDesigner.imgNotNull'));
      return;
    }
    if (isTextLength1000()) {
      createMessage.warning(t('文本最大1000字'));
      return;
    }
    emit('toggleLoading', true);

    // setTimeout(async () => {
    try {
      // 图标转base64
      for (let k in project.value.page) {
        const i = project.value.page[k];
        if (i.type === PRINT_ELE_TYPE.ICON) {
          const value = await svgToCanvas(i);
          i.attrs.src = { value };
        }
        if (i.type === PRINT_ELE_TYPE.RICH_TEXT) {
          const value = await richTextToCanvas(i);
          i.attrs.src = { value };
        }
      }
      await putLabelUpdateDesigner({
        designerJson: JSON.stringify(project.value),
        id: labelInfo.value!.id,
      });
      loadLabelDesignHistoryList();
      if (flag) {
        createMessage.success(t('sys.saveSuccess'));
      }
    } finally {
      emit('toggleLoading', false);
    }
    // }, 0);
  };

  const isHaveVar = () => {
    const varMap: IFieldCOnfig[] = [];
    (selectedPage.value as any[]).forEach((w) => {
      if (!w.attrs) {
        return;
      }
      if (w.attrs.content || w.attrs.text) {
        const { type, value } = w.attrs.content || w.attrs.text;
        switch (w.type) {
          case PRINT_ELE_TYPE.TEXT:
          case PRINT_ELE_TYPE.BAR_CODE:
          case PRINT_ELE_TYPE.QR_CODE:
            varMap.push({
              key: w.id,
              label: w.displayName,
              valType: type,
              defaultVal: type === 'FIXED' ? value : '',
            });
            break;
          default:
        }
      }
    });
    return varMap;
  };

  const isHaveEmptyImg = () => {
    let flag = false;
    (selectedPage.value as any[]).forEach((w) => {
      if (w.type === PRINT_ELE_TYPE.IMAGE && isEmpty(w.attrs.src.value)) {
        flag = true;
      }
    });
    return flag;
  };

  /** 检测文本大于大于1000字 */
  const isTextLength1000 = () => {
    let flag = false;
    (selectedPage.value as any[]).forEach((w) => {
      if (w.type === PRINT_ELE_TYPE.TEXT && w.attrs.text.value.length > 1000) {
        flag = true;
      }
    });
    return flag;
  };

  /**svg转png 目录的图标有引用 需要特殊处理 */
  function svgToCanvas(row) {
    console.log('row', row);
    const id = row.id;
    const iconValue = row.attrs.icon.value;
    let elDom;
    if (iconValue.startsWith('icon-platform:')) {
      const svgId = 'icon-' + iconValue.split(':')[1];
      elDom = document.getElementById(id);
      elDom.firstChild.appendChild(document.getElementById(svgId));
    } else {
      elDom = document.getElementById(id);
    }
    return new Promise((res, rej) => {
      domtoimage.toPng(elDom).then(async function (pngUrl) {
        //将 Canvas 转换为 Base64 图片 URL
        // const pngUrl = canvas.toDataURL('image/png');
        const url = await postFileResourceBase64Upload({
          type: 'LABEL_IMAGE',
          fileContent: pngUrl,
          filename: row.id,
        });
        // 创建一个新的图片元素并显示
        res(url);
      });
    });
  }

  /** 富文本特殊处理 */
  function richTextToCanvas(row) {
    let elDom;
    const timestamp = Date.now();
    // 创建一个新的 DIV 元素
    const newDiv = document.createElement('div');
    elDom = document.getElementById(row.id);
    newDiv.id = row.id + timestamp;
    newDiv.classList.add('copy-main');

    newDiv.style.borderTop = elDom.style.borderTop;
    newDiv.style.borderRight = elDom.style.borderRight;
    newDiv.style.borderBottom = elDom.style.borderBottom;
    newDiv.style.borderLeft = elDom.style.borderLeft;
    newDiv.style.fontSize = elDom.style.fontSize;
    newDiv.style.backgroundColor = elDom.style.backgroundColor;
    newDiv.style.borderRadius = elDom.style.borderRadius;

    newDiv.style.transform = elDom.style.transform;

    if (row.rotate === 270 || row.rotate === 90) {
      newDiv.style.width = row.height + 'px';
      newDiv.style.height = row.width + 'px';
    } else {
      newDiv.style.width = row.width + 'px';
      newDiv.style.height = row.height + 'px';
    }

    newDiv.appendChild(elDom.firstElementChild.cloneNode(true));

    newDiv.style.transformOrigin = elDom.style.transformOrigin;
    newDiv.firstElementChild?.classList.remove('is-empty');
    newDiv.firstElementChild?.classList.add('copy-rich-text');
    document.body.appendChild(newDiv);

    return new Promise((res, rej) => {
      domtoimage.toPng(newDiv).then(async function (dataUrl) {
        document.body.removeChild(newDiv);
        const url = await postFileResourceBase64Upload({
          type: 'LABEL_IMAGE',
          fileContent: dataUrl,
          filename: row.id,
        });
        res(url);
      });
    });
  }
</script>

<style lang="less" scoped>
  .designer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background-color: #1a1d23;

    :deep(.ant-breadcrumb) {
      .ant-breadcrumb-link {
        color: #fff;
      }

      .ant-breadcrumb-separator {
        color: #fff;
      }
    }

    &__lock-info {
      margin-left: auto;

      > span {
        color: #fff;
        cursor: pointer;
      }
    }

    &__divider {
      height: 24px;
      margin: 0 15px;
      border-left: 1px solid #e3e3e3;
    }

    &__actions {
      .ant-btn {
        border: 0;
        background-color: #444;
        color: #fff;

        .iconfont {
          position: relative;
          top: 1px;
          margin-right: 5px;
          line-height: 1em;
        }
      }

      .ant-btn:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
</style>
