/**
 * @author Robin Duda
 * @param line input text.
 *
 * Converts a line into a command.
 * todo should support quoting.
 */

function randomString() {
    var random = "";

    for (var i = 0; i < 3; i++) {
        random += new Array(4).join((Math.random().toString(36) + '00000000000000000').slice(2, 18)).slice(0, 4);

        if (i != 2)
            random += "-";
    }
    return random.toUpperCase();
}

function Parameters(line) {
    this.line = line;

    if (typeof line == 'string') {
        this.args = line.split(" ");

        for (var i = 0; i < this.args.length; i++)
            if (this.args[i] == "random")
                this.args[i] = randomString();

        this.arg = function (index) {
            return this.args[index] ? this.args[index] : "";
        };

        this.first = this.arg(1);
        this.second = this.arg(2);
        this.command = this.arg(0);
    }
}