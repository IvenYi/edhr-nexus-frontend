import { App } from 'vue';
import { IEditorProvider, ITableEditorProvider } from '../../interface';
import { EditorRegisterConst } from '../../constants';

/**
 * 表单编辑器注册器
 *
 * @author zhanghanrui
 * @date 2024-04-17 13:04:06
 * @export
 * @param {string} providerTag
 * @param {() => IEditorProvider} provider
 * @param {*} [com]
 * @return {*}
 */
export function widthEditorInstall(
  providerTag: string,
  provider: () => IEditorProvider,
  com?: any,
) {
  return {
    install(app: App) {
      if (providerTag && provider) {
        gct.register.editor.register(EditorRegisterConst.PREFIX + providerTag, provider);
      }
      if (com) {
        app.component(com.name, com);
      }
    },
  };
}

/**
 * 表格编辑器注册器
 *
 * @author zhanghanrui
 * @date 2024-04-17 13:04:18
 * @export
 * @param {string} providerTag
 * @param {() => ITableEditorProvider} provider
 * @param {*} [com]
 * @return {*}
 */
export function widthTableEditorInstall(
  providerTag: string,
  provider: () => ITableEditorProvider,
  com?: any,
) {
  return {
    install(app: App) {
      if (providerTag && provider) {
        gct.register.tableEditor.register(EditorRegisterConst.PREFIX + providerTag, provider);
      }
      if (com) {
        app.component(com.name, com);
      }
    },
  };
}
