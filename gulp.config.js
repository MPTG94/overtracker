module.exports = function() {
  var server = './server/';
  var temp = './.tmp/';
  var config = {
    /**
     * Server code paths
     */
    server: server,

    /**
     * Temp file paths
     */
    temp: temp,

    alljs: ['./server/**/*.js', './client/src/**/*.js'],

    /**
     * Delay before reloading browserSync plugin
     */
    browserReloadDelay: 1000,

    /**
     * Node settings
     */
    defaultPort: 3001,
    nodeServer: './server/server.js'
  };

  return config;
};
