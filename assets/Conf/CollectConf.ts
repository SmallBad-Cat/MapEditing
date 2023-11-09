export namespace CollectConf {

	export interface Collect {
		map_arrange: number;//地图列数
		color_type?: number[];//颜色种类
		lifts_people?: number[];//电梯人数
		group?: number[];//组合数
	}

	export const datas = {
		6: {
			map_arrange: 6,
			color_type: [8, 9],
			lifts_people: [6, 9, 12],
			group: [6],
		},
		8: {
			map_arrange: 8,
			color_type: [8, 9, 10, 11, 12],
			lifts_people: [6, 9, 12],
			group: [15],
		},
		10: {
			map_arrange: 10,
			color_type: [10, 11, 12],
			lifts_people: [9, 12, 15],
			group: [9],
		},
		12: {
			map_arrange: 12,
			color_type: [11, 12],
			lifts_people: [9, 12, 15],
			group: [6],
		},
	};

	export const getSingle = (id: any) => {
		return datas[id] as Collect;
	};
}