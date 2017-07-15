// var express = require('express');
// var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
 var crypto = require('crypto');
 var User = require('../models/user.js');
 var Post = require('../models/Post.js');
 var fs = require('fs');
 var Tools = require('../tools.js');
var logger = require("./../logs/logHelper").helper;  
var multer = require("../models/multer.js");
module.exports = function(app){
	app.get('/',function(req, res){
		logger.writeInfo("哈哈1开始记录日志");
		Post.get(null, function(err, posts){
			if(err){
				posts = [];
			}
			res.render('index', { title: '首页', posts: posts , act: ["a-active", "", "", ""]});
		});
		
	});
	app.get('/travel',function(req, res){
		Post.get(null, function(err, posts){
			if(err){
				posts = [];
			}
			res.render('travel', { title: '旅游', posts: posts , act: ["", "a-active", "", ""]});
		});
		
	});
	app.get('/photowall',function(req, res){
		var a = Tools.getFile('public/upload/');
		var aLength = Tools.getFileLength('public/upload/');
		
		if(aLength<1){
			res.render('img_index', { title: '照片墙', showwall: false , lists: a});
		} else{
			logger.writeInfo("哈哈1开始记录日志a.  "+ aLength);

			res.render('img_index', { title: '照片墙', showwall: true , lists: a});
		}
		
		
	});
	app.get('/u/:user', function(req, res){
		User.get(req.params.user, function(err, user){
			if(!user){
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}
			Post.get(user.name, function(err, posts){
				if(err){
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user',{title: user.name, posts: posts});
			});
		});
	});
	app.post('/post', checkLogin);
	app.post('/post', function(req, res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post);
		post.save(function(err){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', '发表成功');
			res.redirect('/u/'+currentUser.name);
		})
	});

	// pdf文件上传
	app.post('/fileUpload', multer.single('filename'), function(req, res, next){
		logger.writeInfo(req);
	    var file = req.file;
	    req.flash('success', '发表成功');
		res.redirect('/');
	    // res.send({ret_code: '0'});
	});
	app.post('/imgUpload', function(req, res){
		//上传图片
		var imgPostData = req.body;
		var index = imgPostData.lookIndex;
		var imgName = imgPostData.imgName;

    	// var imgPostData = eval("("+imgdata+")"); 

		var a = Tools.getFileLength('public/upload/');
　　　　 		//var path = 'public/upload/'+ a +'.jpg';//从app.js级开始找--在我的项目工程里是这样的
		logger.writeInfo(a+ "  upload有多少文件");	
		if(a == 25){
			res.writeHead(200,{"Content-Type":'application/json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
		    res.write(resDatamessage('图片达到上限25', index));
		    res.end();
			return false;	

		}
		if(imgName === "no"){
			var path = 'public/upload/'+ new Date().getTime() +'.jpg';
		}else{
			var path = 'public/upload/'+ imgName;
		}
		
		var base64 = imgPostData.imgBase.replace(/^data:image\/\w+;base64,/, "");//去掉图片base64码前面部分data:image/png;base64
    	var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，

        fs.writeFile(path,dataBuffer,function(err){//用fs写入文件
            if(err){
                logger.writeErr(err);
				res.writeHead(50001,{"Content-Type":'application/json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
				res.write(resErrmessage(err, index));
				res.end();
                return false;
            }else{
               logger.writeInfo('写入成功！');
            }
        })
        
		res.writeHead(200,{"Content-Type":'application/json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
		  //response.writeHead(200,{"Content-Type":'text/plain',            'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
		  //response.write("Hello World 8888\n");
		  res.write(resDatamessage('全部上传成功', index));
		  res.end();
		
	})
	app.get('/deleteImg', function(req, res){
		var imgPostData = req.query.imgName;
		// var index = imgPostData.lookIndex;
    	// var imgPostData = eval("("+imgdata+")"); 
		logger.writeInfo(imgPostData);		

		var a = Tools.deleteFile('public/upload/'+imgPostData);
		logger.writeInfo("a. " + a);		

　　　　 	if(a){
			res.writeHead(200,{"Content-Type":'application/json','charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});//可以解决跨域的请求
		//   //response.writeHead(200,{"Content-Type":'text/plain',            'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
		//   //response.write("Hello World 8888\n");
			res.write(resDatamessage('删除成功', 0));
		}
		res.end();
        
		
		
	})
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res){
		res.render('reg', { title: '用户注册' , act: ["", "", "", "a-active"]});
	});
	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res){
		//检验两次输入的密码是否一致
		if(req.body['password-repeat'] != req.body['password']){
			req.flash('error', '两次输入的口令不一致');
			return res.redirect('/reg');
		}
		//生成密码的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		var newUser = new User({ 
			name: req.body.username, 
			password: password
		});
		//检查用户名是否已存在
		User.get(newUser.name, function(err, user){
			if(user) err = 'Username already exists.';

			if(err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			//如果不存在则新增
			newUser.save(function(err){
				if(err){
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = newUser;
				req.flash('success', "注册成功");
				res.redirect('/');
			})
		})
	});
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res){
		res.render('login', {title: '用户登录', act: ["", "", "a-active", ""]})
	});
	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		User.get(req.body.username, function(err, user){
			if(!user){
				req.flash('error', "用户不存在");
				return res.redirect('/login');
			}
			if(user.password != password){
				req.flash('error', "密码错误");
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', "登录成功");
			res.redirect('/');
		})
	});
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res){
		req.session.user = null;
		req.flash('success', "退出成功");
			res.redirect('/');
	});

};
function checkLogin(req, res, next){
 if(!req.session.user){
 	req.flash('error', '尚未登录');
 	return res.redirect('/login');
 }
 next();
}
function checkNotLogin(req, res, next){
 if(req.session.user){
 	req.flash('error', '已经登录');
 	return res.redirect('/');
 }
 next();
}
function resErrmessage(err,index){
	return '{"success": false, "message": "'+err+', "ind":'+index+'}'
}
function resDatamessage(data, index){
	// return '{"success": true, "message": "'+data+'"}'
	return '{"success": true, "message": "'+data+'","Data":{"name":"'+data+'","male":true,"ind":'+index+'}'+',"ind":'+index+'}'
}