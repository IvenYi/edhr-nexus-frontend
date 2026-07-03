import { App, defineAsyncComponent } from 'vue';
import { KitType } from '../enums';

export default {
  install(_app: App) {
    gct.register.render.web.register(
      KitType.TXN_DATA_COLLECTION,
      defineAsyncComponent(() => import('./txn-data-collection/txn-data-collection-render.vue')),
    );
    gct.register.render.web.register(
      KitType.CONTAINER_SEARCH,
      defineAsyncComponent(() => import('./container-search/container-search-render.vue')),
    );
    gct.register.render.web.register(
      KitType.EXCUTE_BUTTON,
      defineAsyncComponent(() => import('./excute-button/excute-button-render.vue')),
    );
    gct.register.render.web.register(
      KitType.SIGNATURECONFIRM,
      defineAsyncComponent(() => import('./signature-confirm/signature-confirm-render.vue')),
    );
    gct.register.render.web.register(
      KitType.PROCESS_PARAMETER_CARD,
      defineAsyncComponent(
        () => import('./process-parameter-card/process-parameter-card-render.vue'),
      ),
    );
    gct.register.render.web.register(
      KitType.RDO_TABLE,
      defineAsyncComponent(() => import('./rdo-table/rdo-table-render.vue')),
    );
    gct.register.render.web.register(
      KitType.BUTTON_GROUP,
      defineAsyncComponent(() => import('./button-group/button-group-render.vue')),
    );
    gct.register.render.web.register(
      KitType.RDO_FORM,
      defineAsyncComponent(() => import('./rdo-form/rdo-form-render.vue')),
    );
    gct.register.render.web.register(
      KitType.FILE_COLLECT,
      defineAsyncComponent(() => import('./file-collect/file-collect-render.vue')),
    );
    gct.register.render.web.register(
      KitType.CONTAINER_SELECT,
      defineAsyncComponent(() => import('./container-select/container-select-render.vue')),
    );
    gct.register.render.web.register(
      KitType.SOP_KIT,
      defineAsyncComponent(() => import('./sop-kit/sop-kit-render.vue')),
    );
    gct.register.render.web.register(
      KitType.WORKFLOW_STEP_SELECT,
      defineAsyncComponent(() => import('./workflow-step-select/workflow-step-select-render.vue')),
    );
    gct.register.render.web.register(
      KitType.DEVICE_SELECT,
      defineAsyncComponent(() => import('./device-select/device-select-render.vue')),
    );
    gct.register.render.web.register(
      KitType.TABLE_SELECT_BUTTON,
      defineAsyncComponent(() => import('./table-select-button/table-select-button-render.vue')),
    );
    gct.register.render.web.register(
      KitType.FIXSURE_SELECT,
      defineAsyncComponent(() => import('./fixsure-select/fixsure-select-render.vue')),
    );
    gct.register.render.web.register(
      KitType.EDHR_VIEW,
      defineAsyncComponent(() => import('./edhr-view/edhr-view-render.vue')),
    );
  },
};
