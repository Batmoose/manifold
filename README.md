manifold
====
####A simple NodeJs server for managing microfluidic experiments  
###About
This is a simple server that allows you to, with an Arduino board, remotely control a solenoid valve manifold. It serves a webpage containing an editor and an HTML input field. Using the editor, keyboard shortcuts, and the input field you can save, open, and execute javascript experiments. These experiments can, in turn, send messages back to the browser as they are executed on the server.
###How does an experiment interface with an Arduino board?
[johnny-five]: https://github.com/rwaldron/johnny-five "Johnny-five Arduino Interface"
An [existing node package][johnny-five] takes care of that (consult its documentation).  
Simply write `var jfive = require('johnny-five');` at the beginning of an experiment to access the module.
##How-to
- `$ node main.js` will start the server from terminal.
- Go to `localhost:8080/index.html` in your browser.

The editor will display, begin writing your experiment!  
#####Editor Commands

Write the name of an experiment in the input field, then, while your cursor is in the editor:

`ctrl+s` to save the experiment written inside the editor

> The extension '.js' is optional. If the file you are trying to save already exists, it will prompt you to override it.

`ctrl+o` to open an experiment into the editor

> Include the appropriate extension.

`ctrl+e` to execute a **saved** experiment

> The name does not need correspond to the experiment in the editor.

#####Sending messages from experiment to browser client

In your experiment, use the `process.send()` method to send a message.  
Messages will be sent to the parent process and then to the client.  
The message will appear in the browser console.
	
	//using process.send() example
	process.send({
		title: 'Success',     //this key and value pair can be anything
		message: 'All's good!'//this key name must be 'message' or 'error'
	});

In the browser console you will see `message: All's good!`

#####Executing an experiment

Once you have executed an experiment (see above) the browser console will display whether or not the experiment was executed successfully.

##Diagrams
![Software-hardware flowchard](https://raw.github.com/Batmoose/manifold-images/master/SW%20Architecture.png)


