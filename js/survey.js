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

function setPickDefaultText(realCtrlName, selCtrlName, defaultValue) {
	var selCtrl = document.getElementById(selCtrlName);

	// 根据defaultValue查询text
	var dictData = JSON.parse(window.localStorage.getItem(DataCenter)).dictData;
	var list = dictData[realCtrlName].dictList;
	for(var index in list) {
		var item = list[index];
		if(item.id == defaultValue) {
			selCtrl.innerHTML = item.name;
			return;
		}
	}
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

// 具有普遍性，不处理特殊情况
function pickerCtrlImp(realCtrlName, selCtrlName, defaultValue) {
	var realCtrl = document.getElementById(realCtrlName);
	var selCtrl = document.getElementById(selCtrlName);

	var userPicker = new mui.PopPicker();
	userPicker.setData(getDataFromDic(realCtrlName));

	userPicker.pickers[0].setSelectedValue(defaultValue, 2000);
	setPickDefaultText(realCtrlName, selCtrlName, defaultValue);

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
	
	selCtrl.innerHTML = defaultValue;

	selCtrl.addEventListener('tap', function() {
		var picker = new mui.DtPicker(JSON.parse('{"type":"date","beginYear":1950,"endYear":2030}'));

		picker.pickers[0].setSelectedValue(defaultValue, 1000);

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
	
	selCtrl.innerHTML = defaultValue;

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