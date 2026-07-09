import { CSSProperties } from 'vue';
import { ModalWrapperProps } from '/@/components/Modal';
import { ButtonProps } from 'ant-design-vue';

/**
 * 模态打开参数，为 basic-modal 参数
 *
 * @author zhanghanrui
 * @date 2024-03-19 19:03:10
 * @export
 * @interface IModalOptions
 */
export interface IModalOptions {
  visible?: boolean;
  /**
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:05
   * @type {boolean}
   */
  scrollTop?: boolean;
  height?: number | string;
  minHeight?: number;
  /**
   * open drag
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:18
   * @type {boolean}
   */
  draggable?: boolean;
  centered?: boolean;
  /**
   *
   * @default sys.cancelText
   * @author zhanghanrui
   * @date 2024-03-20 10:03:39
   * @type {string}
   */
  cancelText?: string;
  /**
   *
   * @default sys.okText
   * @author zhanghanrui
   * @date 2024-03-20 10:03:23
   * @type {string}
   */
  okText?: string;

  closeFunc?: () => Promise<boolean>;
  defaultFullscreen?: boolean;
  /**
   * Can it be full screen
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:48
   * @type {boolean}
   */
  canFullscreen?: boolean;
  /**
   * After enabling the wrapper, the bottom can be increased in height
   *
   * @default 0
   * @author zhanghanrui
   * @date 2024-03-20 10:03:06
   * @type number
   */
  wrapperFooterOffset?: number;
  // Warm reminder message
  helpMessage?: string | string[];
  /**
   * Whether to setting wrapper
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:35
   * @type {boolean}
   */
  useWrapper?: boolean;
  loading?: boolean;
  loadingTip?: string;
  /**
   * Show close button
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:55
   * @type {boolean}
   */
  showCancelBtn?: boolean;
  /**
   * 显示关闭按钮
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-06-04 09:06:11
   * @type {boolean}
   */
  showCloseBtn?: boolean;
  /**
   * Show confirmation button
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:06
   * @type {boolean}
   */
  showOkBtn?: boolean;

  wrapperProps?: Partial<ModalWrapperProps>;

  afterClose?: Function;

  bodyStyle?: CSSProperties;

  /**
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:21
   * @type {boolean}
   */
  closable?: boolean;

  closeIcon?: VueNode;

  confirmLoading?: boolean;

  destroyOnClose?: boolean;

  footer?: VueNode;

  getContainer?: () => any;

  /**
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:34
   * @type {boolean}
   */
  mask?: boolean;

  /**
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-03-20 10:03:51
   * @type {boolean}
   */
  maskClosable?: boolean;

  /**
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-20 10:03:56
   * @type {boolean}
   */
  keyboard?: boolean;

  maskStyle?: CSSProperties;

  /**
   *
   * @default 'primary'
   * @author zhanghanrui
   * @date 2024-03-20 10:03:48
   * @type string
   */
  okType?: string;

  okButtonProps?: ButtonProps;

  cancelButtonProps?: ButtonProps;

  title?: string;

  width?: string | number;

  wrapClassName?: string;

  zIndex?: number;

  /**
   * 是否显示底部
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-04-07 18:04:17
   * @type {boolean}
   */
  showFooter?: boolean;
}
