/**
 * Index.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        name: {
            type: "string",
            required: true
        },
        command: {
            type: "string",
            required: true
        },
        args: {
            type: "array"
        },
        cwd: {
            type: "string",
            required: true
        },
        img: {
            type: "string"
        },
        stopcmd: {
            type: "string"
        },
        checkcmd: {
            type: "string",
            required: true
        },
        pid: {
            type: "string"
        },
        port: {
            type: "string"
        },
        hidden: {
            type: "boolean"
        },
        logs: {
            type: "array"
        },
        file: {
            type: "string"
        }
    }
};
