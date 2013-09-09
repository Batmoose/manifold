var path = require('path');
var Event = require('events').EventEmitter;
module.exports = Processor;
function Processor(parentDir){
    this.init = function(fileInfo){
        if(fileInfo.filename){
            this.override = !!fileInfo.override;
            this.body = fileInfo.body;
            if(fileInfo.extension){
                this.extension = fileInfo.extension;
                this.filename = fileInfo.filename.indexOf(this.extension) ? 
                    fileInfo.filename.slice(0, fileInfo.filename.lastIndexOf('.')) :
                    fileInfo.filename;
            } else {
                this.filename = fileInfo.filename;
                this.extension = 'txt';
            }
            this.filepath = path.normalize(parentDir + 
                '/' + this.filename + 
                '.' + this.extension
            );
            return this.initSuccess = true;
        } else
            console.log('damn');
            return this.initSuccess = false;
    };
}
Processor.prototype.save = function(s, e){
    var self = this,
    fs = require('fs'), fileCases = {
        callback : function(){
            if(self.initSuccess)
                fs.exists(self.filepath, function(exists){
                    return exists ? choose(fileCases.exists) :
                    choose(fileCases.noMatch);
                });
        }
    };
    fileCases.exists = {
        callback : function(){
            if(this.override){
                choose(fileCases.uploadPipe);
            } else
                e('CONFLICT');
        }
    };
    fileCases.noMatch = {
        callback : function(){
            if(this.override)
                e('PRECONDITION_FAILED');
            else {
                choose(fileCases.uploadPipe);
            }
        }
    };
    fileCases.uploadPipe = {
        callback : function(){
            var ws = fs.createWriteStream(self.filepath);
            ws.end(self.body); //write what was already uploaded (just in case)
            ws.on('error', function(exception){
                e(exception);
            });
            ws.on('finish', function(){
                s();
            });
        }
    };
    fileCases.uploadReceived = {
        callback : function(){
            fs.writeFile(self.filepath,
                self.body,
                function(err){
                    e('INTERNAL_SERVER_ERROR');
                });
            s();
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
Processor.prototype.executeExperiment = function(socket, s, e){
    console.log('executing');
    var sessionEmitter = new Event();
    var executor = require('./executor.js');
    executor.setEmitter(sessionEmitter);
    executor.execute(this.filepath, s, e);
    sessionEmitter.on('message', function(m){
        socket.emit('message', m);
    });
    sessionEmitter.on('error', function(e){
        socket.emit('expError', e);
    });
    sessionEmitter.on('setNew', function(name){
        sessionEmitter.on(name, function(m){
            socket.emit(name, m);
        });
        socket.emit('newMessageType', name);
    });
      //must be called first
      /*console.log('do we even get here');
      state.on('expError', function(m){
          internalEmitter.once('socket', function(socket){
              socket.emit('expError', m);
          });d
      });
      state.on('setNew', function(m){
          internalEmitter.once('socket', function(socket){
              state.on(m, function(a){
                  socket.emit(m, a);
              });
              socket.emit('setNew', m);
              console.log('new set');
          });
      });
      internalEmitter.once('socket', function(socket){
          socket.on('instruction', function(i){
              exp.send({'instruction': i});
          });
      });*/
};
