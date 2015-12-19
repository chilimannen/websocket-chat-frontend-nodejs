/**
 * @author Robin Duda
 *
 * Mock implementation of a socket and the backend server.
 */

var MOCK = false;

function SocketProvider(host, listeners) {
    if (!MOCK) {
        this.socket = new WebSocket(host);
        this.socket.onopen = listeners.onopen;
        this.socket.onmessage = listeners.onmessage;
        this.socket.onclose = listeners.onclose;
        this.socket.onerror = listeners.onerror;
    }
    else {
        // Mock socket implementation.
        this.socket = {
            // implement all replies here
            send: function (data) {
                data = JSON.parse(data);
                var messageHandler = [];

                messageHandler["join"] = function (data) {
                    send({action: 'message', content: 'joined room ' + data.room});
                    send({action: 'join', name: data.room, topic: 'Public Room', version: 'SOCKET.MOCK'});
                };

                messageHandler["authenticate"] = function (data) {
                    if (data.username == 'admin' && data.password == 'root') {
                        send({action: 'message', content: 'authentication success.'});
                        messageHandler["join"]({room: 'general'});
                    }
                    else
                        send({action: 'message', content: 'authentication failed.'});
                };

                messageHandler["topic"] = function (data) {
                    send({action: 'message', content: '/topic', command: true});
                    send({action: 'message', content: 'user changed topic to ' + data.topic, command: true});
                    send({action: 'join', name: 'Public Room', topic: data.topic, version: 'SOCKET.MOCK'});
                };

                messageHandler["servers"] = function (data) {
                    send({action: 'message', content: '/servers', command: true});
                    send({action: 'message', list: [{name: 'server.mock.1', ip: "loopback"}]});
                };

                messageHandler["message"] = function (data) {
                    data.sender = 'you';
                    send(data);
                };

                function send(data) {
                    setTimeout(function () {
                        listeners.onmessage({data: JSON.stringify(data)})
                    }, 100);
                }

                if (messageHandler[data.action] != null)
                    messageHandler[data.action](data);
            },

            // socket methods are mocked to trigger events, does not route to failure paths.
            close: listeners.onclose
        };

        // connect and send welcome message, all must be done asynchronously.
        setTimeout(
            function () {
                listeners.onopen();
                setTimeout(function () {
                    listeners.onmessage({
                        data: JSON.stringify({
                            action: 'message',
                            content: '/authenticate user password'
                        })
                    });

                    setTimeout(function () {
                        listeners.onmessage({
                            data: JSON.stringify({
                                action: 'join',
                                name: 'SYSTEM',
                                topic: 'Authorization Required',
                                version: 'SOCKET.MOCK'
                            })
                        });
                    }, 100);
                }, 100);
            }, 100);
    }
}