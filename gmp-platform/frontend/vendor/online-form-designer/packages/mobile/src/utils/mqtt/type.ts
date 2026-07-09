export interface MqttConfig {
  username?: string;
  password?: string;
  topics?: string[];
  opts?: { clientId: string; [key: string]: any };
}
