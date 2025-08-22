import { _decorator, Component, Node, Label, Sprite, sys } from "cc";
import { DragDropUtil, DragDropCallback } from "./DragDropUtil";
import { FileImportUtil, FileImportResult, ImageImportResult } from "./FileImportUtil";
import { Main } from "../../Main";
// import { ItemInType } from "../StateTool";
import { GameUtil } from "../../Sprite/GameUtil";

const { ccclass, property } = _decorator;

@ccclass('DragDropExample')
export class DragDropExample extends Component {

    @property(Label)
    statusLabel: Label = null;

    @property(Sprite)
    dropZone: Sprite = null;

    @property(Sprite)
    previewSprite: Sprite = null;

    private importedTextures: any[] = [];
    private onJsonFile: any = null
    private MapDatasChange = null
    private StorageType = "mapLayoutData"
    init(MapDatasChange, type?) {
        this.MapDatasChange = MapDatasChange;
        if (type) {
            this.StorageType = type
        }
    }
    start() {
        // 为拖拽区域添加拖拽功能
        DragDropUtil.addDragDrop(this.dropZone.node, {
            onDragStart: this.onDragStart.bind(this),
            onDragMove: this.onDragMove.bind(this),
            onDragEnd: this.onDragEnd.bind(this),
            onFileDrop: this.onFileDrop.bind(this)
        });

        this.updateStatus("拖拽文件到此处导入");
    }

    onDestroy() {
        // 移除拖拽功能
        DragDropUtil.removeDragDrop(this.dropZone.node);

        // 清理导入的资源
        this.cleanupImportedResources();
    }

    private onDragStart(event: any) {
        console.log("开始拖拽");
        this.updateStatus("开始拖拽...");
    }

    private onDragMove(event: any) {
        // 可以在这里添加拖拽过程中的视觉反馈
        console.log("拖拽中...");
    }

    private onDragEnd(event: any) {
        console.log("结束拖拽");
        this.updateStatus("拖拽文件到此处导入");
    }

    private onFileDrop(files: FileList) {
        console.log(`接收到 ${files.length} 个文件`);
        this.updateStatus(`接收到 ${files.length} 个文件，正在处理...`);

        // 使用FileImportUtil处理文件
        FileImportUtil.importFiles(files).then(results => {
            this.handleImportResults(results);
        });
    }

    private handleImportResults(results: FileImportResult[]) {
        let successCount = 0;
        let errorMessages: string[] = [];
        console.log(results);
        results.forEach((result, index) => {
            if (result.success) {
                successCount++;
                this.handleSuccessfulImport(result, index);
            } else {
                errorMessages.push(result.message);
            }
        });

        // 更新状态
        if (successCount > 0) {
            this.updateStatus(`成功导入 ${successCount} 个文件`);
            if (errorMessages.length > 0) {
                console.warn("部分文件导入失败:", errorMessages);
            }
        } else {
            this.updateStatus(`导入失败: ${errorMessages.join(", ")}`);
        }
    }

    private handleSuccessfulImport(result: FileImportResult, index: number) {
        console.log(result);
        if (result && result.texture) {
            // 处理图片文件
            const imageResult = result as ImageImportResult;
            this.handleImageImport(imageResult);
        } else if (result && result.jsonData) {
            // 处理文本文件
            this.handleTextImport(result);
        }
    }

    private handleImageImport(result: ImageImportResult) {
        console.log("图片导入成功:", result.message);

        // 保存纹理引用以便后续清理
        if (result.texture) {
            this.importedTextures.push(result.texture);
        }

        // 如果有预览精灵，应用纹理
        if (this.previewSprite && result.spriteFrame) {
            this.previewSprite.spriteFrame = result.spriteFrame;
            this.updateStatus("图片已应用到预览区域");
        }
    }

    private handleTextImport(result: FileImportResult) {
        console.log("文本导入成功:", result.message);
        if (result && result.jsonData) {
            // 处理JSON数据
            console.log("JSON数据:", result.jsonData);
            this.updateStatus("JSON文件解析成功");

            // 这里可以根据JSON内容进行特定处理
            // 例如：更新游戏配置、加载关卡数据等
            this.processJsonData(result.jsonData);
        } else if (result && result.content) {
            // 处理普通文本
            console.log("文本内容:", result.content);
            this.updateStatus("文本文件导入成功");
        }
    }

    private processJsonData(jsonData: any) {
        this.onJsonFile = jsonData;
        // for (let k in this.onJsonFile) {
        //     for (let i in this.onJsonFile[k].data) {
        //         let newT = ItemInType['t' + this.onJsonFile[k].data[i].t]
        //         if (newT) {
        //             this.onJsonFile[k].data[i].t = newT
        //         }
        //         if(this.onJsonFile[k].data[i].dt){
        //             for(let k_i in this.onJsonFile[k].data[i].dt){
        //                 let t =  this.onJsonFile[k].data[i].dt[k_i].t
        //                 this.onJsonFile[k].data[i].dt[k_i].t = ItemInType['t' + t]?ItemInType['t' + t]:t;
        //             }
        //         }
        //     }
        // }
        this.node.getChildByName("HaveFile").active = true
    }

    private cleanupImportedResources() {
        // 清理导入的纹理资源
        this.importedTextures.forEach(texture => {
            FileImportUtil.destroyTexture(texture);
        });
        this.importedTextures = [];

        console.log("已清理导入的资源");
    }

    private updateStatus(message: string) {
        if (this.statusLabel) {
            this.statusLabel.string = message;
        }
        console.log("状态更新:", message);
    }

    // 公共方法：手动清理资源
    public cleanupResources() {
        this.cleanupImportedResources();
    }

    // 公共方法：获取导入的纹理数量
    public getImportedTextureCount(): number {
        return this.importedTextures.length;
    }
    onBack() {
        this.node.active = false
    }
    onSave(event: Event) {
        let target: any = event.target;
        let MapDatas = GameUtil.ChangeStorage(false, this.StorageType, {})
        if (target.name == "ImportSubstitute" || target.name == "Import") {
            for (let k in this.onJsonFile) {
                if (target.name == "ImportSubstitute") {
                    MapDatas[k] = this.onJsonFile[k]
                } else if (!MapDatas[k]) {
                    MapDatas[k] = this.onJsonFile[k]
                }
            }
        } else if (target.name == "Substitute") {
            MapDatas = this.onJsonFile
        }
        GameUtil.ChangeStorage(true, this.StorageType, MapDatas)
        this.node.getChildByName("HaveFile").active = false
        this.updateStatus("数据已更新");
        this.MapDatasChange && this.MapDatasChange()
        this.onBack()
    }
} 