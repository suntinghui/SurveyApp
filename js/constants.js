// http://103.43.185.166:8066/MobileOffice/
var DEFAULT_HOST = '192.168.3.24:8080';

function getLocalStoreageHost() {
	var host = window.localStorage.getItem(SET_HOST);
	if(isNullStr(host)) {
		host = DEFAULT_HOST;
	}
	return host;
}

function getHost() {
	var host = getLocalStoreageHost();
	return 'http://' + host + '/blade';
}

var SET_HOST = 'SET_HOST';

var TIMEOUT = 20000

var PAGE_SIZE = 20;
var MAX_PAGE_SIZE = 19860727;

// 下面是LocalStorage key
var TokenKey = "TokenKey";
var UserName = "UserName";
var LoginName = "LoginName";

var SaveUserName = 'SaveUserName'; // 登录的用户名
var SavePwd = 'SavePwd';
var RoomId = 'RoomId'; // 机房编号

var CheckSavePwd = 'CheckSavePwd';
var CheckAutoLogin = 'CheckAutoLogin';

var VersionName = '1.9.2';
var VersionCode = '192';

var FIR_LINK = 'https://fir.im/d6qx';
