// http://103.43.185.166:8066/MobileOffice/
var DEFAULT_HOST = '192.168.3.24:8080';

function getHost() {
	return 'http://' + DEFAULT_HOST + '/blade';
}

var TIMEOUT = 20000

var PAGE_SIZE = 20;
var MAX_PAGE_SIZE = 19860727;

// 下面是LocalStorage key
var TokenKey = "TokenKey";
var SaveUserName = 'SaveUserName'; // 登录的用户名
var SavePwd = 'SavePwd';
var EngineroomId = 'EngineroomId'; // 机房编号
var DataCenter = 'DataCenter'; 

var CheckSavePwd = 'CheckSavePwd';
var CheckAutoLogin = 'CheckAutoLogin';

var FIR_LINK = 'https://fir.im/d6qx';
