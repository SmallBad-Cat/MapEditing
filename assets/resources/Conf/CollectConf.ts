export namespace CollectConf {

	export interface Collect {
		map_arrange: number;//地图列数
		color_type?: number[];//颜色种类
		lifts_people?: number[];//电梯人数
		group?: number;//组合数
	}

	export const datas = {
		5: {
			map_arrange: 5,
			color_type: [5, 6, 7],
			lifts_people: [6, 9, 12, 15],
			group: 12,
		},
		7: {
			map_arrange: 7,
			color_type: [7, 8, 9, 10],
			lifts_people: [6, 9, 12, 15],
			group: 16,
		},
		9: {
			map_arrange: 9,
			color_type: [7, 8, 9, 10],
			lifts_people: [9, 12, 15, 18],
			group: 16,
		},
		11: {
			map_arrange: 11,
			color_type: [8, 9, 10],
			lifts_people: [9, 12, 15, 21],
			group: 12,
		},
	};

	export const getSingle = (id: any) => {
		return datas[id] as Collect;
	};
}