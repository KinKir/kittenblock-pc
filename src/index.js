/**
 * Created by Riven on 2016/12/15.
 */
"use strict";

var EventEmitter = require('events');
var SerialConnection = require('./SerialConnection');
var UpdateManager = require('./UpdaterManager');
var ArduinoManager = require('./ArduinoManager');
var Toolbox = require('./Toolbox');
var ResourceManager = require('./ResourceManager');
var ConfigManager = require('./ConfigManager');

var KittenBlock = function () {
    var instance = this;
    instance.serial = new SerialConnection();
    instance.updater = new UpdateManager();
    instance.arduino = new ArduinoManager();
    instance.toolbox = new Toolbox();
    instance.resourcemng = new ResourceManager();
    instance.configmng  = new ConfigManager();

    this.connectedPort = null;
    this.portList = [];
    this.config = this.configmng.load();

};

KittenBlock.prototype.connectPort = function (port,successCb,readlineCb,closeCb) {
    var _this = this;
    if(port.type=='serial'){
        var ser = this.serial;
        ser.connect(port.path,{bitrate: this.config.baudrate},function () {
            ser.onReadLine.addListener(readlineCb);
            ser.onDisconnect.addListener(function () {
                _this.connectedPort = null;
                closeCb();
            });
            _this.connectedPort = {"path":port.path,"type":"serial"};
            successCb(port.path);
        });
    }
};

KittenBlock.prototype.sendCmd = function (data) {
    if(this.connectedPort && this.connectedPort.type=='serial'){
        this.serial.send(data+'\r\n');
    }
};

KittenBlock.prototype.enumPort = function (callback) {
    var kb = this;
    kb.portList = [];
    this.serial.enumSerial(function (devices) {
        devices.forEach(function (dev) {
            var port = {"path":dev.path,"type":'serial'};
            kb.portList.push(port);
        });
        if(callback) callback(kb.portList);
    });
};

KittenBlock.prototype.getUpdate = function (callback) {
    this.updater.getServer(callback);
};



module.exports = KittenBlock;
