import { PlatformEnum } from '@gct/nocode-base';

export async function loadRemoteApis() {
  const [
    documentController,
    onlineFormTmplController,
    sqlViewModelController,
    viewModelController,
    jsEngineController,
    modelComprehensiveController,
    reverseModeling,
  ] = await Promise.all([
    import('/@/apis/gct-apaas/DocumentController'),
    import('/@/apis/gct-apaas/OnlineFormTmplController'),
    import('/@/apis/gct-apaas/SqlViewModelController'),
    import('/@/apis/gct-apaas/ViewModelController'),
    import('/@/apis/gct-apaas/JsEngineController'),
    import('/@/apis/gct-apaas/ModelComprehensiveController'),
    import('./reverse-modeling/useReverseModeling'),
  ]);

  return {
    apis: {
      [PlatformEnum.INTEGRATION_PAAS_SI]: {
        getDocument: onlineFormTmplController.getOnlineFormTmplGetVersionById,
        saveDocument: onlineFormTmplController.putOnlineFormTmplUpdateDesignerById,
      },
      [PlatformEnum.INTEGRATION_PAAS_DP]: {
        getDocument: documentController.getDocumentInfo,
        saveDocument: documentController.putDocumentDesignById,
      },
    },
    onlineFormTmplController,
    sqlViewModelController,
    viewModelController,
    jsEngineController,
    modelComprehensiveController,
    reverseModeling,
  };
}
