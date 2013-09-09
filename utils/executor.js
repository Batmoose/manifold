var fs = require('fs'),
EventEmitter = require('events').EventEmitter,
cp = require('child_process'),
path = require('path');

var state = new EventEmitter(),
innerState = new EventEmitter(),
exp,
expState;
exports.execute = function(dir, s, e, tags){
    innerState.once('success', s); innerState.on('error', e);
    if(exp !== undefined){
        var tagsKey = {
            '-u': function(){
                exp.send({instruction: 'update'});
            },
            '-o': function(){
                exp.send({instruction: 'open', message: dir});
            }
        };
        var invalidTag = function(){
            innerState.emit('error', 'Invalid Tag(s)');
        };
        if(tags){
            for(var i in tags.split(' ')){
                (Object.keys(tagsKey).indexOf(i) > -1 ? 
                tagsKey[i] :
                invalidTag)();
            }
        } else {
            exp.kill();
            exp = cp.fork(dir);
        }
    } else {
        exp = cp.fork(dir);
    }
    execute(exp);
    return exp;
};
exports.setEmitter = function(emitter){
    state = emitter;
};
exports.getExpState = function(){
    return expState;
};
function execute(exp){
    var confirmation = false;
    var options = {
        error: function(m){
            state.emit('expError', m);
        },
        message: function(m){
            state.emit('message', m);
        },
        setNew: function(m){
            this[m] = function(a){
                state.emit(m, a);
            };
            state.emit('setNew', m);
        }
    };
    exp.on('error', function(e){
        state.emit('error', e);
    });
    exp.once('message', function(m){
        if(m.confirmation){
            console.log('potato');
            innerState.emit('success', exp.pid);
            confirmation = true;
        }
        console.log('Confirmation: ' + m);
        console.log(state.listeners('setNew'));
    });
    exp.on('message', function(m){
        if(confirmation){
            select(m, options);
        }
        console.log('incoming Message: ' + m.notice);
    });
    function select(message, opt){
        opt[message.error || 
        message.notice || 'message'](message.text ||
                                message.message ||
                                message.content ||
                                message.body ||
                                message.error || undefined);
    }
    exp.send({readFun: select, options: options});
}
