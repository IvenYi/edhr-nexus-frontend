import { Modal } from 'ant-design-vue';
import MQTT, { MqttClient } from 'mqtt';
import { MqttProperties } from '/@/api/sys/model/userModel';
import { useGlobSetting } from '/@/hooks/setting';

type PublishType = {
  topic: string; // 主题
  payload: string;
};

// const { getToken, logout } = useUserStoreWithOut();
const { host } = useGlobSetting();

// todo https => wss

export function useMqtt() {
  let client: MqttClient; // 连接成功后返回的客户端信息
  // 获取当前环境变量
  const hostUrl = (
    process.env.NODE_ENV === 'development' ? host : `${location.protocol}//${location.hostname}`
  )?.replace('http', 'ws');
  // const NODE_ENV = process.env.NODE_ENV;
  // if (NODE_ENV === 'development') {
  //   hostUrl = 'ws://' + host!.replace(/https?:\/\//, '');
  // } else {
  //   hostUrl = 'ws://' + location.hostname;
  // }
  // 创建连接
  const createConnection = async (
    userId: string | number,
    props: MqttProperties,
    token: string,
    callback: (v) => void,
  ) => {
    const { username, password } = props;
    // const hostUrl = location.hostname;
    const id = userId + '';
    // const host = hostUrl.replace('http', 'ws');
    const connection = {
      host: hostUrl,
      endpoint: '/mqtt', // 默认"/mqtt"，string
      clean: true, // 保留会话
      connectTimeout: 4000, // 超时时间
      reconnectPeriod: 4000, // 重连时间间隔
      username: username, // 用户名和密码根据实际情况而定
      password: password,
      lastWillTopic: 'maker',
    };
    const { endpoint, ...options } = connection;
    const connectUrl = `${hostUrl}${endpoint}`;

    try {
      client = MQTT.connect(connectUrl, options);
    } catch (err) {
      return Promise.reject(err);
    }
    const topic = `USER/${id}/KICK_OUT`;
    console.log(connectUrl, options, topic);
    client.subscribe(topic, (error: any, res: any) => {
      if (error) {
        return Promise.reject(error);
      }
      // 监听连接主题
      client.on('message', (topic, message) => {
        const msg = JSON.parse(message.toString());
        const tokenId = msg.token;
        if (token && token === tokenId) {
          // 退出登录
          Modal.warning({
            title: '登录警告',
            content: '当前账号已在其他设备登录',
            onOk: async () => {
              await callback(true);
            },
          });
        }
      });
      // return Promise.resolve(res);
    });
    // // 断线重连
    // client.on('disconnect', () => {
    //   client = MQTT.connect(connectUrl, options);
    // })
  };

  // 断开连接
  const disConnect = async () => {
    if (client?.connected) {
      try {
        client.end();
        console.log('Successfully disconnected!');
      } catch (error: any) {
        console.log('Disconnect failed', error.toString());
      }
    }
  };

  // 发布主题
  const onPublish = async (publish: PublishType) => {
    const { topic, payload } = publish;
    client.publish(topic, payload, (error: any) => {
      if (error) {
        console.log('Publish error', error);
      } else {
        console.log('已发布的消息：', publish);
      }
    });
  };

  // 取消订阅
  const unSubscribe = async (subscription: PublishType) => {
    const { topic } = subscription;
    client.unsubscribe(topic, (error: any) => {
      if (error) {
        return Promise.reject(error);
      }
    });
  };

  return {
    createConnection,
    disConnect,
    onPublish,
    unSubscribe,
  };
}
