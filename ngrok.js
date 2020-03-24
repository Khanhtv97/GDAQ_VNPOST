const ngrok = require('ngrok');
(async function() {
    const url = await ngrok.connect({
        proto: 'http', // http|tcp|tls, defaults to http
        addr: 8080, // port or network address, defaults to 80
        auth: 'user:pwd', // http basic authentication for tunnel
        subdomain: 'alex', // reserved tunnel name https://alex.ngrok.io
        authtoken: '12345', // your authtoken from ngrok.com
        region: 'us', // one of ngrok regions (us, eu, au, ap), defaults to us
        configPath: '~/git/project/ngrok.yml', // custom path for ngrok config fil // custom binary path, eg for prod in electron
        onStatusChange: status => {}, // 'closed' - connection is lost, 'connected' - reconnected
        onLogEvent: data => {}, // returns stdout messages from ngrok process
    });
})();