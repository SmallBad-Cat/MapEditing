import { _decorator, Texture2D, ImageAsset, assetManager, resources, SpriteFrame, Sprite } from "cc";

const { ccclass } = _decorator;

export interface FileImportResult {
    success: boolean;
    message: string;
    jsonData?: any;
    texture?: Texture2D;
    spriteFrame?: SpriteFrame;
    content?: string;
}

export interface ImageImportResult extends FileImportResult {
    texture?: Texture2D;
    spriteFrame?: SpriteFrame;
}

export interface TextImportResult extends FileImportResult {
    content?: string;
    jsonData?: any;
}

@ccclass('FileImportUtil')
export class FileImportUtil {

    /**
     * 支持的图片格式
     */
    static readonly SUPPORTED_IMAGE_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    /**
     * 支持的文本格式
     */
    static readonly SUPPORTED_TEXT_TYPES = [
        'text/plain',
        'text/json',
        'application/json',
        'text/csv',
        'text/xml'
    ];

    /**
     * 检查文件类型是否支持
     */
    static isFileTypeSupported(file: File): boolean {
        return this.SUPPORTED_IMAGE_TYPES.indexOf(file.type) !== -1 ||
            this.SUPPORTED_TEXT_TYPES.indexOf(file.type) !== -1;
    }

    /**
     * 导入图片文件
     */
    static importImage(file: File): Promise<ImageImportResult> {
        return new Promise((resolve) => {
            if (this.SUPPORTED_IMAGE_TYPES.indexOf(file.type) === -1) {
                resolve({
                    success: false,
                    message: `不支持的图片格式: ${file.type}`
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result as string;
                this.createTextureFromDataUrl(dataUrl, file.name)
                    .then(result => resolve(result))
                    .catch(error => {
                        resolve({
                            success: false,
                            message: `图片导入失败: ${error.message}`
                        });
                    });
            };
            reader.onerror = () => {
                resolve({
                    success: false,
                    message: "图片文件读取失败"
                });
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * 导入文本文件
     */
    static importText(file: File): Promise<TextImportResult> {
        return new Promise((resolve) => {
            if (this.SUPPORTED_TEXT_TYPES.indexOf(file.type) === -1) {
                resolve({
                    success: false,
                    message: `不支持的文本格式: ${file.type}`
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result as string;

                // 尝试解析JSON
                let jsonData = null;
                if (file.type === 'application/json' || file.name.endsWith('.json')) {
                    try {
                        jsonData = JSON.parse(content);
                    } catch (error) {
                        resolve({
                            success: false,
                            message: "JSON格式错误"
                        });
                        return;
                    }
                }

                resolve({
                    success: true,
                    message: "文本文件导入成功",
                    content: content,
                    jsonData: jsonData
                });
            };
            reader.onerror = () => {
                resolve({
                    success: false,
                    message: "文本文件读取失败"
                });
            };
            reader.readAsText(file);
        });
    }

    /**
     * 批量导入文件
     */
    static importFiles(files: FileList): Promise<FileImportResult[]> {
        const promises: Promise<FileImportResult>[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (this.SUPPORTED_IMAGE_TYPES.indexOf(file.type) !== -1) {
                promises.push(this.importImage(file));
            } else if (this.SUPPORTED_TEXT_TYPES.indexOf(file.type) !== -1) {
                promises.push(this.importText(file));
            } else {
                promises.push(Promise.resolve({
                    success: false,
                    message: `不支持的文件类型: ${file.type}`
                }));
            }
        }

        return Promise.all(promises);
    }

    /**
     * 从DataURL创建纹理
     */
    private static createTextureFromDataUrl(dataUrl: string, fileName: string): Promise<ImageImportResult> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // 创建ImageAsset
                    const imageAsset = new ImageAsset();
                    imageAsset.reset({
                        _data: img as any,
                        _compressed: false,
                        format: this.getImageFormat(fileName),
                        width: img.width,
                        height: img.height
                    });

                    // 创建Texture2D
                    const texture = new Texture2D();
                    texture.image = imageAsset;

                    // 创建SpriteFrame
                    const spriteFrame = new SpriteFrame();
                    spriteFrame.texture = texture;

                    resolve({
                        success: true,
                        message: "图片导入成功",
                        texture: texture,
                        spriteFrame: spriteFrame
                    });
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => {
                reject(new Error("图片加载失败"));
            };
            img.src = dataUrl;
        });
    }

    /**
     * 根据文件名获取图片格式
     */
    private static getImageFormat(fileName: string): number {
        const ext = fileName.toLowerCase().split('.').pop();
        switch (ext) {
            case 'png':
                return 0; // Texture2D.PixelFormat.RGBA8888
            case 'jpg':
            case 'jpeg':
                return 1; // Texture2D.PixelFormat.RGB888
            case 'webp':
                return 0; // Texture2D.PixelFormat.RGBA8888
            default:
                return 0; // 默认RGBA8888
        }
    }

    /**
     * 将纹理应用到精灵
     */
    static applyTextureToSprite(sprite: Sprite, texture: Texture2D): void {
        if (sprite && texture) {
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            sprite.spriteFrame = spriteFrame;
        }
    }

    /**
     * 清理纹理资源
     */
    static destroyTexture(texture: Texture2D): void {
        if (texture) {
            texture.destroy();
        }
    }

    /**
     * 清理精灵帧资源
     */
    static destroySpriteFrame(spriteFrame: SpriteFrame): void {
        if (spriteFrame) {
            spriteFrame.destroy();
        }
    }
} 