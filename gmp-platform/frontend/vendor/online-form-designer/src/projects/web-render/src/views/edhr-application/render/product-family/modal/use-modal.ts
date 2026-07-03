import { ProductFamilyAction } from '../logic/constants';
import { IProductFamily } from '../logic/type';
import ProductFamilyModal from './product-family-modal.vue';

export type ShouldCloseFn = (data) => Promise<boolean>;

const modalTitle = {
  [ProductFamilyAction.NEW]: $t('sys.new') + $t('sys.edhr.productFamily'),
  [ProductFamilyAction.EDIT]: $t('sys.edit') + $t('sys.edhr.productFamily'),
  [ProductFamilyAction.COPY]: $t('sys.copy') + $t('sys.edhr.productFamily'),
  [ProductFamilyAction.DETAIL]: $t('sys.view') + $t('sys.edhr.productFamily'),
};

const disabledFields: { [k in ProductFamilyAction]?: Array<keyof IProductFamily> } = {
  [ProductFamilyAction.NEW]: [] as any,
  [ProductFamilyAction.EDIT]: [] as any,
  [ProductFamilyAction.COPY]: [] as any,
  [ProductFamilyAction.DETAIL]: ['name_', 'code_', 'description_'],
};

/**
 * 打开产品家族弹窗
 * @export
 * @param opts
 */
export async function openModal(opts: {
  shouldClose?: ShouldCloseFn;
  action: ProductFamilyAction;
  data?: IProductFamily;
}) {
  gct.openUtil.modal(
    ProductFamilyModal,
    {
      data: opts.data,
      shouldClose: opts.shouldClose,
      disabledFields: disabledFields[opts.action],
    },
    {
      title: modalTitle[opts.action],
      width: 640,
      height: 'auto',
      okText: $t('sys.okText'),
      cancelText: undefined,
    },
  );
}
