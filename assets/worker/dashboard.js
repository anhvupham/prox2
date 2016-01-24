"use strict"

var http = (method, url) => {
    return new Promise((resolve, reject) => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(method, url, true);
        xmlHttp.responseType = "json";
        xmlHttp.addEventListener("load", (e) => {
            var target = e.currentTarget;
            if (target.status === 200) {
                resolve(e.currentTarget.response);
            } else {
                reject(e);
            }
        });
        xmlHttp.addEventListener("error", (e) => {
            reject(e);
        });
        xmlHttp.send();
    });
}

onmessage = (e) => {
    var processes = e.data;
    processes.forEach((p) => {
        (function checkstatus(p, pending) {
            setTimeout(() => {
                http('GET', '/status/' + p.id).then((data) => {
                    postMessage({
                        id: p.id,
                        status: data.status
                    });
                    checkstatus(p, pending);
                }).catch((err) => {
                    console.log("error when checking status");
                    checkstatus(p, pending * 5); //if error then try again after amount of time equal to 5 times of pending time
                });
            }, pending);
        })(p, 2000);
    });
}
