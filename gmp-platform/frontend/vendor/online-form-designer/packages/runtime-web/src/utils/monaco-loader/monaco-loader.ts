/**
 * Monaco Editor 懒加载工具
 * 统一管理 Monaco Editor 的加载和配置
 * 使用 @monaco-editor/loader 实现按需加载
 */

import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';

/**
 * Monaco Editor 加载器类
 * 单例模式，统一管理 Monaco Editor 的加载和配置
 */
class MonacoLoader {
  // Monaco Editor 实例缓存
  private _monacoInstance: typeof Monaco | null = null;

  // 加载状态
  private _loadingPromise: Promise<typeof Monaco> | null = null;

  constructor() {
    this._configureLoader();
  }

  /**
   * 配置 Monaco Editor 加载器
   */
  private _configureLoader(): void {
    loader.config({
      paths: {
        vs: location.origin + '/extras/monaco-editor/0.55.1/min/vs',
      },
    });
  }

  /**
   * 加载 Monaco Editor
   * 返回 Monaco Editor 的实例
   * 该函数会缓存加载结果，多次调用只会加载一次
   */
  async loadMonaco(): Promise<typeof Monaco> {
    // 如果已经加载完成，直接返回缓存的实例
    if (this._monacoInstance) {
      return this._monacoInstance;
    }

    // 如果正在加载中，返回加载中的 Promise
    if (this._loadingPromise) {
      return this._loadingPromise;
    }

    // 开始加载
    this._loadingPromise = loader.init();

    try {
      this._monacoInstance = await this._loadingPromise;
      console.log('✓ Monaco Editor loaded successfully');
      return this._monacoInstance;
    } catch (error) {
      console.error('✗ Failed to load Monaco Editor:', error);
      this._loadingPromise = null;
      throw error;
    }
  }

  /**
   * 获取已加载的 Monaco 实例
   * 如果尚未加载，返回 null
   */
  getMonaco(): typeof Monaco | null {
    return this._monacoInstance;
  }

  /**
   * 判断 Monaco 是否已加载
   */
  isMonacoLoaded(): boolean {
    return this._monacoInstance !== null;
  }

  /**
   * 创建 Monaco Editor 实例的辅助函数
   * @param container DOM 容器
   * @param options 编辑器配置选项
   */
  async createMonacoEditor(
    container: HTMLElement,
    options?: Monaco.editor.IStandaloneEditorConstructionOptions,
  ): Promise<Monaco.editor.IStandaloneCodeEditor> {
    const monaco = await this.loadMonaco();
    return monaco.editor.create(container, options);
  }

  /**
   * 创建 Monaco Diff Editor 实例的辅助函数
   * @param container DOM 容器
   * @param options 编辑器配置选项
   */
  async createMonacoDiffEditor(
    container: HTMLElement,
    options?: Monaco.editor.IStandaloneDiffEditorConstructionOptions,
  ): Promise<Monaco.editor.IStandaloneDiffEditor> {
    const monaco = await this.loadMonaco();
    return monaco.editor.createDiffEditor(container, options);
  }

  /**
   * 创建 Monaco Model 的辅助函数
   * @param value 文本内容
   * @param language 语言类型
   * @param uri 资源标识符
   */
  async createMonacoModel(
    value: string,
    language?: string,
    uri?: Monaco.Uri,
  ): Promise<Monaco.editor.ITextModel> {
    const monaco = await this.loadMonaco();
    return monaco.editor.createModel(value, language, uri);
  }
}

// 创建单例实例并挂载到 window
export const monacoLoader = new MonacoLoader();

// 导出类型，方便使用
export type { Monaco };
export type IMonacoLoader = MonacoLoader;
export type MonacoEditor = Monaco.editor.IStandaloneCodeEditor;
export type MonacoDiffEditor = Monaco.editor.IStandaloneDiffEditor;
export type MonacoITextModel = Monaco.editor.ITextModel;
