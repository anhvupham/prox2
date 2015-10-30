var cp = require('child_process'),
    spawn = cp.spawn,
    exec = cp.exec,
    fork = cp.fork;

exports.stop = function (childSpawn, callback) {
    if (childSpawn) {
        if (childSpawn.pid) {
            exec('kill ' + childSpawn.pid, function (error, stdout, stderr) {
                if (error) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        }
    }
}
exports.start = function (proc, stdout) {
    var options = {
        cwd: proc.cwd || undefined
    };

    var process = spawn(proc.command, proc.args, options);

    // var process = spawn('sh', ['build.sh'], {
    //     cwd: '/root/defie/FS/fs-admin-client'
    // });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', function (chunk) {
        //stdout(chunk.replace(/\[([0-9]*)m/g, ''));
        stdout(chunk);
    });
    return process;
}
exports.exec = function (cmd, cwd, callback) {
    function puts(error, stdout, stderr) {
        if (error) {
            callback(false);
        } else {
            callback(true);
        }
    }

    exec(cmd, {
        cwd: cwd
    }, puts);
}

