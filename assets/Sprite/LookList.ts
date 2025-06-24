import { _decorator, Component, error, JsonAsset, Label, Layout, Node, resources, Size, Sprite, UITransform } from 'cc';
import List from '../Scene/list/List';
const { ccclass, property } = _decorator;

@ccclass('LookList')
export class LookList extends Component {
    @property({ type: Label, displayName: "标题文字" })
    private TitleText: Label = null;
    @property({ type: List, displayName: "列表" })
    private MapList: List = null;
    private loadMaxJsonNum: number = 0
    private loadJsonNum: number = 0;
    readonly mapLayoutData: any = null;//地图数据
    readonly levelJsonData: any = null;
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
            }
        });
    }
    public loadJson() {
        this._loadJson("data/LevelConfig", "levelJsonData");
        this._loadJson("data/MapLayoutId", "mapLayoutData");
    }
    initGameData() {

    }
    onList(item: Node, idx: number) {

    }
    start() {

    }
    onGameList(item, idx) {
        if (this.ShowType == 'LevelConf') {
            let next = true
            if (!this.levelJsonData[this.LevelConf[idx]]) {
                item.getChildByName('text').getComponent(Label).string = `level表中${this.LevelConf[idx]}不存在`;
                next = false
            } else if (!this.mapLayoutData[this.levelJsonData[this.LevelConf[idx]].mapLayoutID]) {
                item.getChildByName('text').getComponent(Label).string = `Layout表中${this.levelJsonData[this.LevelConf[idx]].mapLayoutID}不存在`;
                next = false
            }
            if (!next) {
                let Map = item.getChildByName('Map')
                for (let child of Map.children) {
                    child.getComponent(Sprite).enabled = true
                    child.children[0].getComponent(Sprite).enabled = true
                    child.children[0].destroyAllChildren()
                    child.children[0].getComponent(Sprite).color = new Color('#FFFFFF')
                    child.children[0].name = '1'
                    child.active = false
                }
                return
            }

        }
        let k = (this.ShowType == 'LevelConf') ? this.levelJsonData[this.LevelConf[idx]].mapLayoutID : Object.keys(this.allMapDataType[this.nowLookMapSize])[idx];
        let data = (this.ShowType == 'LevelConf') ? this.mapLayoutData[k] : this.allMapDataType[this.nowLookMapSize][k]
        let str = ''
        if (this.ShowType == 'LevelConf') {
            str = 'Lv.' + (idx + 1) + '-ID:' + this.levelJsonData[this.LevelConf[idx]].id
        } else {
            str = 'id:' + this.levelJsonData[this.LevelConf[idx]].id
        }
        item.getChildByName('text').getComponent(Label).string = str;
        let mapSize = new Size(246, 236)
        let layout = data.layout
        // if (this.ShowType != 'LevelConf') {
        //     if (!this.mapLayoutData[data.layout]) {
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
        //     layout = this.mapLayoutData[data.layout].layout
        // }
        this.ItemSetMap(item, layout, mapSize)
    }
    // 
    ItemSetMap(item, data, mapSize) {
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
            map_data[idx[1]][idx[0]].type = idx[2];
            let node = map_data[idx[1]][idx[0]].node;
            map_data[idx[1]][idx[0]].child.name = idx[2] + '';
            if (this.dataParent.getChildByName(idx[2] + '')) {
                map_data[idx[1]][idx[0]].child.getComponent(Sprite).color = this.dataParent.getChildByName(idx[2] + '').getComponent(Sprite).color;
            }
            if (map_data[idx[1]][idx[0]].child.children.length > 1) {
                map_data[idx[1]][idx[0]].child.children[1].destroy()
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

            }
        }
        
    }
    
    update(deltaTime: number) {

    }
    HandleConf(data) {
        data = data.replace(/[A-Z]/g, '1');
        let last = data.substring(data.length - 1, data.length);

        if (last != ';') {
            data += ';'
        }
        
        data = '[[' + data
        data = data.substring(0, data.length - 1)
        data = this.replaceAll(data, ";", '],[')
        data = this.replaceAll(data, "'", '"')
        data += ']]';
        let new_data = JSON.parse(data)
        let row = 0;
        let arrange = 0;
        for (let idx of new_data) {
            row = (idx[1] > row) ? idx[1] : row;
            arrange = (idx[0] > arrange) ? idx[0] : arrange;
        }

        return { map: new_data, size: { row: row, arrange: arrange } }
    }
    replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}


