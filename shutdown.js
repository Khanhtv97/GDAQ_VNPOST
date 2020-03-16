var exec = require('child_process').exec;

// Create shutdown function
function shutdown(callback){
    exec('arp -a 192.168.0.145', function(error, stdout, stderr){ callback(stdout); });
}

// Reboot computer
shutdown(function(output){
    console.log(output);
});