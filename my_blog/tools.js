var logger = require("./logs/logHelper").helper;  
var fs = require('fs');
function Tools(){

}
module.exports = Tools;
//获取文件夹下文件的长度
Tools.getFileLength = function getFileLength(path){
	var num = 0;
	// num = this.getFile(path).length;
	var a = fs.readdirSync(path);
	a.forEach(function(item, index){
		if(item !== '.DS_Store'){
			var stat = fs.statSync(path + item);
	        if (stat.isFile()) {
	            num++;
	        }
		}
		
	})
	logger.writeInfo("upload有"+num+" 个文件")
	return num;
};
//获取文件夹下文件
Tools.getFile = function getFile(path){
	var a = fs.readdirSync(path);
	var listarr = new Array(25);
	a.forEach(function(item, index){
		if(item !== '.DS_Store'){
			var stat = fs.statSync(path + item);
	        if (stat.isFile()) {
	            listarr[index-1] = item;
	        }
		}
		
	})
	logger.writeInfo("upload有"+listarr+" 文件")
	return listarr;
};
//删除文件夹下的文件
Tools.deleteFile = function deleteFile(path){
	var result = true;
	fs.unlink(path, function(err) {
	    if (err) {
	    	logger.writeErr("删除文件 "+path+" 时报错，错误信息为："+err);
	    	result = false;
	        return false;
	    }
	    logger.writeInfo("删除文件 "+path+" 文件成功")
	});
	return result;
	
};

