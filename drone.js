var sys = require('sys');

var logic = {};

var stdin = process.openStdin();
stdin.setEncoding('utf-8');

//process.stderr.write('Running');

stdin.addListener('data', function(message_raw) {
    sys.debug('got message: ' + message_raw);
    var messages  = message_raw.split('\n');

    for (message_id in messages) {
        try {
            message = JSON.parse(messages[message_id]);
        } catch(e) {
            process.stdout.write('message: ' + messages[message_id] + '; error: ' + e);
            message = {};
        }

        if (message.action == 'load') {

            sys.debug('got load command');

            logic = {
                'tick': function(map) {
                    setTimeout(function() {

                    })
                    return {'move': true, 'turn':'n', 'shoot':false};
                }
            };

            process.stdout.write(JSON.stringify({'status':1}));

        } else if (message.action == 'request') {

            var state = logic.tick();
            process.stdout.write(JSON.stringify(state));

        } else if (message.action == 'close') {

            stdin.close();
            exit(0);

        }
    }
});

//sys.debug('Running');
process.stdout.write(JSON.stringify({'status':'running'}));
