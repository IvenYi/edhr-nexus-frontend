interface ImageItem {
  src: string;
  height: number;
  width: number;
}

export class ImgParser {
  static read(file: any): Promise<ImageItem> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          resolve({
            src: e.target?.result as string,
            width: img.width,
            height: img.height,
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
