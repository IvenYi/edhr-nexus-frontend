export enum BuiltinAction {
  ShowAnnotation = 'ShowAnnotation',
  CloseAnnotation = 'CloseAnnotation',
  DoFormChange = 'DoFormChange',
  SubmitFormChange = 'SubmitFormChange',
  SubmitMedProFormChange = 'SubmitMedProFormChange',
  DoFormAbandon = 'DoFormAbandon',
  DoFormResubmit = 'DoFormResubmit',
  DoMedProFormAbandon = 'DoMedProFormAbandon',
}

/** 后台提交类型 */
export enum ChangeType {
  Form = 'Form',
  Resubmit = 'Resubmit',
  Abandon = 'Abandon',
}
