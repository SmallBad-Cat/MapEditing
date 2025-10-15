import { UITransform, Vec2, cclegacy, log, native, resources, sp, sys, tween, v2 } from "cc";
import { CreateRole } from "./CreateRole";
const TitleType = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "S", "Y", "Z",]
export class GetWalkDiff {
    static map_size = {
        row: 0,
        arrange: 0
    }
    static AttrItemData = {}
    static map_data = [];
    static Obstacle = {
        'A': [18, 19, 20],
        'B': [21, 22, 23, 28, 29, 30],
        'C': [24, 25, 26, 27, 6, 7, 8, 9],//电梯
        'D': [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53],//角色
        'E': [61, 63, 64, 68],//检票口
        'F': [71, 72, 73, 74, 75],//双向电梯
        'Role': [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53, 68, 71, 72, 73, 74, 75, 101, 102, 103, 104, 1111, 111],
        'JianPiaoKey': 67,
        'DTJ': [101, 102, 103, 104],
        'VIP': [11, 12, 13]
    }
    static DoubleLiftType = {
        71: [5, 5, 2],
        72: [6, 6, 2],
        73: [7, 7, 3],
        74: [8, 8, 3],
        75: [9, 9, 3],
        101: [2, 2],
        102: [2, 3],
        103: [3, 3],
        104: [3, 2],
    }
    static MapValueData = {
        BallColorValue: {},//球颜色最优间隔
        AverageYZZValue: 0,//平均压制值
        YZZValue: 0,//总压制值
        YZZChange: [],//所有压制值变化队列
        BallColorChange: {},//点击球的步数值
        WalkDiffChange: [],//走线难度变化
        WalkDiffValue: 0,//走线难度值
    }
    static ColorList = []
    static TypeArr = [42, 43, 44, 45, 46, 51, 52, 53, 3, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 61, 63, 64]
    static TypeorAddChild(Type) {
        if (this.TypeArr.indexOf(Type) >= 0 && Type != 2) {
            return true
        }
        if (Type == 3 || Type == 6 || Type == 7 || Type == 8 || Type == 9 || Type == 15 || Type == 16 || Type == 17 || Type == 18 || Type == 19 || Type == 20 || Type == 21 || Type == 22 || Type == 23 || Type == 24 || Type == 25 || Type == 26 || Type == 27 || Type == 28 || Type == 29 || Type == 30) {
            return true
        } else {
            false
        }
    }
    static GoNumAll: number = 0;
    static obstacleOrther = {
        18: [0, 3], 19: [0, 5], 20: [0, 7], 21: [1, 3], 22: [1, 5], 23: [1, 7], 24: [0, 3], 25: [0, 5], 26: [0, 7], 27: [0, 9], 28: [1, 3], 29: [1, 5], 30: [1, 7],
        61: [0, 3], 63: [1, 3], 64: [1, 3]
    }
    static setMapColor(data) {
        this.ColorList = []
        return
        this.dataJsonImport(data.layout)
        return
        this.refish_GoNum()
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
        const matches = data[1].match(/[A-Z]/g);
        let all_people = matches ? matches.length : 0
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
    }
    static replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
    static HandleConf(data, change = true) {
        if (change) {
            data = data.replace(/[A-Z]/g, '1');
        } else {
            data = data.replace(/\b([A-Z])\b/g, "'$1'");
        }
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
    // 数据Json导入
    static dataJsonImport(data: string, Editing?) {

        this.AttrItemData = {}
        let handle = this.HandleConf(data, false)
        let new_data = handle.map
        let row = 0;
        let arrange = 0;
        this.map_size = handle.size
        console.log("data:", data);
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

            if (idx.length > 3) {
                let attrs = [31, 42, 43, 44, 45, 46, 51, 52, 53, 1111, 10, 111]
                if (attrs.indexOf(idx[2]) < 0) {
                    let changeCount = 0
                    let DTJType = false
                    if (this.Obstacle.DTJ.indexOf(idx[2]) >= 0) {

                        let len = this.DoubleLiftType[idx[2]][0] * this.DoubleLiftType[idx[2]][1] * 2
                        if (len * 2 < idx.length) {
                            DTJType = true
                        }

                    }
                    for (let I = 3; I < idx.length; I++) {
                        let d = idx[I];
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
                let lift = [6, 7, 8, 9, 11, 12]
                if (lift.indexOf(this.map_data[idx[1]][idx[0]].type) >= 0 && this.map_data[idx[1]][idx[0]].datas.length > 1) {
                    this.map_data[idx[1]][idx[0]].datas = [this.map_data[idx[1]][idx[0]].datas.length]
                    FixedLiftState = true
                }
            }


            if (idx[2] == 11 || idx[2] == 12) {
                let len = this.map_data[idx[1]][idx[0]].datas.length
                if (len > 0 && len > 4) {
                    this.map_data[idx[1]][idx[0]].datas = [len]
                }
            }
            if (67 >= idx[2] && idx[2] >= 61) {
                if (idx[2] == this.Obstacle.JianPiaoKey) {
                    let k = this.map_data[idx[1] - 1][idx[0]].type
                    if (this.Obstacle.E.indexOf(this.map_data[idx[1]][idx[0] - 1].type) >= 0) {
                        k = 61
                    }
                }
            } else if (this.TypeorAddChild(idx[2])) {
                if (this.obstacleOrther[idx[2]]) {

                    let infeed = (this.obstacleOrther[idx[2]][0] == 0) ? true : false
                    if (infeed) {
                    } else {
                        infeed = false
                    }
                }
            } if (this.Obstacle.F.indexOf(idx[2]) >= 0) {

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

            if (this.map_data[idx[1]][idx[0]].type == 31) {
                this.AttrItemData[idx[1] + "_" + idx[0]] = {
                    idx: [idx[1], idx[0]],
                    count: 3,
                    state: idx[1] == 1 ? true : false,
                    key: this.map_data[idx[1]][idx[0]].type,
                }
            } else if (this.map_data[idx[1]][idx[0]].type == 1111) {
                this.AttrItemData[idx[1] + "_" + idx[0]] = {
                    idx: [idx[1], idx[0]],
                    count: 1,
                    state: idx[1] == 1 ? true : false,
                    key: this.map_data[idx[1]][idx[0]].type,
                }
            }
        }
        for (let y in this.map_data) {
            for (let x in this.map_data[y]) {
                if (this.map_data[y][x].type > 50 && this.map_data[y][x].type < 54) {
                    let hand_keys = []
                    let handFun = (x_x, dir) => {
                        if (this.map_data[y] && this.map_data[y][x_x] && this.map_data[y][x_x].type > 50 && this.map_data[y][x_x].type < 54) {
                            hand_keys.push([y, x_x])
                            handFun(Number(x_x) + dir, dir)
                        }

                    }
                    if (this.map_data[y][x].type == 51) {
                        handFun(Number(x) - 1, -1)
                    } else if (this.map_data[y][x].type == 52) {
                        handFun(Number(x) + 1, 1)
                    } else {
                        handFun(Number(x) - 1, -1)
                        handFun(Number(x) + 1, 1)
                    }
                    this.AttrItemData[y + "_" + x] = {
                        idxs: hand_keys,
                        count: 0,
                        state: true,
                        key: this.map_data[y][x].type,
                    }
                    let c = TitleType.indexOf(this.map_data[y][x].json[3]) + 1
                }
            }
        }
        this.map_size = {
            arrange: arrange,
            row: row,
        }
    }
    static refish_GoNum(count: number = 0) {
        this.GoNumAll = 0
        let HandKeyArr = [51, 52, 53]
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
            // this.TipTween('压制值计算出问题了')
            return
        }
        if (this.GoNumAll != count) {
            return this.refish_GoNum(this.GoNumAll)
        }



        return this.GoNumAll;
    }
    static getMinArr(selfSTTState, y, x, type?) {
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
    static getHandArr(y, x, type) {
        let HandKeyArr = [51, 52, 53]
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
    static broadsideOK(y, x) {
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
}