var fs = require('fs'),
    path = require('path'),
    ansi = require('ansi-html'),
    mkdirp = require('mkdirp');

function updateProcessPID(id, pid, log) {
    Index.findOne({
        id: id
    }).exec(function(err, process) {
        if (err) {
            console.log(err);
        }
        if (process) {
            process.pid = pid;
            if (log) {
                process.logs = process.logs || [];
                var existed = process.logs.filter(function(item) {
                    return item.pid == pid;
                });

                if (existed.length == 0) {
                    process.logs.push({
                        pid: pid,
                        logs: log
                    });
                } else {
                    process.logs = process.logs.map(function(item) {
                        if (item.pid == pid) {
                            item.logs += log;
                        }
                        return item;
                    });
                }
            }
            process.save(function(err, doc) {
                if (err) {
                    console.log('Error when update process info : ', err);
                }
            });
        }
    });
};

function onError(err, res) {
    res.status(500).json({
        err: err
    });
}

module.exports = {
    GET: function(req, res) {
        var search = req.query.search;
        if (search) {
            Index.find({ //full text search
                name: new RegExp(search, "i")
            }).sort({
                name: 'asc'
            }).exec(function(err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json(services);
                }
            });
        } else {
            Index.find().sort({
                name: 'asc'
            }).exec(function(err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json(services);
                }
            });
        }
    },
    findOne: function(req, res) {
        Index.findOne({
            id: req.params.id
        }).exec(function(err, item) {
            if (err) {
                onError(err, res);
            } else {
                var filepath = path.join(item.cwd, 'build.sh');
                if (item.cwd && fs.existsSync(filepath)) {
                    item.file = fs.readFileSync(filepath, 'utf8');
                }
                res.status(200).json(item);
            }
        });
    },
    POST: function(req, res) {
        var service = req.body;
        // console.log(service);
        if (service.args) {
            for (var i = 0; i < service.args.length; i++) {
                service.args[i] = service.args[i].trim();
            }
        }
        Index.create(service).exec(function(err, doc) {
            if (err) {
                onError(err, res);
            } else {
                if (doc.file) {
                    var filepath = path.join(doc.cwd, 'build.sh');
                    if (!fs.existsSync(doc.cwd)) {
                        mkdirp.sync(doc.cwd);
                    }
                    fs.writeFile(filepath, doc.file, function(err) {
                        if (err) {
                            onError(err, res);
                        } else {
                            res.status(200).json(doc);
                        }
                    });
                } else {
                    res.status(200).json(doc);
                }
            }
        });
    },
    PUT: function(req, res) {
        Index.destroy({
            id: req.params.id
        }).exec(function(err) {
            if (err) {
                onError(err, res);
            } else {
                var service = req.body;
                service._id = req.params.id;
                for (var i = 0; i < service.args.length; i++) {
                    service.args[i] = service.args[i].trim();
                }
                Index.create(service).exec(function(err, item) {
                    if (err) {
                        onError(err, res);
                    } else {
                        if (service.file) {
                            if (!fs.existsSync(service.cwd)) {
                                mkdirp.sync(service.cwd);
                            }
                            fs.writeFile(path.join(service.cwd, 'build.sh'), service.file, function(err) {
                                if (err) {
                                    onError(err, res);
                                } else {
                                    res.status(200).json(item);
                                }
                            });
                        } else {
                            res.status(200).json(item);
                        }
                    }
                });
            }
        });
    },
    DELETE: function(req, res) {
        Index.destroy({
            id: req.params.id
        }).exec(function(err) {
            if (err) {
                onError(err, res);
            } else {
                res.status(200).json({
                    status: true
                });
            }
        });
    },
    checkStatus: function(req, res) {
        Index.findOne({
            id: req.params.id
        }).exec(function(err, doc) {
            if (err) {
                res.status(200).json({
                    status: false
                });
            } else {
                if (doc) {
                    if (doc.checkcmd) {
                        Proc.exec(doc.checkcmd, doc.cwd, function(alive) {
                            res.status(200).json({
                                status: alive
                            });
                        });
                    } else {
                        res.status(200).json({
                            status: false
                        });
                    }
                } else {
                    res.status(200).json({
                        status: false
                    });
                }
            }
        });
    },
    StartService: function(req, res) {
        var service = req.body.service;
        if (service) {
            start();
        } else {
            Index.find({
                id: req.params.id
            }, function(err, process) {
                if (err) {
                    onError(err, res);
                } else {
                    service = process[0];
                    if (service) {
                        var custom = false;
                        for (var i = 0; i < service.args.length; i++) {
                            if (service.args[i].match(/\?/g)) {
                                custom = true;
                            }
                        }
                        if (!custom) {
                            start();
                        } else {
                            //ask client to build the service with custom command
                            res.status(200).json({
                                needbuild: true,
                                service: service
                            });
                        }
                    } else {
                        onError('Service not found', res);
                    }
                }
            });
        }

        function start() {
            var log, pid;
            var svc = Proc.start(service, function(stdout) {
                stdout = stdout.replace(/\n$/, '').replace(/\n/g, '\n' + service.name + ' >  ');
                console.log(service.name + ' >  ' + stdout);

                sails.sockets.blast("log", {
                    id: service.id,
                    log: (ansi(stdout) + "<br/>").replace(/\n/g, '<br/>')
                });
                log = stdout;
                // updateProcessPID(req.params.id, pid, log);
            });
            pid = svc.pid;
            // Update PID to database
            updateProcessPID(req.params.id, svc.pid);

            svc.on('close', function(code) {
                console.log('\n--------------------------------------------------------'.red)
                console.log((service.name + " has died with code " + code).red);
                console.log('--------------------------------------------------------\n'.red)

                // Update PID to database
                updateProcessPID(req.params.id, '');

            });
            res.status(200).json({
                service: service
            });
        }
    },
    StopService: function(req, res) {
        Index.findOne({
            id: req.params.id
        }).exec(function(err, doc) {
            if (err) {
                onError(err, res);
            } else {
                console.log(doc);
                if (doc) {
                    if (doc.stopcmd) {
                        Proc.exec(doc.stopcmd, doc.cwd, function(status) {
                            // Update PID to database
                            updateProcessPID(req.params.id, '');
                        });
                    } else if (doc.pid) {
                        Proc.exec(doc, function(status) {
                            // Update PID to database
                            updateProcessPID(req.params.id, '');
                        });
                    }
                    res.status(200).json({
                        status: true
                    });
                } else {
                    onError('Service not found', res);
                }
            }
        });
    },
    dashboard: function(req, res) {
        var search = req.query.search;
        if (search) {
            Index.find({ //full text search
                name: new RegExp(search, "i"),
                hidden: false
            }).sort({
                name: 'asc'
            }).exec(function(err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json({
                        processes: services
                    });
                }
            });
        } else {
            Index.find({
                hidden: false
            }).sort({
                name: 'asc'
            }).exec(function(err, services) {
                if (err) {
                    onError(err, res);
                } else {
                    res.status(200).json({
                        processes: services
                    });
                }
            });
        }
    }
}
