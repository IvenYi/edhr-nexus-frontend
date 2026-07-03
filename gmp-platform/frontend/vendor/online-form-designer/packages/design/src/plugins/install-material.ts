import { MaterialGroup } from '../constant';
import { MaterialRegister } from '../register';
import { DesignGridProvider } from './design-grid/design-grid.provider';
import { DesignMenuListProvider } from './design-menu-list/design-menu-list.provider';
import { DesignPanelProvider } from './design-panel/design-panel.provider';
import { DesignSelectComponentProvider } from './design-select-component/design-select-component.provider';
import { DesignTabsProvider } from './design-tabs/design-tabs.provider';
import { DesignMessageProvider } from './design-message/design-message.provider';
import { DesignWorkbenchProvider } from './design-workbench/design-workbench.provider';
import { DesignPersonalCenterProvider } from './design-personal-center/design-personal-center.provider';
import { DesignTodoProvider } from './design-todo/design-todo.provider';

/**
 * 安装素材
 *
 * @author zhanghanrui
 * @date 2024-07-09 16:07:43
 * @export
 */
export function installMaterial(): void {
  MaterialRegister.registerGroupCustomHome({
    tag: MaterialGroup.LAYOUT,
    label: '布局',
    order: 0,
    icon: '',
    children: [],
  });
  MaterialRegister.registerGroupCustomHome({
    tag: MaterialGroup.SYSTEM,
    label: '系统',
    order: 1,
    icon: '',
    children: [],
  });
  MaterialRegister.registerGroupCustomExpView({
    tag: MaterialGroup.LAYOUT,
    label: '布局',
    order: 0,
    icon: '',
    children: [],
  });
  MaterialRegister.registerGroupCustomExpView({
    tag: MaterialGroup.SYSTEM,
    label: '系统',
    order: 1,
    icon: '',
    children: [],
  });

  // 菜单列表
  MaterialRegister.registerCustomHome(DesignMenuListProvider.materialConfig);
  // 面板
  MaterialRegister.registerCustomHome(DesignPanelProvider.materialConfig);
  MaterialRegister.registerCustomExpView(DesignPanelProvider.materialConfig);
  // 选项卡
  MaterialRegister.registerCustomHome(DesignTabsProvider.materialConfig);
  MaterialRegister.registerCustomExpView(DesignTabsProvider.materialConfig);
  // 选择组件
  MaterialRegister.registerCustomHome(DesignSelectComponentProvider.materialConfig);
  // 栅格容器
  MaterialRegister.registerCustomHome(DesignGridProvider.materialConfig);
  MaterialRegister.registerCustomExpView(DesignGridProvider.materialConfig);
  // 消息
  MaterialRegister.registerCustomExpView(DesignMessageProvider.materialConfig);
  // 审批
  MaterialRegister.registerCustomExpView(DesignTodoProvider.materialConfig);
  // 工作台
  MaterialRegister.registerCustomExpView(DesignWorkbenchProvider.materialConfig);
  // 个人中心
  MaterialRegister.registerCustomExpView(DesignPersonalCenterProvider.materialConfig);
}
