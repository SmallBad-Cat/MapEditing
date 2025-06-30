import { AssetManager, assetManager, log, native, resources, sp, sys, tween, UITransform, v2, v3, Vec2, view } from "cc";
export class GameUtil {
	static FlakesFiles = {}
	static YarnFiles = {}
	static init() {


	}

	// 物品长度距离中心点的距离
	static calculatePositions(lengths) {
		// 计算所有物品的总长度
		const totalLength = lengths.reduce((acc, length) => acc + length, 0);

		// 确定第一个物品的起始位置（相对于中间位置0）
		let startPosition = -totalLength / 2;

		// 存储每个物品的中心位置
		const positions = [];

		lengths.forEach((length) => {
			// 计算物品的中心位置
			const centerPosition = startPosition + length / 2;
			positions.push(centerPosition);

			// 更新下一个物品的起始位置
			startPosition += length;
		});

		return positions;
	}
	static getPos(node, child) {
		if (!child.parent.getComponent(UITransform)) {
			child.parent.addComponent(UITransform)
		}
		return node.getComponent(UITransform).convertToNodeSpaceAR(child.parent.getComponent(UITransform).convertToWorldSpaceAR(child.position))
	}
	static getMedian(numbers) {
		// 获取数组中的最大值和最小值
		let min = Math.min(...numbers);
		let max = Math.max(...numbers);

		// 计算中间值
		let middleValue = (min + max) / 2;
		return middleValue;
	}
	// 打乱对象返回数组
	static ShuffleObj(Obj, count) {
		let arr = []
		let lastTypt = [0, '']
		let getType = () => {
			let Type = null;
			if (Object.keys(Obj).length > 1) {
				let maxKey = [0, null]
				for (let key in Obj) {
					if (!maxKey[0]) {
						maxKey = [Obj[key], key]
					}
					if (maxKey[0] < Obj[key]) {
						if (arr.length > 0 && arr[arr.length - 1] == key) {

						} else {
							maxKey = [Obj[key], key]
						}
					}
					if (lastTypt[1] == 1 && lastTypt[0] != key) {
						maxKey = [Obj[key], key]
					}
				}
				Type = maxKey[1]
			} else {
				Type = Object.keys(Obj)[0]
			}
			Obj[Type] -= 1;
			if (Obj[Type] == 0) {
				delete Obj[Type]
			}
			if (lastTypt[0] == Type) {
				lastTypt[1] = 1
			} else {
				lastTypt[1] = 0
			}
			lastTypt[0] = Type
			return Type;
		}
		for (let i = 0; i < count; i++) {
			arr.push(getType())
		}
		return arr
	}
	static replaceKey(obj, oldKey, newKey) {
		if (obj.hasOwnProperty(oldKey)) {
			obj[newKey] = obj[oldKey];  // 新键赋值
			delete obj[oldKey];         // 删除旧键
		}
		return obj
	}
	static findConsecutiveSequences(arr) {
		const result = [];

		for (let i = 0; i < arr.length - 2; i++) {
			const sequence = [arr[i]];
			let current = Number(arr[i]);

			for (let j = i + 1; j < arr.length && sequence.length < 3; j++) {
				if (arr[j] === current + 1) {
					sequence.push(arr[j]);
					current = arr[j];
				}
			}

			if (sequence.length === 3) {

				result.push(sequence);
			}
		}

		return result;
	}
	// 根据位置获取四边点
	static calculateCorners(centerX, centerY, width, height, angle) {
		// 将角度转换为弧度
		const radians = angle * (Math.PI / 180);

		// 矩形一半的宽高
		const halfWidth = width / 2;
		const halfHeight = height / 2;

		// 计算未旋转时的四个顶点相对于中心点的坐标
		const corners = [
			{ x: -halfWidth, y: -halfHeight }, // 左上
			{ x: halfWidth, y: -halfHeight },  // 右上
			{ x: halfWidth, y: halfHeight },   // 右下
			{ x: -halfWidth, y: halfHeight }   // 左下
		];
		// 旋转并平移这些顶点
		const rotatedCorners = corners.map(corner => {
			const rotatedX = corner.x * Math.cos(radians) - corner.y * Math.sin(radians);
			const rotatedY = corner.x * Math.sin(radians) + corner.y * Math.cos(radians);

			return {
				x: rotatedX + centerX,
				y: rotatedY + centerY
			};
		});
		return rotatedCorners;
	}
	// 获取数组中所有相连和相同的组合
	static analyzeArray(arr) {
		let duplicates = [];
		let links = [];
		let middleCards = [];
		let seen = {};

		// 找到所有相同的值及其下标
		for (let i = 0; i < arr.length; i++) {
			if (seen[arr[i]] !== undefined) {
				duplicates.push({
					value: arr[i],
					indices: [seen[arr[i]], i]
				});
			} else {
				seen[arr[i]] = i;
			}
		}

		// 找到所有相连的值及其下标，并判断是否有中间值
		for (let i = 0; i < arr.length - 1; i++) {
			let current = arr[i];
			let next = arr[i + 1];

			// 处理相连的值
			if (Math.abs(current - next) === 1) {
				links.push({
					pair: [current, next],
					indices: [i, i + 1],
					minLink: Math.min(current, next),
					maxLink: Math.max(current, next)
				});
			}

			// 处理可能有中间值的组合
			if (Math.abs(current - next) === 2) {
				let middle = (current + next) / 2;
				if (!arr.includes(middle)) {
					middleCards.push({
						pair: [current, next],
						indices: [i, i + 1],
						middle
					});
				}
			}
		}
		return { duplicates, links, middleCards };
	}
	static small_view() {
		let size = view.getVisibleSize()
		if (size.width / size.height < 0.5) {
			return false
		}
		return true
	}
	static removeConsecutiveNumbers(data: { [key: number]: number }): [{ [key: number]: number }, number] {
		let count = 0;
		while (true) {
			let keys = Object.keys(data).map(Number).sort((a, b) => a - b); // 对字典的key进行排序
			let changed = false;  // 用于标记是否有删除操作
			let toRemove: number[] = [];  // 临时列表，用于记录需要删除的key

			// 遍历key，查找连续三个数
			for (let i = 0; i < keys.length - 2; i++) {
				let k1 = keys[i], k2 = keys[i + 1], k3 = keys[i + 2];

				// 如果是连续的三个数
				if (k2 === k1 + 1 && k3 === k2 + 1) {
					// 计算这三个key对应的最小值
					let minValue = Math.min(data[k1], data[k2], data[k3]);

					// 对三个key减去最小值
					data[k1] -= minValue;
					data[k2] -= minValue;
					data[k3] -= minValue;

					// 如果对应的值为0，添加到删除列表
					if (data[k1] === 0) {
						toRemove.push(k1);
					}
					if (data[k2] === 0) {
						toRemove.push(k2);
					}
					if (data[k3] === 0) {
						toRemove.push(k3);
					}

					count += minValue;
					changed = true;  // 标记有删除操作
					break;  // 删除后，重新开始遍历字典
				}
			}

			// 删除值为0的key
			for (let key of toRemove) {
				if (data.hasOwnProperty(key)) {  // 检查key是否仍存在，避免KeyError
					delete data[key];
				}
			}

			// 如果没有删除操作，跳出循环
			if (!changed) {
				break;
			}
		}

		return [data, count];
	}

	// 打乱数组，并且只取部分
	static shuffleAndPick(arr, count) {
		// Fisher-Yates 洗牌算法
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		// 返回打乱后数组的前 count 个元素
		return arr.slice(0, count);
	}
	static disturbShuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr
	}
	// 获得最接近的值
	static findClosestValue(arr, target) {
		let closest = arr[0];
		let difference = Math.abs(target - closest);

		arr.forEach(value => {
			const currentDifference = Math.abs(target - value);
			if (currentDifference < difference) {
				closest = value;
				difference = currentDifference;
			}
		});

		return closest;
	}


	// 加载指定 Bundle
	static loadFolderFromBundle(bundleName, folderPath, Type) {
		// 加载资源包
		assetManager.loadBundle(bundleName, (err, bundle) => {
			if (err) {
				console.error(`加载资源包 ${bundleName} 失败:`, err);
				return;
			}
			// console.log(`资源包 ${bundleName} 加载成功!`);
			// 获取文件夹中的所有资源
			const files = bundle.getDirWithPath(folderPath);
			// console.log(`文件夹 ${folderPath} 中的资源:`, files);
			// 对文件数组进行处理
			files.forEach(file => {
				let url = (Type == "Flakes") ? file.path.replace("Flakes/", "") : file.path.replace("YarnFlakes/", "");
				url = url.replace("/", '","')
				if (url.indexOf("spriteFrame") < 0 && url.indexOf("texture") < 0) {
					url = '["' + url + '"]';
					let data = JSON.parse(url);
					if (Type == "Flakes") {
						if (!this.FlakesFiles[data[0]]) {
							this.FlakesFiles[data[0]] = [];
						}
						if (data[1] != "Pic") {
							this.FlakesFiles[data[0]].push(data[1])
						}
					} else {
						if (!this.YarnFiles[data[0]]) {
							this.YarnFiles[data[0]] = [];
						}
						if (data[1] != "Pic") {
							this.YarnFiles[data[0]].push(data[1])
						}
					}


					// console.log(url,JSON.parse(url));
				}
			});
		});
	}

	static isNumericOrLetter(character) {
		return /^[0-9a-zA-Z]$/.test(character);
	}
	static getCsv(data, name) {
		let csvContent = data.map(row =>
			row.map((cell, idx) => idx >= 0 ? `"${cell}"` : cell).join(",")
		).join("\n");
		// let csvContent = data.map(row => row.join(",")).join("\n");
		// 创建一个 Blob 对象并创建一个下载链接
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		Number(new Date().getTime());
		link.download = name + this.getDayType() + '.csv';  // 下载文件名
		// 触发下载
		link.click();
	}
	// static exportXLSX(data, name = "data") {
	// 	// 1. 创建工作表
	// 	const ws = XLSX.utils.aoa_to_sheet(data);
	// 	// 2. 创建工作簿
	// 	const wb = XLSX.utils.book_new();
	// 	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	// 	// 3. 导出
	// 	const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
	// 	// 4. 创建 Blob 并下载
	// 	const blob = new Blob([wbout], { type: "application/octet-stream" });
	// 	const link = document.createElement('a');
	// 	link.href = URL.createObjectURL(blob);
	// 	link.download = name + ".xlsx";
	// 	link.click();
	// }
	static getDayType() {
		let time = new Date();
		let year = time.getFullYear();
		let month = time.getMonth() + 1;
		let date = time.getDate();
		return (year + "-" + month + "-" + date)
	}
	static ChangeStorage(set, key, value?): any {
		if (set) {
			sys.localStorage.setItem(String(key), JSON.stringify(value))
		} else {
			return JSON.parse(sys.localStorage.getItem(String(key)))
		}
		return true
	}
}