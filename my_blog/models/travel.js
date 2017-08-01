var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;
var logger = require("./../logs/logHelper").helper;  
function Travel(username, title,imgpath, con,year, time){
	this.user = username;
	this.title = title;
	this.imgpath = imgpath;
	this.con = con;
	this.year = year;
	if(time){
		this.time = time;
	}else{
		this.time = new Date();
	}
}
module.exports = Travel;
//
Travel.prototype.save = function save(callback){
	//存入Mongodb 的文档
	var post = {
		user: this.user,
		title: this.title,
		imgpath: this.imgpath,
		con: this.con,
		year: this.year,
		time: this.time
	};
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取travels集合
		db.collection('travels', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//为user属性添加索引
			collection.ensureIndex('user');
			//写入post文档
			collection.insert(post, function(err, post){
				mongodb.close();
				callback(err, post);
			});
		});
	});
};
Travel.del = function del(id, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		var imgpath = "";
		//读取users集合
		db.collection('travels', function(err, collection){
			if(err){
				mongodb.close();
				logger.writeErr(err);
				return callback(err,null);
			}
			collection.find({"_id": new ObjectID(id)}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					callback(err, null);
					
				}
				imgpath = docs[0].imgpath;
				logger.writeInfo("数据库查询旅游时光轴数据的图片路径为:");
				logger.writeInfo(imgpath);

			});
			collection.remove({"_id": new ObjectID(id)}, 1, function(err, result){
				mongodb.close();
				logger.writeInfo("数据库删除旅游时光轴数据:");
				logger.writeInfo(result);
				callback(null, imgpath);
			});
		});
	});
};
Travel.get = function get(username,year, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取travels集合
		db.collection('travels', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//查找user属性为username文档,如果是username是null，则匹配全部
			var query = {
				'user': username,
				'year': year
			};
			if(!username){
				mongodb.close();
				return callback("此用户未登录");

			}

			collection.find(query).sort({time: -1}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					callback(err, null);
					
				}
				//封装文档为post对象
				var posts = [];
				docs.forEach(function(doc,index){					
					var post = {
						"user": doc.user,
						"title": doc.title,
						"imgpath": doc.imgpath,
						"con": doc.con,
						"time": doc.time,
						"year": doc.year,
						"id": doc._id
					};
					post.time = post.time.toLocaleDateString();
					posts.push(post);
				});
				logger.writeInfo("数据库查询旅游时光轴数据:");
				logger.writeInfo(docs);
				callback(null, posts);

			});
		});
	});
};

