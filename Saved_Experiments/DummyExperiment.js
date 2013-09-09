process.send({confirmation: true});
process.on('message', function(m){
    console.log('message: ' + m);
});
process.send({notice: "notice", message: "This is a test message using normal title!"});
process.send({notice: "setNew", message: "Potato"});
process.send({notice: "Potato", message: "Custom Potato Message!"});
process.send({notice: "notice", message: "we're done here, thanks!"});
//test