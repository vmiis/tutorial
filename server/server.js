const express	=require('express');
const http		=require('http');
const fs		=require('fs');
//---------------------------------------------------
var password={}
//---------------------------------------------------
const server 		=express();
//---------------------------------------------------
server.get('/*', function(req, res, next){
    console.log(req.connection.remoteAddress.replace("::ffff:","")+" --- "+req.url);
    next();
});
//---------------------------------------------------
var content_path='C:/Users/Zhiming/Documents/websites2/contents';
server.use(express.static(content_path));
//---------------------------------------------------
server.post('/', function (req, res) {
	var r_data='';
	req.on('data',function(data){
      r_data+=data;
    });
    req.on('end',function(){
		d=JSON.parse(r_data);
		var ip=req.connection.remoteAddress;
		console.log(ip);
		
		var read=function(){
			fs.readFile(content_path+"/"+d.path, 'utf8', function(err, txt){
				if (err) {
					res.send(err);
				}
				else res.send(txt);
			})
		}
		var write=function(){
			fs.writeFile(content_path+"/"+d.path, d.content, function (err) {
				if (err) {
					res.send(err);
				}
				else res.send("The file was saved!");
			});
		}
		
		if(d.cmd=='load'){
			read();
			return;
		}
		else if(d.cmd=='save'){
			var items=d.path.split('/');
			var last=d.path.split('/').pop();
			var folder=d.path.replace(last,'');
			console.log(folder);
			console.log(password[folder])
			console.log(d.password)
			console.log(password[folder]==d.password)
			console.log(password[folder].length)
			console.log(d.password.length)
			if(items.length>1){
				if(folder.length>0 && password[folder]==d.password){
					write();
				}
				else{
					res.send("Password is not correct!");
				}
			}
			else res.send("Bad request!");
			
			return;
		}
	})
})
//---------------------------------------------------
fs.readFile("sites-password.txt", 'utf8', function(err, txt){
	var lines=txt.split('\n');
	for(var i=0;i<lines.length;i++){
		var items=lines[i].split(':');
		if(items.length==2){
			password[items[0]]=items[1].replace('\r','');
		}
	}
})
//---------------------------------------------------
fs.readFile("port.txt", 'utf8', function(err, port){
	http.createServer(
		server
	).listen(
		port,
		() => console.log("The server is listening on port "+port+"!") 
	);
})
//---------------------------------------------------
