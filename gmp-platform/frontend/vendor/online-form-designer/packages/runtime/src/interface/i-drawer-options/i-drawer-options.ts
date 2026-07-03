import { CSSProperties } from 'vue';

/**
 * 模态飘窗配置项
 *
 * @author zhanghanrui
 * @date 2024-03-29 13:03:31
 * @export
 * @interface IDrawerOptions
 */
export interface IDrawerOptions {
  /**
   * 抽屉展开后是否将焦点切换至其 Dom 节点
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-29 13:03:51
   * @type {boolean}
   */
  autofocus?: boolean;

  /**
   * 可用于设置 Drawer 内容部分的样式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:26
   * @type {CSSProperties}
   */
  bodyStyle?: CSSProperties;

  /**
   * 对话框外层容器的类名
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:57
   * @type {string}
   */
  class?: string;

  /**
   * 是否显示左上角的关闭按钮
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-29 13:03:23
   * @type {boolean}
   */
  closable?: boolean;

  /**
   * 自定义关闭图标
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:30
   * @type {*}
   */
  closeIcon?: any;

  /**
   * 可用于设置 Drawer 包裹内容部分的样式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:39
   * @type {CSSProperties}
   */
  contentWrapperStyle?: CSSProperties;

  /**
   * 关闭时销毁 Drawer 里的子元素
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-03-29 13:03:25
   * @type {boolean}
   */
  destroyOnClose?: boolean;

  /**
   * 用于设置 Drawer 弹出层的样式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:52
   * @type {Object}
   */
  drawerStyle?: Object;

  /**
   * 抽屉右上角的操作区域
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:16
   * @type {(VNode | slot)}
   */
  extra?: any;

  /**
   * 抽屉的页脚
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:04
   * @type {(VNode | slot)}
   */
  footer?: any;

  /**
   * 抽屉页脚部件的样式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:23
   * @type {CSSProperties}
   */
  footerStyle?: CSSProperties;

  /**
   * 预渲染 Drawer 内元素
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-03-29 13:03:10
   * @type {boolean}
   */
  forceRender?: boolean;

  /**
   * 指定 Drawer 挂载的 HTML 节点
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:49
   */
  getContainer?: any;

  /**
   * 用于设置 Drawer 头部的样式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:25
   * @type {CSSProperties}
   */
  headerStyle?: CSSProperties;

  /**
   * 高度, 在 placement 为 top 或 bottom 时使用
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:40
   * @type {(string | number)}
   */
  height?: string | number;

  /**
   * 是否支持键盘 esc 关闭
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-29 13:03:54
   * @type {boolean}
   */
  keyboard?: boolean;

  /**
   * 是否展示遮罩
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-29 13:03:17
   * @type {boolean}
   */
  mask?: boolean;

  /**
   * 点击蒙层是否允许关闭
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-29 13:03:34
   * @type {boolean}
   */
  maskClosable?: boolean;

  /**
   * 遮罩样式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:49
   * @type {CSSProperties}
   */
  maskStyle?: CSSProperties;

  /**
   * 抽屉的方向
   *
   * @default 'right'
   * @author zhanghanrui
   * @date 2024-03-29 13:03:05
   * @type {('top' | 'right' | 'bottom' | 'left')}
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * 用于设置多层 Drawer 的推动行为
   *
   * @default { distance: 180 }
   * @author zhanghanrui
   * @date 2024-03-29 13:03:27
   * @type {(boolean | { distance: string | number })}
   */
  push?: boolean | { distance: string | number };

  /**
   * 预设抽屉宽度（或高度）
   *
   * @default 'default'
   * @author zhanghanrui
   * @date 2024-03-29 13:03:01
   * @type {('default' | 'large')}
   */
  size?: 'default' | 'large';

  /**
   * 可用于设置 Drawer 最外层容器的样式，和 drawerStyle 的区别是作用节点包括 mask
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:23
   * @type {CSSProperties}
   */
  style?: CSSProperties;

  /**
   * 抽屉的标题
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:32
   * @type {string}
   */
  title?: string;

  /**
   * (v-model)	Drawer 是否可见
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:41
   * @type {boolean}
   */
  visible?: boolean;

  /**
   * 宽度
   *
   * @default 378
   * @author zhanghanrui
   * @date 2024-03-29 13:03:58
   * @type {(string | number)}
   */
  width?: string | number;

  /**
   * 设置 Drawer 的 z-index
   *
   * @default 1000
   * @author zhanghanrui
   * @date 2024-03-29 13:03:21
   * @type {number}
   */
  zIndex?: number;

  /**
   * 是否为详情模式
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:34
   * @type {boolean}
   */
  isDetail?: boolean;

  /**
   * loading 状态
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-03-29 13:03:48
   * @type {boolean}
   */
  loading?: boolean;

  /**
   * loading 文本
   *
   * @author zhanghanrui
   * @date 2024-03-29 13:03:02
   * @type {string}
   */
  loadingText?: string;

  /**
   * isDetail=true 状态下是否显示返回按钮
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-03-29 14:03:03
   * @type {boolean}
   */
  showDetailBack?: boolean;

  /**
   * 自定义关闭函数，返回true关闭，否则不关闭
   *
   * @author zhanghanrui
   * @date 2024-03-29 14:03:42
   */
  closeFunc?: () => Promise<boolean>;

  /**
   * 是否显示底部
   *
   * @author zhanghanrui
   * @date 2024-03-29 14:03:55
   * @type {boolean}
   */
  showFooter?: boolean;

  /**
   * 底部区域高度
   *
   * @default 60
   * @author zhanghanrui
   * @date 2024-03-29 14:03:22
   * @type {number}
   */
  footerHeight?: number;
}
