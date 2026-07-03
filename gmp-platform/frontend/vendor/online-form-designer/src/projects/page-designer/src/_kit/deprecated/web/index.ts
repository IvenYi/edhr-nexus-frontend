import { App } from 'vue';
import { KitType } from '../enums';
// import { PluginConfig } from './test-button/schema';
import { TxnDataCollection } from './txn-data-collection/schema';
import { ContainerSearchConfig } from './container-search/schema';
import { ExcutePluginConfig } from './excute-button/schema';
import { RdoTableConfig } from './rdo-table/schema';
import { RdoFormConfig } from './rdo-form/schema';
import { SignatureConfirmConfig } from './signature-confirm/schema';
import { ProcessParameterCard } from './process-parameter-card/schema';
import { BtnGroupPluginConfig } from './button-group/schema';
import { FileCollectPluginConfig } from './file-collect/schema';
import { ContainerSelect } from './container-select/schema';
import { SopKitPluginConfig } from './sop-kit/schema';
import { WorkflowStepSelect } from './workflow-step-select/schema';
import { DeviceSelect } from './device-select/schema';
import { TableSelectBtnConfig } from './table-select-button/schema';
import { FixsureSelect } from './fixsure-select/schema';
import { EdhrView } from './edhr-view/schema';

export default {
  install(_app: App) {
    // gct.register.designer.web.register(KitType.TEST_BUTTON, () => new PluginConfig());
    gct.register.designer.web.register(KitType.TXN_DATA_COLLECTION, () => new TxnDataCollection());
    gct.register.designer.web.register(KitType.CONTAINER_SEARCH, () => new ContainerSearchConfig());
    gct.register.designer.web.register(KitType.EXCUTE_BUTTON, () => new ExcutePluginConfig());
    gct.register.designer.web.register(KitType.RDO_TABLE, () => new RdoTableConfig());
    gct.register.designer.web.register(KitType.RDO_FORM, () => new RdoFormConfig());
    gct.register.designer.web.register(
      KitType.PROCESS_PARAMETER_CARD,
      () => new ProcessParameterCard(),
    );
    gct.register.designer.web.register(KitType.BUTTON_GROUP, () => new BtnGroupPluginConfig());
    gct.register.designer.web.register(KitType.FILE_COLLECT, () => new FileCollectPluginConfig());
    gct.register.designer.web.register(KitType.CONTAINER_SELECT, () => new ContainerSelect());
    gct.register.designer.web.register(KitType.SOP_KIT, () => new SopKitPluginConfig());
    gct.register.designer.web.register(
      KitType.WORKFLOW_STEP_SELECT,
      () => new WorkflowStepSelect(),
    );
    gct.register.designer.web.register(KitType.DEVICE_SELECT, () => new DeviceSelect());
    gct.register.designer.web.register(
      KitType.SIGNATURECONFIRM,
      () => new SignatureConfirmConfig(),
    );
    gct.register.designer.web.register(
      KitType.TABLE_SELECT_BUTTON,
      () => new TableSelectBtnConfig(),
    );
    gct.register.designer.web.register(KitType.FIXSURE_SELECT, () => new FixsureSelect());
    gct.register.designer.web.register(KitType.EDHR_VIEW, () => new EdhrView());
  },
};
