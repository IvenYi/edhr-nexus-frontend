import { ref, Ref } from 'vue';
import { ToolkitEnum } from '/@page-designer/enum/toolkit';
import { ToolkitWidgetGroup } from '/@page-designer/types/toolkit';
import allWidgetInfo from '/@page-designer/schema';
import { CategoryTypeEnum, Platform, FormComponents } from '/@page-designer/enum';
import { platform } from '/@page-designer/hooks/usePage';
import { useModelField } from '/@/components/FieldTransfer/hooks/useModelField';
import { clone, cloneDeep } from 'lodash-es';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useDesigner } from './useDesigner';

const toolkit: Ref<ToolkitEnum> = ref(ToolkitEnum.OUTLINE);

const toolkitWidgets = ref<ToolkitWidgetGroup[]>([]);

const toolkitShow = ref(true);

const toolkitFixed = ref(false);
// 是否固定工具栏，不可自动切换
const toolkitPinned = ref(false);

const { reloadFieldToolkit } = useModelField();

function useComponents() {
  class ComponentUtils {
    /** 表单 */
    category_form = CategoryTypeEnum.FORM;
    /** 布局 */
    category_layout = CategoryTypeEnum.LAYOUT;
    /** 高级 */
    category_advanced = CategoryTypeEnum.ADVANCED;
    /** 数据展示 */
    category_data = CategoryTypeEnum.DATA;
    /** 按钮 */
    category_button = CategoryTypeEnum.BUTTON;
    /** 套件 */
    category_kit = CategoryTypeEnum.KIT;
    /**流程 */
    category_process = CategoryTypeEnum.PROCESS;
    static instance: any;

    static SubTableGroup = 'SubTableGroup';
    static CardListGroup = 'CardListGroup';

    groupType = '';

    static getInstance() {
      if (!this.instance) {
        this.instance = new ComponentUtils();
      }
      return this.instance;
    }

    set setGroupType(type: string) {
      this.groupType = type;
    }

    get categoryTypes() {
      if (this.groupType === ComponentUtils.SubTableGroup) {
        return [this.category_form, this.category_layout, this.category_advanced];
      }
      return [
        this.category_form,
        this.category_layout,
        this.category_advanced,
        this.category_data,
        this.category_button,
        this.category_kit,
        this.category_process,
      ];
    }

    get form2Comps() {
      if (this.groupType === ComponentUtils.SubTableGroup)
        return ['GenRadio', 'GenCheckbox', 'GenSwitch', 'Text', 'GenImage'];
      return ['GenRadio', 'GenCheckbox', 'GenSwitch', 'Text', 'GenImage', 'Form'];
    }

    get layout2Comps() {
      if (this.groupType === ComponentUtils.SubTableGroup)
        return [
          'Collapse',
          'SpaceOccupation',
          'Divider',
          'LayoutContainer',
          'Grid',
          'LeftRightColumns',
          'Tabs',
        ];
      return [
        'Collapse',
        'SpaceOccupation',
        'Divider',
        'ButtonContainer',
        'LayoutContainer',
        'Grid',
        'LeftRightColumns',
        'Tabs',
      ];
    }

    get advanced2Comps() {
      if ([ComponentUtils.SubTableGroup].includes(this.groupType)) return ['Iframe', 'CustomCode'];
      return ['Search', 'QuickSearch', 'SelectSearch', 'TableSelect', 'Iframe', 'CustomCode'];
    }

    get process2Comps() {
      // return [];
      if ([ComponentUtils.SubTableGroup].includes(this.groupType)) return [];
      return [
        'FormProcess',
        'ProcessButton',
        'ButtonProcessContainer',
        'ApprovalHistory',
        'FlowDiagram',
      ];
    }

    get button2Comps() {
      if ([ComponentUtils.SubTableGroup].includes(this.groupType)) return [];
      return [
        'CustomButton',
        // 'CreateButton',
        // 'CopyButton',
        // 'DeleteButton',
        'SubmitButton',
        'RefreshButton',
        'ResetButton',
        // 'ImportButton',
        // 'ExportButton',
        'LabelPrintButton',
        // 'ModelingButton',
        // 'DocumentPrintButton',
      ];
    }
    get data2Comps() {
      if ([ComponentUtils.SubTableGroup].includes(this.groupType)) return [];
      return [
        // 'DataList',
        'CardList',
        'DataTable',
        'DataVTable',
        'TreeTable',
        'RefDataTable',
        'Descriptions',
      ];
    }
    changeGroupType({ data, modalState }) {
      if (data.type === FormComponents.CardList) {
        this.setGroupType = ComponentUtils.CardListGroup;
        return;
      }
      if (modalState) {
        this.setGroupType = ComponentUtils.SubTableGroup;
        return;
      }
      this.setGroupType = '';
    }

    /**
     * 根据平台特殊过滤，显示的组件
     *
     * @param platform
     * @param suiteKey
     * @returns
     */
    private _filterWidgets(tag: string, platform: string, suiteKey: string): boolean {
      if (platform === Platform.PAD) {
        if (tag === FormComponents.DataTable) {
          return false;
        }
      }
      return true;
    }

    getWidgetsToolkit({ platform, suiteKey }: { platform: string; suiteKey: string }) {
      const { pluginConfigs } = useDesigner();

      const schemas =
        platform === Platform.WEB
          ? allWidgetInfo.webWidgetSchema
          : platform === Platform.PAD
          ? allWidgetInfo.padWidgetSchema
          : allWidgetInfo.mobileWidgetSchema;

      const schemaKeys = Object.values(schemas)
        .filter((i) => !!i && !i.internal)
        .map((schema) => schema.type);
      const configs = this.categoryTypes
        .map((categoryType) => {
          if (categoryType === CategoryTypeEnum.KIT) {
            const design =
              platform === Platform.WEB
                ? gct.register.designer.web
                : platform === Platform.PAD
                ? gct.register.designer.pad
                : gct.register.designer.mobile;
            const list = design
              .getProviders()
              .filter((designer) => {
                if (designer.kit && designer.kit.length) {
                  return designer.kit.includes(suiteKey);
                }
                if (designer.kit && designer.kit.length > 0 && !suiteKey) {
                  return false;
                }
                return true;
              })
              .map((designer) => {
                return designer.schema;
              });
            return {
              categoryType: categoryType,
              categoryName: 'sys.pageDesigner.category_' + categoryType,
              list,
            };
          }
          const list = this[`${categoryType}2Comps`]
            .filter(
              (i) =>
                schemaKeys.includes(FormComponents[i]) &&
                this._filterWidgets(FormComponents[i], platform, suiteKey),
            )
            .map((compKey) => cloneDeep(schemas[FormComponents[compKey]]));
          return {
            categoryType: categoryType,
            categoryName: 'sys.pageDesigner.category_' + categoryType,
            list,
          };
        })
        .filter((i) => i.list.length);
      if (window._gct && pluginConfigs.value) {
        const register =
          platform === Platform.WEB
            ? _gct.register.designer.web
            : platform === Platform.PAD
            ? _gct.register.designer.mobile // todo: 插件模式 PAD 待实现
            : _gct.register.designer.mobile;
        (pluginConfigs.value as IObject[]).forEach((pluginConfig) => {
          const { category, plugins } = pluginConfig;
          configs.push({
            categoryType: category.module,
            categoryName: category.name,
            list: (plugins as IObject[])
              .map((plugin) => {
                const provider = register.getProvider(plugin.key);
                if (provider) {
                  const obj = clone(provider.schema);
                  obj._plugin = clone(plugin);
                  return obj;
                }
                return null;
              })
              .filter((item) => {
                return !!item;
              }),
          });
        });
      }
      return configs;
    }
  }

  return {
    instance: ComponentUtils.getInstance(),
  };
}

const { instance } = useComponents();

export function useToolkit() {
  /**
   * 切换工具栏
   *
   * @author chitanda
   * @date 2025-07-23 17:07:18
   * @param {ToolkitEnum} payload // 工具栏类型
   * @param {boolean} [force] // 是否强制切换
   * @returns {*}
   */
  function toggleToolkit(payload: ToolkitEnum, force?: boolean) {
    if (toolkitPinned.value && !force) {
      // 如果是固定的工具栏，则不切换
      return;
    }
    toolkit.value = payload;
    toolkitShow.value = true;
  }

  /**初始化组件列表 */
  function initToolkitWidgets() {
    const { appInfo } = useAppInfoStore();

    const widgets: ToolkitWidgetGroup[] = instance.getWidgetsToolkit({
      platform: platform.value,
      suiteKey: appInfo.suiteKey,
    });

    toolkitWidgets.value = widgets;
  }

  /** 组件列表改变 */
  function changeToolkitWidgets({ data, modalState }) {
    const { appInfo } = useAppInfoStore();

    const oldGroupType = instance.groupType;
    instance.changeGroupType({ data, modalState });
    if (oldGroupType !== instance.groupType) {
      toolkitWidgets.value = instance.getWidgetsToolkit({
        platform: platform.value,
        suiteKey: appInfo.suiteKey,
      });
    }
  }

  /** 选中的是表单并且关联了模型后需要显示字段 panel */
  async function setFieldToolkit({
    modelKey,
    formId,
    childParentModelKey,
  }: {
    modelKey: string;
    formId: string;
    childParentModelKey?: string;
  }) {
    await reloadFieldToolkit(modelKey, formId, childParentModelKey);
    // toggleToolkit(ToolkitEnum.FIELD);
  }

  function fixedToolkit() {
    toolkitFixed.value = !toolkitFixed.value;
  }

  function pinnedToolkit() {
    toolkitPinned.value = !toolkitPinned.value;
  }

  return {
    toolkit,
    toolkitShow,
    toolkitFixed,
    toolkitPinned,
    toggleToolkit,
    pinnedToolkit,
    toolkitWidgets,
    initToolkitWidgets,
    changeToolkitWidgets,
    fixedToolkit,
    setFieldToolkit,
  };
}
