/**
 *
 * @deprecated
 * @hidden
 * @interface MsgManager
 */
export interface MsgManager {
  /**
   * 发送邮箱消息
   * @param emailMsgRequest
   * @param emailMsgRequest.id 邮箱配置的id
   * @param emailMsgRequest.receiveUserId 发送系统内的用户id(前提是这个用户的邮箱正确)
   * @param emailMsgRequest.title 邮件标题
   * @param emailMsgRequest.content 邮件内容
   */
  sendEmailMessage(emailMsgRequest: {
    id: string;
    receiveUserId: string;
    title: string;
    content: string;
  });

  /**
   * 发送企业微信、钉钉、飞书消息
   * @param msgRequest
   * @param msgRequest.id 企业微信、钉钉、飞书配置的id
   * @param msgRequest.type 'WX_WORK' | 'DING_TALK' | 'FEISHU'
   * @param msgRequest.receiveUser 要发送给对方用户的id(这个用户id是在对应系统里面的用户id)
   * @param msgRequest.content 消息内容
   */
  sendMessage(msgRequest: {
    id: string;
    // type: 'WX_WORK' | 'DING_TALK' | 'FEISHU';
    type: string;
    receiveUser: string;
    content: string;
  });
}
