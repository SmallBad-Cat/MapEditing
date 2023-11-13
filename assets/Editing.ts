import { _decorator, Button, Color, Component, EditBox, EventTouch, instantiate, Label, Layout, loader, Node, resources, ScrollView, Size, Sprite, TextAsset, tween, UITransform, v3, Vec3 } from 'cc';
import { MapLayoutIdConf } from './resources/Conf/MapLayoutIdConf';
import { RoleConf } from './resources/Conf/RoleConf';
import { CollectConf } from './resources/Conf/CollectConf';
const { ccclass, property } = _decorator;

@ccclass('Editing')
export class Editing extends Component {
    @property({ type: Node, displayName: "触摸区域" })
    private Touch: Node = null;
    @property({ type: Node, displayName: "地图区域" })
    private Map: Node = null;
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
    @property({ type: Node, displayName: "所有可选ScrollView节点" })
    private ScrollView: Node[] = [];
    @property({ type: Node, displayName: "所有ScrollView节点Content" })
    private AddContent: Node[] = [];
    @property({ type: Label, displayName: "所有Label节点" })
    private allLabel: Label[] = [];
    private nowContent = 0;
    private ScrollViewSelect = [0, 0, 0, 0];
    // 已选择地图块
    private Piece = [];
    // 地图大小
    private map_size = {
        arrange: 12,
        row: 13,
    }
    private mapSize: Size = null;
    // 拥有提示
    private haveTip: number = 0;
    // 地图数据
    private map_data = [];
    private enter_map = false;
    private role_map = [];
    private RoleKey = [];
    private GoNumAll: number = 0;
    start() {
        // console.log();
        // resources.load('Csv/MapLayoutId', function (err, file) {
        //     if (err != null) {
        //         console.log("load csv Error! csv name :", 'Csv/MapLayoutId', " error Msg :", err.message)
        //         return;
        //     } else {
        //         console.log(file['text']);
        //     }
        // })

        this.MapChange('init')
        this.mapSize = this.Map.getComponent(UITransform).contentSize
        this.Map.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.Map.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)

        // this.writeJson()
        let first = true;
        let contentNode = this.ScrollView[0].getComponent(ScrollView).content
        for (let key in MapLayoutIdConf.datas) {
            let node = contentNode.children[0]
            if (!first) {
                node = instantiate(node)
                contentNode.addChild(node)
            }
            node.name = key
            node.getChildByName('text').getComponent(Label).string = key
            first = false;
        }
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
            this.MapChange()
        }
    }
    TipTween(str) {
        this.haveTip++;
        this.Tip.active = true;
        let text = this.Tip.getChildByName('text').getComponent(Label)
        text.string = str;
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
        this.GoNumAll = 0
        let node = this.Map.children[0];
        let mapLayout = this.Map.getComponent(Layout)
        let newWidth = (this.mapSize) ? (this.mapSize.width - mapLayout.paddingLeft - mapLayout.paddingRight - ((this.map_size.arrange - 1) * mapLayout.spacingX)) / this.map_size.arrange : null;
        let newHeight = (this.mapSize) ? (this.mapSize.height - mapLayout.paddingTop - mapLayout.paddingBottom - ((this.map_size.row - 1) * mapLayout.spacingY)) / this.map_size.row : null;
        let newNodeSize = (this.mapSize) ? new Size(newWidth, newHeight) : null;
        if (newNodeSize) {
            node.getComponent(UITransform).setContentSize(newNodeSize);
        }
        for (let data of this.role_map) {
            if (data.node.getChildByName('bear')) {
                data.node.getChildByName('bear').active = false
            }
        }
        this.role_map = []
        for (let item of this.dataParent.children) {
            if (item.name != 'Mask') {
                item.getChildByName('count').getComponent(Label).string = String(0);
            }
        }
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
                        go_num: row - 1
                    }
                    this.map_data[row][arrange].child.getChildByName('go').active = (this.map_data[i][x].type == 1) ? true : false;
                    this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).string = row + ''
                    this.GoNumAll += data.go_num;
                    let count_label = this.dataParent.getChildByName(data.child.name).getChildByName('count').getComponent(Label)
                    count_label.string = String(Number(count_label.string) + 1);
                    if (this.map_data[i][x].type == 1 || this.map_data[i][x].type == 10) {
                        this.role_map.push(data)
                    }
                    if (newNodeSize) {
                        node.getComponent(UITransform).setContentSize(newNodeSize);
                        data.child.getComponent(UITransform).setContentSize(node.getComponent(UITransform).contentSize)
                    }
                    node.active = true
                    this.map_data[row][arrange] = data;
                } else {
                    if (newNodeSize) {
                        node.getComponent(UITransform).setContentSize(newNodeSize);
                        this.map_data[row][arrange].child.getComponent(UITransform).setContentSize(node.getComponent(UITransform).contentSize)
                    }
                    node.active = false;
                    // let count_label = this.dataParent.getChildByName(this.map_data[row][arrange].child.name).getChildByName('count').getComponent(Label)
                    // count_label.string = String(Number(count_label.string) - 1);
                }
            }
        }
        let all_gonum: number = 0
        if (init) {
            let num = 0;
            for (let y = 1; y <= this.map_size.row; y++) {
                if (!this.map_data[y]) {
                    this.map_data[y] = []
                }
                for (let x = 1; x <= this.map_size.arrange; x++) {

                    node = instantiate(node);
                    node.active = true;
                    this.Map.addChild(node);
                    let newChild = node.getChildByName('1')
                    newChild.getComponent(UITransform).setContentSize(node.getComponent(UITransform).contentSize);
                    newChild.setPosition(v3(0, 0));
                    let data = {
                        node: node,
                        idx: [x, y],
                        type: 1,
                        child: newChild,
                        go_num: y - 1
                    }
                    newChild.getChildByName('go').getComponent(Label).string = data.go_num + ''
                    all_gonum += data.go_num
                    this.map_data[y][x] = data;
                    num++
                }
            }
            this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string = num + ''
            this.GoNumAll = all_gonum
        }
        this.allLabel[5].string = '角色步数总和：' + this.GoNumAll;
        let people_num = Number(this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string) + Number(this.dataParent.getChildByName('10').getChildByName('count').getComponent(Label).string)
        this.PeopleStr.string = `当前人数为：${people_num}
        除3得数为：${(people_num / 3)}`
    }
    onTouchStart(event: EventTouch) {
        if (this.Piece[0]) {
            let localPos = event.getUILocation();
            this.dataInstall(event.getUILocation())
        } else {
            this.TipTween('请先选择需要填充的类型')
        }

    }
    onTouchMove(event: EventTouch) {
        if (this.Piece[0]) {
            let localPos = event.getUILocation();
            this.dataInstall(localPos)
        }
    }
    dataInstall(localPos) {
        this.enter_map = false;
        let worldPos = this.Map.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(localPos.x, localPos.y));
        let data = this.TouchData(worldPos);
        if (data && data.type != this.Piece[1]) {
            data.type = this.Piece[1];
            if (this.Piece[1] == 6 || this.Piece[1] == 7 || this.Piece[1] == 8 || this.Piece[1] == 9) {
                let newChild = instantiate(this.Piece[0])
                newChild.getChildByName('name').active = false;
                newChild.getChildByName('count').active = false;
                newChild.getComponent(UITransform).setContentSize(data.node.getComponent(UITransform).contentSize);
                newChild.getComponent(Button).enabled = false;
                data.child.addChild(newChild);
                newChild.setPosition(v3(0, 0));
            } else {
                let count_label = this.dataParent.getChildByName(data.child.name).getChildByName('count').getComponent(Label)
                count_label.string = String(Number(count_label.string) - 1);
                data.child.name = this.Piece[1] + '';
                data.child.getComponent(Sprite).color = this.Piece[0].getComponent(Sprite).color;
                if (data.child.children.length > 1) {
                    data.child.children[1].destroy()
                }
            }
            if (this.Piece[1] != 1 && this.Piece[1] != 10) {
                // data.child.getChildByName('go').active = false
                if (this.Piece[1] == '2') {
                    data.go_num = data.go_num - 1
                }
            } else {
                data.child.getChildByName('go').active = true
                // data.go_num = data.go_num + 2
            }
            this.map_data[data.idx[1]][data.idx[0]] = data
            this.GoNumRefirsh(data)
            this.Piece[0].getChildByName('count').getComponent(Label).string = String(Number(this.Piece[0].getChildByName('count').getComponent(Label).string) + 1);
            let people_num = Number(this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string) + Number(this.dataParent.getChildByName('10').getChildByName('count').getComponent(Label).string)
            this.PeopleStr.string = `当前人数为：${people_num}
            除3得数为：${(people_num / 3)}`

        }
    }
    Type2ArrMin(idx) {
        let type2Obj = {}
        let type2 = (idx) => {
            let y = idx[1];
            let x = idx[0];
            // 方向
            let min = this.map_data[y][x].go_num
            let direction = (Y, X) => {
                if (this.map_data[Y][X].type == '2') {
                    if (!type2Obj[Y + '_' + X]) {
                        // type2Obj[Y + '_' + X] = [Y, X, this.map_data[Y][X].go_num]
                        type2(this.map_data[Y][X].idx)
                        return 999
                    }

                }
                if (this.map_data[Y][X].type == 1 || this.map_data[Y][X].type == 10) {
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
                }
                // 下
                if (this.map_data[y + 1]) {
                    let nextY = y + 1;
                    let nextX = x
                    direction(nextY, nextX)
                    if (this.map_data[y][x + 1]) {
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
        }
        type2(idx)
        let arr = []
        for (let key in type2Obj) {
            arr.push(type2Obj[key][2])
        }
        let min = Math.min(...arr)
        for (let key in type2Obj) {
            this.map_data[type2Obj[key][0]][type2Obj[key][1]].go_num = (min < 0) ? 0 : min;
            this.map_data[type2Obj[key][0]][type2Obj[key][1]].child.getChildByName('go').getComponent(Label).string = (min < 0) ? 0 : min + ''
        }
        console.log(type2Obj);
        return min
    }
    GoNumRefirsh(data) {
        console.log(data);
        if (data.type == 2) {
            this.Type2ArrMin(data.idx)
        } else {
            let y = data.idx[1];
            let x = data.idx[0];
            this.map_data[y][x].go_num += 1
            let min = this.map_data[y][x].go_num;
            let Type2fun = (idx) => {
                if (this.map_data[idx[1]][idx[0]].type == 2) {
                    let newMin = this.Type2ArrMin(idx)
                    console.log(newMin);
                    if (min > newMin + 1) {
                        min = newMin + 1
                    }
                }
            }
            if (this.map_data[y - 1]) {
                Type2fun(this.map_data[y - 1][x].idx);
            }
            if (this.map_data[y + 1]) {
                Type2fun(this.map_data[y + 1][x].idx);
            }
            if (this.map_data[y][x + 1]) {
                Type2fun(this.map_data[y][x + 1].idx);
            }
            if (this.map_data[y][x - 1]) {
                Type2fun(this.map_data[y][x - 1].idx);
            }
            // this.map_data[y][x].go_num = min
            // this.map_data[y][x].child.getChildByName('go').getComponent(Label).string = min + ''
        }
        // this.scheduleOnce(() => {
            this.refish_GoNum()
        // }, 0.03)
        this.scheduleOnce(() => {
            this.refish_GoNum()
        },0.03)

        console.log(this.map_data);

    }
    refish_GoNum() {
        this.GoNumAll = 0
        for (let y = 1; y <= this.map_size.row; y++) {
            for (let x = 1; x <= this.map_size.arrange; x++) {
                let type = this.map_data[y][x].type
                if (type == 1 || type == 10 || type == 2) {
                    let min_arr = []
                    if (this.map_data[y - 1]) {
                        if (type == 2) {
                            min_arr.push(this.map_data[y - 1][x].go_num)
                        } else if (this.map_data[y - 1][x].type == 1 || this.map_data[y - 1][x].type == 2 || this.map_data[y - 1][x].type == 10) {
                            min_arr.push(this.map_data[y - 1][x].go_num + 1)
                        }
                    } else {
                        min_arr.push(0)
                    }
                    if (this.map_data[y + 1]) {
                        if (type == 2) {
                            min_arr.push(this.map_data[y + 1][x].go_num)
                        }
                        else if (this.map_data[y + 1][x].type == 1 || this.map_data[y + 1][x].type == 2 || this.map_data[y + 1][x].type == 10) {
                            min_arr.push(this.map_data[y + 1][x].go_num + 1)
                        }
                    }
                    if (this.map_data[y][x + 1]) {
                        if (type == 2) {
                            min_arr.push(this.map_data[y][x + 1].go_num)
                        } else if (this.map_data[y][x + 1].type == 1 || this.map_data[y][x + 1].type == 2 || this.map_data[y][x + 1].type == 10) {
                            min_arr.push(this.map_data[y][x + 1].go_num + 1)
                        }

                    }
                    if (this.map_data[y][x - 1]) {
                        if (type == 2) {
                            min_arr.push(this.map_data[y][x - 1].go_num)
                        } else if (this.map_data[y][x - 1].type == 1 || this.map_data[y][x - 1].type == 2 || this.map_data[y][x - 1].type == 10) {
                            min_arr.push(this.map_data[y][x - 1].go_num + 1)
                        }

                    }
                    if (y == 6 && x == 4) {
                    }
                    let minNum = (min_arr.length <= 0) ? this.map_data[y][x].go_num : Math.min(...min_arr)
                    this.map_data[y][x].go_num = minNum
                    this.map_data[y][x].child.getChildByName('go').getComponent(Label).string = minNum + ''
                    this.GoNumAll += minNum
                } else if (this.map_data[y][x].type == 2) {
                    this.Type2ArrMin(this.map_data[y][x].idx)
                }
            }
        }
        this.allLabel[5].string = '角色步数总和：' + this.GoNumAll;
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
    onPiece(event: Event, id: string) {
        let target: any = event.target;
        if (this.Piece.length > 0) {
            if (this.Piece[1] == Number(id) && this.ChooseKuang.active) {
                this.ChooseKuang.active = false;
                this.Piece = [];
                return;
            }
        }
        this.Piece = [target, Number(id)];
        this.ChooseKuang.setPosition(target.getPosition());
        this.ChooseKuang.active = true;

    }
    // 数据处理
    data_handle(event: Event) {
        let target: any = event.target;
        if (target.name == 'seve_data') {
            // 导出数据
            let data = ''
            for (let y = 1; y <= this.map_size.row; y++) {
                for (let x = 1; x <= this.map_size.arrange; x++) {
                    data += x + `,${y},${(this.map_data[y][x].type) ? this.map_data[y][x].type : 5};`
                }
            }
            console.log('----------数据导出----------');
            console.log(data);
            // JSON.stringify(data)
        } else {
            this.dataJsonImport(this.ImportEditBox.string);
        }
    }
    initDataGoNum() {
        for (let y = 1; y <= this.map_size.row; y++) {
            for (let x = 1; x <= this.map_size.arrange; x++) {
                if (this.map_data[y][x].type == 2) {
                    this.Type2ArrMin(this.map_data[y][x].idx)
                    this.map_data[y][x].child.getChildByName('go').active = false
                    this.map_data[y][x].child.getChildByName('go').getComponent(Label).string = this.map_data[y][x].go_num + ''
                }
            }
        }
    }
    // 数据导入
    import_data(EditBox: EditBox) {
        this.dataJsonImport(EditBox.string);
        this.enter_map = true;
    }

    // 数据Json导入
    dataJsonImport(data: string, conf_data?) {
        if (data.length < 6) {
            this.ImportEditBox.string = '';
            return;
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
        data += ']]';
        let new_data = JSON.parse(data)
        let row = 0;
        let arrange = 0;
        // console.log("data:",data);


        if (!conf_data) {
            this.CloseAll(data)

            for (let idx of new_data) {
                row = (idx[1] > row) ? idx[1] : row;
                arrange = (idx[0] > arrange) ? idx[0] : arrange;
                this.map_data[idx[1]][idx[0]].type = idx[2];
                let node = this.map_data[idx[1]][idx[0]].node;
                this.map_data[idx[1]][idx[0]].child.name = idx[2] + '';
                this.map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).color;
                if (this.map_data[idx[1]][idx[0]].child.children.length > 1) {
                    this.map_data[idx[1]][idx[0]].child.children[1].destroy()
                }
                if (idx[2] == 6 || idx[2] == 7 || idx[2] == 8 || idx[2] == 9) {
                    let newChild = instantiate(this.dataParent.getChildByName(idx[2] + ''))
                    newChild.getChildByName('name').active = false;
                    newChild.getChildByName('count').active = false;
                    newChild.getComponent(UITransform).setContentSize(this.map_data[idx[1]][idx[0]].node.getComponent(UITransform).contentSize);
                    newChild.getComponent(Button).enabled = false;
                    this.map_data[idx[1]][idx[0]].child.addChild(newChild);
                    newChild.setPosition(v3(0, 0));
                }
                this.map_data[idx[1]][idx[0]].child.getComponent(UITransform).setContentSize(node.getComponent(UITransform).contentSize);
            }
        }

        this.map_size = {
            arrange: arrange,
            row: row,
        }
        this.EditBox_row.string = String(row);
        this.EditBox_arrange.string = String(arrange);
        this.ImportEditBox.string = '';
        if (!conf_data) {
            this.scheduleOnce(() => {
                this.MapChange();
            }, 0.03)
        } else {
            return this.RoleData(new_data, conf_data);
        }


    }
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
    CloseAll(MapChange?) {
        console.log('清空数据');
        for (let item of this.dataParent.children) {
            if (item.name != 'Mask') {
                item.getChildByName('count').getComponent(Label).string = String(0);
            }
        }
        let num = 0
        this.GoNumAll = 0
        for (let i in this.map_data) {
            let row = Number(i)
            console.log(row);
            for (let x in this.map_data[row]) {
                let arrange = Number(x)
                let node = this.map_data[i][x].node;
                this.map_data[i][x].type = 1;
                // 角色步数重新初始化
                this.map_data[i][x].go_num = row - 1
                this.map_data[row][arrange].child.getChildByName('go').active = true;
                this.map_data[row][arrange].child.getChildByName('go').getComponent(Label).string = this.map_data[i][x].go_num + ''
                this.GoNumAll += this.map_data[i][x].go_num;
                // 小熊节点隐藏
                if (node.getChildByName('bear')) {
                    node.getChildByName('bear').active = false
                }
                // 所有数据初始化为角色类型
                this.map_data[row][arrange].child.name = '1';
                this.map_data[row][arrange].child.getComponent(Sprite).color = this.dataParent.getChildByName('1').getComponent(Sprite).color;
                if (this.map_data[row][arrange].child.children.length > 1) {
                    this.map_data[row][arrange].child.children[1].destroy()
                }
                if (row <= this.map_size.row && arrange <= this.map_size.arrange) {
                    num++
                }
            }
        }
        this.allLabel[5].string = '角色步数总和：' + this.GoNumAll;
        this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string = String(num)
        let people_num = Number(this.dataParent.getChildByName('1').getChildByName('count').getComponent(Label).string) + Number(this.dataParent.getChildByName('10').getChildByName('count').getComponent(Label).string)
        this.PeopleStr.string = `当前人数为：${people_num}
        除3得数为：${(people_num / 3)}`


    }
    // 连续数量
    private SustainCount: number = 2;
    // 最大数量
    private MaxCount: number = 5;
    // 角色数据
    private Type = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "S", "Y", "Z"];
    RoleData(data, conf_data) {
        let all_role = 0;//总人数
        // 行和列
        let size = [0, 0]
        let all_piece = {}
        for (let arr of data) {
            //    总人数
            if (arr[2] == 1 || arr[2] == 10) {
                all_role++
            } else if (arr[2] == 6 || arr[2] == 7 || arr[2] == 8 || arr[2] == 9) {
                all_role += conf_data.lift_num;
            }
            // 地图大小
            if (arr[0] > size[0]) {
                size[0] = arr[0]
            }
            if (arr[1] > size[1]) {
                size[1] = arr[1]
            }
            // 每个块块的数量
            if (!all_piece[arr[2]]) {
                all_piece[arr[2]] = 0
            }
            all_piece[arr[2]]++
        }
        let color = conf_data.color;//几种颜色类型
        let group = 3;//每组人数
        let count = {};
        let remainder = (all_role / 3) % color; //取余
        let evenyone = Math.floor(all_role / group / color);//每个类型有多少组人
        for (let i = 0; i < color; i++) {
            count[i] = evenyone * group
        }
        for (let a = 0; a < remainder; a++) {
            let type = Math.floor(Math.random() * color);
            count[type] += group
        }
        let map_role = [];
        let afresh_again = false;
        let ruleFun = (arr) => {
            if (!map_role[arr[0]]) {
                map_role[arr[0]] = []
            }
            let afresh = [0, 0]
            let get_idx = (type?) => {
                if (type) {
                    afresh[type]++
                    if (afresh[type] >= 300) {
                        afresh_again = true;
                        return this.RoleData(data, conf_data);
                    }
                }
                let idx = Object.keys(count)[Math.floor(Math.random() * Object.keys(count).length)];
                let Rule = (t) => {
                    let sustain = [0, 0];
                    let rule_arr = {}
                    let now_rule = ''
                    let rule_data = (t == 'h') ? map_role[arr[0]] : map_role;
                    for (let i = 1; i <= rule_data.length; i++) {
                        if (rule_data[i]) {
                            let type = (t == 'h') ? rule_data[i] : rule_data[i][arr[1]]
                            if (type != undefined) {
                                if (!rule_arr[type]) {
                                    rule_arr[type] = 1
                                }
                                if (now_rule != type) {
                                    sustain = [];
                                    sustain = [type, 1]
                                };
                                if (sustain[1] == this.SustainCount && this.Type[idx] == type) {
                                    return false;

                                } else if (rule_arr[type] == this.MaxCount && this.Type[idx] == type) {
                                    return false;
                                }
                                // 连续数量
                                sustain[1]++
                                rule_arr[type]++
                                now_rule = type;
                            }
                        }
                    }
                    return true
                }
                // 横向判断
                if (Rule('h')) {
                    // 纵向判断
                    if (Rule('z')) {
                        return Number(idx)
                    } else {
                        return get_idx(0)
                    }
                } else {
                    return get_idx(1)
                }
            }
            let idx = get_idx();
            if (!afresh_again) {
                map_role[arr[0]][arr[1]] = this.Type[Number(idx)]
                count[Number(idx)]--
                if (count[Number(idx)] == 0) {
                    delete count[Number(idx)]
                }
                all_role--
                return this.Type[Number(idx)];
            }
        }
        if (!afresh_again) {
            let Role = []
            let lift = 0;
            for (let arr of data) {
                if (arr[2] == 1 || arr[2] == 10) {
                    Role.push(ruleFun(arr))
                } else if (arr[2] == 6 || arr[2] == 7 || arr[2] == 8 || arr[2] == 9) {
                    lift++
                }
            }
            let liftArr = [];
            for (let i = 0; i < lift; i++) {
                liftArr[i] = [];
                let lift_role = () => {
                    let rule_arr = {}
                    let roleArr = [];
                    for (let num = 0; num < conf_data.lift_num; num++) {
                        let afresh = 0
                        let get_idx = (state?) => {
                            if (state) {
                                afresh++
                                if (afresh >= 300) {
                                    afresh_again = true;
                                    return this.RoleData(data, conf_data);
                                }
                            }
                            let sustain = [0, 1];
                            let idx = Number(Object.keys(count)[Math.floor(Math.random() * Object.keys(count).length)]);
                            if (String(sustain[0]) != count[idx]) {
                                sustain = [idx, 1];
                            }
                            if (!rule_arr[this.Type[idx]]) {
                                rule_arr[this.Type[idx]] = 0;
                            }
                            if (sustain[1] == this.SustainCount && this.Type[idx] == this.Type[sustain[0]]) {
                                return get_idx(true);

                            } else if (rule_arr[this.Type[idx]] == this.MaxCount) {
                                return get_idx(true);
                            }
                            count[idx]--
                            if (count[idx] == 0) {
                                delete count[idx]
                            }
                            sustain[1]++
                            rule_arr[this.Type[idx]]++
                            return this.Type[idx];
                        }
                        (!afresh_again) && (roleArr.push(get_idx()))


                    }
                    if (!afresh_again) return roleArr;
                }
                (!afresh_again) && (liftArr[i].push(lift_role()));

            }
            console.log(map_role);
            if (!afresh_again) {
                let all_lift = (all_piece[6]) ? all_piece[6] : 0 + (all_piece[7]) ? all_piece[7] : 0 + (all_piece[8]) ? all_piece[8] : 0 + (all_piece[9]) ? all_piece[9] : 0;
                let data_difficulty = (all_role / 10) + (conf_data.color * 5) + (all_piece[3] * 10) + (all_piece[10] * 10) + (all_lift * 10) - (all_piece[2] * 15);
                let data_role = '';
                if (Role) {
                    for (let i of Role) {
                        data_role += i + ',';
                    }
                    data_role = data_role.substring(0, data_role.length - 1)
                }
                console.log(data_role);
                let back_data = {
                    list: size[1],
                    color_num: conf_data.color,
                    role: Role.length,
                    lift_role: conf_data.lift_num,
                    lift_num: all_lift,
                    snag_num: all_piece[3],
                    doubt_num: all_piece[10],
                    no_role: all_piece[2],
                    difficulty: data_difficulty,
                    role_data: data_role,
                }
                for (let lift_idx in liftArr) {
                    let lift_data = '';
                    for (let i of liftArr[lift_idx][0]) {
                        lift_data += i + ',';
                    }
                    lift_data = lift_data.substring(0, lift_data.length - 1)
                    back_data['lift_data' + (Number(lift_idx) + 1)] = lift_data
                }
                this.back_data_num++
                this.writeJsonData.content[conf_data.arrange] = [conf_data.level, MapLayoutIdConf.datas[conf_data.key].id]
                for (let i of this.writeJsonData.Identifier) {
                    if (i != 'id' && i != 'map_id') {
                        if (back_data && back_data[i]) {
                            if (i == 'list') {

                            }
                            this.writeJsonData.content[conf_data.arrange].push(back_data[i]);
                        } else {
                            this.writeJsonData.content[conf_data.arrange].push(null);
                        }
                    }
                }
                return;
            }
        }
    }
    private back_data_num = 0
    private writeJsonData = {
        Identifier: ["id", "map_id", "list", "color_num", "role", "lift_role", "lift_num", "snag_num", "doubt_num", "no_role", "difficulty", "role_data", "lift_data1", "lift_data2", "lift_data3", "lift_data4"],
        type: ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number", "number", "string", "string", "string", "string", "string"],
        name: ["关卡id", "地图ID", "地图有效列数", "角色颜色种类", "角色空格数", "电梯角色个数", "电梯个数", "障碍(内)个数", "问号块个数", "无角色空格数", "难度系数", "角色空格参数", "电梯1参数", "电梯1参数", "电梯1参数", "电梯1参数"],
        content: {},
    }
    writeJson() {
        for (let i in this.writeJsonData.Identifier) {
            if (!this.writeJsonData['arrange']) {
                this.writeJsonData['arrange'] = []
            }
            this.writeJsonData['arrange'].push(this.Type[i])
        }
        // 根基配置表角色生成
        let MapLayoutId = MapLayoutIdConf.datas
        let Collect = CollectConf.datas
        let arrange = 4;
        let level = 1;
        for (let key in MapLayoutId) {
            // console.log(key);
            let CollectData = Collect[MapLayoutId[key].now_size[0]]
            if (CollectData) {
                for (let color of CollectData.color_type) {
                    for (let lifts of CollectData.lifts_people) {
                        let conf_data = {
                            color: color,
                            lift_num: lifts,
                            level: level,
                            key: key,
                            arrange: arrange
                        }
                        this.dataJsonImport(MapLayoutId[key].layout + ';', conf_data);
                        level++
                        arrange++
                    }
                }
            }

        }
        console.log(this.writeJsonData);
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
        this.allLabel[4].string = (this.nowContent == 1) ? '编辑地图' : '设置数据';
        if (this.nowContent == 0) {
            this.CloseAll()
        }
    }
    // 点击选择
    onSelect(event: Event, id: string) {
        this.ScrollView[id].active = !this.ScrollView[id].active;
    }
    // 点击选择地图
    onMapItem(event: Event) {
        let target: any = event.target;
        this.ScrollView[0].active = false;
        this.dataJsonImport(MapLayoutIdConf.datas[target.name].layout);
        this.allLabel[0].string = '地图' + target.name;
        this.ScrollViewSelect[0] = Number(target.name);
        let size = MapLayoutIdConf.datas[target.name].now_size[0]
        // 颜色初始
        for (let colorNode of this.AddContent[1].children) {
            colorNode.active = false;
        }
        for (let idx in CollectConf.datas[size].color_type) {
            let node = this.AddContent[1].children[idx];
            if (!node) {
                node = instantiate(this.AddContent[1].children[0]);
                this.AddContent[1].addChild(node)
            } else {

            }
            node.active = true;
            node.getChildByName('text').getComponent(Label).string = CollectConf.datas[size].color_type[idx]
            node.name = CollectConf.datas[size].color_type[idx] + ''
        }
        // 电梯初始
        for (let liftNode of this.AddContent[2].children) {
            liftNode.active = false;
        }
        for (let idx in CollectConf.datas[size].lifts_people) {
            let node = this.AddContent[2].children[idx]
            if (!node) {
                node = instantiate(this.AddContent[2].children[0]);
                this.AddContent[2].addChild(node)
            }
            node.getChildByName('text').getComponent(Label).string = CollectConf.datas[size].lifts_people[idx]
            node.active = true;
            node.name = CollectConf.datas[size].lifts_people[idx] + ''

        }
        this.ScrollViewSelect[1] = CollectConf.datas[size].color_type[0];
        this.allLabel[1].string = `颜色${this.ScrollViewSelect[1]}种`;
        this.ScrollViewSelect[2] = CollectConf.datas[size].lifts_people[0];
        this.allLabel[2].string = `电梯${this.ScrollViewSelect[2]}人`;
        this.scheduleOnce(() => {

            this.refireRoleMap()
        }, 0.03)
    }
    // 点击颜色
    onColor(event: Event) {
        let target: any = event.target;
        let ID = Number(target.name)
        this.ScrollViewSelect[1] = ID;
        this.allLabel[1].string = `颜色${this.ScrollViewSelect[1]}种`;
        this.ScrollView[1].active = false;
        this.refireRoleMap()

    }
    // 点击电梯
    onLifts(event: Event) {
        let target: any = event.target;
        let ID = Number(target.name)
        this.ScrollViewSelect[2] = ID;
        this.allLabel[2].string = `电梯${this.ScrollViewSelect[2]}人`;
        this.ScrollView[2].active = false;
        this.refireRoleMap()

    }
    // 点击角色
    onRole(event: Event) {
        let target: any = event.target;
        let ID = Number(target.name)
        this.ScrollViewSelect[3] = ID;
        this.allLabel[3].string = `角色表ID:${this.ScrollViewSelect[3]}`;
        this.ScrollView[3].active = false;
        console.log(this.ScrollViewSelect[3]);
        this.RoleDataImport(RoleConf.datas[this.ScrollViewSelect[3]].role_data)

    }
    // 刷新角色表
    refireRoleMap() {
        this.RoleKey = []
        for (let key in RoleConf.datas) {
            let data = RoleConf.datas[key]
            if (data.role_data != '此地图数据无法按照规则输出' && data.map_id == this.ScrollViewSelect[0] && data.color_num == this.ScrollViewSelect[1] && data.lift_role == this.ScrollViewSelect[2]) {
                this.RoleKey.push(key)
            }
        }
        for (let roleNode of this.AddContent[3].children) {
            roleNode.active = false;
        }
        for (let i = 0; i < this.RoleKey.length; i++) {
            let node = this.AddContent[3].children[i]
            if (!node) {
                node = instantiate(this.AddContent[3].children[0]);
                this.AddContent[3].addChild(node)
            }
            node.getChildByName('text').getComponent(Label).string = 'ID:' + this.RoleKey[i];
            node.active = true;
            node.name = this.RoleKey[i] + ''
        }
        this.ScrollViewSelect[3] = this.RoleKey[0];
        this.allLabel[3].string = `角色表ID:${this.ScrollViewSelect[3]}`;
        console.log(RoleConf.datas[this.ScrollViewSelect[3]].role_data);
        this.RoleDataImport(RoleConf.datas[this.ScrollViewSelect[3]].role_data)
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
        console.log(RoleArr);
    }
    update(deltaTime: number) {

    }
}


