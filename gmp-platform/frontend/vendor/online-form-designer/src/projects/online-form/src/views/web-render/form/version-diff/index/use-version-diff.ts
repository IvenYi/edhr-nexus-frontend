import {
  scanField,
  FieldSceneType,
} from '/@online-form/views/designer/hooks/reverse-modeling/scan-field';
import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
import { CellWidgetCategory } from '/@online-form/views/designer/enums';
import { getOnlineFormTmplListVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
import { computed, ref, toRaw } from 'vue';
import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
import { FieldConfig, FieldDiff, FieldDiffType, FieldWidgetProperties, VersionDiff } from './types';
import { omit, pick } from 'lodash-es';
import { returnDiffArr } from './diff';
import ChangeVersionModal from '../comps/change-version-modal.vue';
import VersionListModal from '../comps/version-list-modal.vue';
import { FormTypeEnum } from '@gct/nocode-base';

/** 根据字段比较配置来判断是否有变更 */
export function isSame(old: FieldConfig, now: FieldConfig) {
  const properties = FieldWidgetProperties[now.fieldWidget.category];
  const oldStr = JSON.stringify(pick(old.fieldWidget, properties));
  const nowStr = JSON.stringify(pick(now.fieldWidget, properties));
  console.log('字段配置对比', oldStr, nowStr);
  return oldStr === nowStr;
}

export function useVersionDiff() {
  const { initMasterModel, getFieldMeta } = useModelFields();
  const allVersions = ref<OnlineFormTmplResponse[]>([]);
  const baseVersion = ref<OnlineFormTmplResponse>();
  const compareVersion = ref<OnlineFormTmplResponse>();
  const selectedField = ref<any>();
  /** 没有右侧配置项的差异对比 */
  const noDesignDiff = ref(false);

  /**
   * 初始化加载数据
   * @param id
   * @return {*}
   */
  async function init(id: string) {
    const res = await getOnlineFormTmplListVersionById({ id: id });
    if (!res) {
      console.error('没有数据');
      return;
    }
    console.log('所有版本数据', res);
    allVersions.value = res;
    compareVersion.value = res[0];
    baseVersion.value = res[1];

    // 文本表单不显示右侧配置项差异
    if (baseVersion.value.formType === FormTypeEnum.TEXT) {
      noDesignDiff.value = true;
    }

    await initMasterModel({
      key: baseVersion.value.modelKey,
      name: baseVersion.value.modelName,
    });
    calcDiff(baseVersion.value, compareVersion.value);
  }

  /** 字段映射 */
  const fieldDiffMap = ref<Record<string, FieldDiff>>({});
  /** 版本差异数据 */
  const versionDiff = computed<VersionDiff>(() => {
    const allValues = Object.values(toRaw(fieldDiffMap.value));
    const addFields = allValues.filter((item) => item.type === FieldDiffType.ADD);
    const removeFields = allValues.filter((item) => item.type === FieldDiffType.REMOVE);
    const updateFields = allValues.filter((item) => item.type === FieldDiffType.UPDATE);
    return {
      all: [...addFields, ...removeFields, ...updateFields],
      addFields,
      removeFields,
      updateFields,
    };
  });

  /** 右侧tab数据 */
  const versionDiffData = computed(() => {
    const list = Object.keys(versionDiff.value).reduce((arr: any[], k) => {
      const options = (versionDiff.value as any)[k];
      arr.push({
        value: k,
        label: $t(`sys.webRender.versionDiffType.${k}`),
        options,
        num: options.length,
        attrValList: options.reduce((list, e) => {
          const n = e.new?.fieldWidget;
          const o = e.old?.fieldWidget;
          return list;
        }, []),
      });
      return arr;
    }, []);
    return list;
  });

  /** 切换当前选中的字段 */
  function changeSelectedField(field: any) {
    selectedField.value = field;
  }

  /**
   * 解析单个版本里的所有字段信息
   * @param sheets 表单设计数据
   * @param [isOld=true] 是否是旧版本
   * @return {*}
   */
  function parseFields(sheets: any[], isOld = true) {
    const filedMap: any = {};
    sheets.forEach((sheet) => {
      const sheetId = sheet.sheetId;
      scanField(sheet.paper, (params) => {
        if (params.type === FieldSceneType.FieldWidget) {
          const { attachField, cellInfo } = params;
          const key = `${attachField.fieldMeta.model}.${attachField.fieldMeta.field}`;
          console.log('遍历cell,x,y:', isOld, JSON.stringify(cellInfo), key);
          if (filedMap[key]) {
            return;
          } else {
            filedMap[key] = {
              key,
              cellInfo: { ...cellInfo!, sheetId },
              [isOld ? 'old' : 'new']: attachField,
            };
          }

          // 跳过签名字段的日期填充字段
          if (attachField.fieldWidget.category === CellWidgetCategory.Signature) {
            return { isSkip: true };
          }
        }
      });
    });
    return filedMap;
  }

  /**
   * 计算差异（会变更versionDiff）
   * @param baseTmpl
   * @param compareTmpl
   */
  function calcDiff(baseTmpl: OnlineFormTmplResponse, compareTmpl: OnlineFormTmplResponse) {
    if (noDesignDiff.value) {
      return;
    }
    fieldDiffMap.value = {};
    const baseDesignJson = baseTmpl.designerJson
      ? JSON.parse(decodeURIComponent(baseTmpl.designerJson!))
      : { sheets: [] };
    const compareDesignJson = compareTmpl.designerJson
      ? JSON.parse(decodeURIComponent(compareTmpl.designerJson!))
      : { sheets: [] };
    const oldFiledMap = parseFields(baseDesignJson.sheets, true);
    const newFieldMap = parseFields(compareDesignJson.sheets, false);

    // 处理fieldDiffMap
    fieldDiffMap.value = {};
    Object.keys(oldFiledMap).forEach((key) => {
      fieldDiffMap.value[key] = {
        ...oldFiledMap[key],
      };
    });
    Object.keys(newFieldMap).forEach((key) => {
      fieldDiffMap.value[key] = fieldDiffMap.value[key] ?? {};
      Object.assign(fieldDiffMap.value[key], {
        ...newFieldMap[key],
      });
    });

    // 后续处理
    Object.keys(fieldDiffMap.value).forEach((key) => {
      const item = fieldDiffMap.value[key] as any;
      const { fieldWidget: newAttrs } = item.new || {};
      const { fieldWidget: oldAttrs } = item.old || {};

      // 计算有变化的属性
      item.diffArr = returnDiffArr({ newAttrs, oldAttrs });
      if (item.diffArr.length > 0) {
        item.type = !oldAttrs
          ? FieldDiffType.ADD
          : !newAttrs
            ? FieldDiffType.REMOVE
            : FieldDiffType.UPDATE;
      }

      // 处理type和删除相同的配置
      // if (item.old && item.new) {
      //   // 旧配置和新配置都存在
      //   if (isSame(item.old, item.new)) {
      //     // 配置相同删除
      //     delete fieldDiffMap.value[key];
      //   } else {
      //     item.type = FieldDiffType.UPDATE;
      //   }
      // } else if (item.old && !item.new) {
      //   item.type = FieldDiffType.REMOVE;
      // } else if (!item.old && item.new) {
      //   item.type = FieldDiffType.ADD;
      // }

      // 处理字段的翻译等额外属性
      Object.values(fieldDiffMap.value).forEach((item) => {
        const fieldMeta = (item.new ?? item.old)!.fieldMeta;
        item.fieldName = getFieldMeta(fieldMeta).name as string;
        item.fieldType = fieldMeta.fieldType!;
        item.fieldKey = fieldMeta.field!;
      });
    });
  }

  /**
   * 打开自定义对比
   */
  async function openCustomCompare() {
    const res: any = await gct.openUtil.modal(
      ChangeVersionModal,
      {
        data: {
          baseVersion: baseVersion.value,
          compareVersion: compareVersion.value,
        },
        options: allVersions.value,
      },
      {
        title: $t('sys.webRender.customCompare'),
        width: '640px',
      },
    );

    if (
      res?.ok &&
      (res?.data?.baseVersion.id !== baseVersion.value?.id ||
        res?.data?.compareVersion.id !== compareVersion.value?.id)
    ) {
      baseVersion.value = res.data.baseVersion;
      compareVersion.value = res.data.compareVersion;
      calcDiff(baseVersion.value!, compareVersion.value!);
    }
  }

  /**
   * 打开历史对比
   */
  async function openVersionHistory() {
    await gct.openUtil.drawer(
      VersionListModal,
      {
        options: allVersions.value,
      },
      {
        title: $t('sys.webRender.versionList'),
        width: '800px',
        class: 'biz-bpmn-runtime-drawer gct-ant-drawer',
      },
    );
  }

  return {
    init,
    baseVersion,
    compareVersion,
    noDesignDiff,
    calcDiff,
    versionDiff,
    versionDiffData,
    selectedField,
    changeSelectedField,
    openCustomCompare,
    openVersionHistory,
  };
}
