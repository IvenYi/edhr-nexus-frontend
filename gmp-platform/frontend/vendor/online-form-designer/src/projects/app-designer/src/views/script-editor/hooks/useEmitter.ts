import { mitt } from '/@/utils/mitt';
import { EmitterEnum } from '/@app-designer/views/script-editor/types/enum';
import { useMessage } from '/@/hooks/web/useMessage';
import { useEditorConsoleInner } from '/@/components/code-editor/useEditorConsole';
import type * as Monaco from 'monaco-editor';

const emitter = mitt();

// type Result = string | Promise<any>;

export function useEmitter() {
  const { createMessage } = useMessage();
  const { getInputValue, setConsoleResult } = useEditorConsoleInner();

  /**
   * 获取编辑器代码
   * @returns
   */
  async function getCode({ showError = true, ignoreError = false } = {}): Promise<any> {
    const errs = monaco.editor.getModelMarkers({
      owner: 'javascript',
    });
    console.log(errs);
    // ! 暂时先注释掉
    // if (errs.length > 0) {
    //   showError && createMessage.error('脚本语法错误');
    //   if (!ignoreError) {
    //     return Promise.reject();
    //   }
    // }

    let result = '';
    emitter.emit(EmitterEnum.GET_CODE, (value) => {
      result = value;
    });
    return result;
  }

  /**
   * 获取调试参数
   * @returns
   */
  async function getInput({ showError = true, ignoreError = false } = {}): Promise<any> {
    const errs = monaco.editor.getModelMarkers({
      owner: 'json',
    });
    if (errs.length > 0) {
      showError && createMessage.error('参数语法错误');
      if (!ignoreError) {
        return Promise.reject();
      }
    }

    const result = getInputValue();
    return result;
  }

  async function setResult(result) {
    setConsoleResult(result);
  }

  return {
    emitter,
    getCode,
    getInput,
    setResult,
  };
}
