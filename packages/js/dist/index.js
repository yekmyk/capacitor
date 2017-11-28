var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/**
 * Main class for interacting with the Avocado runtime.
 */
var Avocado = /** @class */ (function () {
    function Avocado() {
        var _this = this;
        this.isNative = false;
        // Storage of calls for associating w/ native callback later
        this.calls = {};
        this.callbackIdCount = 0;
        var win = window;
        if (win.avocadoBridge) {
            this.postToNative = function (data) {
                win.avocadoBridge.postMessage(data);
            };
            this.isNative = true;
        }
        else if (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.bridge) {
            this.postToNative = function (data) {
                win.webkit.messageHandlers.bridge.postMessage(__assign({ type: 'message' }, data));
            };
            this.isNative = true;
        }
        // Load console plugin first to avoid race conditions
        setTimeout(function () { _this.loadCoreModules(); });
    }
    Avocado.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.unshift('Avocado: ');
        this.console && this.console.windowLog(args);
    };
    Avocado.prototype.loadCoreModules = function () {
        //this.console = new Console();
    };
    /**
     * Send a plugin method call to the native layer.
     *
     * NO CONSOLE.LOG HERE, WILL CAUSE INFINITE LOOP WITH CONSOLE PLUGIN
     */
    Avocado.prototype.toNative = function (call) {
        if (this.isNative) {
            // create a unique id for this callback
            call.callbackId = call.pluginId + ++this.callbackIdCount;
            // always send at least an empty obj
            call.options = call.options || {};
            // store the call for later lookup
            this.calls[call.callbackId] = call;
            // post the call data to native
            this.postToNative(call);
        }
        else {
            console.warn("browser implementation unavailable for: " + call.pluginId);
        }
    };
    /**
     * Process a response from the native layer.
     */
    Avocado.prototype.fromNative = function (result) {
        // get the stored call
        var storedCall = this.calls[result.callbackId];
        if (!storedCall) {
            // oopps, this shouldn't happen, something's up
            console.error("stored callback not found: " + result.callbackId);
        }
        else if (typeof storedCall.callbackFunction === 'function') {
            // callback
            // if nativeCallback was used, but wasn't passed a callback function
            // then this gets skipped over, which is good
            // do not remove this call from stored calls cuz it could be used again
            if (result.success) {
                storedCall.callbackFunction(null, result.data);
            }
            else {
                storedCall.callbackFunction(result.error, null);
            }
        }
        else if (typeof storedCall.callbackResolve === 'function') {
            // promise
            // promises will always resolve and reject functions
            if (result.success) {
                storedCall.callbackResolve(result.data);
            }
            else {
                storedCall.callbackReject(result.error);
            }
            // no need to keep this call around for a one time resolve promise
            delete this.calls[result.callbackId];
        }
        else {
            if (!result.success && result.error) {
                // no callback, so if there was an error let's log it
                console.error(result.error.message);
            }
            // no need to keep this call around if there is no callback
            delete this.calls[result.callbackId];
        }
        // always delete to prevent memory leaks
        // overkill but we're not sure what apps will do with this data
        delete result.data;
        delete result.error;
    };
    /**
     * @return the instance of Avocado
     */
    Avocado.instance = function () {
        if (window.avocado) {
            return window.avocado;
        }
        return window.avocado = new Avocado();
    };
    return Avocado;
}());

/**
 * Base class for all 3rd party plugins.
 */
var Plugin = /** @class */ (function () {
    function Plugin() {
        this.avocado = Avocado.instance();
        this.isNative = this.avocado.isNative;
    }
    Plugin.prototype.nativeCallback = function (methodName, options, callback) {
        if (typeof options === 'function') {
            // 2nd arg was a function
            // so it's the callback, not options
            callback = options;
            options = {};
        }
        this.avocado.toNative({
            pluginId: this.pluginId(),
            methodName: methodName,
            options: options,
            callbackFunction: callback
        });
    };
    Plugin.prototype.nativePromise = function (methodName, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.avocado.toNative({
                pluginId: _this.pluginId(),
                methodName: methodName,
                options: options,
                callbackResolve: resolve,
                callbackReject: reject
            });
        });
    };
    Plugin.prototype.pluginId = function () {
        var config = this.constructor.getPluginInfo();
        return config.id;
    };
    return Plugin;
}());
/**
 * Decorator for AvocadoPlugin's
 */
function AvocadoPlugin(config) {
    return function (cls) {
        cls['_avocadoPlugin'] = Object.assign({}, config);
        cls['getPluginInfo'] = function () { return cls['_avocadoPlugin']; };
        return cls;
    };
}

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Browser = /** @class */ (function (_super) {
    __extends(Browser, _super);
    function Browser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Browser.prototype.open = function (url) {
        if (this.isNative) {
            this.nativeCallback('open', { url: url });
        }
        window.open(url);
    };
    Browser = __decorate([
        AvocadoPlugin({
            name: 'Browser',
            id: 'com.avocadojs.plugin.browser'
        })
    ], Browser);
    return Browser;
}(Plugin));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Camera = /** @class */ (function (_super) {
    __extends$1(Camera, _super);
    function Camera() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Camera.prototype.getPhoto = function (options) {
        return this.nativePromise('getPhoto', options);
    };
    Camera = __decorate$1([
        AvocadoPlugin({
            name: 'Camera',
            id: 'com.avocadojs.plugin.camera'
        })
    ], Camera);
    return Camera;
}(Plugin));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Console = /** @class */ (function (_super) {
    __extends$2(Console, _super);
    function Console() {
        var _this = _super.call(this) || this;
        _this.queue = [];
        _this.originalLog = window.console.log;
        window.console.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            //const str = args.map(a => a.toString()).join(' ');
            _this.queue.push(['log'].concat(args));
            _this.originalLog.apply(console, args);
        };
        var syncQueue = function () {
            var queue = _this.queue.slice();
            while (queue.length) {
                var logMessage = queue.shift();
                var level = logMessage[0];
                var message = logMessage.slice(1);
                _this.nativeCallback('log', { level: level, message: message });
            }
            setTimeout(syncQueue, 100);
        };
        setTimeout(syncQueue);
        return _this;
    }
    Console.prototype.windowLog = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.originalLog.apply(this.originalLog, args);
    };
    Console = __decorate$2([
        AvocadoPlugin({
            name: 'Console',
            id: 'com.avocadojs.plugin.console'
        })
    ], Console);
    return Console;
}(Plugin));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Device = /** @class */ (function (_super) {
    __extends$3(Device, _super);
    function Device() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Device.prototype.getInfo = function () {
        if (this.isNative) {
            return this.nativePromise('getInfo');
        }
        return Promise.resolve({
            model: navigator.userAgent,
            platform: 'browser',
            uuid: '',
            version: navigator.userAgent,
            manufacturer: navigator.userAgent,
            isVirtual: false,
            serial: ''
        });
    };
    Device = __decorate$3([
        AvocadoPlugin({
            name: 'Device',
            id: 'com.avocadojs.plugin.device'
        })
    ], Device);
    return Device;
}(Plugin));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Filesystem = /** @class */ (function (_super) {
    __extends$4(Filesystem, _super);
    function Filesystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Filesystem.prototype.writeFile = function (file, data, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('writeFile', {
            file: file,
            data: data,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.appendFile = function (file, data, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('appendFile', {
            file: file,
            data: data,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.readFile = function (file, directory, encoding) {
        if (encoding === void 0) { encoding = 'utf8'; }
        return this.nativePromise('readFile', {
            file: file,
            directory: directory,
            encoding: encoding
        });
    };
    Filesystem.prototype.mkdir = function (path, directory, createIntermediateDirectories) {
        if (createIntermediateDirectories === void 0) { createIntermediateDirectories = false; }
        return this.nativePromise('mkdir', {
            path: path,
            directory: directory,
            createIntermediateDirectories: createIntermediateDirectories
        });
    };
    Filesystem.prototype.rmdir = function (path, directory) {
        return this.nativePromise('rmdir', {
            path: path,
            directory: directory
        });
    };
    Filesystem.prototype.readdir = function (path, directory) {
        return this.nativePromise('readdir', {
            path: path,
            directory: directory
        });
    };
    Filesystem.prototype.stat = function (path, directory) {
        return this.nativePromise('stat', {
            path: path,
            directory: directory
        });
    };
    Filesystem = __decorate$4([
        AvocadoPlugin({
            name: 'Filesystem',
            id: 'com.avocadojs.plugin.fs'
        })
    ], Filesystem);
    return Filesystem;
}(Plugin));
var FilesystemDirectory;
(function (FilesystemDirectory) {
    FilesystemDirectory["Application"] = "APPLICATION";
    FilesystemDirectory["Documents"] = "DOCUMENTS";
    FilesystemDirectory["Data"] = "DATA";
    FilesystemDirectory["Cache"] = "CACHE";
    FilesystemDirectory["External"] = "EXTERNAL";
    FilesystemDirectory["ExternalStorage"] = "EXTERNAL_STORAGE"; // Android only
})(FilesystemDirectory || (FilesystemDirectory = {}));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Geolocation = /** @class */ (function (_super) {
    __extends$5(Geolocation, _super);
    function Geolocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Geolocation.prototype.getCurrentPosition = function () {
        if (this.isNative) {
            return this.nativePromise('getCurrentPosition');
        }
        if (navigator.geolocation) {
            return new Promise(function (resolve) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    resolve(position.coords);
                });
            });
        }
        return Promise.reject({
            err: new Error("Geolocation is not supported by this browser.")
        });
    };
    Geolocation.prototype.watchPosition = function (callback) {
        if (this.isNative) {
            this.nativeCallback('watchPosition', callback);
        }
        else if (navigator.geolocation) {
            var successCallback = function (position) {
                callback(null, position.coords);
            };
            var errorCallback = function (error) {
                callback(error, null);
            };
            navigator.geolocation.watchPosition(successCallback, errorCallback);
        }
        else {
            console.warn("Geolocation is not supported by this browser.");
        }
    };
    Geolocation = __decorate$5([
        AvocadoPlugin({
            name: 'Geolocation',
            id: 'com.avocadojs.plugin.geolocation'
        })
    ], Geolocation);
    return Geolocation;
}(Plugin));

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HapticsImpactStyle;
(function (HapticsImpactStyle) {
    HapticsImpactStyle["Heavy"] = "HEAVY";
    HapticsImpactStyle["Medium"] = "MEDIUM";
    HapticsImpactStyle["Light"] = "LIGHT";
})(HapticsImpactStyle || (HapticsImpactStyle = {}));
var Haptics = /** @class */ (function (_super) {
    __extends$6(Haptics, _super);
    function Haptics() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Haptics.prototype.impact = function (options) {
        this.nativeCallback('impact', options);
    };
    Haptics.prototype.vibrate = function () {
        this.nativeCallback('vibrate');
    };
    Haptics.prototype.selectionStart = function () {
        this.nativeCallback('selectionStart');
    };
    Haptics.prototype.selectionChanged = function () {
        this.nativeCallback('selectionChanged');
    };
    Haptics.prototype.selectionEnd = function () {
        this.nativeCallback('selectionEnd');
    };
    Haptics = __decorate$6([
        AvocadoPlugin({
            name: 'Haptics',
            id: 'com.avocadojs.plugin.haptics'
        })
    ], Haptics);
    return Haptics;
}(Plugin));

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LocalNotifications = /** @class */ (function (_super) {
    __extends$7(LocalNotifications, _super);
    function LocalNotifications() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocalNotifications.prototype.schedule = function (notification) {
        return this.nativePromise('schedule', notification);
    };
    LocalNotifications = __decorate$7([
        AvocadoPlugin({
            name: 'LocalNotifications',
            id: 'com.avocadojs.plugin.localnotifications'
        })
    ], LocalNotifications);
    return LocalNotifications;
}(Plugin));

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Modals = /** @class */ (function (_super) {
    __extends$8(Modals, _super);
    function Modals() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Modals.prototype.alert = function (title, message, buttonTitle) {
        return this.nativePromise('alert', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals.prototype.prompt = function (title, message, buttonTitle) {
        this.nativePromise('prompt', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals.prototype.confirm = function (title, message, buttonTitle) {
        this.nativePromise('confirm', {
            title: title,
            message: message,
            buttonTitle: buttonTitle
        });
    };
    Modals = __decorate$8([
        AvocadoPlugin({
            name: 'Modals',
            id: 'com.avocadojs.plugin.modals'
        })
    ], Modals);
    return Modals;
}(Plugin));

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Motion = /** @class */ (function (_super) {
    __extends$9(Motion, _super);
    function Motion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Motion.prototype.watchAccel = function (callback) {
        this.nativeCallback('watchAccel', callback);
    };
    Motion = __decorate$9([
        AvocadoPlugin({
            name: 'Motion',
            id: 'com.avocadojs.plugin.motion'
        })
    ], Motion);
    return Motion;
}(Plugin));

var __extends$10 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$10 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Network = /** @class */ (function (_super) {
    __extends$10(Network, _super);
    function Network() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Network.prototype.onStatusChange = function (callback) {
        this.nativeCallback('onStatusChange', callback);
    };
    Network = __decorate$10([
        AvocadoPlugin({
            name: 'Network',
            id: 'com.avocadojs.plugin.network'
        })
    ], Network);
    return Network;
}(Plugin));

var __extends$11 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$11 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SplashScreen = /** @class */ (function (_super) {
    __extends$11(SplashScreen, _super);
    function SplashScreen() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SplashScreen.prototype.show = function (options, callback) {
        this.nativeCallback('show', options, callback);
    };
    SplashScreen.prototype.hide = function (options, callback) {
        this.nativeCallback('hide', options, callback);
    };
    SplashScreen = __decorate$11([
        AvocadoPlugin({
            name: 'SplashScreen',
            id: 'com.avocadojs.plugin.splashscreen'
        })
    ], SplashScreen);
    return SplashScreen;
}(Plugin));

var __extends$12 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$12 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StatusBarStyle;
(function (StatusBarStyle) {
    StatusBarStyle["Dark"] = "DARK";
    StatusBarStyle["Light"] = "LIGHT";
})(StatusBarStyle || (StatusBarStyle = {}));
var StatusBar = /** @class */ (function (_super) {
    __extends$12(StatusBar, _super);
    function StatusBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StatusBar.prototype.setStyle = function (options, callback) {
        this.nativeCallback('setStyle', options, callback);
    };
    StatusBar = __decorate$12([
        AvocadoPlugin({
            name: 'StatusBar',
            id: 'com.avocadojs.plugin.statusbar'
        })
    ], StatusBar);
    return StatusBar;
}(Plugin));

export { Avocado, Plugin, AvocadoPlugin, Browser, Camera, Console, Device, Filesystem, FilesystemDirectory, Geolocation, Haptics, HapticsImpactStyle, LocalNotifications, Modals, Motion, Network, SplashScreen, StatusBar, StatusBarStyle };
