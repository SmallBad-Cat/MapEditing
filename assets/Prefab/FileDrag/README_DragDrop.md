# Cocos Creator 3.8 Web文件拖拽导入系统

这个系统为Cocos Creator 3.8提供了完整的Web平台文件拖拽导入功能，支持图片和文本文件的导入。

## 功能特性

- ✅ 支持Web平台文件拖拽
- ✅ 支持图片文件导入（PNG, JPG, JPEG, WebP, GIF）
- ✅ 支持文本文件导入（TXT, JSON, CSV, XML）
- ✅ 自动创建Cocos Creator纹理和精灵帧
- ✅ 资源自动清理
- ✅ 拖拽区域检测
- ✅ 错误处理和状态反馈

## 文件结构

```
assets/script/framework/util/
├── DragDropUtil.ts          # 核心拖拽功能
├── FileImportUtil.ts        # 文件导入处理
├── DragDropExample.ts       # 使用示例
└── README_DragDrop.md       # 说明文档
```

## 快速开始

### 1. 基本使用

```typescript
import { DragDropUtil } from "./DragDropUtil";

// 为节点添加拖拽功能
DragDropUtil.addDragDrop(node, {
    onDragStart: (event) => {
        console.log("开始拖拽");
    },
    onDragMove: (event) => {
        console.log("拖拽中");
    },
    onDragEnd: (event) => {
        console.log("结束拖拽");
    },
    onFileDrop: (files) => {
        console.log(`接收到 ${files.length} 个文件`);
        // 处理文件
    }
});
```

### 2. 使用FileImportUtil处理文件

```typescript
import { FileImportUtil } from "./FileImportUtil";

// 批量导入文件
FileImportUtil.importFiles(files).then(results => {
    results.forEach(result => {
        if (result.success) {
            if (result.data.texture) {
                // 处理图片文件
                console.log("图片导入成功");
            } else if (result.data.content) {
                // 处理文本文件
                console.log("文本导入成功");
            }
        } else {
            console.error("导入失败:", result.message);
        }
    });
});
```

### 3. 完整示例

参考 `DragDropExample.ts` 文件，展示了完整的使用流程：

- 设置拖拽区域
- 处理文件导入
- 应用纹理到精灵
- 处理JSON数据
- 资源清理

## API 参考

### DragDropUtil

#### `addDragDrop(node: Node, callback: DragDropCallback)`
为指定节点添加拖拽功能。

#### `removeDragDrop(node: Node)`
移除指定节点的拖拽功能。

#### DragDropCallback 接口
```typescript
interface DragDropCallback {
    onDragStart?: (event: EventTouch) => void;
    onDragMove?: (event: EventTouch) => void;
    onDragEnd?: (event: EventTouch) => void;
    onFileDrop?: (files: FileList) => void;
}
```

### FileImportUtil

#### `importImage(file: File): Promise<ImageImportResult>`
导入单个图片文件。

#### `importText(file: File): Promise<TextImportResult>`
导入单个文本文件。

#### `importFiles(files: FileList): Promise<FileImportResult[]>`
批量导入文件。

#### `applyTextureToSprite(sprite: Sprite, texture: Texture2D): void`
将纹理应用到精灵。

#### `destroyTexture(texture: Texture2D): void`
销毁纹理资源。

#### `destroySpriteFrame(spriteFrame: SpriteFrame): void`
销毁精灵帧资源。

## 支持的文件格式

### 图片格式
- PNG (.png)
- JPEG (.jpg, .jpeg)
- WebP (.webp)
- GIF (.gif)

### 文本格式
- 纯文本 (.txt)
- JSON (.json)
- CSV (.csv)
- XML (.xml)

## 注意事项

1. **平台限制**: 此功能仅在Web平台（浏览器）中有效
2. **文件大小**: 建议限制文件大小，避免内存问题
3. **资源清理**: 记得在组件销毁时清理导入的资源
4. **错误处理**: 始终检查导入结果的成功状态
5. **类型检查**: 使用 `FileImportUtil.isFileTypeSupported()` 检查文件类型

## 使用场景

- 游戏资源导入
- 配置文件加载
- 用户自定义内容
- 关卡数据导入
- 图片素材管理

## 故障排除

### 常见问题

1. **文件拖拽不工作**
   - 检查是否在Web平台运行
   - 确认节点已正确添加拖拽组件

2. **图片导入失败**
   - 检查文件格式是否支持
   - 确认文件没有损坏

3. **内存泄漏**
   - 确保在组件销毁时调用资源清理方法
   - 检查是否有循环引用

### 调试技巧

- 查看控制台输出的详细日志
- 使用 `FileImportUtil.isFileTypeSupported()` 检查文件类型
- 检查导入结果的 `success` 和 `message` 字段

## 更新日志

- v1.0.0: 初始版本，支持基本的文件拖拽导入功能
- 支持图片和文本文件导入
- 添加资源管理和清理功能
- 提供完整的错误处理机制 