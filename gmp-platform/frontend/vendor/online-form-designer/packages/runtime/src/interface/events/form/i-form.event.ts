import { IFormItemBasicController } from "../../controller";

/**
 * 表单事件
 *
 * @author zhanghanrui
 * @date 2024-04-02 13:04:57
 * @export
 * @interface IFormEvent
 */
export interface IFormEvent {
  changeState(key: string, item: IFormItemBasicController): void;

  change(key: string, value: any, oldValue: any): void;

  blur(key: string, value: any): void;
}
