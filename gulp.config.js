module.exports = function() {
  var client = './src/client/';
  var clientApp = client + 'app/';
  var server = './src/server/';
  var temp = './.tmp/';
  var config = {
    /**
     * All JS paths
     */
    alljs: ['./src/**/*.js', './*.js'],

    /**
     * Build folder paths
     */
    build: './build/',

    /**
     * All client code paths
     */
    client: client,

    /**
     * All temp css file paths
     */
    tempCss: temp + 'site.min.css',

    /**
     * Fonts paths
     */
    fonts: './bower_components/font-awesome/fonts/**/*.*',

    /**
     * paths for AngularJS html templates
     */
    htmlTemplates: clientApp + '**/*.html',

    /**
     * All image file paths
     */
    images: client + 'images/**/*.*',

    /**
     * All client html file paths
     */
    index: client + 'index.html',

    /**
     * All JS client file paths
     */
    js: [
      clientApp + '**/*.module.js',
      clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js'
    ],

    /**
     * All CSS paths
     */
    css: client + 'styles/*.css',

    /**
     * All Less paths
     */
    less: client + 'styles/styles.less',

    /**
     * Server code paths
     */
    server: server,

    /**
     * Temp file paths
     */
    temp: temp,

    /**
     * AngularJS template cache
     */
    templateCache: {
      file: 'templates.js',
      options: {
        module: 'app.core',
        standAlone: false,
        root: 'app/'
      }
    },

    /**
     * Delay before reloading browserSync plugin
     */
    browserReloadDelay: 1000,

    /**
     * Bower and NPM locations
     */
    /*bower: {
      json: require("./bower.json"),
      directory: "./bower_components",
      ignorePath: "../.."
    },*/

    /**
     * Node settings
     */
    defaultPort: 7203,
    nodeServer: './src/server/index.js'
  };

  config.getWiredepDefaultOptions = function() {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };

    return options;
  };

  return config;
};
