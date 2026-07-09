/**消息mqtt返回体 */
export interface MessageMqttType {
  totalUnreadCount: number;
  appMessageCount: {
    appId: string;
    unreadCount: number;
  };
}
/**代办mqtt返回体 */
export interface TodoMqttType {
  Count: number;
  appMessageCount: {
    appId: string;
    count: number;
  };
}
