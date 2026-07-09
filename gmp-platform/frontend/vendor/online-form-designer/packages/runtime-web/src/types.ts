import { type IMonacoLoader } from './utils/monaco-loader/monaco-loader';

// 扩展 Window 接口类型声明
declare global {
  interface Window {
    monacoLoader: IMonacoLoader;
  }
}
