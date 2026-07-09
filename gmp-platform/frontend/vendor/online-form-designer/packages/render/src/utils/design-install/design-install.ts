import { Component } from 'vue';
import { FIELD_TYPE } from '@gct/runtime';
import { RenderDesignEditor } from '../../providers';
import { RenderNodeRegister } from '../../register';

/**
 * 设计编辑器安装函数
 *
 * @author chitanda
 * @date 2025-07-07 15:07:46
 * @export
 * @param {string} providerTag
 * @param {() => DesignEditorNodeProvider} provider
 * @param {*} [com]
 * @returns {*}
 */
export function widthRenderDesignEditorInstall(fieldType: FIELD_TYPE, com: Component) {
  class Provider extends RenderDesignEditor {
    override fieldType: FIELD_TYPE = fieldType;
    component = com;
  }

  return {
    install() {
      if (fieldType) {
        RenderNodeRegister.registerDesignEditorNode(fieldType, () => new Provider());
      }
    },
  };
}
