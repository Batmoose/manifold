manifold
====

####A simple server for managing microfluidic experiments  
###About
This is a server that allows you to, with an Arduino board, remotely control a solenoid valve manifold. It serves a webpage containing an editor and an HTML input field. Using the editor, keyboard shortcuts, and the input field you can save, open, and execute javascript experiments. These experiments can, in turn, send messages back to the browser as they are executed on the server.
###How does an experiment interface with an Arduino board?
[johnny-five]: https://github.com/rwaldron/johnny-five "Johnny-five Arduino Interface"
An [existing node package][johnny-five] takes care of that (consult its documentation).  
Simply write `var five = require('johnny-five');` at the beginning of an experiment to access the module.
##How-to
#####Required Hardware
	
	Part           Vendor      Unit Price      Qty      Total Price  
#  
	Arduino UNO    Amazon/     $22.01          1        $22.01
	R3 board with  Arduino
	DIP            
	ATmega328P
	―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
	4 Channel
	MOSTFET relay  Sparkfun    $18.90          2        $37.80
	―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
	SainSmart
	sensor shield  Amazon      $18.00          1        $18.00 
	――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
	Dupont Cables  Multiple    $10.00          1        $10.00
	                                                    ━━━━━━
	                                                    $87.81
#####Required Software
This server runs on Node.js, you will need to install it and set up a working directory.  
[Johnny-five][] requires additional setup, including the installation of [Arduino IDE](http://arduino.cc/en/main/software).  
All the module dependencies are listed in `package.json`.  

--
#####Starting the server
	
- `$ node main.js` will start the server from terminal.
- Go to `localhost:8080/index.html` in your browser.

The editor will display; begin writing your experiment!

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

#####Example experiment
	/*Uses an arduino Mega.
	Pin numbers may not 
	work with Arduino Uno.*/
	var five = require('johnny-five'), board = new five.Board();
	board.on('ready', function(){
		process.send({
			title: 'init',
			message: 'board ready, starting experiment'
		});
		var valves = [],
		i1 = 0,
		i2 = 1;
		setInterval(function(){
			if(valves[i1])
				valves[i1].off();
			if(valves[i2])
				valves[i2].off();
			i1 = (i1 + 1) % 8;
			if(!valves[i1])
				valves[i1] = new five.Led(i1 + 26);
			valves[i1].on();
			
			i2 = (i2 + 1) % 8;
			if(!valves[i2])
				valves[i2] = new five.Led(i2 + 26);
			valves[i2].on();
			
		}, 100);
	});
	/* Actuates a pair of valves connected to two adjacent pins,
	ranging from pin #26 to pin #33. If the Arduino board is
	successfully initialized, it reports it back to the client*/
	

##Diagrams
![Software-hardware flowchard](https://raw.github.com/Batmoose/manifold-images/master/SW%20Architecture.png)


