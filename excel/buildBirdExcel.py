# -*- coding:utf-8 -*- 
import xlrd
import types
import json

filePath = ""
outDir = "..\\assets\\resources\\data\\"

def read_table(table,outFileName):
	nrows = table.nrows
	data = {}
	templateList = []
	id = 0
	dataStartLine = 1
	dataKeyRow = 1
	idLine = 0
	for i in range(dataStartLine ,nrows):
		colData = table.row_values(i)
		
		temp_rowData = {}
		for j in range(len(colData)):
			value = colData[j]
			if i == dataKeyRow : #第二行配置的是字段名字
				templateList.append(str(value))
			else:
				if isinstance(value,float):
					value = float(value)
					valueInt = int(value)
					if valueInt == value:
						value = valueInt
					print(value)
				elif not isinstance(value, str):
					value = int(value)
					print(value)
				else :
					value = str(value)
					print(value)
				if j == idLine:
					id = value
				print(templateList[j])			
				temp_rowData[templateList[j]] = value
		if not i == dataKeyRow:
			data[id] = temp_rowData
		
	outPath = outDir + outFileName + ".json"

	data_string = json.dumps(data,indent=1)
	# data_string = "let " + outFileName + " = " + data_string
	print(data_string)

	# export_string = "\nmodule.exports = " + outFileName + ";"

	f = open(outPath, 'w')
	f.write(data_string)
	# f.write(export_string)
	f.close()


def read_excel(excelName,outFileName):
	# 打开文件
	data = xlrd.open_workbook(filePath + excelName)
	table = data.sheets()[0]
	print(excelName,'----------------------------------')
	read_table(table,outFileName)
	

try:
	read_excel("LevelConfigurationTable.xlsx","LevelConfig")
	read_excel("MapLayoutId.xlsx","MapLayoutId")
	# read_excel("DiDiDifficulty1.xlsx","DiDiDifficulty1")
	# read_excel("DiDiDifficulty2.xlsx","DiDiDifficulty2")
	# read_excel("DiDiDifficulty3.xlsx","DiDiDifficulty3")
	# read_excel("DiDiDifficulty4.xlsx","DiDiDifficulty4")
	# read_excel("DiDiDifficultychallenge.xlsx","DiDiDifficultyChallenge")
	# read_excel("GameDifficulty.xlsx","GameDifficulty")
	# read_excel("LevelDifficulty.xlsx","LevelDifficulty")
	read_excel("ProvinceLevel.xlsx","ProvinceLevel")
	# read_excel("AsicLevel.xlsx","AsicLevel")
	print("生成成功！！！")
	pass
except Exception as e:
	print("生成失败！！！")
	print(f"Error: {e}")

input("Press Enter to continue...")