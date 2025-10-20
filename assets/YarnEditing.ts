import { _decorator, Button, color, Color, Component, dynamicAtlasManager, EditBox, error, EventMouse, EventTouch, Input, input, instantiate, JsonAsset, Label, Layout, loader, Node, Prefab, resources, ScrollView, Size, Sprite, TextAsset, tween, UITransform, v3, Vec3, VerticalTextAlignment } from 'cc';
import { MapLayoutIdConf } from './resources/Conf/MapLayoutIdConf';
import { RoleConf } from './resources/Conf/RoleConf';
import { CollectConf } from './resources/Conf/CollectConf';
import List from './Scene/list/List';
import { MapLayoutConf } from './resources/Conf/MapLayoutConf';
import { CreateRole } from './Sprite/CreateRole';
import { GameUtil } from './Sprite/GameUtil';
import { DragDropExample } from './Prefab/FileDrag/DragDropExample';
import { CreateRoleYarn } from './Sprite/CreateRoleYarn';
import { CreateRoleYarnNew } from './Sprite/CreateRoleYarnNew';
import { GetWalkDiff } from './Sprite/GetWalkDiff';
const { ccclass, property } = _decorator;
export class DTJLayerData {
    layer = 0;
    data = "";
    arrange = 0;
    row = 0;
    size = [];
    YX = []
}
const TitleType = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "S", "Y", "Z",]
export const CellToColor = {
    0: color(0x8c, 0x8c, 0x8c),
    1: color('#0198F3'),//蓝   A
    2: color('#FFF500'),//蜡黄 B
    3: color('#47FF00'),//鲜绿 C
    4: color('#ff95d5'),//粉色 D
    5: color('#ff0700'),//红   E
    6: color('#cf88ff'),//紫   F
    7: color('#46DEE5'),//蓝绿 G
    8: color('#ff8726'),//亮黄 H 
    9: color('#19CFA2'),//绿色 I
    10: color('#CAD0D7'),//银白J
}

@ccclass('YarnEditing')
export class YarnEditing extends Component {
    @property({ type: Node, displayName: "电梯井地图" })
    private DTJMap: Node = null;
    @property({ type: Node, displayName: "地图区域" })
    private Map: Node = null;
    @property({ type: Node, displayName: "地图区域" })
    private MapColor: Node = null;

    @property({ type: Node, displayName: "提示" })
    private Tip: Node = null;
    @property({ type: Node, displayName: "选择边框" })
    private ChooseKuang: Node = null;
    @property({ type: EditBox, displayName: "导入数据框" })
    private ImportEditBox: EditBox = null;
    @property({ type: Node, displayName: "数据块父节点" })
    private dataParent: Node = null;
    @property({ type: EditBox, displayName: "行数" })
    private EditBox_row: EditBox = null;
    @property({ type: EditBox, displayName: "列数" })
    private EditBox_arrange: EditBox = null;
    @property({ type: Label, displayName: "角色文字" })
    private PeopleStr: Label = null;
    @property({ type: Node, displayName: "角色" })
    private PeopleNode: Node = null;
    @property({ type: Node, displayName: "内容节点" })
    private ContentNode: Node[] = [];
    @property({ type: Label, displayName: "所有Label节点" })
    private allLabel: Label[] = [];
    @property({ type: List, displayName: "布局列表" })
    private LayoutList: List = null;
    @property({ type: Node, displayName: "列表Item选择" })
    private ChooseItem: Node = null;
    @property({ type: List, displayName: "游戏中布局列表" })
    private GameList: List = null;
    @property({ type: Prefab, displayName: "查看游戏地图列表" })
    private LookList: Prefab = null;
    @property({ type: Node, displayName: "固定电梯" })
    private FixedLift: Node = null;
    @property({ type: Node, displayName: "文件导入" })
    private FileDrag: Node = null;
    @property({ type: Node, displayName: "改变位置按钮" })
    private ChangePos: Node = null;
    @property({ type: Label, displayName: "状态文字" })
    private StateText: Label = null;
    @property({ type: Node, displayName: "冰冻节点" })
    private IceNode: Node = null;
    @property({ type: Node, displayName: "锁头节点" })
    private LockNode: Node = null;
    @property({ type: Node, displayName: "编辑顺序按钮" })
    private EditOrder: Node = null;

    private nowContent = 0;
    private ScrollViewSelect = [0, 0, 0, 0];
    // 已选择地图块
    private Piece = [];
    // 地图大小
    private map_size = {
        arrange: 11,
        row: 11,
    }
    private mapSize: Size = null;
    // 拥有提示
    private haveTip: number = 0;
    // 地图数据
    private map_data = [];
    private YZZState = false
    private enter_map = false;
    private role_map = [];
    private RoleKey = [];
    private GoNumAll: number = 0;
    private obstacleOrther = {
        18: [0, 3], 19: [0, 5], 20: [0, 7], 21: [1, 3], 22: [1, 5], 23: [1, 7], 24: [0, 3], 25: [0, 5], 26: [0, 7], 27: [0, 9], 28: [1, 3], 29: [1, 5], 30: [1, 7],
        61: [0, 3], 63: [1, 3], 64: [1, 3]
    }
    private DoubleLiftType = {
        71: [5, 5, 2],
        72: [6, 6, 2],
        73: [7, 7, 3],
        74: [8, 8, 3],
        75: [9, 9, 3],
        101: [2, 2],
        102: [2, 3],
        103: [3, 3],
        104: [3, 2],
        99913: [1, 3], 99931: [3, 1], 99923: [2, 3], 99932: [3, 2], 99933: [3, 3]
    }
    private MapId = 1
    private JianPiaoKou = {}
    private MapLayoutConf = {}
    private ChainData = []
    private FixedLiftState = {
        state: false,
        idx: [],
        item: null
    }
    private setColor = null
    private MapColorState = 0
    private ChangePosState = false
    private ChangePosData = {
        start: null
    }
    private TouchNode = null
    // 冰冻开关牵手属性
    private AttrItemData = {}
    private MapValueData = {
        BallColorValue: {},//球颜色最优间隔
        AverageYZZValue: 0,//平均压制值
        YZZValue: 0,//总压制值
        YZZChange: [],//所有压制值变化队列
        BallColorChange: {},//点击球的步数值
        WalkDiffChange: [],//走线难度变化
        WalkDiffValue: 0,//走线难度值
    }
    private LayLiftExportState = false;
    // 电梯口 
    private LiftExportData = {
        key: null,
        nowList: [],
        data: {}
    };

    public loadJson() {
        CreateRoleYarnNew.init_start()
        // this._loadJson("yarn_data/LevelConfig", "levelJsonData");
        this.yarn_mapLayoutData = GameUtil.ChangeStorage(false, "yarn_mapLayoutData")
        if (!this.yarn_mapLayoutData) {
            this._loadJson("yarn_data/YarnMapData", "yarn_mapLayoutData");
            GameUtil.ChangeStorage(true, "yarn_mapLayoutData", this.yarn_mapLayoutData)
        } else {
            this.initGameData()
            this.getNextMapId()
            this.allLabel[3].string = "地图ID：" + this.MapId;
        }
        this.changeMapWalkDiff()
        // this._loadJson("data/ProvinceLevel", "provinceLevelJsonData");
        // this._loadJson("data/AsicLevel", "allMapData");
    }
    changeMapWalkDiff() {
        let change = false
        for (let k in this.yarn_mapLayoutData) {
            let data = this.yarn_mapLayoutData[k]

            const matches_ColorList = data["ColorList"].match(/[A-Z]/g);
            const matches_layout = data["layout"].match(/[A-Z]/g);
            if (!data["WalkValue"]) {
                change = true
                let getWalk = false
                if (matches_ColorList && matches_layout && matches_layout.length == matches_ColorList.length) {
                    let color_count_ColorList = matches_ColorList ? [...new Set(matches_ColorList)].length : 0
                    let color_count_layout = matches_layout ? [...new Set(matches_layout)].length : 0
                    if (color_count_ColorList == color_count_layout) {
                        getWalk = true
                        GetWalkDiff.setMapColor(data);
                    }
                }
                if (!getWalk) {
                    this.yarn_mapLayoutData[k]["WalkValue"] = "地图和点击顺序配置数据对不上"
                }
            }
        }
        if (change) {
            GameUtil.ChangeStorage(true, "yarn_mapLayoutData", this.yarn_mapLayoutData)
        }
    }
    private yarn_mapLayoutData: any = null;//地图数据
    readonly levelJsonData: any = null;
    readonly provinceLevelJsonData: any = null;//关卡数据
    readonly allMapData: any = null;
    private loadMaxJsonNum = 0
    private loadJsonNum = 0
    private DTJShowLayer = 1
    private _loadJson(str: string, loadName: string) {
        this.loadMaxJsonNum++;
        resources.load(str, (err, jsonAsset: JsonAsset) => {
            if (err) { error(err); return; }
            this[loadName] = jsonAsset.json;
            this.loadJsonNum++;
            if (this.loadJsonNum == this.loadMaxJsonNum) {
                // this.initData();
                // console.log(this.provinceLevelJsonData);
                this.initGameData()
                this.getNextMapId()
                this.allLabel[3].string = "地图ID：" + this.MapId;

            }
        });
    }
    getNextMapId() {
        let idx = 1
        for (let k in this.yarn_mapLayoutData) {
            if (idx == Number(k)) {
                idx++
            } else {
                break
            }
        }
        this.MapId = idx;
    }
    private LevelConf = []
    private allMapDataType = {
        'all': {}
    }
    initGameData() {
        this.LevelConf = []
        this.initMapLayoutData()
        let provinceLevel = {}
        for (let k in this.provinceLevelJsonData) {
            provinceLevel[this.provinceLevelJsonData[k].provinceSort] = this.provinceLevelJsonData[k]
            // let level = this.getLevel(this.provinceLevelJsonData[k].level)
            // for (let arr of level) {
            //     this.LevelConf.push(arr[0])
            // }
        }
        for (let k in provinceLevel) {
            let level = this.getLevel(provinceLevel[k].level)
            for (let arr of level) {
                this.LevelConf.push(arr[0])
            }
        }
        for (let k in this.levelJsonData) {
            let data = this.levelJsonData[k]
            for (let i = 1; i <= data.count; i++) {
                this.LevelConf.push([k, i, data['map' + i]])
            }
            // data['layout'] = this.yarn_mapLayoutData[data.mapLayoutID].layout
            // this.allMapDataType['all'][data.id] = data

        }
        this.GameList.numItems = this.LevelConf.length
    }
    initMapLayoutData() {
        this.LayoutList.numItems = Object.keys(this.yarn_mapLayoutData).length
        for (let k in this.yarn_mapLayoutData) {
            let data = this.yarn_mapLayoutData[k]
            if (!this.allMapDataType[data.size]) {
                this.allMapDataType[data.size] = {}
            }
            this.allMapDataType[data.size][data.id] = data;
        }
    }
    getLevel(str) {
        str = str.replaceAll(';', '],[')
        str = `[[${str}]]`;
        return JSON.parse(str)
    }
    start() {

        this.loadJson()
        // console.log();


        this.MapChange('init')
        this.mapSize = new Size(645, 645)
        this.Map.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.Map.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.Map.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
        // input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        // this.writeJson()
        let first = true;


    }
    onMouseMove(event: EventMouse) {
        const mousePos = event.getUILocation();
        let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(mousePos.x, mousePos.y));
        let data = this.TouchData(worldPos);
        this.DTJMap.active = data && this.Obstacle.DTJ.indexOf(data.type) >= 0
    }
    private MapType = {
        'map1': {
            arrange: 10,
            row: 9,
        },
        'map2': {
            arrange: 11,
            row: 10,
        },
        'map3': {
            arrange: 9,
            row: 8,
        },
        'map4': {
            arrange: 11,
            row: 11,
        },
        'map5': {
            arrange: 8,
            row: 7,
        },
    }
    MapSize(E, t) {
        this.map_size = {
            arrange: this.MapType[t].arrange,
            row: this.MapType[t].row,
        }
        this.Map.scale = v3(1, 1, 1);
        if (this.DTJLayer.row > 0) {
            this.map_size = {
                row: this.DTJLayer.row,
                arrange: this.DTJLayer.arrange
            }
        }

        this.DTJLayer = new DTJLayerData
        this.setDTJChooseState(false)
        this.dataParent.active = true
        this.allLabel[4].string = ""
        this.TieLianSuoState = 0
        this.ChainData = []
        this.MapColorState = 0
        this.CloseAll()
        this.scheduleOnce(() => {
            this.MapChange()
        }, 0.05)
    }
    SizeChange(EditBox: EditBox, str: string) {
        if (EditBox.string.length <= 0) return;
        if (this.map_size[str] != Number(EditBox.string)) {

            if (Number(EditBox.string) > 12 && str == 'arrange') {
                this.TipTween('行数不可超过12行');
                EditBox.string = this.map_size[str] + '';
                return
            } else if (Number(EditBox.string) > 13 && str == 'row') {
                this.TipTween('列数不可超过13列');
                EditBox.string = this.map_size[str] + '';
                return;
            }
            this.map_size[str] = Number(EditBox.string);
            this.MapColorState = 0
            this.MapChange()
            this.scheduleOnce(() => {

                this.MapColor.active = false
                this.CloseAll()
            }, 0.05)
        }
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
    // 地图更新
    MapChange(init?) {
        if (!this.node.getChildByName("seve_data").active) {
            this.node.getChildByName("seve_data").active = true
            this.node.getChildByName("setImportColor").active = true
            //  this.node.getChildByName("setImportColor").active = false
        }
        this.node.getChildByName("setImportColor").getComponent(EditBox).placeholder = "设置生成颜色";
        this.ContentNode[2].active = false
        this.setColor = null
        this.ContentNode[0].active = true
        this.FixedLiftState = {
            state: false,
            idx: [],
            item: null
        }
        this.allLabel[3].string = "地图ID：" + this.MapId;
        this.node.getChildByName("DTJNode").active = this.DTJLayer.layer > 0;
        this.dataParent.getChildByName("ClooseDTJ").scale = this.DTJLayer.layer > 0 ? v3(0, 0, 0) : v3(1, 1, 1);
        if (this.DTJLayer.layer <= 0) {
            this.setDTJChooseState(false)
        }
        this.node.getChildByName('theMap').getComponent(Label).string = `当前地图：${this.map_size.arrange}x${this.map_size.row}`
        this.GoNumAll = 0
        let node = this.Map.children[0];
        let mapLayout = this.Map.getComponent(Layout)
        let newWidth = null;
        let newHeight = null;
        if (this.mapSize) {
            newWidth = (this.mapSize.width - mapLayout.paddingLeft - mapLayout.paddingRight - ((this.map_size.arrange - 1) * mapLayout.spacingX)) / this.map_size.arrange - 0.5
            newHeight = (this.mapSize.height - mapLayout.paddingTop - mapLayout.paddingBottom - ((this.map_size.row - 1) * mapLayout.spacingY)) / this.map_size.row
        }
        if (newWidth < newHeight) {
            newHeight = newWidth
        } else {
            newWidth = newHeight
        }
        if (this.mapSize) {
            this.Map.getComponent(UITransform).width = newWidth * this.map_size.arrange + (3 * (this.map_size.arrange - 1)) + 12
        }
        let newNodeSize = (this.mapSize) ? new Size(newWidth, newHeight) : null;
        if (newNodeSize) {
            node.getComponent(UITransform).setContentSize(newNodeSize);
        }
        this.DTJMap.destroyAllChildren()

        if (!init) {
            for (let data of this.role_map) {
                if (data.node.getChildByName('bear')) {
                    data.node.getChildByName('bear').active = false
                }
            }
            this.role_map = []
            for (let item of this.dataParent.children) {
                if (item.name != 'Mask') {
                    if (item.getChildByName('count')) {
                        item.getChildByName('count').getComponent(Label).string = String(0);
                    }
                }
            }
        }
        let NoPushDTJ = []
        let DTJ = []
        for (let i in this.map_data) {
            let row = Number(i)
            for (let x in this.map_data[row]) {
                let arrange = Number(x)

                node = this.map_data[i][x].node;
                if (row <= this.map_size.row && arrange <= this.map_size.arrange) {
                    this.map_data[i][x].go_num = row - 1
                    let data = {
                        node: node,
                        idx: [row, arrange],
                        type: this.map_data[i][x].type,
                        child: this.map_data[row][arrange].child,
                        go_num: row - 1,
                        datas: this.map_data[i][x].datas,
                        json: this.map_data[i][x].json
                    }
                    if (this.map_data[i][x].FixedData) {
                        data["FixedData"] = this.map_data[i][x].FixedData
                    }
                    if (this.map_data[row][arrange].child.getChildByName('go')) {
                        this.map_data[row][arrange].child.getChildByName('go').active = (this.map_data[i][x].type == 1) ? true : false;
                        this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).string = row + ''
                    }
                    this.GoNumAll += data.go_num;
                    if (this.dataParent.getChildByName(data.child.name)) {
                        let count_label = this.dataParent.getChildByName(data.child.name).getChildByName('count').getComponent(Label)
                        count_label.string = String(Number(count_label.string) + 1);
                    }


                    if (this.map_data[i][x].type == 1 || this.map_data[i][x].type == 10) {
                        this.role_map.push(data)
                    }
                    if (newNodeSize) {
                        node.getComponent(UITransform).setContentSize(newNodeSize);
                        data.child.getComponent(UITransform).setContentSize(newNodeSize)
                        // for(let child of data.child.children){
                        //     child.getComponent(UITransform).setContentSize(newNodeSize)
                        // }
                    }
                    node.active = true
                    this.map_data[row][arrange] = data;
                    if (this.Obstacle.DTJ.indexOf(data.type) >= 0) {
                        let namekey = row + '-' + arrange
                        if (NoPushDTJ.indexOf(namekey) < 0) {
                            for (let Y = 0; Y < this.DoubleLiftType[data.type][1]; Y++) {
                                for (let X = 0; X < this.DoubleLiftType[data.type][0]; X++) {
                                    let Y_new = row + Y
                                    let X_new = arrange + X
                                    let name = Y_new + "-" + X_new
                                    NoPushDTJ.push(name)
                                }
                            }
                            DTJ.push([arrange, row, data.type])
                        }
                    }

                } else {
                    if (newNodeSize) {
                        node.getComponent(UITransform).setContentSize(newNodeSize);
                        this.map_data[row][arrange].child.getComponent(UITransform).setContentSize(newNodeSize)
                        // for(let child of this.map_data[row][arrange].child.children){
                        //     child.getComponent(UITransform).setContentSize(newNodeSize)
                        // }
                    }
                    node.active = false;
                    // let count_label = this.dataParent.getChildByName(this.map_data[row][arrange].child.name).getChildByName('count').getComponent(Label)
                    // count_label.string = String(Number(count_label.string) - 1);
                }
            }
        }
        if (DTJ.length > 0) {
            this.scheduleOnce(() => {
                for (let idx of DTJ) {
                    let name_key = idx[1] + "_" + idx[0]
                    if (!this.DTJMap.getChildByName(name_key)) {
                        let DTJNode = new Node()
                        DTJNode.addComponent(UITransform)
                        DTJNode.name = name_key
                        this.DTJMap.addChild(DTJNode)
                        for (let Y = 0; Y < this.DoubleLiftType[idx[2]][1]; Y++) {
                            for (let X = 0; X < this.DoubleLiftType[idx[2]][0]; X++) {
                                let Y_new = idx[1] + Y
                                let X_new = idx[0] + X
                                let t1 = this.map_data[Y_new][X_new].datas[0]
                                let t2 = this.map_data[Y_new][X_new].datas[1]
                                let newChild1 = instantiate(this.Map.children[0].getChildByName("1"))
                                newChild1.getComponent(Sprite).color = this.dataParent.getChildByName(t1 + "").getComponent(Sprite).color;
                                DTJNode.addChild(newChild1)
                                newChild1.name = "1"
                                let newChild2 = instantiate(this.Map.children[0].getChildByName("1"))
                                newChild2.getComponent(Sprite).color = this.dataParent.getChildByName(t2 + "").getComponent(Sprite).color;
                                DTJNode.addChild(newChild2)
                                newChild2.name = "2"
                                let WorldPos = this.map_data[Y_new][X_new].node.getWorldPosition().clone()
                                newChild1.setWorldPosition(WorldPos)
                                newChild2.setWorldPosition(WorldPos)
                                newChild1.active = this.DTJShowLayer == 1;
                                newChild2.active = this.DTJShowLayer != 1;
                            }
                        }

                    }
                }
            })
        }

        let all_gonum: number = 0
        if (init) {
            let num = 0;
            let num105 = 0
            for (let y = 1; y <= this.map_size.row; y++) {
                if (!this.map_data[y]) {
                    this.map_data[y] = []
                }
                for (let x = 1; x <= this.map_size.arrange; x++) {
                    let type = 1
                    if (x == 1 || x == this.map_size.arrange || y == this.map_size.row) {
                        type = 105
                        num105++
                    } else {
                        num++
                    }
                    node = instantiate(node);
                    node.active = true;
                    this.Map.addChild(node);
                    let newChild = node.getChildByName('1')
                    newChild.getComponent(UITransform).setContentSize(node.getComponent(UITransform).contentSize);
                    newChild.setPosition(v3(0, 0));
                    let data = {
                        node: node,
                        idx: [y, x],
                        type: type,
                        child: newChild,
                        go_num: y - 1,
                        datas: [],
                        json: []
                    }
                    newChild.getChildByName('go').getComponent(Label).string = data.go_num + ''
                    all_gonum += data.go_num
                    this.map_data[y][x] = data;
                    newChild.getComponent(Sprite).color = this.dataParent.getChildByName(type + "").getComponent(Sprite).color;

                }
            }
            this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string = num + ''
            this.dataParent.getChildByName('105').getChildByName('count').getComponent(Label).string = num105 + ''
            // this.GoNumAll = all_gonum
            this.refish_GoNum()
            this.scheduleOnce(() => {
                this.map_size = {
                    arrange: this.MapType.map3.arrange,
                    row: this.MapType.map3.row,
                }
                this.Map.scale = v3(1, 1, 1);
                this.CloseAll()
                this.scheduleOnce(() => {
                    this.MapChange()
                })
            })
        }
        this.allLabel[1].string = '角色步数总和：' + this.GoNumAll;
        for (let k of this.Obstacle.DTJ) {
            if (this.dataParent.getChildByName(k + "")) {
                let count_label = this.dataParent.getChildByName(k + "").getChildByName('count').getComponent(Label)
                count_label.string = String(Number(count_label.string) / (this.DoubleLiftType[k][0] * this.DoubleLiftType[k][1]));
            }

        }
        this.setPeopleCount()
        this.refish_GoNum()

    }
    YzzBtn() {
        let newLabel = this.node.getChildByName('YZZ').getChildByName('name').getComponent(Label)
        if (newLabel.string == '显示压制值') {
            newLabel.string = '隐藏压制值'
            this.YZZState = true
            this.refish_GoNum()
        } else {
            this.YZZState = false
            newLabel.string = '显示压制值'
        }
        this.node.getChildByName('theMap').getComponent(Label).enabled = (this.YZZState || this.MapColorState > 1) ? false : true;
        // this.allLabel[1].enabled = (this.YZZState) ? true : false;
        let anjian = [61, 62, 63, 64, 65, 66, 67, 68]
        for (let i in this.map_data) {
            let row = Number(i)
            for (let x in this.map_data[row]) {
                let arrange = Number(x)
                if (anjian.indexOf(this.map_data[row][arrange].type) < 0 && this.map_data[row][arrange].type != 105) {
                    this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).enabled = (this.YZZState) ? true : false;
                } else
                    if (this.Obstacle.Role.indexOf(this.map_data[row].type) >= 0) {

                        this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).enabled = true
                    }
            }
        }
    }
    onTouchStart(event: EventTouch) {
        // 更改颜色位置时
        if (this.ChangePosState) {
            let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y));
            let data = this.TouchData(worldPos);
            if (data && this.Obstacle.Role.indexOf(data.type) >= 0) {
                if (!this.TouchNode) {
                    this.TouchNode = instantiate(data.child)
                    this.node.addChild(this.TouchNode)
                }
                let c = TitleType.indexOf(data.json[2]) + 1
                this.TouchNode.getComponent(Sprite).color = new Color(CellToColor[c]);
                this.TouchNode.active = true
                data.child.active = false
                this.ChangePosData.start = v3(data.idx[1], data.idx[0])
            }
            return
        }
        if (this.FixedLiftState.state) {
            let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y));
            let data = this.TouchData(worldPos);
            if (data) {
                this.setChangeLiftColor(data)
            }
            return
        }
        if (this.MapColorState > 0) {
            console.log("点击颜色顺序");

            let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y));
            let data = this.TouchData(worldPos);
            if (data) {
                if (this.AttrItemData[data.idx[0] + "_" + data.idx[1]]) {
                    if (!this.AttrItemData[data.idx[0] + "_" + data.idx[1]].state || this.AttrItemData[data.idx[0] + "_" + data.idx[1]].count > 0) {
                        return
                    }
                }
                if (data.go_num == 0 && data.json[2]) {
                    this.ChooseColorData(data)
                    if (this.AttrItemData[data.idx[0] + "_" + data.idx[1]] && this.AttrItemData[data.idx[0] + "_" + data.idx[1]].key > 50 && this.AttrItemData[data.idx[0] + "_" + data.idx[1]].key < 56) {
                        for (let ks of this.AttrItemData[data.idx[0] + "_" + data.idx[1]].idxs) {
                            this.ChooseColorData(this.map_data[ks[0]][ks[1]])
                        }
                    }
                    this.AttrChange(data)
                }
            }
            return
        }

        if (this.Piece[0]) {
            this.dataInstall(event.getUILocation())
        } else if (this.TieLianSuoState != 0) {
            let localPos = event.getUILocation();
            let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(localPos.x, localPos.y));
            let data = this.TouchData(worldPos);
            if (data) {
                let key = this.ChainData.length
                if (this.ChainData.length > 0) {
                    if (this.ChainData[this.ChainData.length - 1].length < 3) {
                        key = this.ChainData.length - 1
                    }
                }
                if (this.ChainData.length == key) {
                    this.ChainData.push([])
                }
                if (this.Obstacle.Role.indexOf(data.type) < 0 && this.TieLianSuoState > 1) {
                    this.TieLianSuoState -= 1
                    let new_suo = instantiate(this.node.getChildByPath("chain/suo"))
                    data.child.addChild(new_suo)
                    new_suo.getChildByName('text').getComponent(Label).string = key + "";
                    this.ChainData[key].push([data.idx[1], data.idx[0]])
                } else if (this.TieLianSuoState == 1 && this.Obstacle.Role.indexOf(data.type) >= 0) {
                    this.TieLianSuoState -= 1
                    let yao_shi = instantiate(this.node.getChildByPath("chain/yao_shi"))
                    data.child.addChild(yao_shi)
                    yao_shi.getChildByName('text').getComponent(Label).string = key + "";
                    this.ChainData[key].push([data.idx[1], data.idx[0]])
                }
                if (this.TieLianSuoState == 0) {
                    this.dataParent.active = true
                    this.allLabel[4].string = ""
                } else {
                    this.allLabel[4].string = this.TieLianSuoState == 1 ? "请设置钥匙的位置" : "请设置铁链位置";
                }

            }
        } else {
            this.TipTween('请先选择需要填充的类型')
        }

    }
    AttrChange(data) {
        let k1 = Number(data.idx[0] - 1) + "_" + data.idx[1];
        let k2 = Number(data.idx[0] + 1) + "_" + data.idx[1];
        let k3 = Number(data.idx[0]) + "_" + Number(data.idx[1] - 1);
        let k4 = Number(data.idx[0]) + "_" + Number(data.idx[1] + 1);
        let keys = [k1, k2, k3, k4]
        for (let k in this.AttrItemData) {
            if (k != data.idx[0] + "_" + data.idx[1]) {
                if (keys.indexOf(k) >= 0 && !this.AttrItemData[k].state) {
                    this.AttrItemData[k].state = true
                }
                if (this.AttrItemData[k].state) {
                    if (this.AttrItemData[k].key == 31 && this.AttrItemData[k].count > 0) {
                        this.AttrItemData[k].count -= 1
                        this.AttrItemData[k].item.getChildByName("count").getComponent(Label).string = this.AttrItemData[k].count == 0 ? "" : "" + this.AttrItemData[k].count;
                        if (this.AttrItemData[k].count == 0) {
                            this.AttrItemData[k].item.active = false;
                        }
                    } else if (this.AttrItemData[k].key == 1111) {
                        this.AttrItemData[k].count = this.AttrItemData[k].count == 1 ? 0 : 1;
                        this.AttrItemData[k].item.active = this.AttrItemData[k].count == 1;
                    }
                }
            }
        }
    }
    onTouchMove(event: EventTouch) {
        if (this.ChangePosState) {
            if (this.TouchNode && this.TouchNode.active) {
                this.TouchNode.setWorldPosition(new Vec3(event.getUILocation().x, event.getUILocation().y))
            }
            return
        }
        if (this.MapColorState > 0) {
            // let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y));
            // let data = this.TouchData(worldPos);
            // if (data) {
            //     this.ChooseColorData(data)
            // }
            return
        }
        if (this.Piece[0]) {
            let localPos = event.getUILocation();
            this.dataInstall(localPos)
        }
    }
    onTouchEnd(event: EventTouch) {
        if (this.ChangePosState) {
            let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y));
            if (this.ChangePosData.start) {
                let data = this.TouchData(worldPos);
                let StartData = this.map_data[this.ChangePosData.start.y][this.ChangePosData.start.x]
                StartData.child.active = true
                if (data && this.Obstacle.Role.indexOf(data.type) >= 0) {
                    let StartColor = StartData.json[2]
                    let EndColor = data.json[2]
                    StartData.json[2] = EndColor
                    data.json[2] = StartColor
                    StartData.child.getComponent(Sprite).color = new Color(CellToColor[TitleType.indexOf(EndColor) + 1]);
                    data.child.getComponent(Sprite).color = new Color(CellToColor[TitleType.indexOf(StartColor) + 1]);
                }
            }
            this.ChangePosData.start = null
            this.TouchNode.active = false
            if (this.TouchNode && this.TouchNode.active) {
                this.TouchNode.setWorldPosition(new Vec3(event.getUILocation().x, event.getUILocation().y))
            }
            return
        }
        // if (this.MapColorState > 0) {
        //     let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(event.getUILocation().x, event.getUILocation().y));
        //     let data = this.TouchData(worldPos);
        //     if (data) {
        //         this.ChooseColorData(data)
        //     }
        //     return
        // }
        // if (this.Piece[0]) {
        //     let localPos = event.getUILocation();
        //     this.dataInstall(localPos)
        // }
    }
    dataInstall(localPos) {
        this.enter_map = false;
        let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(localPos.x, localPos.y));
        let data = this.TouchData(worldPos);
        if (!data || !data.type) return
        if (this.Piece[1] == 68) {
            let have = false
            for (let i in this.JianPiaoKou) {
                if (!this.JianPiaoKou[i].keyPos) {
                    have = true
                }
            }
            if (!have) {
                this.TipTween('需先放置安检门')
                return
            }
        }

        if (data && (data.type != this.Piece[1] || this.ChooseDTJState)) {
            this.setNewData(data)
        }
        if (!this.broadsideOK(data.idx[0], data.idx[1])) {
            this.setNewData(data)
        }
    }
    // Type == 11 || Type == 12 ||
    TypeArr = [42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 3, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 61, 63, 64, 131]
    TypeorAddChild(Type) {
        if (this.TypeArr.indexOf(Type) >= 0 && Type != 2) {
            return true
        }
        if (Type == 3 || Type == 6 || Type == 7 || Type == 8 || Type == 9 || Type == 15 || Type == 16 || Type == 17 || Type == 18 || Type == 19 || Type == 20 || Type == 21 || Type == 22 || Type == 23 || Type == 24 || Type == 25 || Type == 26 || Type == 27 || Type == 28 || Type == 29 || Type == 30 || Type == 131) {
            return true
        } else {
            false
        }
    }
    private DTJLayer = new DTJLayerData;

    setNewData(data, id?) {
        if (id) {
            this.Piece = [this.dataParent.getChildByName(id + ''), id]
        }
        if (this.TypeorAddChild(data.type)) {
            if (data.child.getChildByName(String(data.type))) {
                data.child.getChildByName(String(data.type)).destroy()
            }
        }
        if (this.Obstacle.F.indexOf(data.type) >= 0 || this.Obstacle['E'].indexOf(data.type) >= 0 || data.type == 11 || data.type == 12) {
            data.child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
        }
        if (this.HaveAnJian(data.idx[0], data.idx[1])) {
            if (this.Piece[1] == 68) {
                let have = false
                for (let i in this.JianPiaoKou) {
                    if (!this.JianPiaoKou[i].keyPos) {
                        have = true
                    }
                }
                if (!have) {
                    this.TipTween('需先放置安检门')
                    return
                }
            }
        }
        // 双头梯
        if (!this.broadsideOK(data.idx[0], data.idx[1])) {
            this.ClearDoubleLadder(data.idx[0], data.idx[1])
        }
        if (this.Obstacle['DTJ'].indexOf(this.map_data[data.idx[0]][data.idx[1]].type) >= 0) {
            if (this.ChooseDTJState) {
                this.EditDTJ(data.idx[0], data.idx[1], data.type)
                return
            } else {
                this.delDTJ(data.idx[0], data.idx[1], data.type)
            }
            // this.ClearDoubleLadder(data.idx[0], data.idx[1])
        }
        this.DelLiftExport(data);

        this.ChangeChainData(data.idx)

        // console.log(this.map_data[data.idx[0]][data.idx[1]].type);

        let DataType = data.type
        data.type = this.Piece[1]
        console.log("点击属性类型：" + this.Piece[1]);
        let delNames = []
        for (let item of data.child.children) {
            if (item.name != "go") {
                delNames.push(item.name)
            }
        }
        for (let n of delNames) {
            if (data.child.getChildByName(n)) {
                data.child.getChildByName(n).destroy()
            }
        }
        // this.map_data[data.idx[1]][data.idx[0]].type = this.Piece[1]
        if (DataType == 99 || this.obstacleOrther[DataType]) {
            this.onFence(data, DataType)
            return
        } else if (this.TypeorAddChild(this.Piece[1])) {
            this.map_data[data.idx[0]][data.idx[1]].datas = []
            let size = data.node.getComponent(UITransform).contentSize
            let newChild = instantiate(this.Piece[0])
            newChild.getComponent(UITransform).setContentSize(new Size(size.width + 5, size.height + 5));
            if (this.obstacleOrther[this.Piece[1]]) {
                let orther = (this.obstacleOrther[this.Piece[1]][1]) / 2
                let infeed = (this.obstacleOrther[this.Piece[1]][0] == 0) ? true : false
                if (infeed) {
                    if (data.idx[1] - orther < 0 || data.idx[1] + orther > this.map_size.arrange + 1) {
                        this.TipTween('不可超过横向边界')
                        return
                    }

                    newChild.getComponent(UITransform).setContentSize(new Size((size.width + 5) * Number(this.Piece[2]), size.height))
                } else {
                    infeed = false
                    if ((data.idx[0] - orther) < 0 || (data.idx[0] + orther) > (this.map_size.row + 1)) {
                        this.TipTween('不可超过竖向边界')
                        return
                    }
                    newChild.getComponent(UITransform).height = size.height * Number(this.Piece[2])
                }
                let anj = false
                //检票口
                if (this.Piece[1] == 61 || this.Piece[1] == 63 || this.Piece[1] == 64) {
                    data.type = 67
                    anj = true
                    this.JianPiaoKou[data.idx[0] + '_' + data.idx[1]] = {
                        pos: [data.idx[0], data.idx[1]],
                        keyPos: null
                    }
                }
                for (let i = 1; i < orther; i++) {
                    let DataA = this.map_data[(infeed) ? data.idx[0] : data.idx[0] + i][(infeed) ? data.idx[1] + i : data.idx[1]];
                    if (DataA) {
                        if (DataA.type == 99 || this.TypeorAddChild(DataA.type)) {
                            this.TipTween('请先去除其他物品' + DataA.type)
                            return
                        }
                        DataA.child.getComponent(Sprite).enabled = false
                        DataA.node.getComponent(Sprite).enabled = false
                        DataA.child.getChildByName('go').active = (this.Obstacle['Role'].indexOf(this.Piece[1]) >= 0) ? true : false
                        if (DataA.type != 99 && this.dataParent.getChildByName(DataA.child.name)) {
                            let count_labelA = this.dataParent.getChildByName(DataA.child.name).getChildByName('count').getComponent(Label)
                            count_labelA.string = String(Number(count_labelA.string) - 1);
                        }
                        if (anj) {
                            DataA.child.name = this.getAnJianID(this.Piece[1], false) + ''
                            DataA.type = this.getAnJianID(this.Piece[1], false);
                        } else {
                            DataA.child.name = '99'
                            DataA.type = 99;
                        }

                    }
                    let DataB = this.map_data[(infeed) ? data.idx[0] : data.idx[0] - i][(infeed) ? data.idx[1] - i : data.idx[1]]

                    if (DataB) {
                        if (DataB.type == 99 || this.TypeorAddChild(DataB.type)) {
                            this.TipTween('请先去除其他物品' + DataB.type)
                            return
                        }
                        DataB.child.getComponent(Sprite).enabled = false
                        DataB.node.getComponent(Sprite).enabled = false
                        DataB.child.getChildByName('go').active = (this.Obstacle['Role'].indexOf(this.Piece[1]) >= 0) ? true : false
                        if (DataB.type != 99 && this.dataParent.getChildByName(DataB.type + '')) {
                            let count_labelB = this.dataParent.getChildByName(DataB.type + '').getChildByName('count').getComponent(Label)
                            count_labelB.string = String(Number(count_labelB.string) - 1);
                        }
                        if (anj) {
                            DataB.child.name = this.getAnJianID(this.Piece[1], true) + ''
                            DataB.type = this.getAnJianID(this.Piece[1], true);
                        } else {
                            DataB.child.name = '99'
                            DataB.type = 99
                        }

                    }
                    // this.map_data[(infeed)?data.idx[0]:data.idx[0]-i][(infeed)?data.idx[1] - i:data.idx[1]].child.getComponent(Sprite).color = new Color(0, 0, 0)
                }
                // for(let i = data.idx[1];i<)
                // data.child.getComponent(Sprite).spriteFrame = this.Piece[0].getComponent(Sprite).spriteFrame
            }
            if (DataType != 99 && this.dataParent.getChildByName(String(DataType))) {
                let count_labelB = this.dataParent.getChildByName(String(DataType)).getChildByName('count').getComponent(Label)
                count_labelB.string = String(Number(count_labelB.string) - 1);
            }
            data.child.name = this.Piece[1] + '';
            if (newChild.getChildByName('count')) {
                newChild.getChildByName('count').active = false;
                newChild.getChildByName('name').active = false;
            }
            if (this.Obstacle.C.indexOf(this.Piece[1]) >= 0) {
                let EditBox = instantiate(this.node.getChildByName("setEditBox"))
                newChild.addChild(EditBox);
                EditBox.name = data.idx[0] + "_" + data.idx[1]
                EditBox.active = true
                this.map_data[data.idx[0]][data.idx[1]].datas = [3]
            }
            newChild.getComponent(Button).interactable = false
            data.child.addChild(newChild);
            if (this.Obstacle['Role'].indexOf(data.type) >= 0) {
                newChild.setSiblingIndex(0)
            }

            newChild.setPosition(v3(0, 0));
            data.child.getComponent(Sprite).color = new Color(255, 255, 255)
            let LiftExport_state = false
            if (this.Obstacle['LiftExport'].indexOf(this.Piece[1]) >= 0) {
                this.LiftExportData.key = data.idx[0] + "-" + data.idx[1];
                LiftExport_state = true
            }
            if (LiftExport_state) {
                let EditBoxNode = instantiate(this.node.getChildByName("setEditBox"))
                newChild.addChild(EditBoxNode);
                EditBoxNode.name = data.idx[0] + "_" + data.idx[1]
                EditBoxNode.active = true
                EditBoxNode.getComponent(EditBox).string = 2 + "";
                data["FixedData"] = [2]
                if (this.LayLiftExportState) {
                    this.LiftExportData.data[this.LiftExportData.key] = JSON.parse(JSON.stringify(this.LiftExportData.nowList));
                    data["FixedData"] = data["FixedData"].concat(this.LiftExportData.data[this.LiftExportData.key])
                    this.LiftExportData.nowList = [];
                    this.LiftExportData.key = null;
                    this.LayLiftExportState = false;
                } else {
                    this.LayLiftExportState = true;
                }
            }
        } else {
            this.map_data[data.idx[0]][data.idx[1]].datas = []
            if (data.child.name != '99') {
                let count_label = this.dataParent.getChildByName(data.child.name).getChildByName('count').getComponent(Label)
                let count = (Number(count_label.string) - 1) * 1
                if (this.Obstacle['DTJ'].indexOf(this.Piece[1]) >= 0 || this.Obstacle['LiftExport'].indexOf(this.Piece[1]) >= 0) {
                    count = (Number(count_label.string) - (this.DoubleLiftType[this.Piece[1]][0] * this.DoubleLiftType[this.Piece[1]][1])) * 1
                }
                count_label.string = count + '';
            }
            data.child.name = this.Piece[1] + '';
            data.child.getComponent(Sprite).color = this.Piece[0].getComponent(Sprite).color;
            if (this.Obstacle['F'].indexOf(this.Piece[1]) >= 0 || this.Obstacle['E'].indexOf(this.Piece[1]) >= 0 || this.Obstacle['DTJ'].indexOf(this.Piece[1]) >= 0 || this.Obstacle['LiftExport'].indexOf(this.Piece[1]) >= 0) {
                // 双头电梯
                if (this.Obstacle['F'].indexOf(this.Piece[1]) >= 0 || this.Obstacle['DTJ'].indexOf(this.Piece[1]) >= 0 || this.Obstacle['LiftExport'].indexOf(this.Piece[1]) >= 0) {
                    let pieceColor = this.Obstacle['F'].indexOf(this.Piece[1]) >= 0 ? "#FF8F53" : "6C88F8";
                    let LiftExport_state = false
                    if (this.Obstacle['LiftExport'].indexOf(this.Piece[1]) >= 0) {
                        pieceColor = this.Piece[0].getComponent(Sprite).color;
                        this.LiftExportData.nowList = []
                        LiftExport_state = true
                    }
                    let w = this.DoubleLiftType[this.Piece[1]][0]
                    let h = this.DoubleLiftType[this.Piece[1]][1]
                    if (data.idx[1] + w > this.map_size.arrange + 1) {
                        this.TipTween('不可超过横向边界')
                        data.type = 1
                        data.child.getComponent(Sprite).color = new Color('DBEEF3')
                        return
                    }
                    if ((data.idx[0] + h) > (this.map_size.row + 1)) {
                        this.TipTween('不可超过竖向边界')
                        data.type = 1
                        data.child.getComponent(Sprite).color = new Color('DBEEF3')
                        return
                    }
                    this.DoubleLiftType[this.Piece[1]]
                    data.type = 1
                    for (let y = data.idx[0]; y < data.idx[0] + h; y++) {
                        for (let x = data.idx[1]; x < data.idx[1] + w; x++) {
                            this.map_data[y][x] && (this.map_data[y][x].child.getComponent(Sprite).color = new Color(pieceColor))
                            if (y == (data.idx[0] + h) - 1 && this.Obstacle['F'].indexOf(this.Piece[1]) >= 0) {
                                this.map_data[y][x].type = this.Piece[1]
                                // this.map_data[y][x].child.getComponent(Sprite).spriteFrame = this.Piece[0].getComponent(Sprite).spriteFrame;
                            } else {
                                this.map_data[y][x].type = this.Piece[1]
                                if (LiftExport_state) {
                                    this.LiftExportData.nowList.push([y, x])
                                }
                            }
                        }
                    }
                    if (LiftExport_state) {
                        if (this.LayLiftExportState) {
                            let karr = this.LiftExportData.key.split('-').map(item => parseInt(item));
                            let list = JSON.parse(JSON.stringify(this.LiftExportData.nowList))
                            this.LiftExportData.data[this.LiftExportData.key] = list;
                            this.map_data[karr[0]][karr[1]]["FixedData"] = this.map_data[karr[0]][karr[1]]["FixedData"].concat(list);
                            this.LiftExportData.nowList = [];
                            this.LiftExportData.key = null;
                            this.LayLiftExportState = false;
                        } else {
                            this.LayLiftExportState = true;
                        }
                    }


                    if (this.Obstacle['DTJ'].indexOf(this.Piece[1]) >= 0) {
                        this.DTJLayer = {
                            layer: 3,
                            data: this.getNowData(),
                            arrange: this.map_size.arrange,
                            row: this.map_size.row,
                            size: [w, h],
                            YX: [data.idx[0], data.idx[1]]
                        }
                        this.setDTJLayer()
                    }
                    // this.map_size = {
                    //     arrange: h,
                    //     row: w,
                    // };

                } else {
                    data.child.getComponent(Sprite).spriteFrame = this.Piece[0].getComponent(Sprite).spriteFrame;
                }
            } else if (this.Piece[1] == 11 || this.Piece[1] == 12 || this.Piece[1] == 13) {
                // 左右出口

                let next = data.idx[1]
                console.log('类型', this.Piece[1]);
                if (this.Piece[1] == 11) {
                    if (!this.broadsideOK(data.idx[0], data.idx[1] - 1)) {
                        this.TipTween('出口方向不可以是两头露电梯')
                        return
                    }

                    data.child.getComponent(Sprite).spriteFrame = this.Piece[0].getComponent(Sprite).spriteFrame;
                    if (next < this.map_data[1].length) {
                        next = data.idx[1] + 1
                        this.scheduleOnce(() => {
                            this.setNewData(this.map_data[data.idx[0] - 1][data.idx[1]], 14)
                        })

                    }

                } else if (this.Piece[1] == 12) {
                    if (!this.broadsideOK(data.idx[0], data.idx[1] + 1)) {
                        this.TipTween('出口方向不可以是两头露电梯')
                        return
                    }
                    data.child.getComponent(Sprite).spriteFrame = this.Piece[0].getComponent(Sprite).spriteFrame;
                    // next = data.idx[1] - 1
                    // if (next > 0) {
                    this.scheduleOnce(() => {
                        this.scheduleOnce(() => {
                            this.setNewData(this.map_data[data.idx[0] - 1][data.idx[1]], 14)
                        })
                    })
                    // }

                } else if (this.Piece[1] == 13) {

                    if (this.map_data.length > data.idx[0] - 1) {
                        this.setNewData(this.map_data[data.idx[0] - 1][data.idx[1]], 14)
                    }
                }
                if (this.Piece[1] == 11 || this.Piece[1] == 12) {
                    let EditBox = instantiate(this.node.getChildByName("setEditBox"))
                    data.child.addChild(EditBox);
                    EditBox.name = data.idx[0] + "_" + data.idx[1]
                    EditBox.active = true
                    this.map_data[data.idx[0]][data.idx[1]].datas = [3]
                }

                this.ChooseKuang.setPosition(this.dataParent.getChildByName('14').getPosition());
                this.ChooseKuang.active = true;
            } else if (this.Piece[1] == 14) {
                // let next = (data.idx[1] > (this.map_data[1].length / 2)) ? data.idx[1] + 1 : data.idx[1] - 1
                // if (next < this.map_data[1].length && next > 0) {
                //     this.setNewData(this.map_data[data.idx[0]][(data.idx[1] > (this.map_data[1].length / 2)) ? data.idx[1] + 1 : data.idx[1] - 1])
                // } else {
                this.scheduleOnce(() => {
                    // this.map_data.length
                    if (this.map_size.row >= data.idx[0] + 1 && this.map_data[data.idx[0] - 1] && this.map_data[data.idx[0] - 1][data.idx[1]].type != 105) {
                        this.setNewData(this.map_data[data.idx[0] - 1][data.idx[1]])
                    } else {
                        this.Piece = [this.dataParent.getChildByName('1'), 1]
                    }
                })
                // }
            }

            // if (data.child.children.length > 1) {
            //     data.child.children[1].destroy()
            // }
        }
        if (this.Obstacle['D'].indexOf(data.type) < 0 || this.Obstacle['F'].indexOf(data.type) < 0 || data.type == 68) {
            // data.child.getChildByName('go').active = false
            if (this.Piece[1] == '2') {
                this.map_data[data.idx[0]][data.idx[1]].go_num = 999
            }
        } else {
            data.child.getChildByName('go').active = true
            // data.go_num = data.go_num + 2
        }
        if (this.Obstacle['Role'].indexOf(data.type) < 0 || data.type == 68) {
            data.child.getChildByName('go').active = false
            // data.child.scale = v3(1.18, 1.18, 1.18)
        } else {
            data.child.getChildByName('go').active = true
            data.child.scale = v3(1, 1, 1)
        }
        if (data.type == 68 || data.type == this.Obstacle.JianPiaoKey) {
            data.child.getChildByName('go').setSiblingIndex(data.child.children.length - 1)
            data.child.getChildByName('go').getComponent(Label).enabled = true
            data.child.getChildByName('go').getComponent(Label).string = data.idx[0] + '_' + data.idx[1]
            data.child.getChildByName('go').active = true
            if (data.type == 68) {
                for (let i in this.JianPiaoKou) {
                    if (!this.JianPiaoKou[i].keyPos) {
                        this.JianPiaoKou[i].keyPos = [data.idx[0], data.idx[1]]

                        data.child.getChildByName('go').getComponent(Label).string = this.JianPiaoKou[i].pos[0] + '_' + this.JianPiaoKou[i].pos[1]
                        break
                    }
                }
            }
        } else {

            data.child.getChildByName('go').getComponent(Label).enabled = (this.YZZState) ? true : false
        }
        // this.map_data[data.idx[1]][data.idx[0]].type = 3
        // this.map_data[data.idx[0]][data.idx[1]].type = data
        // this.map_data[data.idx[1]][data.idx[0]] = data
        if (this.YZZState) {
            this.GoNumRefirsh(data)
        }
        this.Piece[0].getChildByName('count').getComponent(Label).string = String(Number(this.Piece[0].getChildByName('count').getComponent(Label).string) + 1);
        this.setPeopleCount()
        // + Number(this.dataParent.getChildByName('10').getChildByName('count').getComponent(Label).string)

    }
    setPeopleCount() {
        let people_num = 0
        let PeopleKey = [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 71, 72, 73, 74, 75, 68, 101, 102, 103, 104, 1111, 111]
        for (let y = 1; y <= this.map_size.row; y++) {
            for (let x = 1; x <= this.map_size.arrange; x++) {
                let t = this.map_data[y][x].type
                if (PeopleKey.indexOf(t) >= 0) {
                    people_num += this.Obstacle.DTJ.indexOf(t) >= 0 ? 2 : 1;
                } else if (this.Obstacle.C.indexOf(t) >= 0 || t == 11 || t == 12) {
                    people_num += this.map_data[y][x].datas[0]
                }
                if (t == 131 && this.map_data[y][x].FixedData) {
                    let len = this.map_data[y][x].FixedData.length - 1
                    people_num += len * this.map_data[y][x].FixedData[0]
                }
            }
        }
        // for (let k of PeopleKey) {
        //     if (this.Obstacle.DTJ.indexOf(k) >= 0) {
        //         people_num += Number(this.dataParent.getChildByName(String(k)).getChildByName('count').getComponent(Label).string) * ((this.DoubleLiftType[k][0] * this.DoubleLiftType[k][1]) * 2)
        //     } else {
        //         people_num += Number(this.dataParent.getChildByName(String(k)).getChildByName('count').getComponent(Label).string)
        //     }
        // }
        this.PeopleStr.string = `当前人数为：${people_num}`
        return people_num
    }
    Type2ArrMin(idx) {
        let type2Obj = {};
        let type2 = (idx) => {
            let y = idx[0];
            let x = idx[1];
            // 方向
            let min = 999
            let direction = (Y, X) => {
                if (this.map_data[Y][X].type == '2') {
                    if (!type2Obj[Y + '_' + X]) {
                        // type2Obj[Y + '_' + X] = [Y, X, this.map_data[Y][X].go_num]
                        type2(this.map_data[Y][X].idx)
                        return 999
                    }

                    // this.map_data[Y][X].type == 1 || this.map_data[Y][X].type == 10
                } else if (this.Obstacle['D'].indexOf(this.map_data[Y][X].type) >= 0) {
                    // console.log(type2Obj[y + '_' + x]);
                    // console.log(this.map_data[Y][X].go_num);
                    if (this.map_data[Y][X].go_num < type2Obj[y + '_' + x][2]) {
                        type2Obj[y + '_' + x][2] = this.map_data[Y][X].go_num
                    }
                }
            }
            if (!type2Obj[y + '_' + x]) {
                type2Obj[y + '_' + x] = [y, x, 999]
                // 上
                if (this.map_data[y - 1]) {
                    let nextY = y - 1;
                    let nextX = x;
                    let newMin = direction(nextY, nextX)
                    if (min > newMin) {
                        min = newMin
                    }
                } else {
                    type2Obj[y + '_' + x] = [y, x, 0]
                }
                // 下
                if (this.map_data[y + 1] && (y + 1) <= this.map_size.row) {
                    let nextY = y + 1;
                    let nextX = x
                    direction(nextY, nextX)

                }
                if (this.map_data[y][x + 1] && (x + 1) <= this.map_size.arrange) {
                    let nextY = y;
                    let nextX = x + 1;
                    direction(nextY, nextX)

                }
                if (this.map_data[y][x - 1]) {
                    let nextY = y;
                    let nextX = x - 1;
                    direction(nextY, nextX)
                }
            }
        }
        type2(idx)
        let arr = []
        for (let key in type2Obj) {
            arr.push(type2Obj[key][2])
        }
        let min = Math.min(...arr)
        for (let key in type2Obj) {
            this.map_data[type2Obj[key][0]][type2Obj[key][1]].go_num = (min <= 0) ? -1 : min;
            this.map_data[type2Obj[key][0]][type2Obj[key][1]].child.getChildByName('go').getComponent(Label).string = (min <= 0) ? -1 : min + ''
        }

        return min
    }
    GoNumRefirsh(data) {
        if (data.type == 2) {
            this.Type2ArrMin(data.idx)
        } else {
            let y = data.idx[1];
            let x = data.idx[0];
            if (this.map_data[y][x]) {
                this.map_data[y][x].go_num += 1
                let min = this.map_data[y][x].go_num;
                let Type2fun = (idx) => {
                    if (this.map_data[idx[1]] && this.map_data[idx[1]][idx[0]]) {
                        if (this.map_data[idx[1]][idx[0]].type == 2) {
                            let newMin = this.Type2ArrMin(idx)
                            if (min > newMin + 1) {
                                min = newMin + 1
                            }
                        }
                    }
                }
                if (this.map_data[y - 1]) {
                    Type2fun(this.map_data[y - 1][x].idx);
                }
                if (this.map_data[y + 1] && (y + 1) <= this.map_size.row) {
                    Type2fun(this.map_data[y + 1][x].idx);
                }
                if (this.map_data[y][x + 1] && (x + 1) <= this.map_size.arrange) {
                    Type2fun(this.map_data[y][x + 1].idx);
                }
                if (this.map_data[y][x - 1]) {
                    Type2fun(this.map_data[y][x - 1].idx);
                }
            }
        }
        this.refish_GoNum()
    }
    getHandArr(y, x, type) {
        let HandKeyArr = [51, 52, 53, 54, 55]
        let getFirstRole = (iy, ix) => {
            if (this.map_data[iy][ix].type > 51 && HandKeyArr.indexOf(this.map_data[iy][ix].type) >= 0) {
                return getFirstRole(iy, ix - 1)
            } else {
                return { y: iy, x: ix }
            }
        }
        let HandRoleArr = []
        let HandArr = (ey, ex) => {
            let selfSTTState = this.broadsideOK(ey, ex)
            HandRoleArr = HandRoleArr.concat(this.getMinArr(selfSTTState, ey, ex))
            if (this.map_data[ey][ex + 1] && HandKeyArr.indexOf(this.map_data[ey][ex + 1].type) >= 0) {
                return HandArr(ey, ex + 1)
            } else {
                return HandRoleArr
            }
        }
        if (type == 51) {
            return HandArr(y, x)
        } else {
            let Frist = getFirstRole(y, x - 1)
            return HandArr(Frist.y, Frist.x)
        }
    }
    refish_GoNum(count: number = 0) {
        this.GoNumAll = 0
        let HandKeyArr = [51, 52, 53, 54, 55]
        let AJKeyRole = {}
        for (let y = 1; y <= this.map_size.row; y++) {
            for (let x = 1; x <= this.map_size.arrange; x++) {
                let type = this.map_data[y][x].type
                if (this.Obstacle['Role'].indexOf(type) >= 0 || this.Obstacle['F'].indexOf(type) >= 0 || this.Obstacle['DTJ'].indexOf(type) >= 0) {
                    let selfSTTState = this.broadsideOK(y, x)
                    let min_arr = []
                    if (HandKeyArr.indexOf(type) >= 0) {
                        min_arr = this.getHandArr(y, x, type)
                    } else {
                        min_arr = this.getMinArr(selfSTTState, y, x, type)
                    }
                    // if (type == 31) {
                    //     for (let i in min_arr) {
                    //         (min_arr[i] > 0) && (min_arr[i] += 2)
                    //     }
                    // }

                    let minNum = (min_arr.length <= 0) ? this.map_data[y][x].go_num : Math.min(...min_arr)


                    this.map_data[y][x].go_num = minNum
                    //  else {
                    if (y == 9 && x == 5) {
                        // console.log(min_arr);
                        // console.log(minNum);
                    }
                    if (type != 68) {
                        this.map_data[y][x].child.getChildByName('go').getComponent(Label).string = minNum + ''

                    } else {
                        if (!AJKeyRole[y + '_' + x]) {
                            AJKeyRole[y + '_' + x] = { y: y, x: x, go_num: minNum }
                        }
                    }
                    // }
                    this.GoNumAll += minNum
                }
            }
        }
        if (this.GoNumAll > 10000) {
            this.TipTween('压制值计算出问题了')
            return
        }
        if (this.GoNumAll != count) {
            return this.refish_GoNum(this.GoNumAll)
        }

        for (let k in AJKeyRole) {
            for (let i in this.JianPiaoKou) {
                if (this.JianPiaoKou[i].keyPos[0] == AJKeyRole[k].y && this.JianPiaoKou[i].keyPos[1] == AJKeyRole[k].x) {
                    let pos = this.JianPiaoKou[i].pos
                    if (this.map_data[pos[0]][pos[1]].go_num != AJKeyRole[k].go_num) {
                        this.map_data[pos[0]][pos[1]].go_num = AJKeyRole[k].go_num
                        return this.refish_GoNum(this.GoNumAll)
                    }
                }
            }
        }
        if (this.YZZState || this.MapColorState > 1) {
            // this.allLabel[4].string = '压制值总和：' + this.GoNumAll;
        }

        return this.GoNumAll;
    }
    getMinArr(selfSTTState, y, x, type?) {
        let min_arr = []
        let DTJAdd = 0
        if (type && this.Obstacle['DTJ'].indexOf(type) >= 0) {
            DTJAdd = this.DoubleLiftType[type][0] * this.DoubleLiftType[type][1];
        }
        if (this.map_data[y - 1]) {
            // if (this.map_data[y - 1][x].type == 1 || this.map_data[y - 1][x].type == 2 || this.map_data[y - 1][x].type == 10) {
            let upKey = Number(this.map_data[y - 1][x].type)
            let add = DTJAdd
            if (this.Obstacle['DTJ'].indexOf(upKey) >= 0) {
                add = 0
            }
            if (this.Obstacle['Role'].indexOf(upKey) >= 0 || upKey == 2 || this.Obstacle['F'].indexOf(upKey) >= 0 || upKey == this.Obstacle.JianPiaoKey) {
                if (!selfSTTState) {
                    min_arr.push(this.map_data[y - 1][x].go_num + 1 + add)
                } else if (selfSTTState && this.broadsideOK(y - 1, x)) {
                    min_arr.push(this.map_data[y - 1][x].go_num + 1 + add)
                }
            }
        } else {
            min_arr.push(0 + DTJAdd)
        }
        if (this.map_data[y + 1] && (y + 1) <= this.map_size.row) {
            let downKey = Number(this.map_data[y + 1][x].type)
            let add = DTJAdd
            if (this.Obstacle['DTJ'].indexOf(downKey) >= 0) {
                add = 0
            }
            // if (this.map_data[y + 1][x].type == 1 || this.map_data[y + 1][x].type == 2 || this.map_data[y + 1][x].type == 10) {
            if (this.Obstacle['Role'].indexOf(downKey) >= 0 || downKey == 2 || downKey == this.Obstacle.JianPiaoKey) {
                if (!selfSTTState && !this.broadsideOK(y + 1, x)) {
                    min_arr.push(this.map_data[y + 1][x].go_num + 1 + add)
                } else if (selfSTTState && this.broadsideOK(y, x)) {
                    min_arr.push(this.map_data[y + 1][x].go_num + 1 + add)
                }

            }
        }
        if (this.map_data[y][x + 1] && (x + 1) <= this.map_size.arrange) {
            let rightKey = Number(this.map_data[y][x + 1].type)
            let add = DTJAdd
            if (this.Obstacle['DTJ'].indexOf(rightKey) >= 0) {
                add = 0
            }
            // if (this.map_data[y][x + 1].type == 1 || this.map_data[y][x + 1].type == 2 || this.map_data[y][x + 1].type == 10) {
            if (this.Obstacle['Role'].indexOf(rightKey) >= 0 || rightKey == 2 || rightKey == this.Obstacle.JianPiaoKey) {
                if (!selfSTTState && !this.broadsideOK(y, x + 1)) {
                    min_arr.push(this.map_data[y][x + 1].go_num + 1 + add)
                } else if (selfSTTState && this.broadsideOK(y, x + 1)) {
                    min_arr.push(this.map_data[y][x + 1].go_num + 1 + add)
                }
            }

        }
        if (this.map_data[y][x - 1]) {
            let leftKey = Number(this.map_data[y][x - 1].type)
            let add = DTJAdd
            if (this.Obstacle['DTJ'].indexOf(leftKey) >= 0) {
                add = 0
            }
            // if (this.map_data[y][x - 1].type == 1 || this.map_data[y][x - 1].type == 2 || this.map_data[y][x - 1].type == 10) {
            if (this.Obstacle['Role'].indexOf(leftKey) >= 0 || leftKey == 2 || leftKey == this.Obstacle.JianPiaoKey) {
                if (!selfSTTState && !this.broadsideOK(y, x - 1)) {
                    min_arr.push(this.map_data[y][x - 1].go_num + 1 + add)
                } else if (selfSTTState && this.broadsideOK(y, x - 1)) {
                    min_arr.push(this.map_data[y][x - 1].go_num + 1 + add)
                }
            }
        }

        return min_arr
    }
    // 判断侧边是否可以
    broadsideOK(y, x) {
        let leh = 67
        if (y < this.map_size.row) {
            for (let i = this.map_size.row; i >= y; i--) {
                if (this.Obstacle['F'].indexOf(this.map_data[i][x].type) >= 0 && i - (this.map_data[i][x].type - leh) <= y) {
                    return false
                }
            }
        }
        return true
    }
    delDTJ(y, x, t) {
        let key = y + "_" + x;
        let keyLabel = this.dataParent.getChildByName(t + "").getChildByName('count').getComponent(Label)
        keyLabel.string = String(Number(keyLabel.string) - 1)
        let NoDtj = []
        let count_label = this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label)
        for (let m_y = 1; m_y <= this.map_size.row; m_y++) {
            for (let m_x = 1; m_x <= this.map_size.arrange; m_x++) {
                let k = m_y + "_" + m_x;
                let type = this.map_data[m_y][m_x].type * 1
                if (type == t) {
                    if (NoDtj.indexOf(k) < 0) {
                        for (let new_y = 0; new_y < this.DoubleLiftType[type][1]; new_y++) {
                            for (let new_x = 0; new_x < this.DoubleLiftType[type][0]; new_x++) {
                                let newY = new_y + m_y;
                                let newX = new_x + m_x;
                                let name = newY + "_" + newX
                                NoDtj.push(name);
                                if (key == name) {
                                    for (let Y = 0; Y < this.DoubleLiftType[type][1]; Y++) {
                                        for (let X = 0; X < this.DoubleLiftType[type][0]; X++) {
                                            let Y_new = m_y + Y
                                            let X_new = m_x + X
                                            this.map_data[Y_new][X_new].type = 1
                                            this.map_data[Y_new][X_new].child.name = '1'
                                            this.map_data[Y_new][X_new].child.getChildByName('go').active = true
                                            this.map_data[Y_new][X_new].child.getComponent(Sprite).color = new Color('DBEEF3')
                                            this.map_data[Y_new][X_new].child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
                                            this.map_data[Y_new][X_new].datas = []
                                            count_label.string = String(Number(count_label.string) + 1);
                                        }
                                    }
                                    let DTJMapChild = this.DTJMap.getChildByName(k)
                                    if (DTJMapChild) {
                                        DTJMapChild.destroy()
                                    }
                                    return
                                }

                            }
                        }
                    }

                }

            }
        }


    }
    EditDTJ(y, x, t) {
        let key = y + "_" + x;
        let keyLabel = this.dataParent.getChildByName(t + "").getChildByName('count').getComponent(Label)
        keyLabel.string = String(Number(keyLabel.string) - 1)
        let NoDtj = []
        let count_label = this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label)
        for (let m_y = 1; m_y <= this.map_size.row; m_y++) {
            for (let m_x = 1; m_x <= this.map_size.arrange; m_x++) {
                let k = m_y + "_" + m_x;
                let type = this.map_data[m_y][m_x].type * 1
                if (type == t) {
                    if (NoDtj.indexOf(k) < 0) {
                        for (let new_y = 0; new_y < this.DoubleLiftType[type][1]; new_y++) {
                            for (let new_x = 0; new_x < this.DoubleLiftType[type][0]; new_x++) {
                                let newY = new_y + m_y;
                                let newX = new_x + m_x;
                                let name = newY + "_" + newX
                                NoDtj.push(name);
                                if (key == name) {
                                    this.DTJLayer = {
                                        layer: 3,
                                        data: this.getNowData(),
                                        arrange: this.map_size.arrange,
                                        row: this.map_size.row,
                                        size: [this.DoubleLiftType[type][0], this.DoubleLiftType[type][1]],
                                        YX: [m_y, m_x]
                                    }
                                    let nowData = {}
                                    for (let Y = 0; Y < this.DoubleLiftType[type][1]; Y++) {
                                        for (let X = 0; X < this.DoubleLiftType[type][0]; X++) {
                                            let Y_new = m_y + Y
                                            let X_new = m_x + X
                                            if (!nowData[Y]) {
                                                nowData[Y] = {}
                                            }
                                            if (!nowData[Y][X]) {
                                                nowData[Y][X] = this.map_data[Y_new][X_new].datas
                                            }
                                        }
                                    }
                                    this.setDTJLayer()
                                    for (let Y = 0; Y < this.DoubleLiftType[type][1]; Y++) {
                                        for (let X = 0; X < this.DoubleLiftType[type][0]; X++) {
                                            this.map_data[Y][X].datas = nowData[Y][X]
                                        }
                                    }
                                    return
                                }

                            }
                        }
                    }
                }

            }
        }
    }
    // 删除对应电梯口
    DelLiftExport(data) {
        if (this.Obstacle['LiftExport'].indexOf(data.type) >= 0) {
            let y = data.idx[0];
            let x = data.idx[1];
            let key = y + "-" + x;
            console.warn(key + "存在属于电梯口的数据");
            let count_label = this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label)
            let count = Number(count_label.string) * 1
            let Choose = false
            if (this.LayLiftExportState) {
                let keyLabel = this.dataParent.getChildByName(data.type + "").getChildByName('count').getComponent(Label)
                if (this.LiftExportData.key == key) {
                    this.ChangeDataType1(data)
                    this.LiftExportData.key = null;
                    this.LayLiftExportState = false;
                    count += 1
                    keyLabel.string = String(Number(keyLabel.string) - 1)
                    Choose = true;
                } else if (this.LiftExportData.nowList.length > 0 && this.LiftExportData.nowList.some(item => item[0] === y && item[1] === x)) {
                    let keyLabel = this.dataParent.getChildByName(this.map_data[this.LiftExportData.nowList[0][0]][this.LiftExportData.nowList[0][1]].type + "").getChildByName('count').getComponent(Label)
                    keyLabel.string = String(Number(keyLabel.string) - 1)
                    for (let arr of this.LiftExportData.nowList) {
                        count += 1
                        this.ChangeDataType1(this.map_data[arr[0]][arr[1]])
                    }
                    this.LiftExportData.nowList = []
                    this.LayLiftExportState = false;
                    Choose = true;
                }
            }
            if (!Choose) {
                for (let d_key in this.LiftExportData.data) {
                    if (key == d_key || this.LiftExportData.data[d_key].some(item => item[0] === y && item[1] === x)) {
                        count += 1;
                        let karr = d_key.split('-').map(item => parseInt(item));
                        let karrData = this.map_data[karr[0]][karr[1]]
                        let d_keyText = this.dataParent.getChildByName(karrData.type + "").getChildByName('count').getComponent(Label)
                        d_keyText.string = String(Number(d_keyText.string) - 1)
                        let keyLabel = this.dataParent.getChildByName(this.map_data[this.LiftExportData.data[d_key][0][0]][this.LiftExportData.data[d_key][0][1]].type + "").getChildByName('count').getComponent(Label)
                        keyLabel.string = String(Number(keyLabel.string) - 1)
                        for (let arr of this.LiftExportData.data[d_key]) {
                            this.ChangeDataType1(this.map_data[arr[0]][arr[1]])
                            count += 1
                        }
                        this.ChangeDataType1(karrData)
                        delete this.LiftExportData.data[d_key]
                    }
                }
            }
            count_label.string = String(count);
        }
    }
    ChangeDataType1(data) {
        if (data.child.getChildByName(String(data.type))) {
            data.child.getChildByName(String(data.type)).destroy()
        }
        data.type = 1
        data.child.name = '1'
        data.child.getChildByName('go').active = true
        data.child.getComponent(Sprite).color = new Color('DBEEF3')
        data.child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
        data.datas = []
        if (data["FixedData"]) {
            delete data["FixedData"];
        }

    }
    // 触摸数据
    TouchData(pos) {
        for (let i = 1; i <= this.map_size.row; i++) {
            let row = i
            for (let x = 1; x <= this.map_size.arrange; x++) {
                let arrange = x
                let node: Node = this.map_data[i][x].node;
                let size = node.getComponent(UITransform).contentSize;
                let node_pos = node.getPosition();

                if (pos.x > node_pos.x - (size.width / 2) && pos.x < node_pos.x + (size.width / 2) && pos.y < node_pos.y + (size.height / 2) && pos.y > node_pos.y - (size.height / 2)) {
                    return this.map_data[row][arrange]
                }
            }
        }
        return null;
    }
    onPiece(event: Event, count: string) {
        let target: any = event.target;
        if (this.Piece.length > 0) {
            if (this.Piece[1] == Number(target.name) && this.ChooseKuang.active) {
                this.ChooseKuang.active = false;
                this.Piece = [];
                return;
            }
        }
        this.ChooseItemKey = null;
        this.ChooseItem.active = false;
        this.ChooseItem.parent = this.ContentNode[1]
        this.Piece = [target, Number(target.name), count];
        this.ChooseKuang.setPosition(target.getPosition());
        this.ChooseKuang.active = true;
        this.ChooseKuang.getComponent(UITransform).setContentSize(new Size(target.getComponent(UITransform).width + 20, target.getComponent(UITransform).height + 60))
        if (this.MapColorState == 1) {
            this.MapColorState = 0
            for (let y in this.map_data) {
                for (let x in this.map_data[y]) {
                    let child = this.map_data[y][x].child
                    let c = TitleType.indexOf(this.map_data[y][x].json[2]) + 1
                    if (new Color(CellToColor[c])["_val"] == child.getComponent(Sprite).color._val) {
                        child.getComponent(Sprite).color = new Color("#DAEDF2")

                    }
                }
            }
        }
    }
    private Obstacle = {
        'A': [18, 19, 20],
        'B': [21, 22, 23, 28, 29, 30],
        'C': [24, 25, 26, 27, 6, 7, 8, 9],//电梯
        'D': [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55],//角色
        'E': [61, 63, 64, 68],//检票口
        'F': [71, 72, 73, 74, 75],//双向电梯
        'Role': [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 68, 71, 72, 73, 74, 75, 101, 102, 103, 104, 1111, 111],
        'JianPiaoKey': 67,
        'DTJ': [101, 102, 103, 104],//电梯井
        'VIP': [11, 12, 13],
        'LiftExport': [99913, 99931, 99923, 99932, 99933, 131]
    }
    onObstaclePiece(event: Event, type: string) {
        let target: any = event.target;
        let roleW = [1, 2, 31, 10]
        if (this.Obstacle[type]) {
            for (let item of this.dataParent.children) {
                item.active = false
            }
            for (let i = 0; i < this.Obstacle[type].length; i++) {
                if (roleW.indexOf(this.Obstacle[type][i]) < 0) {
                    this.dataParent.getChildByName(String(this.Obstacle[type][i])) && (this.dataParent.getChildByName(String(this.Obstacle[type][i])).active = true)
                }

            }
            this.dataParent.getChildByName('all').active = true

        } else if (type == 'all') {
            this.ShowAll()
        }
        this.dataParent.getChildByName('Mask').active = true
        this.ChooseKuang.active = false;
    }
    ShowAll() {
        let roleW = [1, 2, 31, 10]
        for (let item of this.dataParent.children) {
            item.active = true
        }
        for (let key in this.Obstacle) {
            if (key != 'Role' && key != 'JianPiaoKey' && key != 'VIP') {
                for (let id of this.Obstacle[key]) {
                    if (roleW.indexOf(id) < 0) {
                        if (this.dataParent.getChildByName(String(id))) {
                            this.dataParent.getChildByName(String(id)).active = false
                        } else {

                        }

                    }
                }

            }
        }
        this.dataParent.getChildByName('all').active = false
    }
    private TieLianSuoState = 0;
    onTieLianSuo() {
        this.TieLianSuoState = 3
        this.dataParent.active = false
        this.allLabel[4].string = "请设置铁链位置";
        this.Piece = []

    }
    private ChooseDTJState = false
    onButton(event: Event) {
        let target: any = event.target;
        if (target.name == "ClooseDTJ") {
            this.setDTJChooseState(true)
            this.TipTween("选择编辑的电梯井")
        } else if (target.name == "dtjback") {
            this.setDTJChooseState(false)
        }

    }
    setDTJChooseState(state) {
        this.ChooseDTJState = state;
        this.node.getChildByPath("DTJNode/dtjback").active = this.ChooseDTJState;
    }
    // 保存地形并返回列表
    seve_map() {
        let data = this.getNowData()
        if (this.MapId && data) {
            let SizeKey = { 7: { 7: 5, 9: 2 }, 9: { 8: 6 }, 8: { 7: 7 }, 10: { 9: 1 }, 11: { 10: 2 } }
            this.yarn_mapLayoutData[this.MapId] = {
                id: this.MapId,
                size: SizeKey[this.map_size.arrange][this.map_size.row],
                layout: data,
                roles: ""
            }
            if (this.ChainData.length > 0) {
                let str = ""
                for (let data of this.ChainData) {
                    if (data.length == 3) {

                        for (let pos of data) {
                            str += pos[0] + "," + pos[1] + "|"
                        }
                        str = str.slice(0, -1);
                        str += ";"
                    }
                }
                if (str != "") {
                    this.yarn_mapLayoutData[this.MapId]["chain"] = str
                }
            }
            this.initMapLayoutData()

            if (!this.yarn_mapLayoutData[this.MapId]["ColorList"]) {
                this.yarn_mapLayoutData[this.MapId]["ColorList"] = ""
            }
            GameUtil.ChangeStorage(true, "yarn_mapLayoutData", this.yarn_mapLayoutData)
            // this.setMapColor()
        }
        this.onLocking()
    }
    // 数据处理
    data_handle(event: Event) {
        let target: any = event.target;
        this.refish_GoNum()
        if (target.name.indexOf('seve_data') >= 0) {
            if (this.LayLiftExportState) {
                this.TipTween("电梯口未编辑完整")
                return
            }
            // CreateRoleYarnNew.getRoleData(this.getNowData(true), true, this.setColor)
            let data = CreateRoleYarnNew.getRoleData(this.getNowData(true), true, this.setColor)
            if (this.MapId && data) {
                this.yarn_mapLayoutData[this.MapId] = {
                    id: this.MapId,
                    size: data[0],
                    layout: data[1],
                    roles: data[2]
                }
                if (this.ChainData.length > 0) {
                    let str = ""
                    for (let data of this.ChainData) {
                        if (data.length == 3) {

                            for (let pos of data) {
                                str += pos[0] + "," + pos[1] + "|"
                            }
                            str = str.slice(0, -1);
                            str += ";"
                        }
                    }
                    if (str != "") {
                        this.yarn_mapLayoutData[this.MapId]["chain"] = str
                    }
                }
                this.initMapLayoutData()

                if (!this.yarn_mapLayoutData[this.MapId]["ColorList"]) {
                    this.yarn_mapLayoutData[this.MapId]["ColorList"] = ""
                }
                this.yarn_mapLayoutData[this.MapId]["ColorList"] = ""
                this.refish_GoNum()
                // GameUtil.ChangeStorage(true, "yarn_mapLayoutData", this.yarn_mapLayoutData)


                this.TipTween("颜色已生成")
                this.setMapColor()

            } else {
                this.TipTween("出现问题1000次循环生成不出有效数据，无法保存")
            }
        } else {
            // EditOrder
            // this.dataJsonImport(this.ImportEditBox.string);
        }
    }

    ChangePosStart() {
        this.StateText.string = "修改颜色位置"
        this.ChangePosState = true
        this.ChangePos.getChildByName("ChangePosOK").active = true;
        this.node.getChildByName("seve_data").active = false
    }
    ChangePosOk() {
        this.StateText.string = "编辑顺序"
        this.ChangePosState = false
        this.SaveChange()
        this.ChangePos.getChildByName("ChangePosOK").active = false;
        this.node.getChildByName("seve_data").active = true;

    }
    getNowData(create?): any {
        let JPKStr = ''
        for (let i in this.JianPiaoKou) {
            if (!this.JianPiaoKou[i].keyPos) {
                this.TipTween('缺少钥匙熊')
                return
            }
            JPKStr += `${this.JianPiaoKou[i].pos[1]},${this.JianPiaoKou[i].pos[0]},${this.JianPiaoKou[i].keyPos[1]},${this.JianPiaoKou[i].keyPos[0]};`
        }
        // 导出数据
        let data = ''
        let DataArrLook = []
        let DataArr = []
        for (let y = 1; y <= this.map_size.row; y++) {
            DataArrLook[y] = []
            DataArr[y] = []
            for (let x = 1; x <= this.map_size.arrange; x++) {
                let t = this.map_data[y][x].type
                if (t > 9999) {
                    t = 1
                }
                data += x + `,${y},${(t) ? t : 5}`


                for (let k of this.map_data[y][x].datas) {
                    if (k) {
                        data += ',' + k
                    }
                }
                if (t == 131) {
                    data += '|' + this.map_data[y][x]["FixedData"][0]
                    // this.map_data[y][x]["FixedData"] = [2]
                }
                let LiftExportK = y + "-" + x;
                if (this.LiftExportData.data[LiftExportK]) {
                    for (let arr of this.LiftExportData.data[LiftExportK]) {
                        data += '|' + arr[0] + "," + arr[1]
                        // this.map_data[y][x]["FixedData"].push(arr)
                    }
                }
                data += ';'
                DataArrLook[y][x] = x + `,${y},${(t) ? t : 5}`
                DataArr[y][x] = [x, y, t]
                DataArr[y][x] = DataArr[y][x].concat(this.map_data[y][x].datas)
                if (this.map_data[y][x]["FixedData"]) {
                    DataArr[y][x] = DataArr[y][x].concat(this.map_data[y][x]["FixedData"])
                }
            }
        }
        console.log('----------数据导出----------');
        console.log(data);
        // console.log(JPKStr);
        console.log(DataArr);
        if (create) {
            return DataArr
        }

        return data
    }
    initDataGoNum() {
        for (let y = 1; y <= this.map_size.row; y++) {
            for (let x = 1; x <= this.map_size.arrange; x++) {
                if (this.map_data[y][x].type == 2) {
                    this.Type2ArrMin(this.map_data[y][x].idx)
                    // this.map_data[y][x].child.getChildByName('go').active = false
                    // this.map_data[y][x].child.getChildByName('go').getComponent(Label).string = this.map_data[y][x].go_num + ''
                }
            }
        }
        let num = 0
        // for (let y = 1; y <= this.map_size.row; y++) {
        //     for (let x = 1; x <= this.map_size.arrange; x++) {
        //         if (this.map_data[y][x].type == 2) {
        //             num = this.refish_GoNum()
        //         }
        //     }
        // }
        num = this.refish_GoNum()
        console.log('输出刷新数据总和：', num);
    }

    // 数据导入
    import_data(EditBox: EditBox) {
        this.dataJsonImport(EditBox.string);
        this.enter_map = true;
    }
    setImportColor(EditBox: EditBox) {
        let color = Number(EditBox.string)
        if (!isNaN(color) && color >= 3) {
            this.setColor = color
            this.TipTween("设置颜色数量为：" + color)
        } else {
            EditBox.placeholder = "设置生成颜色"
        }
    }
    HandleConf(data, change = true) {
        if (data.length < 6) {
            this.ImportEditBox.string = '';
            return;
        }
        if (change) {
            data = data.replace(/[A-Z]/g, '1');
        } else {
            data = data.replace(/\b([A-Z])\b/g, "'$1'");
        }
        let last = data.substring(data.length - 1, data.length);

        if (last != ';') {
            data += ';'
        }
        if (data[0] != '1' && data[1] != ',' && data[2] != '1') {
            this.ImportEditBox.string = '';
            return;
        }
        data = '[[' + data
        data = data.substring(0, data.length - 1)
        data = this.replaceAll(data, ";", '],[')
        data = this.replaceAll(data, "'", '"')
        // data = this.replaceAll(data, "131|", '131,[')
        data += ']]';
        const result = data
            // 将 131| 替换为 131,[
            .replace(/131\|/g, '131,[')
            // 将其他的 | 替换为 ],[
            // 找到131后面的第一个]，在它前面加一个]（变成]]）
            .replace(/131,\[(.*?)\]/g, '131,[$1]]')
            .replace(/\|/g, '],[');
        let new_data = JSON.parse(result)
        let row = 0;
        let arrange = 0;
        for (let idx of new_data) {
            row = (idx[1] > row) ? idx[1] : row;
            arrange = (idx[0] > arrange) ? idx[0] : arrange;
        }

        return { map: new_data, size: { row: row, arrange: arrange } }

    }
    // 数据Json导入
    dataJsonImport(data: string, Editing?) {
        this.allLabel[4].string = ""
        if (data.length < 6) {
            this.ImportEditBox.string = '';
            return;
        }
        this.AttrItemData = {}
        let handle = this.HandleConf(data, false)
        let new_data = handle.map
        let row = 0;
        let arrange = 0;
        this.map_size = handle.size
        let mapLayout = this.Map.getComponent(Layout)
        let newWidth = null;
        let newHeight = null;
        if (this.mapSize) {
            newWidth = (this.mapSize.width - mapLayout.paddingLeft - mapLayout.paddingRight - ((this.map_size.arrange - 1) * mapLayout.spacingX)) / this.map_size.arrange - 0.5
            newHeight = (this.mapSize.height - mapLayout.paddingTop - mapLayout.paddingBottom - ((this.map_size.row - 1) * mapLayout.spacingY)) / this.map_size.row
        }
        if (newWidth < newHeight) {
            newHeight = newWidth
        } else {
            newWidth = newHeight
        }
        if (this.mapSize) {
            this.Map.getComponent(UITransform).width = newWidth * this.map_size.arrange + (3 * (this.map_size.arrange - 1)) + 12
        }
        let newNodeSize = (this.mapSize) ? new Size(newWidth, newHeight) : null;
        console.log("data:", data);
        console.log(new_data);
        this.CloseAll(data)
        let STTKey = {}
        let STTKeyArr = []
        let DTJ = []
        let NoPushDTJ = []
        let FixedLiftState = false
        for (let idx of new_data) {
            row = (idx[1] > row) ? idx[1] : row;
            arrange = (idx[0] > arrange) ? idx[0] : arrange;
            idx[2] = CreateRole.RestoreFixedData[idx[2]] ? CreateRole.RestoreFixedData[idx[2]] : idx[2]
            this.map_data[idx[1]][idx[0]].type = isNaN(Number(idx[2])) ? 1 : idx[2];
            this.map_data[idx[1]][idx[0]].datas = []
            this.map_data[idx[1]][idx[0]].json = idx
            if (idx[2] == 131) {
                this.map_data[idx[1]][idx[0]]["FixedData"] = [0]
            }
            if (idx.length > 3) {
                let attrs = [31, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 1111, 10, 111]
                if (attrs.indexOf(idx[2]) < 0) {
                    let changeCount = 0
                    let DTJType = false
                    if (this.Obstacle.DTJ.indexOf(idx[2]) >= 0) {

                        let len = this.DoubleLiftType[idx[2]][0] * this.DoubleLiftType[idx[2]][1] * 2
                        if (len * 2 < idx.length) {
                            DTJType = true
                        }

                    }
                    let LiftExportCount = 0
                    let key = idx[1] + '-' + idx[0]
                    for (let I = 3; I < idx.length; I++) {
                        let d = idx[I];
                        if (idx[2] == 131) {
                            if (I != 3) {

                                if (!this.LiftExportData.data[key]) {
                                    this.LiftExportData.data[key] = []
                                }
                                this.LiftExportData.data[key].push(d)
                                this.map_data[idx[1]][idx[0]]["FixedData"].push(d)
                            } else {
                                LiftExportCount = d.length;
                            }

                        } else {
                            if (isNaN(d) && changeCount == 0) {
                                d = 1
                            } else if (!isNaN(d)) {
                                changeCount += 1
                            }
                            if (isNaN(d) && changeCount != 0) {
                                changeCount = 0
                            } else {
                                if (DTJType) {
                                    if (d == 111) {
                                        d = 10
                                    }
                                    if (I % 2 == 0) {
                                        d = 999
                                    }
                                }
                                if (d != 999) {

                                    this.map_data[idx[1]][idx[0]].datas.push(d)
                                }
                            }
                        }

                    }
                    if (LiftExportCount > 1 && this.LiftExportData.data[key]) {

                        LiftExportCount = LiftExportCount / this.LiftExportData.data[key].length;
                        this.map_data[idx[1]][idx[0]]["FixedData"][0] = LiftExportCount;
                    }

                }
                let lift = [6, 7, 8, 9, 11, 12]
                if (lift.indexOf(this.map_data[idx[1]][idx[0]].type) >= 0 && this.map_data[idx[1]][idx[0]].datas.length > 1) {
                    this.map_data[idx[1]][idx[0]].datas = [this.map_data[idx[1]][idx[0]].datas.length]
                    FixedLiftState = true
                }
            }
            this.map_data[idx[1]][idx[0]].child.name = this.map_data[idx[1]][idx[0]].type + '';
            if (this.dataParent.getChildByName(idx[2] + '')) {
                if (idx[2] == 1111 && idx[2] == 31) {

                } else {
                    this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).color;
                }
            }
            if (this.map_data[idx[1]][idx[0]].child.children.length > 1) {
                this.map_data[idx[1]][idx[0]].child.children[1].name != "go" && this.map_data[idx[1]][idx[0]].child.children[1].destroy()
            }
            this.map_data[idx[1]][idx[0]].child.getComponent(UITransform).setContentSize(newNodeSize);
            if (idx[2] == 99 || idx[2] == 62 || idx[2] == 65 || idx[2] == 66) {
                this.map_data[idx[1]][idx[0]].node.getComponent(Sprite).enabled = false
                this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).enabled = false
            } else if (idx[2] == 11 || idx[2] == 12) {
                let len = this.map_data[idx[1]][idx[0]].datas.length
                if (len > 0 && len > 4) {
                    this.map_data[idx[1]][idx[0]].datas = [len]
                }
                let EditBox_node = instantiate(this.node.getChildByName("setEditBox"))
                this.map_data[idx[1]][idx[0]].child.addChild(EditBox_node);
                EditBox_node.name = idx[1] + "_" + idx[0]
                EditBox_node.active = true
                EditBox_node.getComponent(EditBox).string = this.map_data[idx[1]][idx[0]].datas[0]
            }
            if (67 >= idx[2] && idx[2] >= 61) {
                if (idx[2] == this.Obstacle.JianPiaoKey) {
                    let newChild = null
                    let k = this.map_data[idx[1] - 1][idx[0]].type
                    if (this.Obstacle.E.indexOf(k) >= 0) {
                        newChild = instantiate(this.dataParent.getChildByName(k + ''))
                    } else if (this.Obstacle.E.indexOf(this.map_data[idx[1]][idx[0] - 1].type) >= 0) {
                        k = 61
                        newChild = instantiate(this.dataParent.getChildByName('61'))
                    }
                    if (newChild) {
                        newChild.getChildByName('name').active = false;
                        newChild.getChildByName('count').active = false;
                        newChild.getComponent(Button).enabled = false;
                        this.map_data[idx[1]][idx[0]].child.addChild(newChild);
                        newChild.setPosition(v3(0, 0));
                        if (this.obstacleOrther[k]) {
                            let infeed = (this.obstacleOrther[k][0] == 0) ? true : false
                            if (infeed) {
                                newChild.getComponent(UITransform).width = newNodeSize.width * Number(this.obstacleOrther[k][1])
                            } else {
                                infeed = false
                                newChild.getComponent(UITransform).height = newNodeSize.height * Number(this.obstacleOrther[k][1])
                            }
                            newChild.scale = v3(1.18, 1.18, 1.18)
                        }
                        newChild.active = true
                    }
                }
            } else if (this.TypeorAddChild(idx[2])) {
                let newChild = instantiate(this.dataParent.getChildByName(idx[2] + ''))
                newChild.active = true
                newChild.getChildByName('name').active = false;
                newChild.getChildByName('count').active = false;
                newChild.getComponent(UITransform).setContentSize(newNodeSize);
                newChild.getComponent(Button).enabled = false;

                this.map_data[idx[1]][idx[0]].child.addChild(newChild);
                newChild.setPosition(v3(0, 0));
                this.map_data[idx[1]][idx[0]].child.getComponent(UITransform).setContentSize(newNodeSize);
                if (this.obstacleOrther[idx[2]]) {

                    let infeed = (this.obstacleOrther[idx[2]][0] == 0) ? true : false
                    if (infeed) {
                        newChild.getComponent(UITransform).width = newNodeSize.width * Number(this.obstacleOrther[idx[2]][1])
                    } else {
                        infeed = false
                        newChild.getComponent(UITransform).height = newNodeSize.height * Number(this.obstacleOrther[idx[2]][1])
                    }
                    newChild.active = true
                }
                newChild.scale = v3(1.18, 1.18, 1.18)
                if (this.Obstacle.C.indexOf(idx[2]) >= 0) {
                    let EditBoxNode = instantiate(this.node.getChildByName("setEditBox"))
                    newChild.addChild(EditBoxNode);
                    EditBoxNode.name = idx[1] + "_" + idx[0]
                    EditBoxNode.active = true
                    EditBoxNode.getComponent(EditBox).string = this.map_data[idx[1]][idx[0]].datas[0]
                }
                if (this.MapColorState > 0) {
                    newChild.getComponent(Sprite).color = new Color("#FFFFFF50")

                }
                if (idx[2] == 131) {
                    let EditBoxNode = instantiate(this.node.getChildByName("setEditBox"))
                    newChild.addChild(EditBoxNode);
                    EditBoxNode.name = idx[1] + "-" + idx[0]
                    EditBoxNode.active = true
                    EditBoxNode.getComponent(EditBox).string = this.map_data[idx[1]][idx[0]].FixedData[0]
                }
            } else if (this.Obstacle.E.indexOf(idx[2]) >= 0) {
                this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).spriteFrame = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).spriteFrame;
            } else if (this.Obstacle.F.indexOf(idx[2]) >= 0) {

                STTKeyArr.push({ y: idx[1], x: idx[0] })

            } else if (this.Obstacle['DTJ'].indexOf(idx[2]) >= 0) {
                let namekey = idx[1] + '-' + idx[0]
                if (NoPushDTJ.indexOf(namekey) < 0) {
                    for (let Y = 0; Y < this.DoubleLiftType[idx[2]][1]; Y++) {
                        for (let X = 0; X < this.DoubleLiftType[idx[2]][0]; X++) {
                            let Y_new = idx[1] + Y
                            let X_new = idx[0] + X
                            let name = Y_new + "-" + X_new
                            NoPushDTJ.push(name)
                        }
                    }
                    DTJ.push(idx)
                }
            }
            if (this.MapColorState > 0) {

                if (this.map_data[idx[1]][idx[0]].type == 1) {
                    let c = TitleType.indexOf(this.map_data[idx[1]][idx[0]].json[2]) + 1
                    this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = new Color(CellToColor[c]);
                } else if (this.map_data[idx[1]][idx[0]].type == 31) {
                    let c = TitleType.indexOf(this.map_data[idx[1]][idx[0]].json[3]) + 1
                    this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = new Color(CellToColor[c]);
                    let Ice = instantiate(this.IceNode)
                    this.AttrItemData[idx[1] + "_" + idx[0]] = {
                        idx: [idx[1], idx[0]],
                        count: 3,
                        state: idx[1] == 1 ? true : false,
                        key: this.map_data[idx[1]][idx[0]].type,
                        item: Ice
                    }
                    Ice.getComponent(UITransform).setContentSize(this.map_data[idx[1]][idx[0]].child.getComponent(UITransform).contentSize)
                    this.map_data[idx[1]][idx[0]].child.addChild(Ice);
                    Ice.active = true;
                    Ice.getChildByName("count").getComponent(Label).string = "3";
                } else if (this.map_data[idx[1]][idx[0]].type == 1111) {
                    let c = TitleType.indexOf(this.map_data[idx[1]][idx[0]].json[3]) + 1
                    this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = new Color(CellToColor[c]);
                    let Lock = instantiate(this.LockNode)
                    this.AttrItemData[idx[1] + "_" + idx[0]] = {
                        idx: [idx[1], idx[0]],
                        count: 1,
                        state: idx[1] == 1 ? true : false,
                        key: this.map_data[idx[1]][idx[0]].type,
                        item: Lock
                    }

                    this.map_data[idx[1]][idx[0]].child.addChild(Lock);
                    Lock.active = true;
                }
            }
            let pieceColor = this.Obstacle['F'].indexOf(this.Piece[1]) >= 0 ? "#FF8F53" : "6C88F8"

        }
        let OkType = {
            RightHand: [53, 52],//牵右手1
            LeftHand: [53, 51],//牵左手-1
            UpHand: [53, 54],//牵上手-1
            DownHand: [53, 55],//牵下手1
        }
        for (let y in this.map_data) {
            for (let x in this.map_data[y]) {
                if (this.map_data[y][x].type > 50 && this.map_data[y][x].type < 56) {
                    let hand_keys = []

                    let handFun = (x_x, dir) => {
                        if (this.map_data[y] && this.map_data[y][x_x]) {
                            if (OkType[dir == -1 ? "RightHand" : "LeftHand"].indexOf(this.map_data[y][x_x].type) >= 0) {
                                hand_keys.push([y, x_x])
                                handFun(Number(x_x) + dir, dir)
                            }
                        }

                    }
                    let handFunUD = (y_y, dir) => {
                        if (this.map_data[y_y] && this.map_data[y_y][x]) {
                            if (OkType[dir == -1 ? "DownHand" : "UpHand"].indexOf(this.map_data[y_y][x].type) >= 0) {
                                hand_keys.push([y_y, x])
                                handFunUD(Number(y_y) + dir, dir)
                            }
                        }
                    }
                    if (this.map_data[y][x].type == 51) {
                        handFun(Number(x) - 1, -1)
                    } else if (this.map_data[y][x].type == 52) {
                        handFun(Number(x) + 1, 1)
                    } else if (this.map_data[y][x].type == 53) {
                        handFun(Number(x) - 1, -1)
                        handFun(Number(x) + 1, 1)
                        handFunUD(Number(y) - 1, -1)
                        handFunUD(Number(y) + 1, 1)
                    } else if (this.map_data[y][x].type == 54) {
                        handFunUD(Number(y) - 1, -1)
                    } else if (this.map_data[y][x].type == 55) {
                        handFunUD(Number(y) + 1, 1)
                    }
                    this.AttrItemData[y + "_" + x] = {
                        idxs: hand_keys,
                        count: 0,
                        state: true,
                        key: this.map_data[y][x].type,
                    }
                    let c = TitleType.indexOf(this.map_data[y][x].json[3]) + 1
                    this.map_data[y][x].child.getComponent(Sprite).color = new Color(CellToColor[c]);
                    //  this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).spriteFrame = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).spriteFrame;
                }
            }
        }




        this.FixedLift.active = FixedLiftState

        if (DTJ.length > 0 && !Editing) {
            this.setDTJData(DTJ)
        }
        if (STTKeyArr.length > 0) {
            for (let pos of STTKeyArr) {
                let getlast_key = this.getLastDoublePos(pos.y, pos.x)
                if (!STTKey[getlast_key.y + '_' + getlast_key.x]) {
                    STTKey[getlast_key.y + '_' + getlast_key.x] = {
                        pos: { y: getlast_key.y, x: getlast_key.x },
                        type: getlast_key.type
                    }
                }
            }

            for (let k in STTKey) {
                let LastPos = STTKey[k].pos
                let w = this.DoubleLiftType[STTKey[k].type][0]
                let h = this.DoubleLiftType[STTKey[k].type][1]
                for (let y = LastPos.y; y > LastPos.y - h; y--) {
                    for (let x = LastPos.x; x > LastPos.x - w; x--) {
                        this.map_data[y][x] && (this.map_data[y][x].child.getComponent(Sprite).color = new Color('#FF8F53'))
                        if (y == LastPos.y) {
                            this.map_data[y][x].child.getComponent(Sprite).spriteFrame = this.dataParent.getChildByName(STTKey[k].type + '').getComponent(Sprite).spriteFrame;
                        }
                    }
                }

            }
        }
        // 电梯口
        if (Object.keys(this.LiftExportData.data).length > 0) {

            for (let key in this.LiftExportData.data) {
                let type = "999"
                if (this.MapColorState == 0) {
                    let start = this.LiftExportData.data[key][0];
                    let end = this.LiftExportData.data[key][this.LiftExportData.data[key].length - 1];
                    type += (end[0] - start[0] + 1)
                    type += (end[1] - start[1] + 1)
                }
                for (let arr of this.LiftExportData.data[key]) {
                    let data = this.map_data[arr[0]][arr[1]]
                    if (this.MapColorState == 0) {
                        data.type = Number(type)
                        data.child.getComponent(Sprite).color = this.dataParent.getChildByName('99923').getComponent(Sprite).color;
                    } else {
                        let node = instantiate(this.dataParent.getChildByName('131'))
                        node.destroyAllChildren();
                        node.getComponent(Button) && node.getComponent(Button).destroy();
                        node.getComponent(UITransform).setContentSize(new Size(15, 15))
                        data.child.addChild(node)
                        node.setPosition(v3(0, 0))
                        node.active = true
                    }
                }
            }
        }
        this.map_size = {
            arrange: arrange,
            row: row,
        }
        this.EditBox_row.string = String(row);
        this.EditBox_arrange.string = String(arrange);
        this.ImportEditBox.string = '';
        this.EditOrder.active = this.MapColorState == 1
        if (this.MapColorState > 1) return
        this.scheduleOnce(() => {
            this.MapChange();
        }, 0.05)
    }
    setDTJData(data) {

        for (let idx of data) {
            let Datas = JSON.parse(JSON.stringify(this.map_data[idx[1]][idx[0]].datas))
            for (let Y = 0; Y < this.DoubleLiftType[idx[2]][1]; Y++) {
                for (let X = 0; X < this.DoubleLiftType[idx[2]][0]; X++) {
                    let Y_new = idx[1] + Y
                    let X_new = idx[0] + X
                    if (X == 0 && Y == 0) {
                        this.map_data[Y_new][X_new].datas = []
                    }
                    this.map_data[Y_new][X_new].type = idx[2]
                    this.map_data[Y_new][X_new].child.name = '' + idx[2]
                    this.map_data[Y_new][X_new].child.getComponent(Sprite).color = new Color('#6C88F8')
                    this.map_data[Y_new][X_new].datas.push(Datas.shift())
                    // this.map_data[Y_new][X_new].child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
                }
            }
            if (Datas.length > 0) {
                for (let Y = 0; Y < this.DoubleLiftType[idx[2]][1]; Y++) {
                    for (let X = 0; X < this.DoubleLiftType[idx[2]][0]; X++) {
                        let Y_new = idx[1] + Y
                        let X_new = idx[0] + X
                        this.map_data[Y_new][X_new].datas.push(Datas.shift())
                    }
                }
            }
        }
    }
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
    CloseAll(MapChange?) {
        this.LiftExportData = {
            key: null,
            nowList: [],
            data: {}
        };
        // if (this.DTJLayer.row > 0) {
        //     this.Map.scale = v3(1, 1, 1)
        //     this.map_size = {
        //         row: this.DTJLayer.row,
        //         arrange: this.DTJLayer.arrange
        //     }
        // }
        // this.DTJLayer = new DTJLayerData

        console.log('清空数据');

        for (let item of this.dataParent.children) {
            if (item.name != 'Mask') {
                if (item.getChildByName('count')) {
                    item.getChildByName('count').getComponent(Label).string = String(0);
                }
            }
        }
        this.JianPiaoKou = {}
        let num = 0
        this.GoNumAll = 0
        let num105 = 0
        for (let i in this.map_data) {
            let row = Number(i)


            // console.log(row);
            for (let x in this.map_data[row]) {
                let arrange = Number(x)
                let type = 1
                if (row <= this.map_size.row && arrange <= this.map_size.arrange) {
                    if ((arrange == 1 || arrange == this.map_size.arrange || row == this.map_size.row) && this.DTJLayer.layer <= 0) {
                        type = 105
                        num105++
                    } else {
                        num++

                    }
                }

                let node = this.map_data[i][x].node;
                if (this.Obstacle.F.indexOf(this.map_data[i][x].type) >= 0 || this.Obstacle['E'].indexOf(this.map_data[i][x].type) >= 0 || this.map_data[i][x].type == 11 || this.map_data[i][x].type == 12) {
                    this.map_data[row][arrange].child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
                }
                this.map_data[i][x].type = type;
                // 角色步数重新初始化
                this.map_data[i][x].go_num = row - 1
                this.map_data[row][arrange].child.getChildByName('go').active = true;
                this.map_data[row][arrange].child.scale = v3(1, 1, 1)
                this.map_data[row][arrange].child.getComponent(Sprite).enabled = true
                this.map_data[row][arrange].node.getComponent(Sprite).enabled = true
                this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).enabled = (this.YZZState) ? true : false;
                this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).string = this.map_data[i][x].go_num + ''
                this.GoNumAll += this.map_data[i][x].go_num;
                this.map_data[row][arrange].datas = []
                // 小熊节点隐藏
                if (node.getChildByName('bear')) {
                    node.getChildByName('bear').active = false
                }
                // 所有数据初始化为角色类型
                this.map_data[row][arrange].child.name = '' + type;
                this.map_data[row][arrange].child.active = true
                this.map_data[row][arrange].child.getComponent(Sprite).color = this.dataParent.getChildByName(type + "").getComponent(Sprite).color;

                // this.map_data[row][arrange].child.getComponent(Sprite).spriteFrame = this.dataParent.getChildByName('1').getComponent(Sprite).spriteFrame
                if (this.map_data[row][arrange].child.children.length > 1) {
                    for (let child of this.map_data[row][arrange].child.children) {
                        if (child.name != 'go') {
                            child.destroy()
                        }
                    }
                    // this.map_data[row][arrange].child.children[1]
                }


            }
        }
        this.refish_GoNum()
        this.allLabel[1].string = '压制值总和：' + this.GoNumAll;
        this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string = String(num)
        this.dataParent.getChildByName('105').getChildByName('count').getComponent(Label).string = String(num105)

        this.setPeopleCount()


    }
    // 数据导入
    import_RoleData(RoleData: EditBox) {
        if (!this.enter_map) {
            this.TipTween('请先导入对应地图数据')
            return
        }
        let colorData = JSON.parse(`["${this.replaceAll(RoleData.string, ",", '","')}"]`)
        for (let idx in this.role_map) {
            let node = this.role_map[idx].node.getChildByName('bear');
            if (!node) {
                node = instantiate(this.PeopleNode);
                this.role_map[idx].node.addChild(node)
            }
            let newscale = node.getComponent(UITransform).height / this.role_map[idx].node.getComponent(UITransform).height
            node.scale = v3(newscale, newscale, newscale);
            node.setPosition(v3(0, 0, 0))
            node.getComponent(Sprite).color = this.RoleColor[colorData[idx]]

        }
        this.enter_map = true;
    }
    private RoleColor = {
        "A": new Color(229, 555, 50), "B": new Color(225, 117, 67), "C": new Color(240, 166, 71), "D": new Color(255, 220, 25), "E": new Color(136, 238, 26), "F": new Color(53, 250, 193), "G": new Color(46, 214, 255), "H": new Color(70, 144, 239), "I": new Color(247, 160, 255), "J": new Color(221, 83, 242),
    }
    // 点击设置界面
    onSetting() {
        this.ContentNode[this.nowContent].active = false;
        this.nowContent = (this.nowContent == 1) ? 0 : 1;
        this.ContentNode[this.nowContent].active = true;
        if (this.nowContent == 0) {
            this.CloseAll()
        }
    }
    // 点击设置界面
    onLocking() {
        this.ContentNode[2].active = false
        this.MapId = null;
        this.ContentNode[this.nowContent].active = false;
        this.nowContent = (this.nowContent == 1) ? 0 : 1;
        this.ContentNode[this.nowContent].active = true;
        if (this.nowContent == 0) {
            // this.CloseAll()
        } else {
            if (!this.LayoutList.numItems || this.LayoutList.numItems <= 0) {
                this.LayoutList.numItems = Object.keys(this.yarn_mapLayoutData).length
            }
        }

        if (this.TieLianSuoState != 0) {
            this.dataParent.active = true
            this.allLabel[4].string = ""
            this.TieLianSuoState = 0

            // 被删除的（元素数 < 3）
            const removed = this.ChainData.filter(subArr => subArr.length < 3);
            for (let arr of removed) {
                for (let pos of arr) {
                    let data = this.map_data[pos[1]][pos[0]]
                    let suo = data.child.getChildByName("suo")
                    suo && suo.destroy()
                    let yao_shi = data.child.getChildByName("yao_shi")
                    yao_shi && yao_shi.destroy()
                }
            }
            this.ChainData = this.ChainData.filter(subArr => subArr.length >= 3);
        }

    }
    ListMoveTo(EditBox: EditBox) {
        let count = Number(EditBox.string)
        if (!isNaN(count)) {
            this.LayoutList.scrollTo(count - 1)
        }
    }
    private ChooseItemKey = null
    // 点击item
    onItem(event: Event,) {
        let target: any = event.target;
        this.onLocking()
        let data = this.yarn_mapLayoutData[target.name]
        this.ChainData = []
        this.ShowAll()
        // this.MapColorState = data["layout"].match(/[A-Z]/) != null ? 1 : 0
        this.MapColorState = data["ColorList"] ? 1 : 0

        this.ChooseKuang.active = this.MapColorState > 0 ? false : true
        this.dataJsonImport(data.layout)
        if (data.chain) {
            this.setChainData(data.chain)
        }
        this.MapId = target.name
    }
    setChainData(str, look?) {
        str = str.slice(0, -1);
        str = str.replaceAll("|", '],[')
        let data_str = JSON.parse("[[[" + this.replaceAll(str, ";", ']],[[') + "]]]");
        if (look) {
            return data_str
        }
        this.ChainData = data_str
        let key = 0
        for (let arr of data_str) {
            for (let i in arr) {
                let pos = arr[i]
                let node = null
                let data = this.map_data[pos[1]][pos[0]]

                if (Number(i) != 2) {
                    node = instantiate(this.node.getChildByPath("chain/suo"))
                } else {
                    node = instantiate(this.node.getChildByPath("chain/yao_shi"))
                }
                node.getChildByName('text').getComponent(Label).string = key + "";
                data.child.addChild(node)
            }
            key++
        }

        // for(let data of data)
        // 
        // 
    }
    ChangeChainData(pos) {
        let del_idx = -1
        for (let i in this.ChainData) {

            for (let arr of this.ChainData[i]) {
                if (arr[1] == pos[0] && arr[0] == pos[1]) {
                    del_idx = Number(i)
                    break
                }
            }
            if (del_idx > -1) break
        }
        if (del_idx > -1) {
            for (let arr of this.ChainData[del_idx]) {
                let data = this.map_data[arr[1]][arr[0]]
                let suo = data.child.getChildByName("suo")
                suo && suo.destroy()
                let yao_shi = data.child.getChildByName("yao_shi")
                yao_shi && yao_shi.destroy()
            }
            this.ChainData.splice(del_idx, 1);
        }
    }
    onList(item, idx) {
        let k = Object.keys(this.yarn_mapLayoutData)[idx]
        let data = this.yarn_mapLayoutData[k]
        const matches = data["layout"].match(/[A-Z]/g);
        let all_people = matches ? matches.length : 0
        item.getChildByName('text').getComponent(Label).string = 'ID:' + data.id;

        let color_count = matches ? [...new Set(matches)].length : 0
        item.getChildByName('ball_c').getComponent(Label).string = all_people + '球 ' + color_count + "色";

        let mapSize = new Size(200, 200)
        data.layout.indexOf("A")
        // item.getChildByName("Color").active = data["layout"].match(/[A-Z]/) != null

        item.getChildByName("Color").active = data["ColorList"] ? 1 : 0
        this.ItemSetMap(item, data.layout, mapSize, data.chain)
        item.name = k
        if (this.ChooseItemKey) {
            if (k == this.ChooseItemKey) {
                this.ChooseItem.parent = item
                this.ChooseItem.setPosition(v3(0, 0, 0))
                this.ChooseItem.active = true
            } else if (item.getChildByName('ChooseItem') && k != this.ChooseItemKey) {
                this.ChooseItem.active = false
            }
        }
        this.StateText.string = "编辑地图"
        this.ChangePosState = false
        this.ChangePos.active = false;
        this.TouchNode && (this.TouchNode.active = false);
        this.ChangePos.getChildByName("ChangePosOK").active = false;
    }
    onGameListBack() {
        this.GameList.node.active = false
        this.ShowType = null
    }
    onLookGameList() {
        this.ShowType = 'LevelConf'
        this.GameList.node.getChildByName('AllType').active = false
        this.GameList.node.active = true
        this.GameList.numItems = this.LevelConf.length;

        this.GameList.node.getChildByName('EditBox').getComponent(EditBox).placeholder = '关卡数'
        this.GameList.scrollTo(0)
    }
    private ShowType = null
    onAllMapDataList() {
        this.GameList.node.active = !this.GameList.node.active
        this.ShowType = (this.GameList.node.active) ? 'allMapData' : null;
        this.GameList.numItems = Object.keys(this.allMapDataType[this.nowLookMapSize]).length;
        this.GameList.node.getChildByName('AllType').active = (this.GameList.node.active) ? true : false;
        this.GameList.node.getChildByName('EditBox').getComponent(EditBox).placeholder = '配置id'
        this.GameList.scrollTo(0)

    }
    private nowLookMapSize = 'all'
    setLookMapSize(e, str) {
        if (str != 'all') {
            str = Number(str)
        }
        this.nowLookMapSize = str;
        this.GameList.numItems = Object.keys(this.allMapDataType[this.nowLookMapSize]).length;
        this.GameList.scrollTo(0)
    }
    setListMoveTo(EditBox: EditBox) {
        let count = Number(EditBox.string)
        if (!isNaN(count)) {
            if (this.ShowType == 'LevelConf') {
                for (let i in this.LevelConf) {
                    let data = this.LevelConf[i]
                    if (Number(data[0]) == count) {
                        this.GameList.scrollTo(Number(i))
                        return
                    }
                }
                EditBox.string = ''
                this.TipTween('不存在此关卡')
            } else {
                if (this.allMapDataType[this.nowLookMapSize][count]) {
                    let idx = Object.keys(this.allMapDataType[this.nowLookMapSize]).indexOf(count + '')
                    this.GameList.scrollTo(idx - 1)
                } else {
                    if (!this.allMapDataType['all'][count]) {
                        this.TipTween('当前id表中未存在')
                        EditBox.string = ''
                        return
                    } else {
                        this.nowLookMapSize = 'all';
                        this.GameList.numItems = Object.keys(this.allMapDataType[this.nowLookMapSize]).length;
                        let idx = Object.keys(this.allMapDataType[this.nowLookMapSize]).indexOf(count + '')
                        this.GameList.scrollTo(0)
                        this.scheduleOnce(() => {
                            this.GameList.scrollTo(idx - 1)
                        })
                    }
                }
            }
            EditBox.string = ''
        } else {
            EditBox.string = ''
        }
    }
    onGameList(item, idx) {
        // if (this.ShowType == 'LevelConf') {
        //     let next = true
        //     if (!this.levelJsonData[this.LevelConf[idx]]) {
        //         item.getChildByName('text').getComponent(Label).string = `level表中${this.LevelConf[idx]}不存在`;
        //         next = false
        //     } else if (!this.yarn_mapLayoutData[this.levelJsonData[this.LevelConf[idx]].mapLayoutID]) {
        //         item.getChildByName('text').getComponent(Label).string = `Layout表中${this.levelJsonData[this.LevelConf[idx]].mapLayoutID}不存在`;
        //         next = false
        //     }
        //     if (!next) {
        //         let Map = item.getChildByName('Map')
        //         for (let child of Map.children) {
        //             child.getComponent(Sprite).enabled = true
        //             child.children[0].getComponent(Sprite).enabled = true
        //             child.children[0].destroyAllChildren()
        //             child.children[0].getComponent(Sprite).color = new Color('#FFFFFF')
        //             child.children[0].name = '1'
        //             child.active = false
        //         }
        //         return
        //     }
        // }
        let data = this.LevelConf[idx]
        let str = data[0] + '-' + data[1] + ":地图:" + data[2]
        item.getChildByName('text').getComponent(Label).string = str;
        let mapSize = new Size(246, 236)
        let layout = this.yarn_mapLayoutData[data[2]].layout
        // if (this.ShowType != 'LevelConf') {
        //     if (!this.yarn_mapLayoutData[data.layout]) {
        //         item.getChildByName('text').getComponent(Label).string = `Layout表中${data.layout}不存在`;
        //         let Map = item.getChildByName('Map')
        //         for (let child of Map.children) {
        //             child.getComponent(Sprite).enabled = true
        //             child.children[0].getComponent(Sprite).enabled = true
        //             child.children[0].destroyAllChildren()
        //             child.children[0].getComponent(Sprite).color = new Color('#FFFFFF')
        //             child.children[0].name = '1'
        //             child.active = false
        //         }
        //         return
        //     }
        //     layout = this.yarn_mapLayoutData[data.layout].layout
        // }

        this.ItemSetMap(item, layout, mapSize, this.yarn_mapLayoutData[data[2]].chain)
    }
    // 
    ItemSetMap(item, data, mapSize, chain?) {

        let handle = this.HandleConf(data)
        let new_data = handle.map
        let map_size = handle.size
        let Map = item.getChildByName('Map')
        let node = Map.children[0];
        let mapLayout = Map.getComponent(Layout)
        let newWidth = null;
        let newHeight = null;
        if (mapSize) {
            newWidth = (mapSize.width - mapLayout.paddingLeft - mapLayout.paddingRight - ((map_size.arrange - 1) * mapLayout.spacingX)) / map_size.arrange - 0.5
            newHeight = (mapSize.height - mapLayout.paddingTop - mapLayout.paddingBottom - ((map_size.row - 1) * mapLayout.spacingY)) / map_size.row
        }
        if (newWidth < newHeight) {
            newHeight = newWidth
        } else {
            newWidth = newHeight
        }
        if (mapSize) {
            Map.getComponent(UITransform).width = newWidth * map_size.arrange + (1 * (map_size.arrange - 1)) + 6
        }
        let newNodeSize = new Size(newWidth, newHeight)
        let STTKey = {}
        let STTKeyArr = []
        let first = true
        for (let child of Map.children) {
            // if(!first){
            //     child.destroy()
            // }else{

            //     first = false
            // }
            child.getComponent(Sprite).enabled = true
            child.children[0].getComponent(Sprite).enabled = true
            child.children[0].destroyAllChildren()
            child.children[0].getComponent(Sprite).color = new Color('#FFFFFF')
            child.children[0].name = '1'
            child.active = false
            // 
        }

        if (newNodeSize) {
            node.getComponent(UITransform).setContentSize(newNodeSize);
        }
        let map_data = []
        let nodeIdx = 0
        let NoPushDTJ = []
        let DTJ = []
        let LiftExportData = {}
        for (let y = 1; y <= map_size.row; y++) {
            if (!map_data[y]) {
                map_data[y] = []
            }
            for (let x = 1; x <= map_size.arrange; x++) {
                let name_key = nodeIdx + '';
                if (!Map.getChildByName(name_key)) {
                    node = instantiate(node);
                    Map.addChild(node);
                    node.name = name_key
                } else {
                    node = Map.getChildByName(name_key)
                }
                node.getComponent(UITransform).setContentSize(newNodeSize);
                node.active = true;
                let newChild = node.getChildByName('1')
                newChild.getComponent(UITransform).setContentSize(newNodeSize);
                newChild.setPosition(v3(0, 0));
                let data = {
                    node: node,
                    idx: [y, x],
                    type: 1,
                    child: newChild,
                }
                map_data[y][x] = data;
                nodeIdx += 1
            }
        }
        for (let idx of new_data) {
            idx[2] = CreateRole.RestoreFixedData[idx[2]] ? CreateRole.RestoreFixedData[idx[2]] : idx[2]
            map_data[idx[1]][idx[0]].type = idx[2];
            let node = map_data[idx[1]][idx[0]].node;
            map_data[idx[1]][idx[0]].child.name = idx[2] + '';
            if (this.dataParent.getChildByName(idx[2] + '')) {
                // if (idx[2] == 31) {
                //     let Ice = instantiate(this.IceNode)
                //     map_data[idx[1]][idx[0]].child.addChild(Ice);
                //     Ice.getComponent(UITransform).setContentSize(this.map_data[idx[1]][idx[0]].child.getComponent(UITransform).contentSize)
                //     Ice.active = true;
                //     Ice.getChildByName("count").getComponent(Label).string = "";

                // } else {
                map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).color;
                // }
            }
            let LiftExportCount = 0
            let key = idx[1] + '-' + idx[0]
            if (idx[2] == 131) {
                for (let I = 4; I < idx.length; I++) {
                    let d = idx[I];


                    if (!LiftExportData[key]) {
                        LiftExportData[key] = []
                    }
                    LiftExportData[key].push(d)

                }
            }

            if (map_data[idx[1]][idx[0]].child.children.length > 1) {
                map_data[idx[1]][idx[0]].child.children[1].name != "go" && map_data[idx[1]][idx[0]].child.children[1].destroy()
            }
            map_data[idx[1]][idx[0]].child.getComponent(UITransform).setContentSize(newNodeSize);
            if (idx[2] == 99 || idx[2] == 62 || idx[2] == 65 || idx[2] == 66) {
                map_data[idx[1]][idx[0]].node.getComponent(Sprite).enabled = false
                map_data[idx[1]][idx[0]].child.getComponent(Sprite).enabled = false
            }
            if (67 >= idx[2] && idx[2] >= 61) {
                if (idx[2] == this.Obstacle.JianPiaoKey) {
                    let newChild = null
                    let k = map_data[idx[1] - 1][idx[0]].type
                    if (this.Obstacle.E.indexOf(k) >= 0) {
                        newChild = instantiate(this.dataParent.getChildByName(k + ''))
                    } else if (this.Obstacle.E.indexOf(map_data[idx[1]][idx[0] - 1].type) >= 0) {
                        k = 61
                        newChild = instantiate(this.dataParent.getChildByName('61'))
                    }
                    if (newChild) {
                        newChild.getChildByName('name').active = false;
                        newChild.getChildByName('count').active = false;
                        newChild.getComponent(Button).enabled = false;
                        map_data[idx[1]][idx[0]].child.addChild(newChild);
                        newChild.setPosition(v3(0, 0));
                        if (this.obstacleOrther[k]) {
                            let infeed = (this.obstacleOrther[k][0] == 0) ? true : false
                            if (infeed) {
                                newChild.getComponent(UITransform).width = newNodeSize.width * Number(this.obstacleOrther[k][1])
                            } else {
                                infeed = false
                                newChild.getComponent(UITransform).height = newNodeSize.height * Number(this.obstacleOrther[k][1])
                            }
                            newChild.scale = v3(1.18, 1.18, 1.18)
                        }
                        newChild.active = true
                    }
                }
            } else if (this.TypeorAddChild(idx[2])) {
                let newChild = instantiate(this.dataParent.getChildByName(idx[2] + ''))
                newChild.active = true
                newChild.getChildByName('name').active = false;
                newChild.getChildByName('count').active = false;
                newChild.getComponent(UITransform).setContentSize(newNodeSize);
                newChild.getComponent(Button).enabled = false;

                map_data[idx[1]][idx[0]].child.addChild(newChild);
                newChild.setPosition(v3(0, 0));
                map_data[idx[1]][idx[0]].child.getComponent(UITransform).setContentSize(newNodeSize);
                if (this.obstacleOrther[idx[2]]) {

                    let infeed = (this.obstacleOrther[idx[2]][0] == 0) ? true : false
                    if (infeed) {
                        newChild.getComponent(UITransform).width = newNodeSize.width * Number(this.obstacleOrther[idx[2]][1])
                    } else {
                        infeed = false
                        newChild.getComponent(UITransform).height = newNodeSize.height * Number(this.obstacleOrther[idx[2]][1])
                    }
                    newChild.active = true
                }
                newChild.scale = v3(1.18, 1.18, 1.18)
            } else if (this.Obstacle.E.indexOf(idx[2]) >= 0) {
                map_data[idx[1]][idx[0]].child.getComponent(Sprite).spriteFrame = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).spriteFrame;
            } else if (this.Obstacle.F.indexOf(idx[2]) >= 0) {

                STTKeyArr.push({ y: idx[1], x: idx[0] })

            } else if (this.Obstacle['DTJ'].indexOf(idx[2]) >= 0) {
                let namekey = idx[1] + '-' + idx[0]
                if (NoPushDTJ.indexOf(namekey) < 0) {
                    for (let Y = 0; Y < this.DoubleLiftType[idx[2]][1]; Y++) {
                        for (let X = 0; X < this.DoubleLiftType[idx[2]][0]; X++) {
                            let Y_new = idx[1] + Y
                            let X_new = idx[0] + X
                            let name = Y_new + "-" + X_new
                            NoPushDTJ.push(name)
                        }
                    }
                    DTJ.push(idx)
                }
            }
        }
        if (DTJ.length > 0) {
            for (let idx of DTJ) {
                for (let Y = 0; Y < this.DoubleLiftType[idx[2]][1]; Y++) {
                    for (let X = 0; X < this.DoubleLiftType[idx[2]][0]; X++) {
                        let Y_new = idx[1] + Y
                        let X_new = idx[0] + X
                        map_data[Y_new][X_new].type = idx[2]
                        map_data[Y_new][X_new].child.name = '' + idx[2]
                        map_data[Y_new][X_new].child.getComponent(Sprite).color = new Color('#6C88F8')
                    }
                }
            }
        }
        if (STTKeyArr.length > 0) {
            for (let pos of STTKeyArr) {
                let getlast_key = this.getLastDoublePos(pos.y, pos.x)
                if (!STTKey[getlast_key.y + '_' + getlast_key.x]) {
                    STTKey[getlast_key.y + '_' + getlast_key.x] = {
                        pos: { y: getlast_key.y, x: getlast_key.x },
                        type: getlast_key.type
                    }
                }
            }

            for (let k in STTKey) {
                let LastPos = STTKey[k].pos
                let w = this.DoubleLiftType[STTKey[k].type][0]
                let h = this.DoubleLiftType[STTKey[k].type][1]
                for (let y = LastPos.y; y > LastPos.y - h; y--) {
                    for (let x = LastPos.x; x > LastPos.x - w; x--) {
                        map_data[y][x] && (map_data[y][x].child.getComponent(Sprite).color = new Color('#FF8F53'))
                        if (y == LastPos.y) {
                            map_data[y][x].child.getComponent(Sprite).spriteFrame = this.dataParent.getChildByName(STTKey[k].type + '').getComponent(Sprite).spriteFrame;
                        }
                    }
                }

            }
        }
        if (chain) {
            let ChainData = this.setChainData(chain, true)
            let key = 0
            for (let arr of ChainData) {
                for (let i in arr) {
                    let pos = arr[i]
                    let node = null
                    let data = map_data[pos[1]][pos[0]]

                    if (Number(i) != 2) {
                        node = instantiate(this.node.getChildByPath("chain/suo"))
                    } else {
                        node = instantiate(this.node.getChildByPath("chain/yao_shi"))
                    }
                    node.scale = v3(0.5, 0.5, 1)
                    node.getChildByName('text').getComponent(Label).string = key + "";
                    data.child.addChild(node)
                }
                key++
            }
        }
        if (Object.keys(LiftExportData).length > 0) {
            for (let key in LiftExportData) {
                for (let arr of LiftExportData[key]) {
                    let data = map_data[arr[0]][arr[1]]
                    let node = instantiate(this.dataParent.getChildByName('131'))
                    node.destroyAllChildren();
                    node.getComponent(Button) && node.getComponent(Button).destroy();
                    node.getComponent(UITransform).setContentSize(new Size(5, 5))
                    data.child.addChild(node)
                    node.setPosition(v3(0, 0))
                    node.active = true
                }
            }
        }
    }

    RoleDataImport(data) {
        let colorData = JSON.parse(`["${this.replaceAll(data, ",", '","')}"]`)
        let RoleArr = []
        for (let idx in this.role_map) {
            let node = this.role_map[idx].node.getChildByName('bear');
            if (!node) {
                node = instantiate(this.PeopleNode);
                this.role_map[idx].node.addChild(node)
            }
            let newscale = this.role_map[idx].node.getComponent(UITransform).height / node.getComponent(UITransform).height
            node.scale = v3(newscale, newscale, newscale);
            node.setPosition(v3(0, 0, 0))
            node.getComponent(Sprite).color = this.RoleColor[colorData[idx]]
            if (!RoleArr[this.role_map[idx].idx[0]]) {
                RoleArr[this.role_map[idx].idx[0]] = []
            }
            RoleArr[this.role_map[idx].idx[0]][this.role_map[idx].idx[1]] = [this.role_map[idx].idx[1], colorData[idx]]
            node.active = true;
            node.setSiblingIndex(this.role_map[idx].node.children.length);
        }
    }
    /**点击围栏的区域*/
    onFence(data, DataType) {
        let getObstacle = (idx) => {
            let lift = this.map_data[idx[0]][idx[1] - 1]
            let right = this.map_data[idx[0]][idx[1] + 1]
            let up = this.map_data[idx[0] - 1][idx[1] - 1]
            let down = this.map_data[idx[0] + 1][idx[1] - 1]
            if (lift && this.obstacleOrther[lift.type]) {
                return lift
            } else if (right && this.obstacleOrther[right.type]) {
                return right
            } else if (up && this.obstacleOrther[up.type]) {
                return up
            } else if (down && this.obstacleOrther[down.type]) {
                return down
            } else if (this.obstacleOrther[DataType]) {
                return this.map_data[idx[0]][idx[1]]
            }
            if (lift && lift.type == 99) {
                return getObstacle(lift.idx);
            } else if (right && right.type == 99) {
                return getObstacle(right.idx);
            } else if (up && up.type == 99) {
                return getObstacle(up.idx);
            } else if (down && down.type == 99) {
                return getObstacle(down.idx);
            }
        }
        let Obstacle = getObstacle(data.idx)
        if (!Obstacle) return
        let KeyType = Obstacle.type
        if (this.obstacleOrther[DataType]) {
            KeyType = DataType
        }
        let orther = (this.obstacleOrther[KeyType][1]) / 2
        let infeed = (this.obstacleOrther[KeyType][0] == 0) ? true : false
        let count_label = this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label)
        for (let i = 1; i < orther; i++) {
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] + i][(infeed) ? Obstacle.idx[1] + i : Obstacle.idx[1]].type = 1;
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] + i][(infeed) ? Obstacle.idx[1] + i : Obstacle.idx[1]].child.getComponent(Sprite).enabled = true
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] + i][(infeed) ? Obstacle.idx[1] + i : Obstacle.idx[1]].node.getComponent(Sprite).enabled = true
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] + i][(infeed) ? Obstacle.idx[1] + i : Obstacle.idx[1]].child.getChildByName('go').active = true
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] + i][(infeed) ? Obstacle.idx[1] + i : Obstacle.idx[1]].child.getComponent(Sprite).color = new Color('#DBEEF3')
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] + i][(infeed) ? Obstacle.idx[1] + i : Obstacle.idx[1]].child.name = '1'
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] - i][(infeed) ? Obstacle.idx[1] - i : Obstacle.idx[1]].type = 1
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] - i][(infeed) ? Obstacle.idx[1] - i : Obstacle.idx[1]].child.getComponent(Sprite).enabled = true
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] - i][(infeed) ? Obstacle.idx[1] - i : Obstacle.idx[1]].node.getComponent(Sprite).enabled = true
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] - i][(infeed) ? Obstacle.idx[1] - i : Obstacle.idx[1]].child.getChildByName('go').active = true
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] - i][(infeed) ? Obstacle.idx[1] - i : Obstacle.idx[1]].child.getComponent(Sprite).color = new Color('#DBEEF3')
            this.map_data[(infeed) ? Obstacle.idx[0] : Obstacle.idx[0] - i][(infeed) ? Obstacle.idx[1] - i : Obstacle.idx[1]].child.name = '1'
            count_label.string = String(Number(count_label.string) + 2);
        }
        Obstacle.child.getChildByName(String(KeyType)) && Obstacle.child.getChildByName(String(KeyType)).destroy()
        Obstacle.type = 1
        Obstacle.child.name = '1'
        Obstacle.child.getChildByName('go').active = true
        Obstacle.child.getComponent(Sprite).color = new Color('DBEEF3')
        Obstacle.child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
        let size = this.Map.children[0].getComponent(UITransform).contentSize
        Obstacle.child.getComponent(UITransform).setContentSize(size);
        count_label.string = String(Number(count_label.string) + 1);
        this.setNewData(this.map_data[data.idx[0]][data.idx[1]])
    }
    /**清空双头梯*/
    ClearDoubleLadder(y, x) {
        let LastPos = this.getLastDoublePos(y, x)
        let w = this.DoubleLiftType[LastPos.type][0]
        let h = this.DoubleLiftType[LastPos.type][1]
        for (let y = LastPos.y; y > LastPos.y - h; y--) {
            for (let x = LastPos.x; x > LastPos.x - w; x--) {
                this.map_data[y][x].type = 1
                this.map_data[y][x].child.name = '1'
                this.map_data[y][x].child.getChildByName('go').active = true
                this.map_data[y][x].child.getComponent(Sprite).color = new Color('DBEEF3')
                this.map_data[y][x].child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame
                this.map_data[y][x].datas = []
            }
        }
    }
    getLastDoublePos = (y, x) => {
        let lastPos = (posY, posX, Type) => {
            let nextX = posX + 1
            if (!this.map_data[posY][nextX] || this.map_data[posY][nextX].type != Type) {
                return { y: posY, x: posX, type: Type }
            } else if (this.map_data[posY][nextX].type == Type) {
                return lastPos(posY, nextX, Type)
            }
        }
        if (y < this.map_size.row) {
            for (let i = this.map_size.row; i >= y; i--) {
                if (this.Obstacle['F'].indexOf(this.map_data[i][x].type) >= 0 && i - (this.map_data[i][x].type - 67) <= y) {
                    return lastPos(i, x, this.map_data[i][x].type)
                }
            }
        }
    }
    /**获取安检ID*/
    getAnJianID(id, up_right?) {
        if (id == 61) {
            return (up_right) ? 61 : 62;
        } else if (id == 63) {
            return (up_right) ? 63 : 65;
        } else if (id == 64) {
            return (up_right) ? 64 : 66;
        }
    }
    /**存在安检*/
    HaveAnJian(y, x) {
        let keyArr = [61, 62, 63, 64, 65, 66, 67]
        let type = this.map_data[y][x].type
        let needKey = []
        if (keyArr.indexOf(type) >= 0) {
            needKey.push([y, x])
            let Key = [y, x]
            if (type == this.Obstacle.JianPiaoKey) {
                if (this.map_data[y - 1][x].type == 63 || this.map_data[y - 1][x].type == 64) {
                    needKey.push([y + 1, x])
                    needKey.push([y - 1, x])
                } else if (this.map_data[y][x - 1].type == 61) {
                    needKey.push([y, x - 1])
                    needKey.push([y, x + 1])
                }
            } else if (type == 63 || type == 64) {
                needKey.push([y + 1, x])
                needKey.push([y + 2, x])
                Key = [y + 1, x]
            } else if (type == 65 || type == 66) {
                needKey.push([y - 1, x])
                needKey.push([y - 2, x])
                Key = [y - 1, x]
            } else if (type == 61) {
                needKey.push([y, x + 1])
                needKey.push([y, x + 2])
                Key = [y, x + 1]
            } else if (type == 62) {
                needKey.push([y, x - 1])
                needKey.push([y, x - 2])
                Key = [y, x - 1]
            }
            if (this.JianPiaoKou[Key[0] + '_' + Key[1]].keyPos) {
                needKey.push(this.JianPiaoKou[Key[0] + '_' + Key[1]].keyPos)
            }
            for (let idx of needKey) {
                let idx_key = this.map_data[idx[0]][idx[1]].type + 0

                this.map_data[idx[0]][idx[1]].type = 1
                this.map_data[idx[0]][idx[1]].child.name = '1'
                for (let child of this.map_data[idx[0]][idx[1]].child.children) {
                    if (child.name == 'go') {
                        child.active = false
                        child.getComponent(Label).enabled = (this.YZZState) ? true : false;
                    } else {
                        child.destroy()
                    }
                }

                this.map_data[idx[0]][idx[1]].child.getComponent(Sprite).enabled = true
                this.map_data[idx[0]][idx[1]].node.getComponent(Sprite).enabled = true
                this.map_data[idx[0]][idx[1]].child.active = true;
                this.map_data[idx[0]][idx[1]].child.getComponent(Sprite).color = new Color('DBEEF3')
                this.map_data[idx[0]][idx[1]].child.getComponent(Sprite).spriteFrame = this.Map.children[0].children[0].getComponent(Sprite).spriteFrame;
                if (this.dataParent.getChildByName(idx_key + '')) {
                    let ComLabel = this.dataParent.getChildByName(idx_key + '').getChildByName('count').getComponent(Label)
                    ComLabel.string = (Number(ComLabel.string) - 1) + ''
                }

            }
            delete this.JianPiaoKou[Key[0] + '_' + Key[1]]
            return true
        }
        return false
    }
    setDTJLayer() {
        this.DTJLayer.layer -= 1
        if (this.DTJLayer.layer > 0) {
            for (let item of this.dataParent.children) {
                item.active = true
            }
            for (let key in this.Obstacle) {
                if (key != 'Role' && key != 'JianPiaoKey') {
                    for (let id of this.Obstacle[key]) {
                        let roleW = [1, 2, 31, 10]
                        if (roleW.indexOf(id) < 0) {
                            this.dataParent.getChildByName(String(id)).active = false
                        }
                    }
                }
            }
            this.dataParent.getChildByName('Mask').active = true
            this.ChooseKuang.active = false;
            this.dataParent.getChildByName('all').active = false
            this.map_size.row = this.DTJLayer.size[1]
            this.map_size.arrange = this.DTJLayer.size[0]
            this.Map.scale = v3(0.4, 0.4, 0.4)
            this.CloseAll()
            this.scheduleOnce(() => {
                this.MapChange()
            }, 0.05)
        } else {
            this.Map.scale = v3(1, 1, 1)
            this.dataJsonImport(this.DTJLayer.data, true);
            // this.map_size.row = this.DTJLayer.row
            // this.map_size.arrange = this.DTJLayer.arrange

        }

        // 
        //


        // layer_data
    }
    SaveMapData() {

        const data = [
            ["ID", "大小", "填充顺序", "总人数", "问号人", "电梯", "走线难度", "走线队列", "地图数据", "铁链锁"], ["id", "size", "ColorList", "all_people", "qusition", "lift", "walk_diff", "walk_list", "layout", "exLayout"]
            // ["ID", "大小", "地图数据", "角色库", "锁链数据"], ["id", "size", "layout", "roles", "chain"]
        ];
        let lifts = [6, 7, 8, 9, 116, 117, 118, 119]
        let DTJS = [101, 102, 103, 104, 112, 113, 114, 115]
        for (let k in this.yarn_mapLayoutData) {
            let d = this.yarn_mapLayoutData[k]
            let new_d = JSON.parse(JSON.stringify(d))
            let ColorList = new_d["ColorList"] ? new_d["ColorList"] : "";
            let Role = (new_d.roles) ? new_d.roles.split(",") : []
            if (Role.length == 1) {
                if (Role[0] == "") {
                    Role = []
                }
            }
            let RoleLens = Role.length
            const matches = new_d.layout.match(/[A-Z]/g);
            let all_people = matches ? matches.length + RoleLens : 0 + RoleLens
            // data[data.length - 1].push()
            let new_data = this.HandleConf(new_d.layout).map
            let qusition = 0
            let lift = 0

            for (let arr of new_data) {
                for (let i = 2; i < arr.length; i++) {
                    let t = arr[i]
                    if (t == 10 || t == 111) {
                        qusition++
                    } else if (lifts.indexOf(t) >= 0) {
                        lift++
                        if (t < 10) {
                            break
                        }
                    }
                }
            }
            let chain = "";
            if (d.chain) {
                console.log("铁链锁",);
                let d_chain = this.setChainData(d.chain, true)
                let chain_data = {
                    lock: []
                }
                for (let d of d_chain) {
                    let obj_chain = {
                        startPos: d[0][0]+","+ d[0][1],
                        endPos: d[1][0]+","+d[1][1],
                        keyPos: d[2][0]+","+ d[2][1]
                    }
                    chain_data.lock.push(obj_chain)
                }
                chain =JSON.stringify(chain_data)
                console.log(chain);
            }
            let walk_diff = d["WalkValue"] ? d["WalkValue"] : "";
            let walk_list = d["WalkValueChange"] ? d["WalkValueChange"] : "";
            data.push([d.id, d.size, ColorList, all_people, qusition == 0 ? "" : qusition, lift == 0 ? "" : lift, walk_diff, walk_list, d.layout, chain])
        }
        GameUtil.getCsv(data, "YarnMapData")

    }
    AddMapData() {
        this.onLocking()
        this.getNextMapId()
        this.map_size = {
            arrange: this.MapType.map3.arrange,
            row: this.MapType.map3.row,
        }
        this.Map.scale = v3(1, 1, 1);
        this.DTJLayer = new DTJLayerData
        this.setDTJChooseState(false)
        this.CloseAll()
        this.EditOrder.active = false;
        this.scheduleOnce(() => {
            this.MapChange()
        }, 0.05)
    }
    saveDTJLayer() {

        let data = this.getNowData();
        let map_D = this.HandleConf(this.DTJLayer.data).map
        let w = this.DTJLayer.size
        let h = this.DTJLayer.size
        let mapD = {}
        for (let d of map_D) {
            if (!mapD[d[1]]) {
                mapD[d[1]] = {}
            }
            if (!mapD[d[1]][d[0]]) {
                mapD[d[1]][d[0]] = []
            }
            for (let i = 2; i <= d.length - 1; i++) {
                mapD[d[1]][d[0]].push(d[i])
            }
        }
        for (let y = 1; y <= this.map_size.row; y++) {
            for (let x = 1; x <= this.map_size.arrange; x++) {
                mapD[(y - 1) + this.DTJLayer.YX[0]][(x - 1) + this.DTJLayer.YX[1]].push(this.map_data[y][x].type)
            }
        }
        let datastr = ''
        for (let y = 1; y <= this.DTJLayer.row; y++) {
            for (let x = 1; x <= this.DTJLayer.arrange; x++) {
                datastr += x + "," + y
                for (let k of mapD[y][x]) {
                    datastr += "," + k
                }
                datastr += ';'
            }
        }
        this.DTJLayer.data = datastr;
        this.setDTJLayer()

    }
    setLiftCount(e: EditBox) {
        let count = Number(e.string);
        let Name = e.node.name;
        let arr = JSON.parse("[" + Name.replace(/_/g, ',') + "]");
        let lift = this.map_data[arr[0]][arr[1]].type != 131
        if (isNaN(count)) {
            count = lift ? 3 : 2
            e.string = 3 + "";
            this.TipTween('输入正确数字');
        }
        if (lift) {
            this.map_data[arr[0]][arr[1]].datas = [count]
        } else {
            this.map_data[arr[0]][arr[1]]["FixedData"][0] = count;
        }

        this.setPeopleCount()
    }
    onItemBtn(event, str) {
        let target: any = event.target;
        let key = target.parent.parent.name
        if (target.name == "delItem") {
            delete this.yarn_mapLayoutData[key]
            GameUtil.ChangeStorage(true, 'yarn_mapLayoutData', this.yarn_mapLayoutData)
            target.parent.parent.getChildByName('ItemPage').active = false
            this.initMapLayoutData()

        } else if (target.name == "copy") {
            let Keys = Object.keys(this.yarn_mapLayoutData)
            let newK = Number(Keys[Keys.length - 1]) + 1;
            this.yarn_mapLayoutData[newK] = JSON.parse(JSON.stringify(this.yarn_mapLayoutData[key]))
            this.yarn_mapLayoutData[newK].id = newK
            GameUtil.ChangeStorage(true, 'yarn_mapLayoutData', this.yarn_mapLayoutData)
            this.initMapLayoutData()
        } else if (target.name == "ChangeType") {
            let ItemPage = target.parent.getChildByName('ItemPage')
            ItemPage.active = !ItemPage.active
        }
    }
    setItemNewId(e: EditBox) {
        let count = Number(e.string);
        if (isNaN(count)) {
            e.string = "";
            this.TipTween('输入正确ID数字');
        } else {
            if (this.yarn_mapLayoutData[count]) {
                this.TipTween("ID冲突，请删除原ID")
            } else {
                let key = e.node.parent.parent.name
                this.yarn_mapLayoutData[count] = JSON.parse(JSON.stringify(this.yarn_mapLayoutData[key]))
                this.yarn_mapLayoutData[count].id = count

                this.scheduleOnce(() => {
                    delete this.yarn_mapLayoutData[key]
                    this.initMapLayoutData()
                })
                GameUtil.ChangeStorage(true, 'yarn_mapLayoutData', this.yarn_mapLayoutData)
                let ItemPage = e.node.parent.parent.getChildByName('ItemPage')
                ItemPage.active = false
            }
        }
    }
    onCutDTJShow(event, str) {
        let target: any = event.target;
        this.DTJShowLayer = this.DTJShowLayer == 1 ? 2 : 1;
        target.getChildByName('text').getComponent(Label).string = this.DTJShowLayer + "层"
        for (let Item of this.DTJMap.children) {
            for (let child of Item.children) {
                child.active = (Number(child.name) == this.DTJShowLayer)
            }
        }
    }
    // 
    update(deltaTime: number) {

    }
    ChangeJson() {

    }
    onFixedLift() {
        this.ContentNode[0].active = false
        this.ContentNode[2].active = true
        this.FixedLiftState.state = true
        this.FixedLift.active = false
        for (let y in this.map_data) {
            for (let x in this.map_data[y]) {
                let data = this.map_data[y][x]
                if (data.type < 10 && data.type > 5) {
                    this.setChangeLiftColor(data)
                    // return
                }
            }
        }
    }
    setChangeLiftColor(data) {
        this.ContentNode[2].getChildByName("text").getComponent(Label).string = "电梯:" + data.idx[1] + "-" + data.idx[0];
        let LiftColor = this.ContentNode[2].getChildByName("LiftColor")
        this.FixedLiftState.idx = data.idx

        for (let child of LiftColor.children) {
            child.active = false
        }
        let idx = 0
        for (let i = 3; i < data.json.length; i++) {
            let c = TitleType.indexOf(data.json[i]) + 1
            let node = LiftColor.children[idx]
            if (!node) {
                node = instantiate(LiftColor.children[0])
                LiftColor.addChild(node)
            }
            node.active = true
            node.getComponent(Sprite).color = new Color(CellToColor[c])
            node.name = data.json[i] + ""
            if (idx == 0) {
                this.FixedLiftState.item = node
                this.ContentNode[2].getChildByName("ChooseColor").setWorldPosition(node.getWorldPosition().clone())
            }
            idx++
        }
    }
    onSetLiftColor(e) {
        let target = e.target
        this.ContentNode[2].getChildByName("ChooseColor").setWorldPosition(target.getWorldPosition().clone())
        this.FixedLiftState.item = target
    }
    changeLiftColor(e) {
        let target = e.target
        if (!this.FixedLiftState.item) return
        let idx = this.FixedLiftState.item.getSiblingIndex()
        if (target.name == "up") {
            idx += 1
            this.FixedLiftState.item.setSiblingIndex(idx)
        } else {
            idx -= 1
            this.FixedLiftState.item.setSiblingIndex(idx)
        }
        this.scheduleOnce(() => {
            this.ContentNode[2].getChildByName("ChooseColor").setWorldPosition(this.FixedLiftState.item.getWorldPosition().clone())
            let LiftColor = this.ContentNode[2].getChildByName("LiftColor")
            let newJson = this.map_data[this.FixedLiftState.idx[0]][this.FixedLiftState.idx[1]].json.slice(0, 3)
            for (let child of LiftColor.children) {
                if (child.active) {
                    newJson.push(child.name)
                }
            }
            this.map_data[this.FixedLiftState.idx[0]][this.FixedLiftState.idx[1]].json = newJson;
            // this.SaveChangeLift()
        }, 0.1)
    }
    SaveChange() {
        let layout = ""
        for (let y in this.map_data) {
            for (let x in this.map_data[y]) {
                let data = this.map_data[y][x].json
                let i = 0
                for (let k of data) {
                    if (i >= 2 && CreateRole.FixedData[k]) {
                        k = CreateRole.FixedData[k]
                    }
                    layout += k + ",";

                    i++
                }
                layout = layout.slice(0, layout.length - 1)
                layout += ";"

            }
        }
        layout = layout.slice(0, layout.length - 1)
        this.yarn_mapLayoutData[this.MapId].layout = layout
        GameUtil.ChangeStorage(true, "yarn_mapLayoutData", this.yarn_mapLayoutData)
    }
    ImportData() {
        this.ContentNode[3].getComponent(DragDropExample).init(() => {
            this.yarn_mapLayoutData = GameUtil.ChangeStorage(false, "yarn_mapLayoutData")
            this.initGameData()
        })
        this.ContentNode[3].active = true

    }
    setMapColor() {
        this.ColorList = []
        this.MapColor.getChildByName("Save").active = false

        // for (let child of this.Map.children) {
        //     let new_child = instantiate(child)
        //     this.MapColor.addChild(new_child)
        // }
        this.MapColor.active = true
        this.MapColorState = this.setPeopleCount()
        this.ContentNode[0].active = false
        this.dataJsonImport(this.yarn_mapLayoutData[this.MapId].layout)
        if (this.yarn_mapLayoutData[this.MapId].chain) {
            this.setChainData(this.yarn_mapLayoutData[this.MapId].chain)
        }
        const matches = this.yarn_mapLayoutData[this.MapId].layout.match(/[A-Z]/g);
        let all_people = matches ? matches.length : 0
        let color_count = matches ? [...new Set(matches)].length : 0
        this.ChangePos.active = true
        this.StateText.string = "编辑顺序"
        this.MapValueData = {
            BallColorValue: {},//球颜色最优间隔
            AverageYZZValue: 0,//平均压制值
            YZZValue: this.GoNumAll,//总压制值
            YZZChange: [this.GoNumAll],//所有压制值变化队列
            BallColorChange: {},//点击球的步数值
            WalkDiffChange: [],//走线难度变化
            WalkDiffValue: 0,//走线难度值
        }
        let AllBall = {
        }
        for (let c of matches) {
            if (!this.MapValueData.BallColorChange[c]) {
                this.MapValueData.BallColorChange[c] = {
                    value: 0,
                    change: []
                }
            }
            if (!AllBall[c]) {
                AllBall[c] = 0
            }
            AllBall[c] += 1
            if (!this.MapValueData.BallColorValue[c]) {
                this.MapValueData.BallColorValue[c] = 0
            }
        }
        console.log(all_people, AllBall);
        for (let c in this.MapValueData.BallColorValue) {
            this.MapValueData.BallColorValue[c] = Math.abs(all_people / AllBall[c]);
        }
        console.log("走线初始状态：", this.MapValueData);
        this.MapValueData.AverageYZZValue = this.GoNumAll / all_people
        this.FixedLift.active = false

    }
    private ColorList = []
    ChooseColorData(data) {
        this.ChangePos.active = false
        this.TouchNode && (this.TouchNode.active = false);
        if (this.node.getChildByName("seve_data").active) {
            this.node.getChildByName("seve_data").active = false
            this.node.getChildByName("setImportColor").active = false
            //  this.node.getChildByName("setImportColor").active = false
        }
        let types = [1, 31, 111, 51, 52, 53, 54, 55, 1111]
        let change = false
        if (types.indexOf(data.type) >= 0) {

            this.ColorList.push([data.idx[0], data.idx[1], data.json.pop()])
            // 下方有电梯
            let NoShow = this.AaroundLift(data)
            if (NoShow) {
                data.child.active = false;
                data.type = 2;
                data.child.name = "2";
            }
            change = true

        }
        this.GoNumRefirsh(data)
        if (change) {
            let c = this.ColorList[this.ColorList.length - 1][2]
            // 当前颜色实际间隔
            let color_sjjg = this.MapValueData.BallColorChange[c].value
            this.MapValueData.BallColorChange[c].change.push(this.MapValueData.BallColorChange[c].value)
            this.MapValueData.BallColorChange[c].value = 0

            // 当前颜色间隔系数
            let color_jgxs = Math.abs(color_sjjg - this.MapValueData.BallColorValue[c])
            // 上一次压制值
            let last_yzz = this.MapValueData.YZZChange[this.MapValueData.YZZChange.length - 1]
            // 压制值变化数
            let yzz_bhs = Math.abs((((last_yzz - this.GoNumAll) - this.MapValueData.AverageYZZValue) / this.MapValueData.AverageYZZValue));
            // 增加当前压制值
            this.MapValueData.YZZChange.push(this.GoNumAll)
            console.log("当前颜色间隔：", color_sjjg, "颜色间隔系数", color_jgxs);
            console.log("压制值变化：", last_yzz - this.GoNumAll, "压制值变化数：", yzz_bhs);
            // 走线难度
            let walkDiff = Math.abs(color_jgxs * yzz_bhs);
            this.MapValueData.WalkDiffChange.push(walkDiff)
            this.MapValueData.WalkDiffValue += walkDiff
            for (let c in this.MapValueData.BallColorChange) {
                if (this.MapValueData.BallColorChange[c].change.length > 0) {
                    this.MapValueData.BallColorChange[c].value += 1;
                }
            }
            console.log("走线难度变化：", this.MapValueData);
            this.allLabel[4].string = "走线难度:" + this.MapValueData.WalkDiffValue
        }

        console.log(this.GoNumAll, "========");
        if (this.MapColorState == this.ColorList.length) {
            this.MapColor.getChildByName("Save").active = true

        }
        this.ExportGroup()
        this.GoNumRefirsh(data)
    }
    AaroundLift(data) {
        let NoShow = true
        let HaveLift = (Lift) => {
            NoShow = false
            let jsonLen = Lift.json.length - Lift.datas[0]
            let c = TitleType.indexOf(Lift.json[jsonLen]) + 1
            data.child.getComponent(Sprite).color = new Color(CellToColor[c]);
            data.json.push(Lift.json[jsonLen])
            Lift.datas[0] -= 1
            let name = Lift.idx[0] + "_" + Lift.idx[1]
            if (Lift.child.getChildByName(name)) {
                Lift.child.getChildByName(name).getComponent(EditBox).string = Lift.datas[0]
            } else if (Lift.child.children[1] && Lift.child.children[1].getChildByName(name)) {
                Lift.child.children[1].getChildByName(name).getComponent(EditBox).string = Lift.datas[0]
            }
        }
        if (this.map_data[data.idx[0] + 1]) {
            let Down = this.map_data[data.idx[0] + 1][data.idx[1]]
            if (Down.type == 8 && Down.datas[0] > 0) {
                HaveLift(Down)
            } else if (Down.type == 10) {
                Down.type = 1
                Down.json.splice(2, 1)
                let c = TitleType.indexOf(Down.json[2]) + 1
                Down.child.getComponent(Sprite).color = new Color(CellToColor[c]);
            }
        }
        if (this.map_data[data.idx[0] - 1]) {
            let Up = this.map_data[data.idx[0] - 1][data.idx[1]]
            if (NoShow && Up.type == 9 && Up.datas[0] > 0) {
                HaveLift(Up)
            } else if (Up.type == 10) {
                Up.type = 1
                Up.json.splice(2, 1)
                let c = TitleType.indexOf(Up.json[2]) + 1
                Up.child.getComponent(Sprite).color = new Color(CellToColor[c]);
            }
        }
        if (this.map_data[data.idx[0]][data.idx[1] - 1]) {
            let Left = this.map_data[data.idx[0]][data.idx[1] - 1]
            if (NoShow && (Left.type == 7 || Left.type == 12) && Left.datas[0] > 0) {
                HaveLift(Left)
            } else if (Left.type == 10) {
                Left.type = 1
                Left.json.splice(2, 1)
                let c = TitleType.indexOf(Left.json[2]) + 1
                Left.child.getComponent(Sprite).color = new Color(CellToColor[c]);
            }
        }
        if (NoShow && this.map_data[data.idx[0]][data.idx[1] + 1]) {
            let Right = this.map_data[data.idx[0]][data.idx[1] + 1]
            if (NoShow && (Right.type == 6 || Right.type == 11) && Right.datas[0] > 0) {
                HaveLift(Right)
            } else if (Right.type == 10) {
                Right.type = 1
                Right.json.splice(2, 1)
                let c = TitleType.indexOf(Right.json[2]) + 1
                Right.child.getComponent(Sprite).color = new Color(CellToColor[c]);
            }
        }

        return NoShow
    }
    ExportGroup() {
        if (Object.keys(this.LiftExportData.data).length > 0) {
            for (let key in this.LiftExportData.data) {
                let karr = key.split('-').map(item => parseInt(item));
                let key_data = this.map_data[karr[0]][karr[1]]
                if (key_data["FixedData"][0] > 0) {
                    let have = false
                    for (let arr of this.LiftExportData.data[key]) {
                        let data = this.map_data[arr[0]][arr[1]]
                        if (data.type == 1) {
                            have = true
                        }
                    }
                    if (!have) {
                        let len = this.LiftExportData.data[key].length
                        const result = Array.from({ length: Math.ceil(key_data.json[3].length / len) }, (_, i) => key_data.json[3].slice(i * len, i * len + len));
                        let idx = result.length - key_data["FixedData"][0];
                        let Colors = result[idx]
                        for (let arr of this.LiftExportData.data[key]) {
                            let data = this.map_data[arr[0]][arr[1]]
                            data.type = 1
                            let color = Colors.shift()
                            let c = TitleType.indexOf(color) + 1
                            data.child.getComponent(Sprite).color = new Color(CellToColor[c]);
                            data.child.name = "1";
                            data.child.active = true
                            data.go_num = 0;
                            data.json.push(color)
                        }
                        key_data["FixedData"][0] -= 1
                        key_data.child.getChildByPath("131/" + key).getComponent(EditBox).string = String(key_data["FixedData"][0]);
                    }

                    // console.log(key_data.child);
                }

            }
        }
    }
    SaveData() {
        this.StateText.string = ""
        let ColorList = ""
        if (!this.yarn_mapLayoutData[this.MapId]["ColorList"]) {
            this.yarn_mapLayoutData[this.MapId]["ColorList"] = ""
        }
        for (let k of this.ColorList) {
            ColorList += k[0] + "-" + k[1] + "-" + k[2] + ","
        }
        ColorList = ColorList.slice(0, ColorList.length - 1)
        this.yarn_mapLayoutData[this.MapId]["ColorList"] = ColorList
        GameUtil.ChangeStorage(true, "yarn_mapLayoutData", this.yarn_mapLayoutData)
        this.MapColor.active = false
        this.MapColorState = 1
        this.dataJsonImport(this.yarn_mapLayoutData[this.MapId].layout)
        if (this.yarn_mapLayoutData[this.MapId].chain) {
            this.setChainData(this.yarn_mapLayoutData[this.MapId].chain)
        }
        this.yarn_mapLayoutData[this.MapId]["WalkValue"] = this.MapValueData.WalkDiffValue
        this.yarn_mapLayoutData[this.MapId]["WalkValueChange"] = this.MapValueData.WalkDiffChange.toString();
        this.LayoutList.numItems = Object.keys(this.yarn_mapLayoutData).length
        // this.exportData()
    }
    exportData() {
        let data = JSON.parse(JSON.stringify(this.yarn_mapLayoutData))

        var str = JSON.stringify(data)
        // var str = `{"map_datas":${JSON.stringify(values)}}`;
        var blob = new Blob([str], { type: "text/plain" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "./YarnMapData.json";
        link.click();
    }
    ImportYarnData() {
        this.FileDrag.active = true
        this.FileDrag.getComponent(DragDropExample).init(() => {
            this.yarn_mapLayoutData = GameUtil.ChangeStorage(false, "yarn_mapLayoutData")
            this.initMapLayoutData()
        }, "yarn_mapLayoutData")
    }

}


