import { UITransform, Vec2, cclegacy, log, native, resources, sp, sys, tween, v2 } from "cc";
const TitleType = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "S", "Y", "Z",]
const SustainCount = 2
const MaxCount = 5
type Cell = [number, number, string | null]; // [x, y, color]
type Grid = (null | (null | Cell)[])[];
export class CreateRoleYarnNew {
    static RestoreFixedData = {
        116: 6,
        117: 7,
        118: 8,
        119: 9,
        111: 10,
        112: 101,
        113: 102,
        114: 103,
        115: 104
    }
    static FixedData = {
        6: 116,
        7: 117,
        8: 118,
        9: 119,
        10: 111,
        101: 112,
        102: 113,
        103: 114,
        104: 115
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
    static ElementType = {
        role: [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 111, 1111],
        lift: [11, 12, 13, 6, 7, 8, 9, 25, 24, 26, 27],
        DTJ: [101, 102, 103, 104],
        VIP: [11, 12, 13],
        LiftExport: [99913, 99931, 99923, 99932, 99933, 131]
    }
    static MapType = {
        '5_8': [8, 1],
        '7_9': [8, 1],
        '9_8': [8, 1],
        '8_7': [8, 1],
    }
    static MapData = [
        null,
        [
            null,
            [
                1,
                1,
                105
            ],
            [
                2,
                1,
                1
            ],
            [
                3,
                1,
                1
            ],
            [
                4,
                1,
                1
            ],
            [
                5,
                1,
                1
            ],
            [
                6,
                1,
                1
            ],
            [
                7,
                1,
                1
            ],
            [
                8,
                1,
                1
            ],
            [
                9,
                1,
                105
            ]
        ],
        [
            null,
            [
                1,
                2,
                105
            ],
            [
                2,
                2,
                1
            ],
            [
                3,
                2,
                1
            ],
            [
                4,
                2,
                1
            ],
            [
                5,
                2,
                1
            ],
            [
                6,
                2,
                1
            ],
            [
                7,
                2,
                1
            ],
            [
                8,
                2,
                1
            ],
            [
                9,
                2,
                105
            ]
        ],
        [
            null,
            [
                1,
                3,
                105
            ],
            [
                2,
                3,
                1
            ],
            [
                3,
                3,
                1
            ],
            [
                4,
                3,
                1
            ],
            [
                5,
                3,
                1
            ],
            [
                6,
                3,
                1
            ],
            [
                7,
                3,
                10
            ],
            [
                8,
                3,
                1
            ],
            [
                9,
                3,
                105
            ]
        ],
        [
            null,
            [
                1,
                4,
                105
            ],
            [
                2,
                4,
                1
            ],
            [
                3,
                4,
                1
            ],
            [
                4,
                4,
                10
            ],
            [
                5,
                4,
                1
            ],
            [
                6,
                4,
                1
            ],
            [
                7,
                4,
                1
            ],
            [
                8,
                4,
                6,
                7
            ],
            [
                9,
                4,
                105
            ]
        ],
        [
            null,
            [
                1,
                5,
                105
            ],
            [
                2,
                5,
                1
            ],
            [
                3,
                5,
                1
            ],
            [
                4,
                5,
                1
            ],
            [
                5,
                5,
                1
            ],
            [
                6,
                5,
                1
            ],
            [
                7,
                5,
                1
            ],
            [
                8,
                5,
                1
            ],
            [
                9,
                5,
                105
            ]
        ],
        [
            null,
            [
                1,
                6,
                105
            ],
            [
                2,
                6,
                1
            ],
            [
                3,
                6,
                1
            ],
            [
                4,
                6,
                1
            ],
            [
                5,
                6,
                1
            ],
            [
                6,
                6,
                1
            ],
            [
                7,
                6,
                1
            ],
            [
                8,
                6,
                1
            ],
            [
                9,
                6,
                105
            ]
        ],
        [
            null,
            [
                1,
                7,
                105
            ],
            [
                2,
                7,
                1
            ],
            [
                3,
                7,
                1
            ],
            [
                4,
                7,
                1
            ],
            [
                5,
                7,
                8,
                7
            ],
            [
                6,
                7,
                1
            ],
            [
                7,
                7,
                1
            ],
            [
                8,
                7,
                1
            ],
            [
                9,
                7,
                105
            ]
        ],
        [
            null,
            [
                1,
                8,
                105
            ],
            [
                2,
                8,
                105
            ],
            [
                3,
                8,
                105
            ],
            [
                4,
                8,
                105
            ],
            [
                5,
                8,
                105
            ],
            [
                6,
                8,
                105
            ],
            [
                7,
                8,
                105
            ],
            [
                8,
                8,
                105
            ],
            [
                9,
                8,
                105
            ]
        ]
    ]
    static PeopleColor = { 30: 5, 40: 6, 50: 7, 80: 8, 999: 9 }
    static getRoleData(data, fixed, setColor) {
        // 所有类型数量
        let AllTypeCount = {}
        let all_roles = 0;//所有人数
        let all_lift = 0;//所有电梯角色数量
        let no_role = 0;//无角色地图块
        let size = { x: 1, y: 1 };//地图大小
        let map_data = {}//地图数据
        let LiftExportRoles = 0;
        for (let x in data) {
            if (Number(x) > size.x) {
                size.x = Number(x)
            }
            if (!map_data[x]) {
                map_data[x] = {}
            }
            for (let y in data[x]) {
                if (Number(y) > size.y) {
                    size.y = Number(y)
                }
                let d = data[x][y]
                let t = d[2]
                if (!AllTypeCount[t]) {
                    AllTypeCount[t] = 0
                }
                AllTypeCount[t]++
                if (this.ElementType.lift.indexOf(t) >= 0) {
                    // 电梯
                    all_lift += d[3]
                    all_roles += d[3]
                } else if (this.ElementType.role.indexOf(t) >= 0) {
                    // 角色
                    all_roles += 1
                } else if (this.ElementType.DTJ.indexOf(t) >= 0) {
                    //电梯井
                    all_roles += 2
                } else if (this.ElementType.LiftExport.indexOf(t) >= 0) {
                    let len = d.length - 4
                    all_roles += len + len * d[3]
                    LiftExportRoles += len + len * d[3]
                } else {
                    no_role += 1;
                }
                map_data[x][y] = {
                    "idx": [x, y],
                    "type": t,
                    "go_num": Number(y) - 1,
                }
            }
        }
        let color = 8
        if (setColor) {
            color = setColor
        }
        let SizeKey = { 7: { 7: 5, 9: 2 }, 9: { 8: 6 }, 8: { 7: 7 }, 10: { 9: 1 }, 11: { 10: 2 } }

        let getDatas = {}
        let TitleArr = TitleType.slice(0, color)
        let LiftColor = []
        let UseColor = all_roles - all_lift - LiftExportRoles;
        let t_k = 0
        for (let i = 0; i < all_roles; i++) {

            if (UseColor > 0) {
                UseColor -= 1
            } else {
                LiftColor.push(TitleArr[t_k])
            }
            t_k++
            if (t_k == TitleArr.length) {
                t_k = 0
            }
        }
        // let getData = this.getRoleDataStrs(0, this.fillColors(data, TitleArr), all_roles, all_lift, color, SizeKey[size.y][size.x], fixed, LiftColor)
        // if (getData) {
        //     if (!getDatas[getData[3]]) {
        //         getDatas[getData[3]] = []
        //     }
        //     getDatas[getData[3]].push(getData)
        // }
        for (let i = 0; i < 1000; i++) {
            let getData = this.getRoleDataStrs(0, this.fillColors(data, TitleType.slice(0, color)), all_roles, all_lift, color, SizeKey[size.y][size.x], fixed, LiftColor)
            if (getData) {
                if (!getDatas[getData[3]]) {
                    getDatas[getData[3]] = []
                }
                getDatas[getData[3]].push(getData)
            }
        }
        let maxKey = Math.max(...Object.keys(getDatas).map(Number));
        return getDatas[maxKey][0]

    }
    static getRoleDataStrs(createIdx, datas, roles, lift_roles, color, size, fixed, LiftColor): any {
        let NewLiftColor = JSON.parse(JSON.stringify(LiftColor))
        let ColorState = {}
        // 每组人数
        if (roles < 9) {
            color = 2
        }

        const group = 1;
        const count: { [key: number]: number } = {};
        // 计算余数
        const remainder = Math.ceil((roles / 1) % color);
        // 每个颜色多少人
        const evenyone = Math.floor(roles / group / color);
        // 每个类型有多少组人
        let countAll = 0;
        for (let i = 0; i < color; i++) {
            count[i] = evenyone * group;
            countAll += evenyone * group;
            if (countAll === roles) {
                break;
            }
        }
        let afresh_again = [0]
        // 处理余数
        for (let a = 0; a < remainder; a++) {
            count[a] += group;
            countAll += group;
        }

        // 初始化数据结构
        const map_role = {};
        const MapHS = {
            H: {},
            S: {}
        };
        const LastHS = {
            H: {},
            S: {}
        };
        // 电梯人数统计
        const liftPeoCount: { [key: number]: number } = {};
        // 获取角色分配
        const getRole = (Role_num: number) => {
            let IDX = 0;
            for (let i = 0; i < Role_num; i++) {
                const countKey = Object.keys(count)[IDX];


                if (!liftPeoCount[countKey]) {
                    liftPeoCount[countKey] = 0;
                }
                liftPeoCount[countKey]++;
                count[countKey]--;
                if (count[countKey] == 0) {
                    delete count[countKey];
                }
                IDX++;
                if (IDX === Object.keys(count).length) {
                    IDX = 0;
                }
            }
        };
        let data = []
        let lift_num = 0

        for (let x in datas) {
            for (let y in datas[Number(x)]) {
                let arr = datas[Number(x)][Number(y)]
                if ((arr[2] < 10 && this.ElementType.lift.indexOf(arr[2]) >= 0) || this.ElementType.VIP.indexOf(arr[2]) >= 0) {
                    // lift_num += arr[3]

                    getRole(arr[3])
                }
                data.push(JSON.parse(JSON.stringify(datas[Number(x)][Number(y)])))
            }
        }

        if (createIdx > 1000) {
            console.log("循环次数超过了1000次，数据存在问题")
            return
        }
        let role_str = ""
        let lift_str = ""



        // console.log("电梯人数拿出后，对应颜色数量", count);
        // console.log("电梯数量", liftPeoCount);
        let DTJObj: number[][] = [];
        let NoDTJ = [];
        const DTJKEY: Record<number, [number, number]> = {
            101: [2, 2],
            102: [2, 3],
            103: [3, 3],
            104: [3, 2],
        };
        const peopleTypes = [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 111, 1111];
        const DTJAdd: Record<string, number> = {};
        const ruleFun = (arr: number[]) => {
            if (arr[3]) {
                let K = String(arr.pop())
                let idx = TitleType.indexOf(K)
                count[idx]--;
                if (count[idx] === 0) {
                    delete count[idx];
                }
                return TitleType[idx];
            }
            const afresh = [0, 0];
            let type = 0;
            const liftPeo = [0];
            const role_arr: [number, number][] = [];

            for (const key_i in count) {
                role_arr.push([parseInt(key_i), count[key_i]]);
            }

            const newarr = this.bubble_sort(role_arr);
            let max = 2;
            if (newarr.length - 1 < 3) {
                max = newarr.length - 1;
            }
            const rand = Math.floor(Math.random() * (max + 1));
            const count_i = newarr[rand][1];
            let key_count = rand;
            let Choose = false;

            for (const i of newarr) {
                if (!Choose) {
                    if (i[1] > count_i) {
                        key_count = i[0];
                        Choose = true;
                    }
                }
            }

            const get_idx = (key: number): number => {
                if (newarr.length <= key) {
                    key = 0;
                }

                const idx = newarr[key][0];
                if (type === 0 || type === 1) {
                    afresh[type]++;
                    // 重新调用次数
                    if (afresh[type] >= 25 && afresh[type] < 28) {
                        afresh_again.push(0);
                        return this.getRoleDataStrs(
                            createIdx,
                            datas,
                            roles,
                            lift_roles,
                            color,
                            size,
                            fixed,
                            LiftColor
                        );
                    }
                }

                // 规则方法
                const Rule = (): boolean => {
                    // 横向初始化赋值
                    if (!MapHS["H"][arr[0]]) {
                        MapHS["H"][arr[0]] = {};
                    }
                    if (!MapHS["H"][arr[0]][TitleType[idx]]) {
                        MapHS["H"][arr[0]][TitleType[idx]] = [0, 0];
                    }

                    // 竖向初始化赋值
                    if (!MapHS["S"][arr[1]]) {
                        MapHS["S"][arr[1]] = {};
                    }
                    if (!MapHS["S"][arr[1]][TitleType[idx]]) {
                        MapHS["S"][arr[1]][TitleType[idx]] = [0, 0];
                    }

                    // 限制判断
                    if (!LastHS["H"][arr[0]] && !LastHS["S"][arr[1]]) {
                        return true;
                    }

                    const key = arr[0] - 1;
                    if (map_role[key]) {
                        if (map_role[key][arr[1]] === TitleType[idx]) {
                            return false;
                        }
                    }

                    if (map_role[arr[0]]) {
                        if (map_role[arr[0]][arr[1] - 1] === TitleType[idx]) {
                            return false;
                        }
                    }


                    return true;
                };

                if (Rule()) {
                    return idx;
                } else {
                    return get_idx(key + 1);
                }
            };

            let idx = get_idx(key_count);
            if (idx === undefined) {
                idx = get_idx(0);
            }

            if (afresh_again.length === 1) {
                if (!LastHS["H"][arr[0]]) {
                    LastHS["H"][arr[0]] = TitleType[idx];
                }
                if (!LastHS["S"][arr[1]]) {
                    LastHS["S"][arr[1]] = TitleType[idx];
                }

                if (LastHS["H"][arr[0]] !== TitleType[idx]) {
                    MapHS["H"][arr[0]][TitleType[idx]][0] = 0;
                }
                if (LastHS["S"][arr[1]] !== TitleType[idx]) {
                    MapHS["S"][arr[1]][TitleType[idx]][0] = 0;
                }

                MapHS["H"][arr[0]][TitleType[idx]][0]++;
                MapHS["S"][arr[1]][TitleType[idx]][0]++;
                MapHS["H"][arr[0]][TitleType[idx]][1]++;
                MapHS["S"][arr[1]][TitleType[idx]][1]++;

                LastHS["H"][arr[0]] = TitleType[idx];
                LastHS["S"][arr[1]] = TitleType[idx];

                count[idx]--;
                if (count[idx] === 0) {
                    delete count[idx];
                }
                return TitleType[idx]; // Convert 'A' to 0, 'B' to 1, etc.
            }

            return 0;
        };
        function getDataIdx(x: number, y: number): number {
            return data.findIndex((arr) => arr[0] === x && arr[1] === y);
        }
        if (afresh_again.length === 1) {
            let RoleArr: any[] = [];
            let lift = 0;
            let MapDataLan: [number, number] = [0, 0];
            let LiftExport = []
            for (let arr of data) {
                if (arr.length > 0) {
                    if (arr[2] == 10) {
                        if (fixed) {
                            // const newRole = arr[3] ? arr.pop() : ruleFun(arr);
                            const newRole = ruleFun(arr);
                            if (!map_role[arr[0]]) map_role[arr[0]] = {};
                            if (!map_role[arr[0]][arr[1]]) map_role[arr[0]][arr[1]] = {};
                            RoleArr.push(newRole);
                            map_role[arr[0]][arr[1]] = newRole;
                            arr[2] = 111
                            arr.push(newRole);
                            if (!ColorState[newRole]) {
                                ColorState[newRole] = {
                                    value: 0,
                                    pos: []
                                }
                            }
                            ColorState[newRole].pos.push([arr[0], arr[1], 0])
                        }
                    } else if (this.ElementType.role.indexOf(arr[2]) >= 0) {
                        // const newRole = arr[3] ? arr.pop() : ruleFun(arr);
                        const newRole = ruleFun(arr);
                        if (!map_role[arr[0]]) map_role[arr[0]] = {};
                        if (!map_role[arr[0]][arr[1]]) map_role[arr[0]][arr[1]] = {};
                        RoleArr.push(newRole);
                        map_role[arr[0]][arr[1]] = newRole;

                        if (arr[2] === 1) {
                            arr[2] = newRole;
                        } else {
                            arr.push(newRole);
                        }
                        if (!ColorState[newRole]) {
                            ColorState[newRole] = {
                                value: 0,
                                pos: []
                            }
                        }
                        ColorState[newRole].pos.push([arr[0], arr[1], 0])
                    } else if (this.ElementType.DTJ.indexOf(arr[2]) >= 0) {
                        continue
                        if (!map_role[arr[0]]) map_role[arr[0]] = {};
                        if (!map_role[arr[0]][arr[1]]) map_role[arr[0]][arr[1]] = {};
                        const DTJIDX = getDataIdx(arr[0], arr[1]);
                        const key = `${arr[0]}_${arr[1]}`;
                        if (NoDTJ.indexOf(key) < 0) {
                            DTJObj.push([arr[0], arr[1], arr[2]]);
                            let AllDTJType = []
                            for (let i = 0; i < 2; i++) {
                                for (let y = 0; y < DTJKEY[arr[2]][1]; y++) {
                                    for (let x = 0; x < DTJKEY[arr[2]][0]; x++) {
                                        const arrX = x + arr[0];
                                        const arrY = y + arr[1];
                                        const name = `${arrX}_${arrY}`;
                                        const IDX = getDataIdx(arrX, arrY);
                                        if (!fixed) {
                                            if (NoDTJ.indexOf(name) < 0) {
                                                NoDTJ.push(name);
                                                if (x != 0 || y != 0) {
                                                    data[IDX][2] = 2
                                                }
                                            }
                                            AllDTJType.push(data[IDX].splice(3, 1)[0])
                                        } else {
                                            if (!DTJAdd[name]) DTJAdd[name] = 0;
                                            const k = 3 + i + DTJAdd[name];
                                            const newRole = ruleFun(data[IDX]);
                                            if (peopleTypes.indexOf(data[IDX][k]) >= 0) {
                                                if (data[IDX][k] === 1) {
                                                    data[IDX][k] = newRole;
                                                    AllDTJType.push(1, newRole)
                                                } else {
                                                    data[IDX].splice(k + 1, 0, newRole);
                                                    AllDTJType.push(111, newRole)
                                                    DTJAdd[name]++;
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                            if (fixed) {
                                for (let y = 0; y < DTJKEY[arr[2]][1]; y++) {
                                    for (let x = 0; x < DTJKEY[arr[2]][0]; x++) {
                                        const arrX = x + arr[0];
                                        const arrY = y + arr[1];
                                        const IDX = getDataIdx(arrX, arrY);
                                        if (x != 0 || y != 0) {
                                            data[IDX] = [data[IDX][0], data[IDX][1], 2]
                                        }
                                    }
                                }
                                data[DTJIDX] = [data[DTJIDX][0], data[DTJIDX][1], this.FixedData[data[DTJIDX][2]]]
                            }

                            data[DTJIDX] = data[DTJIDX].concat(AllDTJType)
                        }
                    } else if (this.ElementType.VIP.indexOf(arr[2]) >= 0) {
                        // getRole(arr[3])
                        let VipPeople = NewLiftColor.splice(0, arr[3])
                        let IDX = getDataIdx(arr[0], arr[1])
                        let newArr = [arr[0], arr[1], arr[2]]
                        for (let r of VipPeople) {
                            newArr.push(r)
                        }
                        data[IDX] = newArr
                    } else if (fixed && arr[2] < 10 && this.ElementType.lift.indexOf(arr[2]) >= 0) {
                        // getRole(arr[3])
                        let VipPeople = NewLiftColor.splice(0, arr[3])
                        // newLiftRule(arr[3])
                        let newArr = [arr[0], arr[1], this.FixedData[arr[2]]]
                        for (let r of VipPeople) {
                            newArr.push(r)
                        }
                        let IDX = getDataIdx(arr[0], arr[1])
                        data[IDX] = newArr

                    } else if (arr[2] == 131) {
                        // LiftExportRoles+=len+len*d[3]
                        // 
                        LiftExport.push(arr)
                    }

                    if (arr[0] > MapDataLan[0]) MapDataLan[0] = arr[0];
                    if (arr[1] > MapDataLan[1]) MapDataLan[1] = arr[1];
                }
            }
            for (let Export of LiftExport) {
                 let len = Export.length - 4
                let neew_cound = len+len*Export[3]
                let Roles = "|"+NewLiftColor.splice(0, neew_cound).join();
                let range = Export.slice(4)  // 从下标4开始（下标3后面）
                .filter(item => Array.isArray(item))  // 确保是数组
                .map(item => `${item[0]},${item[1]}`)  // 转换为 "x,y" 格式
                .join('|'); 
                 
                let newArr = [Export[0],Export[1],Export[2]+Roles+"|"+range]
                // for (let count = 0; count < Export[3]; count++) {
                //     for (let i = 4; i < Export.length; i++) {
                //         console.log(Export[i]);
                //         console.log("============");
                //     }
                // }
                let IDX = getDataIdx(newArr[0], newArr[1])
                        data[IDX] = newArr
            }
            // console.log("角色：", RoleArr, liftPeoCount);

            let self = this
            // getRole(lift_roles);
            function newLiftRule(peopleCount) {
                const peopleArr = [];
                function getType(key) {
                    function bubble_sort(arr) {
                        const n = arr.length;
                        for (let i = 0; i < n - 1; i++) {
                            for (let j = 0; j < n - i - 1; j++) {
                                if (arr[j][1] < arr[j + 1][1]) {
                                    const temp = arr[j];
                                    arr[j] = arr[j + 1];
                                    arr[j + 1] = temp;
                                }
                            }
                        }
                        return arr;
                    }
                    let arr = []
                    for (let key_i in liftPeoCount) {
                        arr.push([key_i, liftPeoCount[key_i]])
                    }
                    const newarr = bubble_sort(arr);
                    let rand = Math.floor(Math.random() * 3);
                    if (newarr.length <= rand) rand = 0;
                    let chosenKey = newarr[rand][0];
                    let count_i = newarr[rand][1];

                    let Choose = false;
                    for (let i of newarr) {
                        if (!Choose && i[1] > count_i) {
                            chosenKey = i[0];
                            Choose = true;
                        }
                    }

                    const Type = TitleType[chosenKey];
                    if (peopleArr.length === 0) {
                        liftPeoCount[chosenKey]--;
                        if (liftPeoCount[chosenKey] === 0) delete liftPeoCount[chosenKey];
                        return Type;
                    } else if (newarr.length >= 0) {
                        if (newarr.length === 2 && newarr[0][1] > newarr[1][1] * 3) {
                            afresh_again.push(0);
                            console.log("电梯重来---------", count);
                            return self.getRoleDataStrs(createIdx + 1, datas, roles, lift_roles, color, size, fixed, LiftColor)
                        }

                        if (peopleArr[peopleArr.length - 1] !== Type) {
                            liftPeoCount[chosenKey]--;
                            if (liftPeoCount[chosenKey] === 0) delete liftPeoCount[chosenKey];
                            return Type;
                        }

                        if (newarr.length === 1 || newarr.length > 1) {
                            const nextKey = newarr[1]?.[0] || chosenKey;
                            const nextType = TitleType[nextKey];
                            if (peopleArr[peopleArr.length - 1] !== nextType) {
                                liftPeoCount[nextKey]--;
                                if (liftPeoCount[nextKey] === 0) delete liftPeoCount[nextKey];
                                return nextType;
                            }
                        }

                        if (newarr.length > 2) {
                            const nextKey = newarr[2][0];
                            const nextType = TitleType[nextKey];
                            if (peopleArr[peopleArr.length - 1] !== nextType) {
                                liftPeoCount[nextKey]--;
                                if (liftPeoCount[nextKey] === 0) delete liftPeoCount[nextKey];
                                return nextType;
                            }
                        }

                        return getType(key + 1);
                    }
                }

                for (let i = 0; i < peopleCount; i++) {
                    peopleArr.push(getType(0));
                }

                return peopleArr;
            }
            let Roles = ''
            // const liftArr = newLiftRule(lift_roles);
            // for (let k in count) {
            //     for (let i = 0; i < count[k]; i++) {
            //         Roles += ',' + TitleType[k]
            //     }
            // }

            if (fixed && Roles.length > 0) {
                return this.getRoleDataStrs(createIdx + 1, datas, roles, lift_roles, color, size, fixed, LiftColor)
            }

            let AllValue = 0
            for (let k in ColorState) {
                for (let i in ColorState[k].pos) {
                    let self = ColorState[k].pos[i]
                    for (let i_i in ColorState[k].pos) {
                        if (i != i_i) {
                            let the = ColorState[k].pos[i_i]
                            let lenX = Math.abs(self[0] - the[0]);
                            let lenY = Math.abs(self[1] - the[1]);
                            ColorState[k].value += lenX + lenY;
                            self[2] += lenX + lenY;
                        }
                    }


                }
                AllValue += ColorState[k].value;
            }
            Roles = Roles.slice(1);
            let result = JSON.stringify(data).slice(2, -2);
            result = result.replace(/\],\[/g, ";");
            result = result.replace(/"/g, "");
            return [size, result, Roles, AllValue, ColorState]
        }

    }
    static bubble_sort(arr) {
        const n = arr.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j][1] < arr[j + 1][1]) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
    // 通用随机填色函数
    static fillColors(grid: any[][], colors: string[]): any[][] {
        const emptyCells: { x: number, y: number, cell: any }[] = [];
        for (let y = 1; y < grid.length; y++) {
            const row = grid[y];
            for (let x = 1; x < row.length; x++) {
                const cell = row[x];
                if (!cell) continue;
                if ([1, 10, 111].indexOf(cell[2]) >= 0) {
                    emptyCells.push({ x: cell[0], y: cell[1], cell });
                }
            }
        }

        const colorPositions: { [key: string]: { x: number, y: number }[] } = {};
        colors.forEach(c => colorPositions[c] = []);

        while (emptyCells.length > 0) {
            for (let color of colors) {
                if (emptyCells.length === 0) break;

                let maxDist = -1;
                let candidateCells: number[] = [];

                for (let i = 0; i < emptyCells.length; i++) {
                    const { x, y } = emptyCells[i];
                    let minDist = Infinity;

                    for (let pos of colorPositions[color]) {
                        const dist = Math.abs(pos.x - x) + Math.abs(pos.y - y);
                        if (dist < minDist) minDist = dist;
                    }

                    if (minDist > maxDist) {
                        maxDist = minDist;
                        candidateCells = [i];
                    } else if (minDist === maxDist) {
                        candidateCells.push(i);
                    }
                }

                const chosenIndex = candidateCells[Math.floor(Math.random() * candidateCells.length)];
                const chosen = emptyCells.splice(chosenIndex, 1)[0];

                // 直接赋值颜色，而不是数组
                chosen.cell[3] = color;

                colorPositions[color].push({ x: chosen.x, y: chosen.y });
            }
        }

        return grid;
    }

    // Fisher-Yates 随机打乱
    static shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    static init_start() {
        const colors = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const countPerColor = 5; // 每个颜色填充次数
        const newGrid = this.fillColors(this.MapData, colors);
        console.log(newGrid);
    }
    // 使用示例


    // 打印可视化

}