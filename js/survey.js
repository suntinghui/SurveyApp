function getValue() {
	var i = 0;

	var map = new Object();
	var divs = document.querySelectorAll('.param');
	[].forEach.call(divs, function(div) {
		i++;
		var id = div.getAttribute('id');
		var value = div.value;
		map[id] = value;
	});

	console.log('get属性总数：' + i);
	console.log('get:' + JSON.stringify(map));

	return map;
}

function setValue(obj) {
	var i = 0;

	var divs = document.querySelectorAll('.param');
	[].forEach.call(divs, function(div) {
		i++;
		var id = div.getAttribute('id');
		div.value = obj[id];
	});
	console.log('set属性总数：' + i);
}

// 从数据字典中取值
function getDataFromDic(type) {
	var dictData = JSON.parse(window.localStorage.getItem(DataCenter)).dictData;

	var data = new Array();

	var list = dictData[type].dictList;
	for(var i = 0; i < list.length; i++) {
		data.push({
			value: list[i].num,
			text: list[i].name
		});
	}
	return data;
}

function setPickDefaultText(realCtrlName, selCtrlName, dictKey, defaultValue) {
	var selCtrl = document.getElementById(selCtrlName);

	// 根据defaultValue查询text
	var dictData = JSON.parse(window.localStorage.getItem(DataCenter)).dictData;
	var list = dictData[dictKey].dictList;
	for(var index in list) {
		var item = list[index];
		if(item.num == defaultValue) {
			// 设置默认填充值
			selCtrl.innerHTML = item.name;
			return;
		}
	}
}

// 具有普遍性，不处理特殊情况
// dictKey 数据字典中的key
// defaultValue一般为后台传过来的值
function pickerCtrlImp(realCtrlName, selCtrlName, dictKey, defaultValue) {
	var realCtrl = document.getElementById(realCtrlName);
	var selCtrl = document.getElementById(selCtrlName);

	var userPicker = new mui.PopPicker();
	userPicker.setData(getDataFromDic(dictKey));

	// 设置打开时的默认选中项
	userPicker.pickers[0].setSelectedValue(defaultValue, 2000);

	// 设置未点开时显示的内容
	setPickDefaultText(realCtrlName, selCtrlName, dictKey, defaultValue);

	selCtrl.addEventListener('tap', function(event) {
		userPicker.show(function(items) {
			selCtrl.innerHTML = items[0].text;
			realCtrl.value = items[0].value;
		});
	}, false);
}

// 选择日期
function datePickerCtrlImp(realCtrlName, selCtrlName, defaultValue) {
	var realCtrl = document.getElementById(realCtrlName);
	var selCtrl = document.getElementById(selCtrlName);

	// 设置表面显示值
	selCtrl.innerHTML = defaultValue;
	realCtrl.value = defaultValue;

	selCtrl.addEventListener('tap', function() {
		var picker = new mui.DtPicker(JSON.parse('{"type":"date","beginYear":1950,"endYear":2030}'));

		// 设置打开时间控件后显示的值
		picker.setSelectedValue(defaultValue, 1000);

		picker.show(function(selectItems) {
			selCtrl.innerHTML = selectItems.text;
			realCtrl.value = selectItems.value;

			picker.dispose();
		});
	}, false);
}

// 选择城市
function cityPickerCtrlImp(realCtrlName, selCtrlName, defaultValue) {
	var realCtrl = document.getElementById(realCtrlName);
	var selCtrl = document.getElementById(selCtrlName);

	selCtrl.innerHTML = queryCityName(defaultValue);

	var cityPicker3 = new mui.PopPicker({
		layer: 3
	});
	cityPicker3.setData(cityData3);

	selCtrl.addEventListener('tap', function(event) {
		cityPicker3.show(function(items) {
			selCtrl.innerText = _getParam(items[0], 'text') + " " + _getParam(items[1], 'text') + " " + _getParam(items[2], 'text');
			realCtrl.value = items[2]['value'];
		});
	}, false);

	var _getParam = function(obj, param) {
		return obj[param] || '';
	};

	// 设置点开后的默认选中项
	if(defaultValue && defaultValue.length == 6) {
		// 设定省初始值
		cityPicker3.pickers[0].setSelectedValue(defaultValue.substr(0, 2) + '0000', 0, function() {
			// 设定市初始值
			cityPicker3.pickers[1].setSelectedValue(defaultValue.substr(0, 4) + '00', 1000, function() {
				// 设定区初始值
				cityPicker3.pickers[2].setSelectedValue(defaultValue);
			});
		});
	}
}

// 根据ID查询城市
function queryCityName(code) {
	var areaName = '';
	var proCode = code.substr(0, 2) + '0000';
	var cityCode = code.substr(0, 4) + '00';

	for(var i = 0; i < cityData3.length; i++) {
		if(cityData3[i].value == proCode) {
			areaName += (cityData3[i].text + '-');

			for(var j = 0; j < cityData3[i].children.length; j++) {
				if(cityData3[i].children[j].value == cityCode) {
					areaName += (cityData3[i].children[j].text + '-');

					for(var k = 0; k < cityData3[i].children[j].children.length; k++) {
						if(cityData3[i].children[j].children[k].value == code) {
							areaName += (cityData3[i].children[j].children[k].text);
							
							return areaName;
						}
					}
				}
			}

		}
	}
	
	return '未知';
}