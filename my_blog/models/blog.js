var mongodb = require('./db');
var ObjectID = require('mongodb').ObjectID;
var fs = require('fs');

var logger = require("./../logs/logHelper").helper;  
function Blog(username, title,docpath, time){
	this.user = username;
	this.title = title;
	this.docpath = docpath;
	if(time){
		this.time = time;
	}else{
		this.time = new Date();
	}
}
module.exports = Blog;
//
Blog.prototype.save = function save(callback){

	//存入Mongodb 的文档
	var post = {
		user: this.user,
		title: this.title,
		docpath: this.docpath,
		time: this.time
	};
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取travels集合
		db.collection('Blogs', function(err, collection){
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
Blog.del = function del(id, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		var imgpath = "";
		//读取users集合
		db.collection('Blogs', function(err, collection){
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
Blog.get = function get(username,title, callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取travels集合
		db.collection('Blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(!username){
				mongodb.close();
				return callback("此用户未登录");

			}else{
				query.user = username;

			}

			if(title){
				query.title = title;
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
						"docpath": doc.docpath,
						"time": doc.time,
						"id": doc._id
					};
					post.time = post.time.toLocaleDateString();
					var contentText = fs.readFileSync("public/uploadblog/1501408084772.txt",'utf-8');
					logger.writeInfo("读取的博文内容为： "+ contentText);
					post.con = contentText;

					posts.push(post);
				});
				logger.writeInfo("数据库查询blog数据:");
				logger.writeInfo(docs);
				callback(null, posts);

			});
		});
	});
};

