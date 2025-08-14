import { Component, Node, EventTouch, Vec3, UITransform, sys, _decorator } from "cc";

const { ccclass } = _decorator;

export interface DragDropCallback {
    onDragStart?: (event: EventTouch) => void;
    onDragMove?: (event: EventTouch) => void;
    onDragEnd?: (event: EventTouch) => void;
    onFileDrop?: (files: FileList) => void;
}

export class DragDropUtil {

    /**
     * 为节点添加拖拽功能
     * @param node 目标节点
     * @param callback 回调函数
     */
    static addDragDrop(node: Node, callback: DragDropCallback) {
        const component = node.getComponent(DragDropComponent);
        if (!component) {
            node.addComponent(DragDropComponent);
        }
        const dragComponent = node.getComponent(DragDropComponent);
        dragComponent.setCallback(callback);
    }

    /**
     * 移除节点的拖拽功能
     * @param node 目标节点
     */
    static removeDragDrop(node: Node) {
        const component = node.getComponent(DragDropComponent);
        if (component) {
            component.destroy();
        }
    }
}

@ccclass('DragDropComponent')
export class DragDropComponent extends Component {

    private callback: DragDropCallback = null;
    private isDragging: boolean = false;
    private dragStartPos: Vec3 = new Vec3();
    private originalPos: Vec3 = new Vec3();
    private canvasElement: HTMLElement = null;

    onLoad() {
        // 添加触摸事件监听
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // 在Web平台添加文件拖拽监听
        if (sys.platform === sys.Platform.MOBILE_BROWSER || sys.platform === sys.Platform.DESKTOP_BROWSER) {
            this.addFileDropListener();
        }
    }

    onDestroy() {
        // 移除事件监听
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        if (sys.platform === sys.Platform.MOBILE_BROWSER || sys.platform === sys.Platform.DESKTOP_BROWSER) {
            this.removeFileDropListener();
        }
    }

    setCallback(callback: DragDropCallback) {
        this.callback = callback;
    }

    private onTouchStart(event: EventTouch) {
        console.log(event);
        this.isDragging = true;
        const location = event.getLocation();
        this.dragStartPos.set(location.x, location.y, 0);
        this.originalPos = this.node.position.clone();

        if (this.callback?.onDragStart) {
            this.callback.onDragStart(event);
        }
    }

    private onTouchMove(event: EventTouch) {
        if (!this.isDragging) return;

        const currentPos = event.getLocation();
        const deltaX = currentPos.x - this.dragStartPos.x;
        const deltaY = currentPos.y - this.dragStartPos.y;

        // 更新节点位置
        this.node.setPosition(
            this.originalPos.x + deltaX,
            this.originalPos.y + deltaY,
            this.originalPos.z
        );

        if (this.callback?.onDragMove) {
            this.callback.onDragMove(event);
        }
    }

    private onTouchEnd(event: EventTouch) {
        this.isDragging = false;

        if (this.callback?.onDragEnd) {
            this.callback.onDragEnd(event);
        }
    }

    private addFileDropListener() {
        // 在Web平台添加文件拖拽监听
        try {
            // 获取canvas元素
            const canvas = document.querySelector('canvas');
            if (canvas) {
                this.canvasElement = canvas;

                // 阻止默认的拖拽行为
                this.canvasElement.addEventListener('dragover', this.onDragOver.bind(this), false);
                this.canvasElement.addEventListener('dragenter', this.onDragEnter.bind(this), false);
                this.canvasElement.addEventListener('drop', this.onDrop.bind(this), false);

                console.log('文件拖拽监听已添加');
            } else {
                console.warn('未找到canvas元素，无法添加文件拖拽功能');
            }
        } catch (error) {
            console.error('添加文件拖拽监听失败:', error);
        }
    }

    private removeFileDropListener() {
        if (this.canvasElement) {
            this.canvasElement.removeEventListener('dragover', this.onDragOver.bind(this), false);
            this.canvasElement.removeEventListener('dragenter', this.onDragEnter.bind(this), false);
            this.canvasElement.removeEventListener('drop', this.onDrop.bind(this), false);
            this.canvasElement = null;
            console.log('文件拖拽监听已移除');
        }
    }

    private onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    private onDragEnter(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    private onDrop(event: DragEvent) {
        if (!this.node.parent.active) return
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            console.log(`接收到 ${files.length} 个文件`);

            // 检查是否在目标节点区域内
            // if (this.isDropInTargetArea(event)) {
            if (this.callback?.onFileDrop) {
                this.callback.onFileDrop(files);
            }
            // } else {
            //     console.log('????????????????');
            // }
        }
    }

    private isDropInTargetArea(event: DragEvent): boolean {
        if (!this.node || !this.node.getComponent(UITransform)) {
            return false;
        }

        const uiTransform = this.node.getComponent(UITransform);
        const nodeWorldPos = this.node.getWorldPosition();
        const nodeSize = uiTransform.contentSize;

        // 获取鼠标在canvas中的位置
        const rect = this.canvasElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // 转换为世界坐标
        const worldPos = this.node.parent.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(mouseX, mouseY, 0));
        console.log(event);
        console.log(worldPos, nodeWorldPos);
        // 检查是否在节点范围内
        const halfWidth = nodeSize.width / 2;
        const halfHeight = nodeSize.height / 2;
        console.log(worldPos, nodeWorldPos);

        return Math.abs(worldPos.x - nodeWorldPos.x) <= halfWidth &&
            Math.abs(worldPos.y - nodeWorldPos.y) <= halfHeight;
    }
} 