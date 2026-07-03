import { GctDialog } from '/@/utils/Dialog';
import SelectUserContainer from './SelectUserContainer.vue';
import { SceneType } from './controller';

interface IParams {
  title?: string;
  values: string[];
  modelKey: string;
  multiple?: boolean;
  showTabs?: string[];
  callback?: Function;
  sceneType?: SceneType;
  /** 需要额外隐藏的id集合 */
  hiddenKeys?: string[];
}

export function openSelectUserModal({
  title,
  values,
  modelKey,
  showTabs,
  multiple,
  callback,
  sceneType,
  hiddenKeys,
  readonly,
}: IParams) {
  const tabs = ['User', 'Org', 'Role', 'UserGroup', 'Dynamic'];
  GctDialog.open(SelectUserContainer, {
    baseProps: {
      selectValues: values || [],
      showTabs: showTabs || tabs,
      multiple: multiple ?? true,
      modelKey,
      sceneType,
      hiddenKeys,
      readonly,
    },

    options: {
      title: title || '人员选择',
    },
    callback,
  });
}
