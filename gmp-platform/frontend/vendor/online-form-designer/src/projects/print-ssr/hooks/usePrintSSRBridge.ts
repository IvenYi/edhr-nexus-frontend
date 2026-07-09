export function setupPrintSSRBridge(type: 'excel' | 'word', api: any) {
  window.GCT_PRINT_SSR = {
    type,

    async getAttachments() {
      return api.getAttachments?.() || [];
    },

    async getFileFormInfo() {
      return api.getFileFormInfo?.() || { isFile: false };
    },

    async getPdfBuffer() {
      return api.getPdfBuffer?.();
    },
  };
}
