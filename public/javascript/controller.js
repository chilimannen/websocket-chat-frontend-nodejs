/**
 * @author Robin Duda
 *
 * AngularJS websocket client connector.
 * todo up for refactoring
 */

angular.module('messageApp', [])
    .controller('messaging', ['$scope', function ($scope) {
        $scope.commandHandler = {};
        $scope.messageHandler = {};
        $scope.message = "";
        $scope.loadingroom = null;
        $scope.servername = null;
        $scope.publicRoom = "Public room";
        $scope.token = null;
        $scope.room = {
            messages: [],
            name: 'Registry',
            topic: 'Connecting..',
            version: 'LOADING',
            connected: false,
            host: 'localhost:0',
            socket: null
        };

        $scope.submit = function () {
            if ($scope.message.length != 0) {
                if ($scope.message[0] == '/') {
                    $scope.handleCommand($scope.message);
                } else {
                    $scope.handleMessage($scope.message);
                }
                $scope.message = "";
            }
        };

        $scope.handleCommand = function () {
            $scope.command($scope.message);
            var command = new Parameters($scope.message).command;

            if ($scope.commandHandler[command] == null)
                $scope.commandHandler[null]();
            else
                $scope.commandHandler[command](new Parameters($scope.message));
        };

        $scope.command = function (text) {
            var parameters = new Parameters(text);

            // mask passwords in input.
            if (parameters.command == '/authenticate') {
                text = parameters.command + " " + parameters.first + " **********";
            }
            $scope.room.messages.push({content: text, command: true});
            $scope.scroll();
        };

        $scope.handleMessage = function () {
            if ($scope.room.connected) {
                $scope.send(new Protocol.Message($scope.message));
            } else {
                $scope.write("Not connected. Type /help for manual.");
            }
        };

        $scope.send = function (message) {
            $scope.room.socket.send(JSON.stringify(message));
        };

        $scope.write = function (content, sender) {
            $scope.room.messages.push({content: content, sender: sender, system: (sender == null)});
            $scope.scroll();
        };

        $scope.scroll = function () {
            var frame = jQuery("#messageframe");
            frame.stop(true);
            frame.animate({scrollTop: $("#messagebox")[0].scrollHeight}, 600);
        };


        $scope.onMessage = function (message) {
            message = JSON.parse(message.data);

            console.log(message);

            if ($scope.messageHandler[message.header.action] != null)
                $scope.messageHandler[message.header.action](message);
            else
                console.log("no handler for " + message.header.action);

            $scope.$apply();
        };

        $scope.connect = function (ip, port, room, server) {
            $scope.write("Connecting to " + server + ".. ");

            $scope.room.socket = new SocketProvider("ws://" + ip + ":" + port, {
                onopen: function () {
                    $scope.onOpen(room);
                },
                onmessage: $scope.onMessage,
                onclose: $scope.onClose,
                onerror: $scope.onError
            }).socket;
        };

        $scope.registry = function () {

        };

        $scope.onOpen = function () {
            $scope.room.connected = true;

            console.log($scope.token);
            console.log(new Date().getTime());

            if ($scope.token != null && $scope.token.expiry > new Date().getTime() / 1000) {
                $scope.write("Attempting to authenticate with token.. ");
                $scope.send(new Protocol.Token($scope.token));
            } else if ($scope.token != null) {
                $scope.write("Token has expired, authentication required.");
            }


            $scope.$apply();
        };

        $scope.onClose = function () {
            $scope.onDisconnect();
            $scope.$apply();
        };

        $scope.onError = function () {
            $scope.onDisconnect();
            $scope.write("Error: socket error.");
            $scope.$apply();
        };

        $scope.onDisconnect = function () {
            $scope.room.connected = false;
            $scope.room.version = "disconnected.";
            $scope.room.topic = "chat your socks off.";
            $scope.room.name = "SYSTEM";
            $scope.servername = null;
        };

        $scope.commandHandler["/authenticate"] = function (param) {
            $scope.send(new Protocol.Authenticate(param.first, param.second));
        };

        $scope.commandHandler["/join"] = function (param) {
            $scope.room.messages = [];
            $scope.lookup(param.first);
        };


        $scope.commandHandler["/topic"] = function (param) {
            $scope.send(new Protocol.Topic('', param.first));
        };

        $scope.commandHandler["/servers"] = function () {
            $scope.send(new Protocol.ServerList());
        };

        $scope.commandHandler["/help"] = function () {
            $scope.printHelp();
        };

        $scope.commandHandler["/logout"] = function () {
            $scope.closeconnection();
            $scope.lookup($scope.publicRoom);
        };

        $scope.printHelp = function () {
            $scope.write("/join <string>, /disconnect, /logout");

            if ($scope.room.connected) {
                $scope.send(new Protocol.Help());
            }
        };

        $scope.commandHandler[null] = function () {
            $scope.write("Error: no such command.");
        };

        $scope.messageHandler["join"] = function (message) {
            $scope.room.name = message.room;
            $scope.room.topic = message.topic;
            $scope.room.version = message.version;
            $scope.write(message.content);
        };

        $scope.messageHandler["message"] = function (message) {
            if (message.command)
                $scope.command(message.content);
            else
                $scope.write(message.content, message.sender)
        };

        $scope.messageHandler["token"] = function (message) {
            if (message.accepted) {
                $scope.write("Authenticated by token.");
                $scope.send(new Protocol.Join($scope.loadingroom));
            } else {
                $scope.write("Failed to authenticate with token.");
                $scope.write("/authenticate <username> <password>");
            }
        };

        $scope.messageHandler["authenticate"] = function (message) {
            if (message.authenticated) {

                $scope.token = {};
                $scope.token.key = message.token;
                $scope.token.expiry = message.expiry;
                $scope.token.username = message.username;

                if (message.created)
                    $scope.write("Created account '" + message.username + "'.");
                else
                    $scope.write("Authenticated.");

                $scope.send(new Protocol.Join($scope.loadingroom));
            } else {
                $scope.write("Authentication Failed.");
                $scope.write("/authenticate <user> <password>");
            }
        };

        $scope.messageHandler["history"] = function (message) {
            $scope.room.messages = $scope.room.messages.concat(message.list);
        };

        $scope.closeconnection = function () {
            if ($scope.room.socket != null && $scope.room.socket.readyState == 1)
                $scope.room.socket.close();
        };

        $scope.lookup = function (room) {
            $scope.write("Connecting to the Registry..");

            if ("WebSocket" in window) {
                $scope.room.messages = [];
                $scope.write("Looking up " + room + "..");

                $scope.registry = new SocketProvider("ws://localhost:6090", {
                    onopen: function () {
                        $scope.registry.send(JSON.stringify(new Protocol.Lookup(room)));
                    },
                    onmessage: function (event) {
                        var result = JSON.parse(event.data);
                        if (result.full) {
                            $scope.write("All servers busy.");
                        } else {
                            $scope.loadingroom = room;

                            if (result.name == $scope.servername) {
                                $scope.write("Already on best route.");
                                $scope.send(new Protocol.Join(room));
                            } else {
                                $scope.closeconnection();
                                $scope.servername = result.name;
                                $scope.write("Server " + result.name + " selected, " + result.ip + ":" + result.port + ".");
                                $scope.connect(result.ip, result.port, room, result.name);
                            }
                        }
                        $scope.registry.close();
                        $scope.$apply();
                    },
                    onerror: function () {
                        $scope.write("Registry unavailable, try reloading.");
                        $scope.$apply();
                    }
                }).socket;
            } else {
                $scope.onDisconnect();
                $scope.write("Error: WebSocket not supported.");
            }
        };

        $scope.lookup($scope.publicRoom);
    }]);