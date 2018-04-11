'use strict';

var fs = require('fs');
var path = require('path');

var VersionBumpPlugin = function () {
  var plugin = function plugin(options) {
    this.settings = Object.assign({
      dirname: path.resolve(__dirname, '../../../'),
      file: path.resolve(__dirname, '../../../', 'version.json')
    }, options);
  };

  plugin.prototype.saveFile = function () {
    var build = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0.0.0';
    var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

    var content = '{\n  "build": "' + build + '",\n  "version": "' + version + '"\n}';

    fs.writeFileSync(this.settings.file, content, { encoding: 'utf8', flag: 'w' }, function (err) {
      if (!err && typeof cb === 'function') {
        cb();
      }
    });
  };

  plugin.prototype.get = function () {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    return JSON.stringify(require(this.settings.file)[name]);
  };

  plugin.prototype.getDataFromFile = function () {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var data = JSON.stringify(require(this.settings.file)[name]);
    return data.replace('"', '').replace('"', "");
  };

  plugin.prototype.createFile = function () {
    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

    if (!fs.existsSync(this.settings.file)) {
      this.saveFile("0", "0.0.0", cb);
    } else {
      cb();
    }
  };

  plugin.prototype.pickUp = function () {
    var version = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var split = version.split(".");
    split = split.map(function (item) {
      return parseInt(item);
    });

    split[2]++;
    split[1] = split[2] > 9999 ? split[1] + 1 : split[1];
    split[2] = split[2] > 9999 ? 0 : split[2];

    split[0] = split[1] > 9999 ? split[0] + 1 : split[0];
    split[1] = split[1] > 9999 ? 0 : split[1];

    return split.join('.');
  };

  plugin.prototype.upVersionNumber = function () {
    var _this = this;

    this.createFile(function () {
      var build = _this.getDataFromFile('build');
      var version = _this.getDataFromFile('version');
      _this.saveFile(build, _this.pickUp(version));
    });
  };

  plugin.prototype.upBuildNumber = function () {
    var _this2 = this;

    this.createFile(function () {
      var build = _this2.getDataFromFile('build');
      var version = _this2.getDataFromFile('version');

      build = parseInt(build);
      build++;

      _this2.saveFile(build, version);
    });
  };
  return plugin;
}();

VersionBumpPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.plugin('done', function () {
    setTimeout(function () {
      self.settings.development ? self.upVersionNumber() : self.upBuildNumber();
      self.settings.version = self.getDataFromFile('version');
    }, 1);
  });
};

module.exports = VersionBumpPlugin;

