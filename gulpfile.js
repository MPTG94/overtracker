const gulp = require('gulp');
const args = require('yargs').argv;
const browserSync = require('browser-sync');
const config = require('./gulp.config')();
const del = require('del');
const $ = require('gulp-load-plugins')({
  lazy: true
});
let port = process.env.PORT || config.defaultPort;

var hello = 'hi';

gulp.task('help', $.taskListing);

gulp.task('default', ['help']);

/**
 * Task to verify JS rules with ESLint
 */
gulp.task('vet', function() {
  log('Analyzing source with ESLint');

  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

/**
 * Task to prepare CSS for production
 */
gulp.task('styles', ['clean-styles'], function() {
  log('Preparing CSS');

  return gulp
    .src(config.css)
    .pipe($.concat('site.css'))
    .pipe($.cleanCss())
    .pipe($.plumber())
    .pipe(
      $.autoprefixer({
        browsers: ['last 2 version', '> 5%']
      })
    )
    .pipe(
      $.rename({
        suffix: '.min'
      })
    )
    .pipe(gulp.dest(config.temp));
});

/**
 * Task to prepare fonts for production
 */
gulp.task('fonts', ['clean-fonts'], function() {
  log('Copying fonts');

  return gulp.src(config.fonts).pipe(gulp.dest(config.build + 'fonts'));
});

/**
 * Task to prepare images for production
 */
gulp.task('images', ['clean-images'], function() {
  log('Copying images');

  return gulp
    .src(config.images)
    .pipe(
      $.imagemin({
        optimizationLevel: 4
      })
    )
    .pipe(gulp.dest(config.build + 'images'));
});

/**
 * Task to clean stale production files
 */
gulp.task('clean', function(done) {
  var delconfig = [].concat(config.build, config.temp);
  log('Cleaning: ' + $.util.colors.cyan(delconfig));
  del(delconfig, done);
});

/**
 * Task to clean stale font files
 */
gulp.task('clean-fonts', function(done) {
  return clean(config.build + 'fonts/**/*.*', done);
});

/**
 * Task to clean stale image files
 */
gulp.task('clean-images', function(done) {
  return clean(config.build + 'images/**/*.*', done);
});

/**
 * Task to clean stale CSS files
 */
gulp.task('clean-styles', function(done) {
  return clean(config.temp + '**/*.css', done);
});

/**
 * Task to clean stale JS files
 */
gulp.task('clean-code', function(done) {
  let files = [].concat(
    config.temp + '**/*.js',
    config.build + '**/*.html',
    config.build + 'js/**/*.js'
  );
  return clean(files, done);
});

/**
 * Task to watch CSS file changes
 */
gulp.task('css-watcher', function() {
  gulp.watch([config.css], ['styles']);
});

/**
 * Task to generate AngularJS template cache
 */
gulp.task('templatecache', ['clean-code'], function() {
  log('Creating AngularJS $templateCache');

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

/**
 * Task to inject bower dependencies into HTML
 */
gulp.task('wiredep', function() {
  log('Wire up the bower css js and our app js into the html');
  let options = config.getWiredepDefaultOptions();
  let wiredep = require('wiredep').stream;
  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe($.inject(gulp.src(config.js)))
    .pipe(gulp.dest(config.client));
});

/**
 * Task to inject custom project CSS and JS into html
 */
gulp.task('inject', ['styles'], function() {
  log('Wire up the app css js and our app js into the html');

  return (gulp
      .src(config.index)
      .pipe($.inject(gulp.src([config.tempCss, './src/client/**/*.js'])))
      //.pipe($.inject(gulp.src([config.tempCss, config.alljs.])))
      .pipe(gulp.dest(config.client)) );
});

/**
 * Task to start up the development environment
 */
gulp.task('serve-dev', ['inject'], function() {
  let isDev = true;

  let nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      PORT: port,
      NODE_ENV: isDev ? 'dev' : 'build'
    },
    watch: [config.server]
  };

  return $.nodemon(nodeOptions)
    .on('restart', function(ev) {
      log('*** nodemon restarted');
      log('files changed on restart: \n' + ev);
      setTimeout(function() {
        browserSync.notify('reloading now ...');
        browserSync.reload({
          stream: false
        });
      }, config.browserReloadDelay);
    })
    .on('start', function() {
      log('*** nodemon started');
      startBrowserSync();
    })
    .on('crash', function() {
      log('*** nodemon crashed: script crashed for some reason');
    })
    .on('exit', function() {
      log('*** nodemon exited cleanly');
    });
});

// Functions
function changeEvent(event) {
  let srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
  log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync() {
  if (args.nosync || browserSync.active) {
    return;
  }

  log('Starting browser-sync on port ' + port);

  gulp.watch([config.css], ['styles']).on('change', function(event) {
    changeEvent(event);
  });

  let options = {
    proxy: 'localhost:' + port,
    port: 3000,
    files: [
      config.client + '**/*.*',
      '!' + config.css,
      config.temp + '**/*.css'
    ],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scrolls: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 1000
  };

  browserSync(options);
}

function clean(path, done) {
  log('Cleaning: ' + $.util.colors.cyan(path));
  return del(path, done);
}

function log(message) {
  if (typeof message === 'object') {
    for (var item in message) {
      if (message.hasOwnProperty(item)) {
        $.util.log($.util.colors.cyan(message[item]));
      }
    }
  } else {
    $.util.log($.util.colors.cyan(message));
  }
}
