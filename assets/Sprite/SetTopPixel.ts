import { _decorator, color, Color, Component, EditBox, EventMouse, Input, instantiate, Label, Node, Size, Sprite, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import List from '../Scene/list/List';
import { GameUtil } from './GameUtil';
const { ccclass, property } = _decorator;
export const ColorValue = {
    0: color(0x8c, 0x8c, 0x8c),
    1: "#077AFF",
    2: "#FFD800",
    3: "#45B554",
    4: "#FF45F0",
    5: "#FF3434",
    6: "#FFBD9E",
    7: "#07CBFF",
    8: "#FF8F21",
    9: "#EFE6E2",
    10: "#C14AFF",
    11: "#000000",
}
@ccclass('SetTopPixel')
export class SetTopPixel extends Component {
    @property({ type: Node, displayName: "提示" })
    private Tip: Node = null;
    @property({ type: Node, displayName: "选择颜色" })
    private ChooseColor: Node = null;
    @property({ type: Node, displayName: "色块区域" })
    private Content: Node = null;
    @property({ type: List, displayName: "队列" })
    private ItemList: List = null;
    @property({ type: Node, displayName: "颜色列表" })
    private ColorList: Node = null;
    @property({ type: EditBox, displayName: "物品key" })
    private ItemKeyEB: EditBox = null;
    @property({ type: EditBox, displayName: "Xhang" })
    private Xhang: EditBox = null;
    @property({ type: EditBox, displayName: "Ylie" })
    private Ylie: EditBox = null;

    private PageState = "Look";
    private ItemKey = null;
    private DataStorage = null;
    private MapData = v2(5, 5);
    private haveTip: number = 0;
    start() {
        // 
        // 鼠标按下
        this.node.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        // 鼠标移动
        this.node.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.initPage()
    }
    onMouseMove(event: EventMouse) {
        if (this.ChooseColor.active) {
            this.ChooseColor.setWorldPosition(this._convertToVec3(event.getUILocation()));
        }
    }
    private _convertToVec3(pos: Vec2) {
        return new Vec3(pos.x, pos.y);
    }
    // ========== 点击事件处理 ==========
    private onMouseDown(event: EventMouse) {

        const mousePos = event.getUILocation();
        if (this.ChooseColor.active) {
            let worldPos = this.Content.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y));
            let Item = this.TouchData(new Vec3(mousePos.x, mousePos.y))
            if (Item) {
                Item.name = this.ChooseColor.name
                Item.getComponent(Sprite).color = this.ChooseColor.getComponent(Sprite).color;
            }
        }
    }
    TouchData(pos) {
        for (let node of this.Content.children) {
            let size = node.getComponent(UITransform).contentSize;
            let node_pos = node.getWorldPosition();

            if (pos.x > node_pos.x - (size.width / 2) && pos.x < node_pos.x + (size.width / 2) && pos.y < node_pos.y + (size.height / 2) && pos.y > node_pos.y - (size.height / 2)) {
                return node
            }
        }
        return null;
    }
    initPage() {
        this.DataStorage = GameUtil.ChangeStorage(false, "TopPoxel")
        if (!this.DataStorage) {
            this.DataStorage = {}
        }
        this.ItemList.numItems = Object.keys(this.DataStorage).length;
        this.initContent()
    }
    initContent() {
        for (let child of this.Content.children) {
            child.active = false;
        }
        let idx = 0
        let SizeX = (520 - ((this.MapData.x - 1) * 5)) / this.MapData.x
        let SizeY = (520 - ((this.MapData.y - 1) * 5)) / this.MapData.y
        let size = new Size(SizeX, SizeY)
        let data = this.DataStorage[this.ItemKey]
        this.Xhang.string = this.MapData.x + ""
        this.Ylie.string = this.MapData.y + ""
        if (data) {
            let data = this.DataStorage[this.ItemKey]
            let top = data.data.top_yarn
            let top_idx = 0
            let item_idx = 0
            let getColorAdd = () => {
                let have = false
                for (let i in top) {
                    let c = top[i][top_idx]
                    if (c) {
                        have = true
                        let node = this.Content.children[item_idx]
                        if (!node) {
                            node = instantiate(this.ChooseColor)
                            this.Content.addChild(node)
                        }
                        node.active = true;
                        node.name = c + ""
                        node.getComponent(Sprite).color = new Color(ColorValue[c]);
                        idx++
                        node.getComponent(UITransform).setContentSize(size)
                        item_idx += 1
                    }
                }
                top_idx += 1
                if (have) {
                    getColorAdd()
                }
            }
            getColorAdd()
            console.log(item_idx);
        } else {
            for (let y = 0; y < this.MapData.y; y++) {
                for (let x = 0; x < this.MapData.x; x++) {
                    let node = this.Content.children[idx]
                    if (!node) {
                        node = instantiate(this.ChooseColor)
                        this.Content.addChild(node)
                    }
                    node.active = true;
                    node.name = "9"
                    node.getComponent(Sprite).color = new Color("#FFFFFF");
                    // node.getChildByName("text").getComponent(Label).string = idx + ""
                    idx++
                    node.getComponent(UITransform).setContentSize(size)
                }
            }
        }


    }

    // 选择颜色
    onClooseColor(e) {
        let target = e.target;
        this.ChooseColor.name = target.name;
        this.ChooseColor.active = true;
        this.ChooseColor.getComponent(Sprite).color = target.getComponent(Sprite).color;

    }
    update(deltaTime: number) {

    }
    // 复制一份
    itemCopy(e) {
        let target = e.target;
        let key = target.parent.parent.name
        let new_key = key + "_1"
        this.DataStorage[new_key] = JSON.parse(JSON.stringify(this.DataStorage[key]))
        GameUtil.ChangeStorage(true, "TopPoxel", this.DataStorage)
        this.onRefirshList()

    }
    // 修改ID
    itemChangeID(eb: EditBox) {
        let now_key = eb.node.parent.parent.name
        let new_key = eb.string
        this.DataStorage[new_key] = JSON.parse(JSON.stringify(this.DataStorage[now_key]))
        eb.node.parent.parent.name = new_key;
        eb.node.parent.parent.getChildByName("title").getComponent(Label).string = new_key;
        GameUtil.ChangeStorage(true, "TopPoxel", this.DataStorage)

    }
    // 点击删除
    itemDel(e) {
        let target = e.target;
        let key = target.parent.parent.name
        delete this.DataStorage[key]
        GameUtil.ChangeStorage(true, "TopPoxel", this.DataStorage)
        this.onRefirshList()

    }
    // 刷新列表
    onRefirshList() {
        this.ItemList.numItems = Object.keys(this.DataStorage).length;
        this.initContent()
    }
    // 点击编辑
    onItemEdit(e) {
        let target = e.target;
        let ItemPage = target.parent.getChildByName("ItemPage")
        ItemPage.active = !ItemPage.active;
    }
    // 点击
    onItem(e) {
        let target = e.target;
        this.ItemKey = target.name;
        console.log(target.name);
        this.ItemKeyEB.string = this.ItemKey
        let data = this.DataStorage[this.ItemKey]
        let top = data.data.top_yarn
        this.changePageState("setData")
        this.MapData = v2(Object.keys(top).length, top[0].length)
        this.initContent()

    }
    // 列表每个物品
    onList(item, idx) {
        let keys = Object.keys(this.DataStorage)
        let k = keys[idx]
        item.name = k + ""
        item.getChildByName("title").getComponent(Label).string = k + "";
        let Pixel = item.getChildByName("Pixel")
        for (let child of Pixel.children) {
            child.active = false;
        }
        let data = this.DataStorage[k]
        let top = data.data.top_yarn
        let dataA = {}
        let top_idx = 0
        let item_idx = 0
        let SizeX = 200 / Object.keys(top).length
        let SizeY = 200 / top[0].length
        let size = new Size(Math.floor(SizeX), Math.floor(SizeY))
        let getColorAdd = () => {
            let have = false
            for (let i in top) {
                let c = top[i][top_idx]
                if (c) {
                    have = true
                    let node = Pixel.children[item_idx]
                    if (!node) {
                        node = instantiate(this.ChooseColor)
                        Pixel.addChild(node)
                    }
                    node.active = true;
                    node.name = "9"
                    node.getComponent(Sprite).color = new Color(ColorValue[c]);
                    idx++
                    node.getComponent(UITransform).setContentSize(size)
                    item_idx += 1
                }
            }
            top_idx += 1
            if (have) {
                getColorAdd()
            }
        }
        getColorAdd()
    }
    // 增加一个
    AddItem() {
        let key = 1
        while (key in this.DataStorage) {
            key++
        }

        this.ItemKey = Number(key);
        this.ItemKeyEB.string = this.ItemKey
        this.MapData = v2(5, 5)
        this.changePageState("setData")
        this.initContent()
    }
    // 更改界面状态
    changePageState(state) {
        this.PageState = state
        this.ItemList.node.active = this.PageState == "setData" ? false : true;
        this.ColorList.active = this.PageState == "setData" ? true : false;
    }
    onTouchButton(e) {
        let target = e.target;
        if (target.name == "Add") {

        } else if (target.name == "Back") {
            this.node.active = false;
        } else if (target.name == "onSave") {
            this.onSaveData()
        } else if (target.name == "onLookList") {
            this.changePageState("look");
            this.ItemList.numItems = Object.keys(this.DataStorage).length;
        }
    }

    onSetMapSize(eb: EditBox) {
        let num = Number(eb.string)
        if (!isNaN(num)) {
            if (eb.node.name == "Xhang") {
                this.MapData.x = num
            } else {
                this.MapData.y = num
            }
            this.initContent()
        }


    }
    onSaveData() {
        if (!this.ItemKey) {
            this.TipTween("请先设置图案Key")
            return
        }
        let idx = 0
        let PixelData = {
            max_color: 0,
            need_item: 0,
            data: {
                item: [],
                top_yarn: {}
            }
        }
        let TopYarn = {}
        for (let y = 0; y < this.MapData.y; y++) {
            for (let x = 0; x < this.MapData.x; x++) {
                if (!TopYarn[x]) {
                    TopYarn[x] = []
                }
                let node = this.Content.children[idx]
                if (node.active) {
                    TopYarn[x].push(Number(node.name))
                    if (!PixelData[node.name]) {
                        PixelData[node.name] = 0
                        PixelData.max_color += 1
                    }
                    PixelData[node.name] += 1
                    idx += 1
                }

            }
        }
        for (let k_k in PixelData) {
            if (k_k != "max_color" && k_k != "need_item" && k_k != "data") {
                let count = PixelData[k_k]
                let value = Math.ceil(PixelData[k_k] / 3);
                PixelData.need_item += value;
                PixelData[k_k] = value * 3;
                if (count < PixelData[k_k]) {
                    let minKey = Object.keys(TopYarn).reduce((a, b) =>
                        TopYarn[a].length <= TopYarn[b].length ? a : b
                    );
                    for (let i = 0; i < PixelData[k_k] - count; i++) {
                        TopYarn[minKey].push(Number(k_k))
                        minKey = Object.keys(TopYarn).reduce((a, b) =>
                            TopYarn[a].length <= TopYarn[b].length ? a : b
                        );
                    }
                }
                PixelData.max_color += 1
            }
        }
        PixelData.data.top_yarn = JSON.parse(JSON.stringify(TopYarn))
        let ClickKeys = []
        let ColorList = []
        let ColorState = {}
        let changeColorList = (key) => {
            ColorState[key] -= 1
            if (ColorState[key] == 0) {
                ColorList.push(key)
                delete ColorState[key]
            }
        }
        while (Object.keys(TopYarn).length > 0) {
            let change = false
            for (let top_k in TopYarn) {
                let top_key = Number(TopYarn[top_k][0])
                if (ClickKeys.indexOf(top_k) < 0 && !ColorState[top_key]) {
                    if (ColorState[top_key] && ColorState[top_key] == 0) {
                        ColorList.push(top_key)
                    }
                    ColorState[top_key] = 2
                    TopYarn[top_k].shift()
                    ClickKeys.push(top_k)
                    change = true
                } else if (ColorState[top_key] && ColorState[top_key] > 0) {
                    changeColorList(top_key)
                    TopYarn[top_k].shift()
                    ClickKeys.push(top_k)
                    change = true
                }
                for (let c_k in ColorState) {
                    let c_k_int = Number(c_k)
                    if (ColorState[c_k] > 0 && c_k_int == Number(TopYarn[top_k][0])) {
                        ColorState[c_k] -= 1
                        TopYarn[top_k].shift()
                        ClickKeys.push(top_k)
                        change = true
                    }
                    if (ColorState[c_k] == 0) {
                        ColorList.push(c_k_int)
                        delete ColorState[c_k]
                    }
                }
                if (TopYarn[top_k].length == 0) {
                    delete TopYarn[top_k]
                }
            }
            if (!change) {
                let nowKey = Object.keys(TopYarn)
                let noKey = true
                for (let n_k of nowKey) {
                    if (ClickKeys.indexOf(n_k) < 0) {
                        noKey = false
                    }
                }
                if (noKey) {
                    ClickKeys = []
                }
            }
        }
        PixelData.need_item = ColorList.length;
        PixelData.data.item = ColorList;
        console.log(PixelData);
        this.DataStorage[this.ItemKey] = PixelData;
        GameUtil.ChangeStorage(true, "TopPoxel", this.DataStorage)
    }
    onSetKey(eb: EditBox) {
        this.ItemKey = eb.string
    }
    TipTween(str) {
        this.haveTip++;
        this.Tip.active = true;
        let text = this.Tip.getChildByName('text').getComponent(Label)
        text.string = str;
        this.Tip.setPosition(v3(0, 0))
        tween(this.Tip).
            by(0.4, { position: v3(0, 160) })
            .call(() => {
                this.scheduleOnce(() => {
                    this.haveTip--
                    if (this.haveTip == 0) {
                        this.Tip.active = false
                        text.string = '';
                    }
                }, 0.8)
            }).start()
    }
}


