var exec = require('child_process').exec;

// Create shutdown function
function shutdown(callback){
    exec('shutdown now', function(error, stdout, stderr){ callback(stdout); });
}

// Reboot computer
shutdown(function(output){
    console.log(output);
});