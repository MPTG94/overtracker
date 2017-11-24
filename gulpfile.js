var gulp = require("gulp");
var args = require("yargs").argv;
var browserSync = require("browser-sync");
var config = require("./gulp.config")();
var del = require("del");
var $ = require("gulp-load-plugins")({
  lazy: true
});
var port = process.env.PORT || config.defaultPort;

gulp.task("help", $.taskListing);

gulp.task("default", ["help"]);

gulp.task("vet", function() {
  log("Analyzing source with JSHint and JSCS");

  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jscs())
    .pipe($.jscs.reporter())
    .pipe($.jshint())
    .pipe(
      $.jshint.reporter("jshint-stylish", {
        verbose: true
      })
    )
    .pipe($.jshint.reporter("fail"));
});

gulp.task("styles", ["clean-styles"], function() {
  log("Preparing CSS");

  return gulp
    .src(config.css)
    .pipe($.concat("site.css"))
    .pipe($.cleanCss())
    .pipe($.plumber())
    .pipe(
      $.autoprefixer({
        browsers: ["last 2 version", "> 5%"]
      })
    )
    .pipe(
      $.rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest(config.temp));
});

gulp.task("fonts", ["clean-fonts"], function() {
  log("Copying fonts");

  return gulp.src(config.fonts).pipe(gulp.dest(config.build + "fonts"));
});

gulp.task("images", ["clean-images"], function() {
  log("Copying images");

  return gulp
    .src(config.images)
    .pipe(
      $.imagemin({
        optimizationLevel: 4
      })
    )
    .pipe(gulp.dest(config.build + "images"));
});

gulp.task("clean", function(done) {
  var delconfig = [].concat(config.build, config.temp);
  log("Cleaning: " + $.util.colors.cyan(delconfig));
  del(delconfig, done);
});

gulp.task("clean-fonts", function(done) {
  return clean(config.build + "fonts/**/*.*", done);
});

gulp.task("clean-images", function(done) {
  return clean(config.build + "images/**/*.*", done);
});

gulp.task("clean-styles", function(done) {
  return clean(config.temp + "**/*.css", done);
});

gulp.task("clean-code", function(done) {
  var files = [].concat(
    config.temp + "**/*.js",
    config.build + "**/*.html",
    config.build + "js/**/*.js"
  );
  return clean(files, done);
});

gulp.task("less-watcher", function() {
  gulp.watch([config.less], ["styles"]);
});

gulp.task("templatecache", ["clean-code"], function() {
  log("Creating AngularJS $templateCache");

  return gulp
    .src(config.htmlTemplates)
    .pipe(
      $.minifyHtml({
        empty: true
      })
    )
    .pipe(
      $.angularTemplatecache(
        config.templateCache.file,
        config.templateCache.options
      )
    )
    .pipe(gulp.dest(config.temp));
});

gulp.task("wiredep", function() {
  log("Wire up the bower css js and our app js into the html");
  var options = config.getWiredepDefaultOptions();
  var wiredep = require("wiredep").stream;
  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe($.inject(gulp.src(config.js)))
    .pipe(gulp.dest(config.client));
});

gulp.task("inject", ["styles"], function() {
  log("Wire up the app css js and our app js into the html");

  return gulp
    .src(config.index)
    .pipe($.inject(gulp.src(config.tempCss)))
    .pipe(gulp.dest(config.client));
});

gulp.task("serve-dev", ["inject"], function() {
  var isDev = true;

  var nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      PORT: port,
      NODE_ENV: isDev ? "dev" : "build"
    },
    watch: [config.server]
  };

  return $.nodemon(nodeOptions)
    .on("restart", function(ev) {
      log("*** nodemon restarted");
      log("files changed on restart: \n" + ev);
      setTimeout(function() {
        browserSync.notify("reloading now ...");
        browserSync.reload({
          stream: false
        });
      }, config.browserReloadDelay);
    })
    .on("start", function() {
      log("*** nodemon started");
      startBrowserSync();
    })
    .on("crash", function() {
      log("*** nodemon crashed: script crashed for some reason");
    })
    .on("exit", function() {
      log("*** nodemon exited cleanly");
    });
});

// Functions
function changeEvent(event) {
  var srcPattern = new RegExp("/.*(?=/" + config.source + ")/");
  log("File " + event.path.replace(srcPattern, "") + " " + event.type);
}

function startBrowserSync() {
  if (args.nosync || browserSync.active) {
    return;
  }

  log("Starting browser-sync on port " + port);

  gulp.watch([config.css], ["styles"]).on("change", function(event) {
    changeEvent(event);
  });

  var options = {
    proxy: "localhost:" + port,
    port: 3000,
    files: [
      config.client + "**/*.*",
      "!" + config.css,
      config.temp + "**/*.css"
    ],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scrolls: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: "debug",
    logPrefix: "gulp-patterns",
    notify: true,
    reloadDelay: 1000
  };

  browserSync(options);
}

function clean(path, done) {
  log("Cleaning: " + $.util.colors.cyan(path));
  return del(path, done);
}

function log(message) {
  if (typeof message === "object") {
    for (var item in message) {
      if (message.hasOwnProperty(item)) {
        $.util.log($.util.colors.cyan(message[item]));
      }
    }
  } else {
    $.util.log($.util.colors.cyan(message));
  }
}
