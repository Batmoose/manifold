var http = require('http'), 
    Event = require('events').EventEmitter,
    mime = require('mime'),
    url = require('url'),
    path = require('path'),
    internalEmitter = new Event(),
    continueExpect,
    currentProcess;
var server = http.createServer(noContinueExpectCreate()),
    io = require('socket.io').listen(server, {log: false});
server.listen(8080);
server.on('checkContinue', continueExpectCreate());
function continueExpectCreate(){
    return function(req,res){
        continueExpect = true;
        serverHandler(req,res);
    };
}
function noContinueExpectCreate(){
    return function(req,res){
        continueExpect = false;
        serverHandler(req,res);
    };
}
io.configure(function(){
    io.set('authorization', function(data, f){
        f(null, !data.xdomain);
    });
});
io.sockets.on('connection', function(socket){
    var Processor = require('./utils/saveExecute.js');
    var processor = new Processor(__dirname + '/Saved_Experiments');
    console.log('connection');
    socket.on('save', function(body){
        if(processor.init(body)){
            processor.save(function(httpHeader){
                socket.emit(httpHeader);
            }, function(httpHeader){
                socket.emit(httpHeader);
            });
        }
    });
    socket.on('execute', function(body){
        console.log('well');
        if(processor.init(body)){
            processor.executeExperiment(socket, function(m){
                socket.emit('experimentSuccess', m);
            }, function(e){
                socket.emit('experimentError', e);
            });
        } else
        console.log('woah');
    });
});
function serverHandler(req,res){
    function Processor(){
        this.download = {
            init : function(){
                this.filePath = __dirname + url.parse(req.url).pathname; //Much simpler since file always present in URL
                this.fileType = mime.lookup(this.filePath);
            }
        };
    }
    Processor.prototype.manageDownload = function(){
        var self = this,
        fs = require('fs'), fileCases = {
            callback : function(){
                fs.exists(self.download.filePath, function(exists){
                    return exists ? choose(fileCases.verifyType) :
                    choose(fileCases.noMatch);
                });
            },
            verifyType : {
                callback : function(){
                    fs.stat(self.download.filePath, function(err, stats){
                        return stats.isFile() ? choose(fileCases.verifyType.exists) :
                        choose(fileCases.verifyType.isNotFile);
                    });
                }
            }
        };
        fileCases.verifyType.isNotFile = {
            callback : function(){
                res.writeHead(400);
                res.end();
            }
        };
        fileCases.verifyType.exists = {
            callback : function(){
                var rs = fs.createReadStream(self.download.filePath);
                rs.on('open', function(){
                    res.writeHead(200, {
                    'Content-Type' : self.download.fileType,
                    });
                    rs.pipe(res);
                });
                rs.on('error', function(exception){
                    self.simpleHead('INTERNAL_SERVER_ERROR');
                    console.log(exception);
                    res.end();
                });
                rs.on('end', function(){
                    res.end();
                    rs.destroy();
                });
            }
        };
        fileCases.noMatch = {
            callback : function(){
                res.writeHead(404);
                res.end();
            }
        };
        
        return fileCases.callback();
        
        function choose(obj, args){
            return obj.callback.apply(obj, args); /*|| findCallback();
            function findCallback(){
                for (var i in obj){
                    if(typeof obj[i] == 'function'){
                        return obj[i].apply(obj[i], args);
                    }
                }
                new Err('noCallback');
            }*/
        }
    };
    Processor.prototype.simpleHead = function(head){
        if(!isNaN(head)){
            res.writeHead(parseInt(head, 10));
        }else if(typeof head === 'string'){
            var codes = require('know-your-http-well');
            res.writeHead(codes.statusPhrasesToCodes[head]);
        }
    };
    function ManageCases(cases){
        this.allCases = cases || null;
        this.currentlyAt = cases;
        this.iterations = 0;
    }
    //ManageCase.prototype.choose = function(currentCase, args){
        /*return (function(parent, callback){
            return callback.apply(parent, args) || findCallback();
            function findCallback(){
                for (var i in parent){
                    if(typeof parent[i] == 'function'){
                        return parent[i];
                    }
                }
                (new Err()).noCallback();
            }
        })(this.allCases[currentCase], this.allCases[currentCase].callback);*/
       /* if(this.iterations > 0){
            this.currentlyAt = this.currentlyAt[currentCase];
            this.iterations++;
        }
        return this.currentlyAt.callback.apply(this.allCases, args) || 
        new Err('noCallback'); 
    };*/
    
    var processor = new Processor();
    req.setEncoding('utf8');
    switch(req.method){
        case "GET":
            console.log(__dirname + url.parse(req.url).pathname);
            processor.download.init();
            processor.manageDownload();
            break;
        case "DELETE":
            processor.deleteFile(true); //complete by sending response header
            break;
        case "OPTIONS":
            break;
    }
}
