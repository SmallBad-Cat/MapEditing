import { Asset, assetManager, BufferAsset, JsonAsset, log, resources, TextAsset } from "cc";
import XLSX from "./xlsx.full.min.js";

async function saveFile(excelData,fileName,fileType) {
    try {
      // 请求文件句柄
      const handle = await window["showSaveFilePicker"]({
        suggestedName: fileName,
        types: [{
          description: 'Excel 文件',
          accept: { 'text/plain': [fileType] },
        }],
      });
  
      // 创建文件可写流
      const writable = await handle.createWritable();
      
      // 写入数据
      await writable.write(excelData);
      
      // 关闭文件流
      await writable.close();
      console.log('文件保存成功');
    } catch (err) {
      console.error('文件保存失败', err);
    }
}

export class DealExcel {
    public static init(){
        this.registExcel();
    }

    public static buildExcel(data : any,fileName : string) {
        
        // 创建工作簿和工作表
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(data);
    
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
        // 生成 Excel 文件的二进制数据
        const excelData = XLSX.write(workbook, { bookType: "xlsx", type: "array"});
        let excelFileName = fileName + ".xlsx";
        saveFile(excelData,fileName,".xlsx");

        // 创建 Blob 对象
        // const blob = new Blob([excelData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        // // 创建下载链接
        // const link = document.createElement("a");
        // link.href = URL.createObjectURL(blob);
        // link.download = `${fileName}.xlsx`;
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    }

    public static readExcelByPath(filePath : string, callback : Function) {
        resources.load( filePath
            , (err,  data) => {
            if (err) {
                console.error("加载文件时出错:", err);
                return;
            }
            const uint8Array = new Uint8Array(data["_file"]);
            const workbook = XLSX.read(uint8Array, { type: 'array' });
    
            // 获取工作表名
            const sheetNames = workbook.SheetNames;
            
            // 选择第一个工作表
            const sheetName = sheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // 获取工作表范围
            const range = XLSX.utils.decode_range(worksheet['!ref']);

            // 将范围的起始行向下移动一行（跳过第一行）
            range.s.r += 1;
            worksheet['!ref'] = XLSX.utils.encode_range(range);
                        
            // 将工作表转换为 JSON 数据
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            // 输出数据
            log(jsonData);
            callback(jsonData);
        });
        
    }

    public static registExcel() {
        assetManager.downloader.register('.xlsx', function (url, options, callback) {
            options.xhrResponseType = 'arraybuffer';
            downloadFile(url, options, options.onFileProgress as FileProgressCallback, callback);
        });
    }

    // Base64 解码函数
    static base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    static textToArrayBuffer(text) {
        const encoder = new TextEncoder(); // 默认使用 UTF-8 编码
        const uint8Array = encoder.encode(text);
        return uint8Array.buffer;
    }

    static stringToArrayBuffer(str) {
        const encoder = new TextEncoder();
        return encoder.encode(str).buffer;
    }
}

type FileProgressCallback = (loaded: number, total: number) => void;
function downloadFile (
    url: string,
    options: Record<string, any>,
    onProgress: FileProgressCallback | null | undefined,
    onComplete: ((err: Error | null, data?: any) => void),
    ): XMLHttpRequest {
        const xhr = new XMLHttpRequest();
        const errInfo = `download failed: ${url}, status: `;

    xhr.open('GET', url, true);

    if (options.xhrResponseType !== undefined) { xhr.responseType = options.xhrResponseType as XMLHttpRequestResponseType; }
    if (options.xhrWithCredentials !== undefined) { xhr.withCredentials = options.xhrWithCredentials as boolean; }
    if (options.xhrMimeType !== undefined && xhr.overrideMimeType) { xhr.overrideMimeType(options.xhrMimeType as string); }
    if (options.xhrTimeout !== undefined) { xhr.timeout = options.xhrTimeout as number; }

    if (options.xhrHeader) {
        for (const header in options.xhrHeader) {
            xhr.setRequestHeader(header, options.xhrHeader[header] as string);
        }
    }

    xhr.onload = (): void => {
        if (xhr.status === 200 || xhr.status === 0) {
            if (onComplete) { onComplete(null, xhr.response); }
        } else if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(no response)`)); }
    };

    if (onProgress) {
        xhr.onprogress = (e): void => {
            if (e.lengthComputable) {
                onProgress(e.loaded, e.total);
            }
        };
    }

    xhr.onerror = (): void => {
        if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(error)`)); }
    };

    xhr.ontimeout = (): void => {
        if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(time out)`)); }
    };

    xhr.onabort = (): void => {
        if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(abort)`)); }
    };

    xhr.send(null);

    return xhr;
}
DealExcel.init();