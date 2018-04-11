/*
 * =============================================================================
 * Project: webpack-version-bump
 * Created Date: 2018-04-11, 09:05:23
 * Author: Przemysław Drzewicki <przemyslaw.drzewicki@gmail.com>
 * =============================================================================
 * Last Modified: 2018-04-11, 11:43:10
 * Modified By: Przemysław Drzewicki
 * =============================================================================
 * Copyright (c) 2018 webonweb
 * =============================================================================
 */
let fs = require('fs');
var path = require('path');

const VersionBumpPlugin = (function() {
  /**
   * Main instance of plugin.
   * 
   * @memberof VersionBumpPlugin
   */
  const plugin = function(options) {
    this.settings = Object.assign({
      dirname: path.resolve(__dirname, '../'),
      file: path.resolve(__dirname, '../', 'version.json')
    }, options)
  }

  /**
   * Save file.
   * 
   * @param {string} [build=''] 
   * @param {string} [version=''] 
   * @param {functnio} [cb=() => {}] 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.saveFile = function(build = 0, version = '0.0.0', cb = () => {}) {
    let content = `{
  "build": "${build}",
  "version": "${version}"
}`;

    fs.writeFileSync(this.settings.file,content,{ encoding:'utf8',flag:'w' }, function(err){
      if(!err && typeof cb === 'function') {
        cb();
      }
    });
  }

  /**
   * Get data from file not replace coma.
   * 
   * @param {string} [name=''] 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.get = function(name = '') { 
    return JSON.stringify(require(this.settings.file)[name]);
  }

  /**
   * Get data from file.
   * 
   * @param {string} [name=''] 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.getDataFromFile = function(name = '') {
    let data = JSON.stringify(require(this.settings.file)[name]);
    return data.replace('"', '').replace('"', "");
  }

  /**
   * Create file.
   * 
   * @param {function} [cb] 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.createFile = function(cb = () => {}) {
    if (!fs.existsSync(this.settings.file)) { 
      this.saveFile("0", "0.0.0", cb)
    } else {
      cb();
    }
  }
  
  /**
   * Pick up verion number.
   * 
   * @param {string} [version=''] 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.pickUp = function(version = '') {
    let split = version.split(".");
    split = split.map(item => parseInt(item));

    split[2]++;
    split[1] = split[2] > 9999? split[1]+1 : split[1];
    split[2] = split[2] > 9999? 0 : split[2];

    split[0] = split[1] > 9999? split[0]+1 : split[0];
    split[1] = split[1] > 9999? 0 : split[1];

    return split.join('.');
  }

  /**
   * Handle pickup version.
   * 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.upVersionNumber = function() {
    this.createFile(() => {
      let build = this.getDataFromFile('build');
      let version = this.getDataFromFile('version');
      this.saveFile(build, this.pickUp(version));
    });
  }

  /**
   * Handle pickup build.
   * 
   * @memberof VersionBumpPlugin
   */
  plugin.prototype.upBuildNumber = function() {
    this.createFile(() => {
      let build = this.getDataFromFile('build');
      let version = this.getDataFromFile('version');
      
      build = parseInt(build);
      build++;

      this.saveFile(build, version);
    });
  }
  return plugin;
})();


VersionBumpPlugin.prototype.apply = function(compiler) {
  let self = this;
  compiler.plugin('done', function() {
    setTimeout(function() {
      self.settings.development? self.upVersionNumber() : self.upBuildNumber();
      self.settings.version = self.getDataFromFile('version');

      console.log(self.settings);
    }, 1);
  });
};

module.exports = VersionBumpPlugin;