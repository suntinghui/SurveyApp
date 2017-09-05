/**
  	   字符文本框=1,
       整数文本框=2,
       浮点数文本框=3,
       多行文本框=4,
       意见类型=5,
       下拉列表框=6,
       日期=7,
       时间=8,
       日期时间=9,
       单选人员=10,
       多选人员=11,
       单选部门=12,
       多选部门=13,
       ╳关联字段=14, 
       ╳手写意见=15,
       ╳图片=16,
       年月=17,
       ╳连接=18,
       ╳附件=19,
       ╳从表=0,
       ╳流水号=21,
       复选框=23 
 **/
/**
 * 控件EditModel
 
显示只读=0,
显示可更新=1,
显示可更新必填=2,
不显示用默认值更新=3,
显示用默认值更新=4
**/

/**
 * 表单BrowModel
	浏览模式 1：浏览模式，0：编辑模式
	浏览模式不添加操作按纽
	
**/
var resp = null;

var LeaderData = null;
var FlowAttr = '1'; // 1-通用工作流；2-公文；3-便函
var draft = '0'; // 0表示是起草，没有退回来源功能

function parseForm(response, flowAttrParam, draftParam) {
	resp = response;

	FlowAttr = flowAttrParam;
	draft = draftParam;

	console.log('一共' + resp.Controls.length + '个元素');

	var fragment = document.createDocumentFragment();
	for(var i = 0; i < resp.Controls.length; i++) {
		var item = resp.Controls[i];

		if(item.EditModel == '3') {
			console.log('不可见元素：' + item.CaptionName + '，不进行解析。');
			continue;
		}

		switch(item.ControlType - 0) {

			case 1: // 字符文本框
			case 2: // 整数文本框
			case 3: // 浮点数文本框 
			case 4: // 多行文本框
				fragment.appendChild(createTextarea(item));
				break;

			case 5: //意见类型
				fragment.appendChild(createOpinionControl(item));
				break;

			case 6: // 下拉列表框
				fragment.appendChild(createComboBox(item));
				break;

			case 7: // 日期
			case 8: // 时间
			case 9: // 日期时间
			case 17: // 年月
				{
					if(FlowAttr == '01' && item.DataField == 'BSRQ') { // 只有公文特殊处理
						fragment.appendChild(createBSRQ(item));

					} else {
						fragment.appendChild(createDateType(item.ControlType - 0, item));
					}
				}
				break;

			case 10: // 单选人员
				fragment.appendChild(createRadioPerson(item));
				break;

			case 11: //  多选人员
				fragment.appendChild(createMultiPerson(item));
				break;

			case 12: // 单选部门
				fragment.appendChild(createRadioDep(item));
				break;

			case 13: // 多选部门
				fragment.appendChild(createMultiDep(item));
				break;

			case 23: // 复选框
				fragment.appendChild(createCheckBoxList(item));
				break;

			default:
				console.log('未解析类型:' + item.ControlType + '--' + item.CaptionName);
				break;
		}
	} // end Control

	// 浏览模式 1：浏览模式，0：编辑模式
	if(resp.BrowModel == '0') {
		fragment.appendChild(createOperBtn());
	}

	return fragment;
}

/**
 对于可编辑字段的处理思路：
 
 不显示用默认值更新=3，不进行解析，取值时直接取值。
 显示只读=0, 
显示可更新=1,  显示用默认值更新=4  显示可更新必填=2且循环遍历检查

**/

/* 1 单行文本框
   单行文本框的处理是可编辑模式下为文本框，在不可编辑模式为div
   
   2 整数文本框
   
   3 浮点数文本框 
   
   4 多行文本框
   
 */
function createTextarea(Control) {
	var div = createDiv("item-div");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");

	if(Control.EditModel == '0') {
		var textdiv = createTextDiv(Control.Value, Control.EditModel);
		textdiv.id = Control.DataField;
		valuediv.appendChild(textdiv);

	} else {
		var textarea = document.createElement('textarea');
		textarea.id = Control.DataField;
		textarea.value = Control.Value;
		if(Control.ControlType == '4') {
			textarea.rows = 4;
		} else {
			textarea.rows = Math.ceil(textarea.length / 10);
		}

		textarea.maxLength = Control.Length;
		valuediv.appendChild(textarea);
	}
	div.appendChild(valuediv);

	return div;
}

/* 
 5 意见类型
 在只读状态下，只显示历史意见
 
 在可编辑模式下需要显示历史意见，可输入框及常用意见按纽
 */
function createOpinionControl(Control) {
	var div = createDiv("item-div");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");

	// 历史意见
	var textdiv = createTextDiv(Control.HistoryValue, Control.EditModel);
	valuediv.appendChild(textdiv);

	// 意见
	var textarea = document.createElement('textarea');
	textarea.id = Control.DataField;
	textarea.value = Control.Value;
	textarea.rows = 2;
	valuediv.appendChild(textarea);

	// 常用意见
	var button = document.createElement('button');
	button.innerHTML = '请选择常用意见';
	button.className = 'mui-btn mui-btn-primary mui-btn-outlined';
	button.style.marginTop = '5px'
	button.addEventListener('tap', function() {
		event05(textarea, Control);
	}, false);
	valuediv.appendChild(button);

	if(Control.EditModel == '0') {
		button.style.display = 'none';
		textarea.style.display = 'none';
	} else {
		textdiv.style.marginBottom = '10px';
	}

	div.appendChild(valuediv);

	return div;
}

/*
 * 6 下拉列表框
 */
function createComboBox(Control) {
	var div = createDiv("item-div mui-table-view-cell");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;
	valuediv.value = '';

	// 设置默认值 
	var selectedOption = getDefaultValue06(Control.Options);
	if(selectedOption != null) {
		valuediv.innerHTML = selectedOption.Text;
		valuediv.value = selectedOption.Value;
		valuediv.selectedOption = selectedOption;
	} else {
		valuediv.innerHTML = '无';
		valuediv.value = '';
	}

	if(Control.EditModel == '0') {
		valuediv.className = 'item-value mui-table';
		valuediv.removeEventListener('tap', function() {
			event06(null, null);
		}, false);
	} else {
		valuediv.className = 'item-value mui-table mui-navigate-right';
		valuediv.addEventListener('tap', function() {
			event06(valuediv, Control);
		}, false);
	}

	div.appendChild(valuediv);

	return div;
}

/* 
 * 7 8 9 17
 * 注意DateFormat类型必须为yyyy-MM-dd HH:mm  MM-dd
 */
function createDateType(type, Control) {
	var div = createDiv("item-div mui-table-view-cell");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;

	if(isNullStr(Control.Value)) {
		valuediv.value = '无';
	} else {
		valuediv.value = Control.Value;
	}

	if(Control.EditModel == '0') {
		valuediv.className = 'item-value';
		valuediv.removeEventListener('tap', function() {
			if(type == 7) {
				event07(null, null);
			} else if(type == 8) {
				event08(null, null);
			} else if(type == 9) {
				event09(null, null);
			} else if(type == 17) {
				event17(null, null);
			}

		}, false);
	} else {
		valuediv.className = 'item-value mui-table mui-navigate-right';
		valuediv.addEventListener('tap', function() {
			if(type == 7) {
				event07(valuediv, Control);
			} else if(type == 8) {
				event08(valuediv, Control);
			} else if(type == 9) {
				event09(valuediv, Control);
			} else if(type == 17) {
				event17(valuediv, Control);
			}
		}, false);
	}

	valuediv.innerHTML = Control.Value;
	div.appendChild(valuediv);

	return div;
}

/*
 * 报审日期 特殊复合控件
 */
function createBSRQ(Control) {
	var div = createDiv("item-div mui-table-view-cell");

	// 报审日期
	div.appendChild(createNameDiv(Control.CaptionName));

	// 复合域
	var valuediv = createDiv("item-value");

	//送审时间
	var songshenDiv = createDiv('item-bsrq');

	var songshenName = createLeft('送阅时间');
	songshenDiv.appendChild(songshenName);

	var songshenValueDiv = createRight('');
	songshenValueDiv.id = 'SendReadTime';
	songshenValueDiv.disabled = true;
	songshenValueDiv.style.border = 'none';
	songshenDiv.appendChild(songshenValueDiv);

	valuediv.appendChild(songshenDiv);

	//阅批时间
	var yuepiDiv = createDiv('item-bsrq');

	var yuepiName = createLeft('阅批时间');
	yuepiDiv.appendChild(yuepiName);

	var yuepiValueDiv = createRight('');
	yuepiValueDiv.id = 'ReadHandTime';
	yuepiValueDiv.disabled = true;
	yuepiValueDiv.style.border = 'none';
	yuepiDiv.appendChild(yuepiValueDiv);

	valuediv.appendChild(yuepiDiv);

	//批审时间
	var pishenDiv = createDiv('item-bsrq');

	var pishenName = createLeft('报审时间');
	pishenDiv.appendChild(pishenName);

	var pishenValueDiv = createRight('');
	pishenValueDiv.id = 'BSTime';
	pishenDiv.appendChild(pishenValueDiv);

	valuediv.appendChild(pishenDiv);

	// 上网方式
	var shangwangDiv = createDiv('item-bsrq');

	var shangwangName = createLeft('上网方式');
	shangwangName.style.marginTop = '20px';
	shangwangDiv.appendChild(shangwangName);

	var shangwangValueDiv1 = createDiv('item-bsrq-right');
	shangwangValueDiv1.classList.add('mui-checkbox', 'mui-left');
	shangwangValueDiv1.innerHTML = '<label>公告公示</label><input id="ISGG" name="shangwang" value="0" type="checkbox" ' + (Control.EditModel == "0" ? "disabled" : "") + '>';
	shangwangDiv.appendChild(shangwangValueDiv1);

	var shangwangValueDiv2 = createDiv('item-bsrq-right');
	shangwangValueDiv2.classList.add('mui-checkbox', 'mui-left');
	shangwangValueDiv2.innerHTML = '<label>文件发布</label><input id="ISWJFB" name="shangwang" value="0" type="checkbox" ' + (Control.EditModel == "0" ? "disabled" : "") + '>';
	shangwangDiv.appendChild(shangwangValueDiv2);

	valuediv.appendChild(shangwangDiv);

	// 留存公开
	var liucunDiv = createDiv('item-bsrq');

	var liucunName = createLeft('留存公开');
	liucunName.style.marginTop = '30px';
	liucunDiv.appendChild(liucunName);

	var liucunValueDiv1 = createDiv('item-bsrq-right');
	liucunValueDiv1.classList.add('mui-checkbox', 'mui-left');
	liucunValueDiv1.innerHTML = '<label>留存</label><input id="ISLC" name="liucun" value="0" type="checkbox" ' + (Control.EditModel == "0" ? "disabled" : "") + '>';
	liucunDiv.appendChild(liucunValueDiv1);

	var liucunValueDiv2 = createDiv('item-bsrq-right');
	liucunValueDiv2.classList.add('mui-checkbox', 'mui-left');
	liucunValueDiv2.innerHTML = '<label>不公开</label><input id="ISOpen" name="liucun" value="0" type="checkbox" ' + (Control.EditModel == "0" ? "disabled" : "") + '>';
	liucunDiv.appendChild(liucunValueDiv2);

	valuediv.appendChild(liucunDiv);

	if(Control.EditModel == '0') {
		pishenValueDiv.disabled = true;
		pishenValueDiv.style.border = 'none';

		shangwangValueDiv1.classList.add('mui-disabled');
		shangwangValueDiv2.classList.add('mui-disabled');

		liucunValueDiv1.classList.add('mui-disabled');
		liucunValueDiv2.classList.add('mui-disabled');

	} else {
		pishenValueDiv.addEventListener('tap', function() {
			var picker = new mui.DtPicker(JSON.parse('{}'));
			picker.show(function(selectItems) {
				pishenValueDiv.innerHTML = selectItems.text;
				pishenValueDiv.value = selectItems.value;
				picker.dispose();
			});
		}, false);
	}

	div.appendChild(valuediv);

	/**
	// 因为无法通过document得到元素，所有只能外移
	for(var i = 0; i < resp.Controls.length; i++) {
		var item = resp.Controls[i];
		if(item.DataField == 'ZZLD' && item.SelectedUsers.length > 0) {
			requestRecDocLeader(item.SelectedUsers[0].UserId);
			break;
		}
	}
	**/

	return div;
}

function findZZLD() {
	for(var i = 0; i < resp.Controls.length; i++) {
		var item = resp.Controls[i];
		if(item.DataField == 'ZZLD' && item.SelectedUsers.length > 0) {
			requestRecDocLeader(item.SelectedUsers[0].UserId);
			break;
		}
	}
}

function createLeft(value) {
	var textdiv = document.createElement('div');
	textdiv.className = "item-bsrq-left";
	textdiv.innerHTML = value;
	return textdiv;
}

function createRight(value) {
	var textarea = document.createElement('textarea');
	textarea.className = 'item-bsrq-right';
	textarea.value = value;
	textarea.rows = 1;
	return textarea;
}

/* 
 * 10  单选人员
 * 
 * 如果DataSource不为null，则从DataSource中取值,并以复选框的形式展现，
 * 如果DataSource为null，则从人员列表 userlist.html 中取值。
 * 
 */
function createRadioPerson(Control) {
	var div = createDiv("item-div mui-table-view-cell");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;

	if(!isNullStr(Control.SelectedUsers) && Control.SelectedUsers.length != 0) {
		valuediv.innerHTML = Control.SelectedUsers[0].UserName;
		valuediv.value = Control.SelectedUsers[0].UserId;
	} else {
		valuediv.innerHTML = '无';
		valuediv.value = '';
	}

	if(Control.EditModel == '0') {
		valuediv.className = 'item-value';
		valuediv.removeEventListener('tap', function() {
			event10(null, null);
		}, false);

	} else {
		// 如果是可编辑状态，则区分是userlist取值还是通过datasource取值。
		if(isNullStr(Control.DataSource)) {
			// from userlist.html
			valuediv.className = 'item-value mui-table mui-navigate-right';
			valuediv.addEventListener('tap', function() {
				event10(valuediv, Control);
			}, false);

		} else {
			valuediv.innerHTML = '';
			valuediv.value = '';

			var selectedIdArrs = new Array();
			for(var i = 0; i < Control.SelectedUsers.length; i++) {
				selectedIdArrs.push(Control.SelectedUsers[i].UserId);
			}

			// 单选
			for(var i = 0; i < Control.DataSource.length; i++) {
				var temp = Control.DataSource[i];
				var tempdiv = document.createElement('div');
				tempdiv.className = "mui-input-row mui-radio mui-left";

				var checked = (contains(selectedIdArrs, temp.UserId) ? ' checked ' : ' ');
				tempdiv.innerHTML = '<label>' + temp.UserName + '</label><input name="' + Control.DataField + '" value="' + temp.UserId + '" type="radio" ' + checked + ' > ';
				valuediv.appendChild(tempdiv);
			}
		}
	}

	div.appendChild(valuediv);

	return div;
}

/*
 * 11 多选人员
 */
function createMultiPerson(Control) {
	var div = createDiv("item-div mui-table-view-cell");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;

	if(!isNullStr(Control.SelectedUsers) && Control.SelectedUsers.length != 0) {
		var arrName = new Array();
		var arrId = new Array();
		for(var i = 0; i < Control.SelectedUsers.length; i++) {
			arrName.push(Control.SelectedUsers[i].UserName);
			arrId.push(Control.SelectedUsers[i].UserId);
		}
		valuediv.innerHTML = arrName;
		valuediv.value = arrId;
	} else {
		valuediv.innerHTML = '无';
		valuediv.value = '';
	}

	if(Control.EditModel == '0') {
		valuediv.className = 'item-value';
		valuediv.removeEventListener('tap', function() {
			event11(null, null);
		}, false);

	} else {
		// 如果是可编辑状态，则区分是userlist取值还是通过datasource取值。
		if(isNullStr(Control.DataSource)) {
			// from userlist.html
			valuediv.className = 'item-value mui-table mui-navigate-right';
			valuediv.addEventListener('tap', function() {
				event11(valuediv, Control);
			}, false);

		} else {
			valuediv.innerHTML = '';
			valuediv.value = '';

			if(!isNullStr(Control.SelectedUsers)) {
				var selectedIdArrs = new Array();
				for(var i = 0; i < Control.SelectedUsers.length; i++) {
					selectedIdArrs.push(Control.SelectedUsers[i].UserId);
				}
			}

			// 多选
			for(var i = 0; i < Control.DataSource.length; i++) {
				var temp = Control.DataSource[i];
				var tempdiv = document.createElement('div');
				tempdiv.className = "mui-input-row mui-checkbox mui-left";

				var checked = (contains(selectedIdArrs, temp.UserId) ? ' checked ' : ' ');
				tempdiv.innerHTML = '<label>' + temp.UserName + '</label><input name="' + Control.DataField + '" value="' + temp.UserId + '" type="checkbox" ' + checked + ' > ';
				valuediv.appendChild(tempdiv);
			}
		}
	}

	div.appendChild(valuediv);

	return div;
}

// 12 单选部门
function createRadioDep(Control) {
	var div = createDiv("item-div mui-table-view-cell");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;

	if(!isNullStr(Control.SelectedDeps) && Control.SelectedDeps.length != 0) {
		valuediv.innerHTML = Control.SelectedDeps[0].DepName;
		valuediv.value = Control.SelectedDeps[0].DepId;
	} else {
		valuediv.innerHTML = '无';
		valuediv.value = '';
	}

	if(Control.EditModel == '0') {
		valuediv.className = 'item-value';
		valuediv.removeEventListener('tap', function() {
			event12(null, null);
		}, false);

	} else {
		// 如果是可编辑状态，则区分是deptlist取值还是通过datasource取值。
		if(isNullStr(Control.DataSource)) {
			// from deptlist.html
			valuediv.className = 'item-value mui-table mui-navigate-right';
			valuediv.addEventListener('tap', function() {
				event12(valuediv, Control);
			}, false);

		} else {
			valuediv.innerHTML = '';
			valuediv.value = '';

			var selectedIdArrs = new Array();
			for(var i = 0; i < Control.SelectedDeps.length; i++) {
				selectedIdArrs.push(Control.SelectedDeps[i].DepId);
			}

			// 单选
			for(var i = 0; i < Control.DataSource.length; i++) {
				var temp = Control.DataSource[i];
				var tempdiv = document.createElement('div');
				tempdiv.className = "mui-input-row mui-radio mui-left";

				var checked = (contains(selectedIdArrs, temp.DepId) ? ' checked ' : ' ');
				tempdiv.innerHTML = '<label>' + temp.DepName + '</label><input name="' + Control.DataField + '" value="' + temp.DepId + '" type="radio" ' + checked + ' > ';
				valuediv.appendChild(tempdiv);
			}
		}
	}

	div.appendChild(valuediv);

	return div;
}

// 13 多选部门
function createMultiDep(Control) {
	var div = createDiv("item-div mui-table-view-cell");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;

	if(!isNullStr(Control.SelectedDeps) && Control.SelectedDeps.length != 0) {
		var arrName = new Array();
		var arrId = new Array();
		for(var i = 0; i < Control.SelectedDeps.length; i++) {
			arrName.push(Control.SelectedDeps[i].DepName);
			arrId.push(Control.SelectedDeps[i].DepId);
		}
		valuediv.innerHTML = arrName;
		valuediv.value = arrId;
	} else {
		valuediv.innerHTML = '无';
		valuediv.value = '';
	}

	if(Control.EditModel == '0') {
		valuediv.className = 'item-value';
		valuediv.removeEventListener('tap', function() {
			event13(null, null);
		}, false);

	} else {
		// 如果是可编辑状态，则区分是deptlist取值还是通过datasource取值。
		if(isNullStr(Control.DataSource)) {
			// from userlist.html
			valuediv.className = 'item-value mui-table mui-navigate-right';
			valuediv.addEventListener('tap', function() {
				event13(valuediv, Control);
			}, false);

		} else {
			valuediv.innerHTML = '';
			valuediv.value = '';

			var selectedIdArrs = new Array();
			for(var i = 0; i < Control.SelectedDeps.length; i++) {
				selectedIdArrs.push(Control.SelectedDeps[i].DepId);
			}

			// 多选
			for(var i = 0; i < Control.DataSource.length; i++) {
				var temp = Control.DataSource[i];
				var tempdiv = document.createElement('div');
				tempdiv.className = "mui-input-row mui-checkbox mui-left";

				var checked = (contains(selectedIdArrs, temp.DepId) ? ' checked ' : ' ');
				tempdiv.innerHTML = '<label>' + temp.DepName + '</label><input name="' + Control.DataField + '" value="' + temp.DepId + '" type="checkbox" ' + checked + ' > ';
				valuediv.appendChild(tempdiv);
			}
		}
	}

	div.appendChild(valuediv);

	return div;
}

/* 
 * 23 复选框
 */
function createCheckBoxList(Control) {
	var div = createDiv("item-div");

	div.appendChild(createNameDiv(Control.CaptionName));

	var valuediv = createDiv("item-value");
	valuediv.id = Control.DataField;

	// 不可编辑模式下，查找已选择的数据
	if(Control.EditModel == '0') {
		var text = '';
		var value = '';
		for(var i = 0; i < Control.Options.length; i++) {
			var item = Control.Options[i];
			if(item.Selected) {
				text += (item.Text + '</br>');
				value += (item.Value + Control.SplitStr);
			}
		}

		if(value.length > 0) {
			value = value.substring(0, value.length - 1);
		}

		valuediv.innerHTML = text;
		valuediv.value = value;

	} else {
		for(var i = 0; i < Control.Options.length; i++) {
			var temp = Control.Options[i];
			var tempdiv = document.createElement('div');
			tempdiv.className = "mui-input-row mui-checkbox mui-left checkbox";
			tempdiv.innerHTML = '<label>' + temp.Text + '</label><input name="' + Control.DataField + '" value="' + temp.Value + '" type="checkbox" ' + (temp.Selected ? "checked" : "") + ' > ';
			valuediv.appendChild(tempdiv);
		}
	}
	div.appendChild(valuediv);

	return div;
}

function createOperBtn() {
	var div = createDiv('button-div');
	var save = createBtn('save', '保存', 'mui-btn mui-btn-primary oabtn oper-btn');
	save.addEventListener('tap', function() {
		mui.confirm('您确定要保存吗？', '提示', ['取消', '确认'], function(e) {
			if(e.index == 1) {
				for(var i = 0; i < resp.Controls.length; i++) {
					if(resp.Controls[i].DataField == 'BSRQ' && resp.Controls[i].EditModel != '0') {
						requestSaveLeader(false);
						return;
					}
				}

				saveOper(false);
			}
		});

	}, false);

	div.appendChild(save);

	var next = createBtn('next', '提交下一步', 'mui-btn mui-btn-primary oabtn oper-btn')
	next.addEventListener('tap', function() {
		confirmNext();

	}, false);

	div.appendChild(next);

	var back = createBtn('back', '退回来源', 'mui-btn mui-btn-primary oabtn oper-btn');
	back.addEventListener('tap', function() {
		mui.confirm('您确定要退回来源吗？', '提示', ['取消', '确认'], function(e) {
			if(e.index == 1) {
				backOper();
			}
		});
	}, false);

	if(draft - 0 != 0) {
		div.appendChild(back);
	}

	return div;
}

/**************************************/

function getDefaultValue06(Options) {
	for(var i = 0; i < Options.length; i++) {
		if(Options[i].Selected == true) {
			return Options[i];
		}
	}

	return null;
}

/**************************************/

function event05(textarea, Control) {
	var data = new Array();
	for(var i = 0; i < Control.ComOpinions.length; i++) {
		var item = Control.ComOpinions[i];
		data.push({
			value: item.OpinionId,
			text: item.OpinionText
		});
	}

	var userPicker = new mui.PopPicker();
	userPicker.setData(data);
	userPicker.show(function(selectItems) {
		textarea.value += selectItems[0].text;
	});
}

function event06(valuediv, Control) {
	var data = new Array();
	for(var i = 0; i < Control.Options.length; i++) {
		var item = Control.Options[i];
		data[i] = {
			value: item.Value,
			text: item.Text
		};
	}

	var userPicker = new mui.PopPicker();
	userPicker.setData(data);
	userPicker.pickers[0].setSelectedValue(valuediv.selectedOption.Value, 1000);

	userPicker.show(function(selectItems) {
		valuediv.selectedOption = {
			Value: selectItems[0].value,
			Text: selectItems[0].text
		};
		valuediv.innerHTML = selectItems[0].text;
		valuediv.value = selectItems[0].value;
	});
}

function event07(valuediv, Control) {
	var picker = new mui.DtPicker(JSON.parse('{"type":"date"}'));
	picker.show(function(selectItems) {
		valuediv.innerHTML = selectItems.text;
		valuediv.value = selectItems.value;
		picker.dispose();
	});
}

function event08(valuediv, Control) {
	var picker = new mui.DtPicker(JSON.parse('{"type":"time"}'));
	picker.show(function(selectItems) {
		valuediv.innerHTML = selectItems.text;
		valuediv.value = selectItems.value;
		picker.dispose();
	});
}

function event09(valuediv, Control) {
	var picker = new mui.DtPicker(JSON.parse('{}'));
	picker.show(function(selectItems) {
		valuediv.innerHTML = selectItems.text;
		valuediv.value = selectItems.value;
		picker.dispose();
	});
}

function event10(valuediv, Control) {
	mui.plusReady(function() {
		var prePage = plus.webview.currentWebview();

		mui.openWindow({
			url: 'userlist.html',
			id: Math.random(),
			preload: true,
			show: {
				aniShow: 'pop-in'
			},
			extras: {
				selectedUsers: Control.SelectedUsers,
				radioType: true,
				firevent: 'event10',
				webviewId: prePage.id,
				divid: valuediv.id
			}
		});
	})
}

function event11(valuediv, Control) {
	mui.plusReady(function() {
		var prePage = plus.webview.currentWebview();

		mui.openWindow({
			url: 'userlist.html',
			id: Math.random(),
			preload: true,
			show: {
				aniShow: 'pop-in'
			},
			extras: {
				selectedUsers: Control.SelectedUsers,
				radioType: false,
				firevent: 'event10',
				webviewId: prePage.id,
				divid: valuediv.id
			}
		});
	})
}

function event12(valuediv, Control) {
	mui.plusReady(function() {
		var prePage = plus.webview.currentWebview();

		mui.openWindow({
			url: 'deptlist.html',
			id: Math.random(),
			preload: true,
			show: {
				aniShow: 'pop-in'
			},
			extras: {
				selectedUsers: Control.SelectedDeps,
				radioType: true,
				firevent: 'event10',
				webviewId: prePage.id,
				divid: valuediv.id
			}
		});
	})
}

function event13(valuediv, Control) {
	mui.plusReady(function() {
		var prePage = plus.webview.currentWebview();

		mui.openWindow({
			url: 'deptlist.html',
			id: Math.random(),
			preload: true,
			show: {
				aniShow: 'pop-in'
			},
			extras: {
				selectedUsers: Control.SelectedDeps,
				radioType: false,
				firevent: 'event10',
				webviewId: prePage.id,
				divid: valuediv.id
			}
		});
	})
};

mui.plusReady(function() {
	window.addEventListener('event10', function(event) {
		console.log('==========fire');
		//获得事件参数
		var data = event.detail.data;
		//console.log(JSON.stringify(data));

		var valuediv = document.getElementById(data.divid);
		valuediv.value = data.value;
		valuediv.innerHTML = data.text;
	});

}); // end

function event17(valuediv, Control) {
	var picker = new mui.DtPicker(JSON.parse('{"type":"month"}'));
	picker.show(function(selectItems) {
		valuediv.innerHTML = selectItems.text;
		valuediv.value = selectItems.value;
		picker.dispose();
	});
}

// 创建一个普通div，指定class
function createDiv(className) {
	var div = document.createElement('div');
	div.className = className;
	return div;
}

// 创建左边的文本标题区域
function createNameDiv(name) {
	var namediv = document.createElement('div');
	namediv.className = "item-name";
	namediv.innerHTML = name;
	return namediv;
}

// 值域部分，不可编辑模式下，只显示文本
function createTextDiv(value, editModel) {
	var textdiv = document.createElement('div');
	textdiv.className = "item-value";
	textdiv.style.width = '100%';
	textdiv.innerHTML = value;
	return textdiv;
}

function createBtn(id, text, classname) {
	var btn = document.createElement('button');
	btn.type = 'button';
	btn.id = id;
	btn.className = classname;
	btn.innerText = text;
	return btn;
} // end

function confirmNext() {
	mui.confirm('您确定要提交下一步吗？', '提示', ['取消', '确认'], function(e) {
		if(e.index == 1) {
			if(!checkFormInput(getFormValue())) {
				return;
			}

			for(var i = 0; i < resp.Controls.length; i++) {
				if(resp.Controls[i].DataField == 'BSRQ' && resp.Controls[i].EditModel != '0') {
					if(isNullStr(document.getElementById("BSTime").value)) {
						mui.toast('报审时间不能为空');
						return;
					}

					requestSaveLeader(true);
					return;
				}
			}

			/*
			 * 注意这里！
			 * 司法局提交后直接流转完成
			 * 路建需要输入签核意见，提交其实就是下一步的操作。做完保存后直接进入签核界面。
			 * 
			 */
			saveOper(true);
		}

	});
}

// 注意界面中的InstanceId
function saveOper(next) {
	var childRecordId = '';

	mui.plusReady(function() {
		plus.nativeUI.showWaiting("正在加载..."); //这里是开始显示原生等待框
	});

	mui.post(getHost() + 'WorkFlow.ashx?Commond=SaveFormData', {
		instanceId: InstanceId,
		tokenKey: window.localStorage.getItem(TokenKey),
		recordId: exReturnSpace(resp.RecordId),
		childRecordId: '',
		PhyDataTable: resp.PhyDataTable,
		formData: JSON.stringify(getFormValue())

	}, function(data) {
		mui.plusReady(function() {
			plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
		});

		console.log('保存：' + JSON.stringify(data));

		if(next) {
			// 页面中定义该函数，方便传值
			gotoSignView();

		} else {
			mui.alert('保存操作成功', '提示', function() {
				closeToMain();
			});
		}

	}, 'json');

}

// 提交下一步
function nextOper() {
	mui.plusReady(function() {
		plus.nativeUI.showWaiting("正在加载..."); //这里是开始显示原生等待框
	});

	var url = getHost() + 'WorkFlow.ashx?Commond=FlowNext&tokenKey=' + window.localStorage.getItem(TokenKey) + '&recordId=' + exReturnSpace(resp.RecordId) + '&flowAttr=' + FlowAttr;
	mui.ajax(url, {
		dataType: 'json', //服务器返回json格式数据
		type: 'POST', //HTTP请求类型
		timeout: TIMEOUT, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			console.log(JSON.stringify(data));

			mui.alert('提交操作成功', '提示', function() {
				needRefresh = true;

				closeToMain();
			});

		},
		error: function(xhr, type, errorThrown) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			mui.toast(getHttpErrorDesp(type));
		}
	});
}

function backOper() {
	mui.plusReady(function() {
		plus.nativeUI.showWaiting("正在加载..."); //这里是开始显示原生等待框
	});

	var url = getHost() + 'WorkFlow.ashx?Commond=GoBack&tokenKey=' + window.localStorage.getItem(TokenKey) + '&recordId=' + exReturnSpace(resp.RecordId);
	mui.ajax(url, {
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: TIMEOUT, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			console.log(JSON.stringify(data));

			mui.alert('退回操作成功', '提示', function() {
				closeToMain();
			});

		},
		error: function(xhr, type, errorThrown) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			mui.toast(getHttpErrorDesp(type));
		}
	});
}

// 得到各字段的值
function getFormValue() {
	console.log('开始取各字段的值...');
	var arr = new Array();

	for(var i = 0; i < resp.Controls.length; i++) {
		var item = resp.Controls[i];

		if(item.DataField == 'BSRQ') {
			arr.push(createKeyValue(item.CaptionName, item.DataField, '', item.ControlType, item.EditModel));
			continue;
		}

		// 如果是不可见，则不解析至界面，直接取值。
		if(item.EditModel == '3') {
			arr.push(createKeyValue(item.CaptionName, item.DataField, exReturnSpace(item.Value), item.ControlType, item.EditModel));
			continue;
		}

		switch(item.ControlType - 0) {
			// 如果是单选和多选的情况下
			case 10:
			case 11:
			case 12:
			case 13:
				{
					// 并且是在可编辑且datasource不为空的情况下取值方式为，在其他情况下已经赋值
					if((item.EditModel != '0') && !isNullStr(item.DataSource)) {
						var ele = document.getElementById(item.DataField);

						var checkboxArray = [];
						var checkedValues = [];
						if(item.ControlType == '10' || item.ControlType == '12') {
							checkboxArray = [].slice.call(ele.querySelectorAll('input[type="radio"]'));
						}
						if(item.ControlType == '11' || item.ControlType == '13') {
							checkboxArray = [].slice.call(ele.querySelectorAll('input[type="checkbox"]'));
						}
						checkboxArray.forEach(function(box) {
							if(box.checked) {
								checkedValues.push(box.value);
								document.getElementById(item.DataField).value = checkedValues;

								arr.push(createKeyValue(item.CaptionName, item.DataField, exReturnSpace(array2Str(checkedValues)), item.ControlType, item.EditModel));
							}
						});
					} else {
						// 10 11 12 13 在其他情况下已经赋值
						var value = document.getElementById(item.DataField).value;
						arr.push(createKeyValue(item.CaptionName, item.DataField, exReturnSpace(array2Str(value)), item.ControlType, item.EditModel));
					}
				}
				break;

			case 23:
				{
					var ele = document.getElementById(item.DataField);

					var checkboxArray = [].slice.call(ele.querySelectorAll('input[type="checkbox"]'));
					var checkedValues = '';
					checkboxArray.forEach(function(box) {
						if(box.checked) {
							checkedValues += (box.value + item.SplitStr);
							if(checkedValues.length > 0) {
								checkedValues.substring(0, checkedValues.length - 1);
							}
							document.getElementById(item.DataField).value = checkedValues;
							arr.push(createKeyValue(item.CaptionName, item.DataField, exReturnSpace(array2Str(checkedValues)), item.ControlType, item.EditModel));
						}
					});
				}
				break;

			default:
				{
					var value = document.getElementById(item.DataField).value;
					arr.push(createKeyValue(item.CaptionName, item.DataField, exReturnSpace(array2Str(value)), item.ControlType, item.EditModel));
				}

				break;
		}
	}

	return arr;
}

function createKeyValue(CaptionName, DataField, Value, ControlType, EditModel) {
	var keyValue = new Object();
	keyValue.CaptionName = CaptionName;
	keyValue.DataField = DataField;
	keyValue.Value = Value;
	keyValue.ControlType = ControlType;
	keyValue.EditModel = EditModel;
	return keyValue;
}

/**
显示只读=0, 不显示用默认值更新=3,

显示可更新=1,  显示用默认值更新=4（4是1的特殊情况)  显示可更新必填=2且循环遍历检查

**/
function checkFormInput(arr) {
	console.log('开始检查必填输入项...' + arr.length);

	for(var i = 0; i < arr.length; i++) {
		var item = arr[i];

		if(item.EditModel == '2' && isNullStr(item.Value)) {
			mui.toast(item.CaptionName + '为必填项，请检查');
			return false;
		}
	}

	return true;
}

// 主责领导
function requestRecDocLeader(LeaderId) {
	mui.plusReady(function() {
		plus.nativeUI.showWaiting("正在加载...");
	});

	var url = getHost() + 'DocManager.ashx?Commond=GetRecDocLeader&instanceId=' + InstanceId + '&tokenKey=' + window.localStorage.getItem(TokenKey);
	mui.ajax(url, {
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: TIMEOUT, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			console.log('主责领导:' + JSON.stringify(data));

			console.log('LeaderId:' + LeaderId);

			for(var i = 0; i < data.length; i++) {
				if(data[i].LeaderId == LeaderId) {
					LeaderData = data[i];

					responseRecDocLeader();

					break;
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			mui.toast(getHttpErrorDesp(type));
		}
	});
} // end requestRecDocLeader

function responseRecDocLeader() {
	document.getElementById("SendReadTime").value = LeaderData.SendReadTime;
	document.getElementById("ReadHandTime").value = LeaderData.ReadHandTime;
	document.getElementById("BSTime").value = LeaderData.BSTime;
	document.getElementById("ISGG").checked = (LeaderData.ISGG == '0' ? false : true);
	document.getElementById("ISWJFB").checked = (LeaderData.ISWJFB == '0' ? false : true);
	document.getElementById("ISLC").checked = (LeaderData.ISLC == '0' ? false : true);
	document.getElementById("ISOpen").checked = (LeaderData.ISOpen != '0' ? false : true);

} // end responseRecDocLeader

// 保存主责领导从表数据
function requestSaveLeader(next) {
	if(LeaderData == null) {
		mui.toast('数据异常，不能保存主责领导信息');
		return;
	}

	LeaderData.BSTime = document.getElementById("BSTime").value;
	LeaderData.ISGG = (document.getElementById("ISGG").checked ? "1" : "0");
	LeaderData.ISWJFB = (document.getElementById("ISWJFB").checked ? "1" : "0");
	LeaderData.ISLC = (document.getElementById("ISLC").checked ? "1" : "0");
	LeaderData.ISOpen = (!document.getElementById("ISOpen").checked ? "1" : "0");

	mui.plusReady(function() {
		plus.nativeUI.showWaiting("正在保存...");
	});

	var url = getHost() + 'DocManager.ashx?Commond=SaveRecDocLeader&instanceId=' + InstanceId + '&tokenKey=' + window.localStorage.getItem(TokenKey) + '&recDocLeader=[' + JSON.stringify(LeaderData) + ']';
	mui.ajax(url, {
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: TIMEOUT, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(data) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			console.log('保存主责领导从表数据:' + JSON.stringify(data));

			responseSaveLeader(next);
		},
		error: function(xhr, type, errorThrown) {
			mui.plusReady(function() {
				plus.nativeUI.closeWaiting(); //这里监听页面是否加载完毕，完成后关闭等待框
			});

			mui.toast(getHttpErrorDesp(type));
		}
	});
}

function responseSaveLeader(next) {
	saveOper(next);
}