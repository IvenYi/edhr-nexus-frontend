import { PlatformType } from '../../enums';
import { IAppEnv, IAppSetting, IOverlayController } from '../../interface';
import { allRegister } from '../../register';
import { CodeListService, DictionaryService } from '../../service';
import { AppEnv } from '../app-env/app-env';
import { AppSetting } from '../app-setting/app-setting';

/**
 * 全局运行时
 *
 * @author zhanghanrui
 * @date 2024-03-27 13:03:15
 * @export
 * @class GctRuntime
 */
export class GctRuntime {
  /**
   * 应用信息
   *
   * @author zhanghanrui
   * @date 2024-07-24 17:07:04
   * @type {IData}
   */
  appInfo: IData = {};

  /**
   * 应用全局设置
   *
   * @author chitanda
   * @date 2025-07-22 19:07:30
   * @type {IAppSetting}
   */
  appSetting: IAppSetting = new AppSetting();

  /**
   * 应用环境变量
   *
   * @type {IAppEnv}
   */
  env: IAppEnv = new AppEnv();

  /**
   * 代码表服务
   *
   * @deprecated
   * @author zhanghanrui
   * @date 2024-03-27 13:03:05
   * @type {CodeListService}
   */
  codeList: CodeListService = new CodeListService();

  /**
   * 数据字典服务
   *
   * @author zhanghanrui
   * @date 2024-04-02 21:04:25
   * @type {DictionaryService}
   */
  dictionary: DictionaryService = new DictionaryService();

  /**
   * 弹出工具
   *
   * @author zhanghanrui
   * @date 2024-03-28 15:03:16
   * @type {OverlayController}
   */
  openUtil!: IOverlayController;

  /**
   * 所有注册器
   *
   * @author zhanghanrui
   * @date 2024-04-01 13:04:13
   */
  register = allRegister;

  /**
   * 当前运行平台，具体平台初始化时赋值，默认为浏览器环境。
   * 不是设计环境，是运行时环境
   *
   * @author chitanda
   * @date 2025-10-20 20:10:12
   * @type {PlatformType} 平台类型枚举
   */
  platform: PlatformType = PlatformType.WEB;

  /**
   * 当前设计平台，具体平台初始化时赋值，默认为浏览器环境。
   * !非设计环境下该值无意义
   *
   * @author chitanda
   * @date 2025-10-20 20:10:36
   * @type {PlatformType}
   */
  designPlatform: PlatformType = PlatformType.WEB;
}
