/** 导入Word依赖 */
import { setupPlatformAdapters, setupVueRuntime, edhrSuitePlugin } from '@gct-paas/word';
import '@gct-paas/word/style.css';
import 'floating-vue/dist/style.css';
import type { AxiosInstance } from 'axios';

/**
 * 上传文件到服务器
 * @param {File} file - 待上传的文件对象
 * @param {Object} [payload] - 上传配置项
 * @param {string} [payload.modelKey] - 模型标识
 * @param {Function} [payload.onProgress] - 上传进度回调函数
 * @param {AbortSignal} [payload.signal] - 中断请求的信号
 * @returns {Promise<string>} 文件上传后的路径
 */
async function uploadByFile(
  file: File,
  payload?: {
    modelKey?: string;
    onProgress?: (p: number) => void;
    signal?: AbortSignal;
  },
) {
  const { modelKey, onProgress, signal } = payload || {};

  const formData = new FormData();
  formData.append('file', file, file.name);

  const { postFileResourceUpload } = await import('/@/apis/gct-apaas/FileResourceController');
  const path = await postFileResourceUpload(
    formData,
    { ...(modelKey ? { modelKey } : {}) },
    {
      signal,
      onUploadProgress: (e) => {
        if (onProgress) {
          const percent = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          onProgress(percent);
        }
      },
      transferToConfig: {
        headers: {
          'Content-Type': 'multipart/form-data;charset=UTF-8',
        },
      },
    },
  );

  return {
    data: path,
  };
}

/**
 * 获取应用基本信息
 */
async function getAppInfo() {
  const { getDesignerCommonGetApp } = await import('/@/apis/gct-apaas/DesignerCommonController');
  return await getDesignerCommonGetApp();
}

/**
 * 解析Word文件为JSON格式
 * @param {File} file - 待解析的Word文件
 * @returns {Promise<any>} 解析后的JSON数据
 */
async function transformOfficeDocxJson(file: File) {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const { postOfficeDocxJson } = await import('/@/apis/gct-apaas/OfficeController');
  const res = await postOfficeDocxJson(formData, {
    transferToConfig: {
      headers: {
        'Content-Type': 'multipart/form-data;charset=UTF-8',
      },
    },
  });

  return res;
}

/**
 * 初始化GCT Word的全局配置（核心能力注册）
 * @description 注册Word组件的全局拦截器、文件解析/上传方法、业务套件，应用启动时仅需调用一次
 */
export function initGctWordGlobalConfig() {
  setupPlatformAdapters({
    interceptors: (axios: AxiosInstance) => {
      axios.interceptors.request.use(async (config) => {
        const { applyRequestHeaders } = await import('../utils/http/axios');
        return applyRequestHeaders(config);
      });
    },
    getAppInfo,
    parseFile: transformOfficeDocxJson,
    uploadFile: uploadByFile,
    formulaIdentify: async (...args) => {
      const { identify } = await import('../components/Expression/utils/expression');
      return identify(...args);
    },
    formulaCalculate: async (...args) => {
      const { calc } = await import('../components/Expression/utils/expression');
      return calc(...args);
    },
    triggerHandler: async (name, options) => {
      const { triggerHandler } = await import('./triggerHandler');
      return triggerHandler(name, options);
    },
    plugins: [edhrSuitePlugin],
  });
}

/**
 * 注册GCT Word的运行时能力到Vue应用
 * @description 为Vue应用实例挂载Word相关的运行时插件（如FloatingVue、VueKonva）和全局指令
 * @param {ReturnType<typeof createApp>} app - Vue应用实例
 */
export function registerGctWordRuntime(app) {
  setupVueRuntime({ app });
}
