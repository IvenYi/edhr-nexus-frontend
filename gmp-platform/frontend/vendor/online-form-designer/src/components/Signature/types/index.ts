import { ComponentPublicInstance } from 'vue';

export interface SignInfo {
  /**
   * 签名图片url
   */
  url: string;
  /**
   * 签名时间戳
   */
  time: number;
  /**
   * 签名记录id
   */
  historyId: string;
  /**
   * 签名用户姓名
   */
  username: string;
}

export type PartialSignInfo = Partial<Omit<SignInfo, 'url'>> & Pick<SignInfo, 'url'>;

export declare type SignerExpose = {
  /**
   * 提交并获取签名信息
   */
  submit: () => Promise<SignInfo>;
};

export declare type SignerInstance = ComponentPublicInstance<{}, SignerExpose>;

export type GetSignImgByAccount = (
  username: string,
  password: string,
  type: string,
) => Promise<PartialSignInfo>;

export type UploadSignFile = (file: File, modelKey?: string) => Promise<PartialSignInfo>;
