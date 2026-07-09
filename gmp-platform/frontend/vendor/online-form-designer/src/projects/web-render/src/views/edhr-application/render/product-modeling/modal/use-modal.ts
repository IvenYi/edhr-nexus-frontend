import { ProductAction } from '../logic/constants';
import { IProductVersion } from '../logic/type';
import ProductModal from './product-modal.vue';

export type ShouldCloseFn = (data) => Promise<boolean>;

const modalTitle = {
  [ProductAction.CREATE]: $t('sys.new') + $t('sys.edhr.product'),
  [ProductAction.EDIT_VERSION]: $t('sys.edit') + $t('sys.edhr.product'),
  [ProductAction.COPY]: $t('sys.copy') + $t('sys.edhr.product'),
  [ProductAction.DETAIL]: $t('sys.view') + $t('sys.edhr.product'),
  [ProductAction.CREATE_VERSION]: $t('sys.pageDesigner.version_createText'),
  [ProductAction.COPY_VERSION]: $t('sys.pageDesigner.version_copyText'),
};

const disabledFields: { [k in ProductAction]?: Array<keyof IProductVersion> } = {
  [ProductAction.CREATE]: [] as any,
  [ProductAction.EDIT_VERSION]: ['name_', 'version_', 'product_type_', 'code_'] as any,
  [ProductAction.COPY]: [] as any,
  [ProductAction.DETAIL]: [
    'name_',
    'default_',
    'version_',
    'description_',
    'product_family_id_',
    'product_type_',
    'code_',
  ],
  [ProductAction.CREATE_VERSION]: ['name_'],
  [ProductAction.COPY_VERSION]: ['name_'],
};

/**
 * 打开产品家族弹窗
 * @export
 * @param opts
 */
export async function openModal(opts: {
  shouldClose?: ShouldCloseFn;
  action: ProductAction;
  data?: IProductVersion;
}) {
  gct.openUtil.modal(
    ProductModal,
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
