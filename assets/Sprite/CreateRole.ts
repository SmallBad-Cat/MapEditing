import { UITransform, Vec2, cclegacy, log, native, resources, sp, sys, tween, v2 } from "cc";
const TitleType = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "S", "Y", "Z",]
const SustainCount = 2
const MaxCount = 5
export class CreateRole {
    static DoubleLiftType = {
        71: [5, 5, 2],
        72: [6, 6, 2],
        73: [7, 7, 3],
        74: [8, 8, 3],
        75: [9, 9, 3],
        101: [2, 2],
        102: [2, 3],
        103: [3, 3],
    }
    static ElementType = {
        role: [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53],
        lift: [11, 12, 13, 6, 7, 8, 9, 25, 24, 26, 27],
        DTJ: [101, 102, 103]
    }
    static MapType = {
        '5_8': [8, 1],
        '7_9': [8, 1],
        '9_8': [8, 1],
        '7_7': [8, 1],
    }
    static getRoleData(data) {
        // 所有类型数量
        let AllTypeCount = {}
        let all_roles = 0;//所有人数
        let all_lift = 0;//所有电梯角色数量
        let no_role = 0;//无角色地图块
        let size = { x: 1, y: 1 };//地图大小
        let map_data = {}//地图数据
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
        let SizeKey = { 7: { 7: 5, 9: 2 }, 9: { 8: 6 } }
        if (Number.isInteger(all_roles / 3)) {
            return this.getRoleDataStrs(0, data, all_roles, all_lift, color, SizeKey[size.y][size.x])
        } else {
            console.error("地图数据不正确,人数不是3的倍数")
        }

    }
    static getRoleDataStrs(createIdx, datas, roles, lift_roles, color, size): any {
        // let data = JSON.parse(JSON.stringify(datas))
        let data = []
        // console.log(datas)
        for (let x in datas) {
            for (let y in datas[Number(x)]) {
                data.push(datas[Number(x)][Number(y)])
            }
        }
        if (createIdx > 100) {
            console.log("循环次数超过100次，数据存在问题")
            return
        }
        let role_str = ""
        let lift_str = ""
        // 每组人数
        if (roles < 9) {
            color = 2
        }
        const group = 3;
        const count: { [key: number]: number } = {};
        // 计算余数
        const remainder = Math.ceil((roles / 3) % color);
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
        // console.log(count)
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
                const countKey = IDX;
                IDX++;

                if (!liftPeoCount[countKey]) {
                    liftPeoCount[countKey] = 0;
                }
                liftPeoCount[countKey]++;
                count[countKey]--;
                if (count[countKey] === 0) {
                    delete count[countKey];
                }
                if (IDX === Object.keys(count).length) {
                    IDX = 0;
                }
            }
        };

        // console.log("电梯人数拿出后，对应颜色数量", count);
        // console.log("电梯数量", liftPeoCount);
        let DTJObj: number[][] = [];
        let NoDTJ = [];
        const DTJKEY: Record<number, [number, number]> = {
            101: [2, 2],
            102: [2, 3],
            103: [3, 3],
        };
        const peopleTypes = [1, 10, 31, 42, 43, 44, 45, 46, 51, 52, 53];
        const DTJAdd: Record<string, number> = {};
        const ruleFun = (arr: number[]) => {
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
                            size
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
                            // if (map_role[key][arr[1] - 1] === TitleType[idx]) {
                            console.log("左边---------");
                            return false;
                            // }
                            // if (map_role[key][arr[1] + 1] === TitleType[idx]) {
                            //     console.log("右边---------");
                            //     return false;
                            // }
                        }
                    }

                    if (map_role[arr[0]]) {
                        if (map_role[arr[0]][arr[1] - 1] === TitleType[idx]) {
                            // if (map_role[arr[0]][arr[1] - 2] === TitleType[idx]) {
                            console.log("上边---------");
                            return false;
                            // }
                        }
                    }

                    // if (LastHS["H"][arr[0]]) {
                    //     if (LastHS["H"][arr[0]] === TitleType[idx]) {
                    //         if (MapHS["H"][arr[0]][TitleType[idx]][0] === SustainCount) {
                    //             return false;
                    //         } else if (MapHS["H"][arr[0]][TitleType[idx]][1] === MaxCount) {
                    //             if (Object.keys(count).length === 1) {
                    //                 return true;
                    //             }
                    //             return false;
                    //         }
                    //     }
                    // }

                    // if (LastHS["S"][arr[1]]) {
                    //     if (LastHS["S"][arr[1]] === TitleType[idx]) {
                    //         if (MapHS["S"][arr[1]][TitleType[idx]][0] === SustainCount) {
                    //             return false;
                    //         } else if (MapHS["S"][arr[1]][TitleType[idx]][1] === MaxCount) {
                    //             if (Object.keys(count).length === 1) {
                    //                 return true;
                    //             }
                    //             return false;
                    //         }
                    //     }
                    // }

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
                // console.log("None----", newarr);
                idx = get_idx(0);
                // console.log(idx);
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

            for (let arr of data) {
                if (arr.length > 0) {
                    if (arr[2] == 10) {

                    } else if (this.ElementType.role.indexOf(arr[2]) >= 0) {
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
                    } else if (this.ElementType.DTJ.indexOf(arr[2]) >= 0) {
                        if (!map_role[arr[0]]) map_role[arr[0]] = {};
                        if (!map_role[arr[0]][arr[1]]) map_role[arr[0]][arr[1]] = {};
                        const DTJIDX = getDataIdx(arr[0], arr[1]);
                        const key = `${arr[0]}_${arr[1]}`;
                        if (NoDTJ.indexOf(key) < 0) {
                            DTJObj.push([arr[0], arr[1], arr[2]]);
                            let AllDTJType = []
                            for (let i = 0; i < 2; i++) {
                                for (let x = 0; x < DTJKEY[arr[2]][0]; x++) {
                                    for (let y = 0; y < DTJKEY[arr[2]][1]; y++) {
                                        const arrX = x + arr[0];
                                        const arrY = y + arr[1];
                                        const name = `${arrX}_${arrY}`;
                                        const IDX = getDataIdx(arrX, arrY);
                                        if (NoDTJ.indexOf(name) < 0) {
                                            NoDTJ.push(name);
                                            if (x != 0 || y != 0) {
                                                data[IDX][2] = 2
                                            }
                                        }
                                        AllDTJType.push(data[IDX].splice(3, 1)[0])



                                        //  data[IDX].splice(k + 1, 0, newRole);
                                        // if (!DTJAdd[name]) DTJAdd[name] = 0;
                                        // const k = 3 + i + DTJAdd[name];
                                        // AllDTJType.push()
                                        // const newRole = ruleFun(data[IDX]);
                                        // if (peopleTypes.indexOf(data[IDX][k]) >= 0) {
                                        //     if (data[IDX][k] === 1) {
                                        //         data[IDX][k] = newRole;
                                        //     } else {
                                        //         data[IDX].splice(k + 1, 0, newRole);
                                        //         DTJAdd[name]++;
                                        //     }
                                        // }
                                    }
                                }
                            }
                            data[DTJIDX] = data[DTJIDX].concat(AllDTJType)
                        }
                    }

                    if (arr[0] > MapDataLan[0]) MapDataLan[0] = arr[0];
                    if (arr[1] > MapDataLan[1]) MapDataLan[1] = arr[1];
                }
            }

            // console.log("角色：", RoleArr, liftPeoCount);
            // console.log(data);
            let self = this
            // getRole(lift_roles);
            function newLiftRule(peopleCount) {
                const peopleArr = [];

                function getType(key) {
                    let arr = []
                    for (let key_i in liftPeoCount) {
                        arr.push([key_i, liftPeoCount[key_i]])
                    }
                    // console.log(arr)
                    const newarr = self.bubble_sort(arr);
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
                            return self.getRoleDataStrs(createIdx + 1, datas, roles, lift_roles, color, size)
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
            for (let k in count) {
                for (let i = 0; i < count[k]; i++) {
                    Roles += ',' + TitleType[k]
                }
            }
            console.log("Roles", Roles)
            Roles = Roles.slice(1);
            let result = JSON.stringify(data).slice(2, -2);
            result = result.replace(/\],\[/g, ";");
            result = result.replace(/"/g, "");
            return [size, result, Roles]
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
}