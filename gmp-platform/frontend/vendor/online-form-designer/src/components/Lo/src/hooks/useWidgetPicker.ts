import { computed } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { useGlobal } from '/@page-designer/hooks/useGlobal';
import { treeToList } from '/@/utils/helper/treeHelper';
import { CategoryTypeEnum, FormComponents } from '/@page-designer/enum';

const { t } = useI18n();

const { pageJson } = useDesigner();
const { gModal, queryGModal } = useGlobal();

// 拉取远程modal数据
queryGModal();

enum ModalType {
  Local,
  Remote,
}

export function useWidgetPicker() {
  /**
   * 模态框（本地 + 远程）
   */
  const modals = computed(() => {
    const modals = pageJson.modals.map((item) => ({
      id: item.id,
      name: item.modalName ?? item.id,
      type: ModalType.Local,
    }));
    const remoteModals = gModal.value.map((item) => ({
      id: item.id,
      name: item.name || item.id,
      type: ModalType.Remote,
    }));
    return modals.concat(remoteModals);
  });

  // 根页面组件列表
  const rootWidgets = computed(() => {
    return treeToList(pageJson.widgets);
  });
  // 模态框中的组件列表
  const modelWidgets = computed(() => {
    return pageJson.modals.map((item) => {
      return {
        id: item.id,
        name: item.modalName,
        children: treeToList(item.children),
      };
    });
  });

  const widgets = computed(() => {
    return [
      {
        id: '',
        name: '根页面',
        children: rootWidgets.value,
      },
    ].concat(modelWidgets.value);
  });
  const widgetIdMap = computed(() => {
    return widgets.value.reduce((map, group) => {
      group.children.forEach((item) => {
        map[item.id] = {
          ...item,
          belong: group.id,
        };
      });
      return map;
    }, {});
  });

  // 表单集合
  const forms = computed(() => {
    return widgets.value
      .map((group) => {
        const list = {
          id: group.id,
          name: group.name,
          children: group.children
            .filter((item) => item.type === FormComponents.Form)
            .map((item) => ({
              id: item.id,
              name: item.alias || t(item.name) + item.id,
              type: item.type,
              belong: group.id,
            })),
        };
        return list;
      })
      .filter((item) => item.children.length > 0);
  });

  // 数据表格集合
  const dataTables = computed(() => {
    return widgets.value
      .map((scope) => {
        const list = {
          id: scope.id,
          name: scope.name,
          children: scope.children
            .filter((item) => item.type === FormComponents.DataTable || item.type === FormComponents.DataVTable)
            .map((item) => ({
              id: item.id,
              name: item.alias || item.name,
              type: item.type,
              belong: scope.id,
            })),
        };
        return list;
      })
      .filter((item) => item.children.length > 0);
  });

  // 表单控件集合
  const formComps = computed(() => {
    return widgets.value
      .map((scope) => {
        const list = {
          id: scope.id,
          name: scope.name,
          children: scope.children
            .filter(
              (item) =>
                item.categoryType === CategoryTypeEnum.FORM && ![FormComponents.Form].includes(item.type),
            )
            .map((item) => ({
              id: item.id,
              name: item.alias || item.id,
              type: item.type,
              belong: scope.id,
            })),
        };
        return list;
      })
      .filter((item) => item.children.length > 0);
  });

  return {
    modals,
    widgets,
    widgetIdMap,
    forms,
    dataTables,
    formComps,
  };
}
