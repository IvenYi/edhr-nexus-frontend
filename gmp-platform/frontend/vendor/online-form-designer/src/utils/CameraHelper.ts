/**
 * PC端摄像头快速拍照助手
 * 自动开启摄像头 → 截图 → 关闭 → 返回压缩 base64
 */
export class CameraHelper {
  private readonly config: Required<CameraHelperOptions>;
  video: HTMLVideoElement;
  stream: MediaStream | undefined;
  constructor(video?: HTMLVideoElement, options: CameraHelperOptions = {}) {
    this.video = this.createVideoElement(video);
    this.config = {
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
      facingMode: 'user',
      videoConstraints: {},
      ...options,
    };
  }

  /**
   *  启动
   */
  async startSnap({ facingMode, deviceId }: any = {}): Promise<void> {
    try {
      if (!this.checkSupport()) {
        throw new Error('浏览器不支持摄像头或非安全环境（HTTPS）');
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { max: 4096 },
          height: { max: 4096 },
          facingMode: facingMode || this.config.facingMode,
          // 👇 用户自定义的约束覆盖默认值
          ...(this.config.videoConstraints || {}),
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        },
        audio: false,
      });

      this.video.srcObject = this.stream;
      await this.waitVideoReady(this.video);
    } catch (err) {
      console.error('拍照失败:', err);
      throw err;
    } finally {
    }
  }

  /* ================== 内部方法 ================== */

  private createVideoElement(v?: HTMLVideoElement): HTMLVideoElement {
    const video = v || document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    v || (video.style.display = 'none');
    return video;
  }

  private waitVideoReady(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('摄像头启动超时'));
      }, 10000);
      video.onloadedmetadata = () => {
        clearTimeout(timer);
        resolve();
      };

      video.onerror = (e) => {
        clearTimeout(timer);
        reject(e);
      };
    });
  }
  /**
   * 截图
   * @returns
   */
  takeSnapshot(): string {
    const { videoWidth, videoHeight } = this.video;

    if (!videoWidth || !videoHeight) {
      throw new Error('无法获取摄像头画面尺寸');
    }

    const { width, height } = this.calculateSize(
      videoWidth,
      videoHeight,
      this.config.maxWidth,
      this.config.maxHeight,
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 不支持');
    }

    ctx.drawImage(this.video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', this.config.quality);
  }

  private calculateSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);
    }

    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = Math.round(width * ratio);
    }

    return {
      width: Math.max(width, 100),
      height: Math.max(height, 100),
    };
  }

  /**关闭 */
  stopStream(): void {
    this.stream && this.stream.getTracks().forEach((track) => track.stop());
    if (this.video) this.video.srcObject = null;
  }

  private checkSupport(): boolean {
    return !!(navigator.mediaDevices?.getUserMedia && window.isSecureContext);
  }
}
export interface SnapOptions {
  beforeSnap?: () => Promise<void> | void;
}
type FacingMode = 'user' | 'environment';

export interface CameraHelperOptions {
  quality?: number; // 0 - 1
  maxWidth?: number;
  maxHeight?: number;
  facingMode?: FacingMode;
  /** 新增：完全透传给 getUserMedia 的 video 约束 */
  videoConstraints?: MediaTrackConstraints;
}

/**
 * 获取可用摄像头列表
 * - 会在必要时请求一次摄像头权限，用于获取 label
 * - 自动释放临时 stream
 */
export async function getCameraList(): Promise<CameraDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    throw new Error('浏览器不支持 enumerateDevices');
  }

  let tempStream: MediaStream | null = null;

  try {
    // 先拿一次设备列表
    let devices = await navigator.mediaDevices.enumerateDevices();
    let cameras = devices.filter((d) => d.kind === 'videoinput');

    // 如果 label 为空，说明还没授权 → 临时申请一次权限
    if (cameras.length && cameras.every((c) => !c.label)) {
      tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      devices = await navigator.mediaDevices.enumerateDevices();
      cameras = devices.filter((d) => d.kind === 'videoinput');
    }

    return cameras.map((d, index) => ({
      value: d.deviceId,
      label: d.label || `摄像头 ${index + 1}`,
      facingMode: d.label.includes('front') ? 'user' : 'environment',
    }));
  } finally {
    // 释放临时 stream
    tempStream?.getTracks().forEach((t) => t.stop());
  }
}
export interface CameraDevice {
  value: string;
  label: string;
  facingMode: 'user' | 'environment';
}
