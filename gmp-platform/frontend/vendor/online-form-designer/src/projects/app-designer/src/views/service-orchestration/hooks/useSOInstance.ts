import { inject, Ref } from 'vue';
import { ServiceOrchestrationResponse } from '/@/apis/gct-apaas/model';

export function useSOInstance() {
  const SOInstance = inject('SOInstance') as {
    soId: String;

    init: Function;
    drag: Function;
    panel;
    setPanel: Function;
    controlId;

    addVariable;
    updateVariable;
    deleteVariable;

    soVersion;
    soVersionList;
    soResponse: Ref<ServiceOrchestrationResponse>;
    soDataObject;
    loading;

    loadSoHistoryInfo;
    loadSoHistoryList;
    soHistoryList;
    soHistoryListVisible;
    setSoHistoryListVisible;

    changeVersion;

    load;
    save;
    saveAs;
    saveAndActive;

    execute;

    removeNode;
  };

  return SOInstance;
}
