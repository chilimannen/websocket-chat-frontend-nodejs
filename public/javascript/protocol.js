/**
 * @author Robin Duda
 *
 * Class represents a shared notion of transfer objects.
 *
 * Shared file with bin/protocol ln this for your own sanity.
 */


Protocol = {

    Message: function (content, room, sender, command) {
        this.header = {
            action: 'message'
        };

        this.room = room;
        this.content = content;
        this.sender = sender;
        this.command = command;
    },

    Join: function (room) {
        this.header = {
            action: 'join'
        };

        this.room = room;
    },

    Room: function (room, topic, username, actor) {
        this.header = {
            action: 'room',
            actor: actor
        };

        this.room = room;
        this.topic = topic;
        this.username = username;
    },

    Topic: function (room, topic) {
        this.header = {
            action: 'topic'
        };

        this.room = room;
        this.topic = topic;
    },

    Authenticate: function (username, password, actor) {
        this.header = {
            action: 'authenticate',
            actor: actor
        };

        this.username = username;
        this.password = password;
        this.created = undefined;
        this.authenticated = undefined;
    },

    History: function (room, actor) {
        this.header = {
            action: 'history',
            actor: actor
        };

        this.room = room;
        this.list = list;
    },

    Register: function (servername) {
        this.header = {
            action: 'register',
            name: servername
        }
    },

    ServerList: function (actor) {
        this.header = {
            action: 'server.list',
            actor: actor
        };

        this.list = undefined;
    },

    UserEvent: function (room, username, join) {
        this.header = {
            action: 'user.event'
        };

        this.room = room;
        this.username = username;
        this.join = join;
    },

    Help: function () {
        this.header = {
            action: 'help'
        }
    },

    Lookup: function (room) {
        this.header = {
            action: 'registry.lookup'
        };
        this.room = room;
    }
};