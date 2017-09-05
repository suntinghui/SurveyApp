//判断输入字符串是否为空或者全部都是空格
function isNullStr(str) {
	if(str == "") return true;
	if(str == null) return true;
	if(str == undefined) return true;
	var regu = "^[ ]+$";
	var re = new RegExp(regu);
	return re.test(str);
}

function exReturnSpace(str) {
	if(isNullStr(str))
		return '';

	return str;
}

// 得到今天日期yyyy-MM-dd
function getyyyyMMdd(date) {
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();

	var currentdate2 = date.getFullYear() + seperator1 + month + seperator1 + strDate;
	return currentdate2;

}

// 得到某个月的第一天
function currentMonthParam(year, month) {
	var firstdate = new Date(year, month - 1, 1);
	var day = new Date(year, month, 0);
	var lastdate = new Date(year, month - 1, day.getDate()); //获取当月最后一天日期

	var firstday = firstdate.getDay();
	var firststr = getyyyyMMdd(addDate(firstdate, 'd', -firstday));
	var lastday = 6 - lastdate.getDay();
	var laststr = getyyyyMMdd(addDate(lastdate, 'd', lastday));

	return [firstday, firststr, lastday, laststr];
}

// 得到当前月第一天 yyyy-MM-dd
function getCurrentMonthFirst() {
	var date = new Date();
	date.setDate(1);
	return date;
}

function addDate(date, part, value) {
	value *= 1;
	if(isNaN(value)) {
		value = 0;
	}
	switch(part) {
		case "y":
			date.setFullYear(date.getFullYear() + value);
			break;
		case "M":
			date.setMonth(date.getMonth() + value);
			break;
		case "d":
			date.setDate(date.getDate() + value);
			break;
		case "h":
			date.setHours(date.getHours() + value);
			break;
		case "m":
			date.setMinutes(date.getMinutes() + value);
			break;
		case "s":
			date.setSeconds(date.getSeconds() + value);
			break;
		default:
			break;
	}

	return date;
}

//判断是否是手机号
function isPhoneNum(str) {　　
	var reg = /^0?1[3|4|5|8][0-9]\d{8}$/;　　
	if(reg.test(str)) {　　　　
		return true;　　
	} else {　　　　
		return false;　　
	};
}

function getHttpErrorDesp(type) {
	//	mui.plusReady(function() {
	//		plus.nativeUI.closeWaiting(); 
	//	});

	var desp = '未知异常,请重试';
	if(type == 'timeout') {
		desp = '网络请求超时,请重试';
	} else if(type == 'error') {
		desp = '请求出错,请稍候再试';
	} else if(type == 'abort') {
		desp = '请求失败,可能是网络问题或服务器故障';
	} else if(type == 'parsererror') {
		desp = '服务器返回数据异常,请重试';
	} else if(type == 'null') {
		desp = '服务器返回数据为空,请重试';
	}

	return desp;
}

function checkNetwork() {
	// 用没有网络时返回abort
	return;

	if(window.plus) {　　
		onNetChange();
	} else {　　
		document.addEventListener("netchange", onNetChange, false);
	}
}

// 如果返回真则说明有网络,否则没有网络
function onNetChange() {
	var nt = plus.networkinfo.getCurrentType();
	if(nt == plus.networkinfo.CONNECTION_UNKNOW || nt == plus.networkinfo.CONNECTION_NONE) {
		mui.toast("当前没有网络,请检查网络设置");
		return false;
	}

	return true;
}

// 判断对象是否在数组中
function contains(arr, obj) {
	if(isNullStr(arr))
		return false;

	var i = arr.length;
	while(i--) {
		if(arr[i] === obj) {
			return true;
		}
	}
	return false;
}

function array2Str(arr) {
	if(!(arr instanceof Array))
		return arr;

	var str = '';
	for(var i = 0; i < arr.length; i++) {
		str += (arr[i] + ',');
	}

	if(str.length > 1)
		return str.substring(0, str.length - 1);

	return str;

}

function formatToType(format) {
	if(format == '.doc' || format == '.docx') {
		return 1;
	} else if(format == '.xls' || format == '.xlsx') {
		return 2;
	} else if(format == '.pdf') {
		return 3;
	} else if(format == '.html') {
		return 0;
	}

	return -1;
}

function getDocumentTypeImage(type) {
	var img = '../img/format_att.png';
	switch(type - 0) {
		case 0:
			img = '../img/format_html.png';
			break;

		case 1:
			img = '../img/format_word.png';
			break;

		case 2:
			img = '../img/format_excel.png';
			break;

		case 3:
			img = '../img/format_pdf.png';
			break;
	}

	return img;
}

function getDocumentType(type) {
	var end = '.doc';
	switch(type - 0) {
		case 0:
			end = '.html';
			break;

		case 1:
			end = '.doc';
			break;

		case 2:
			end = '.xls';
			break;

		case 3:
			end = '.pdf';
			break;
	}

	return end;
}

// 获取记录办理状态
function getFlowState(FEG_30_COL_190) {
	if(FEG_30_COL_190 == '00')
		return '待接收';

	if(FEG_30_COL_190 == '01')
		return '处理中';

	if(FEG_30_COL_190 == '02')
		return '已结束';

	if(FEG_30_COL_190 == '03')
		return '未接收终止';

	if(FEG_30_COL_190 == '04')
		return '办理中中止';

	return '未定义状态';
}

// 下载文件并自动打开
function openContent(url, type, html) {
	if(type.toUpperCase() == '.HTML') {
		mui.openWindow({
			url: 'showHTML.html',
			id: Math.random(),
			preload: false,
			show: {
				aniShow: 'pop-in'
			},
			extras: {
				content: html
			}

		});
		return;
	}

	mui.plusReady(function() {
		plus.nativeUI.showWaiting("正在下载...");
	});

	var dtask = plus.downloader.createDownload(url, {
		filename: '_doc/oa' + Math.random() + type,
		timeout: 30, // 默认值为120s,超时时间为服务器响应请求的时间（不是下载任务完成的总时间）
		retry: 3, // 默认为重试3次
		retryInterval: 30 // 默认值为30s。

	}, function(download, status) {
		mui.plusReady(function() {
			plus.nativeUI.closeWaiting();
		});

		if(status == 200) {
			console.log("Download success: " + download.getFileName());
			plus.runtime.openFile(download.filename);
		} else {
			mui.toast('下载失败：' + status);
		}
	});
	//dtask.addEventListener("statechanged", onStateChanged, false);
	dtask.start();
}

/**
//获取当前网络类型
function onNetChange() {
	var nt = plus.networkinfo.getCurrentType();　　
	switch(nt) {　　　　
		case plus.networkinfo.CONNECTION_ETHERNET:
		case plus.networkinfo.CONNECTION_WIFI:
			mui.toast("当前网络为WiFi");
			break;

		case plus.networkinfo.CONNECTION_CELL2G:
		case plus.networkinfo.CONNECTION_CELL3G:
		case plus.networkinfo.CONNECTION_CELL4G:
			mui.toast("当前网络非WiFi");
			break;　　　　
		default:
			mui.toast("当前没有网络");
			break;　　
	}
}

**/

// http://www.cnblogs.com/tugenhua0707/p/3776808.html
Date.prototype.format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}