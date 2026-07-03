import Design from './design.vue';
import Process from './process.vue';
import RoutingInfo from './modal/routing-info.vue';
import ProductProcessInfo from './modal/product-process-info.vue';
import OnlineFormTempInfo from './modal/online-form-temp-info.vue';
import EDHRTempInfo from './modal/edhr-temp-info.vue';
import { openApprovalSubjectInfoModal } from './modal/composable/useApprovalHisInfo';

enum ModalName {
  Routing = 'RoutingInfo',
  ProductProcess = 'ProductProcessInfo',
  OnlineFormTemp = 'OnlineFormTempInfo',
  EDHRTemp = 'EDHRTempInfo',
}

const ModalInfo = {
  [ModalName.Routing]: RoutingInfo,
  [ModalName.ProductProcess]: ProductProcessInfo,
  [ModalName.OnlineFormTemp]: OnlineFormTempInfo,
  [ModalName.EDHRTemp]: EDHRTempInfo,
};

export { Design, Process, ModalName, ModalInfo, openApprovalSubjectInfoModal };
