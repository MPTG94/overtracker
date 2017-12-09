const gulp = require('gulp');
const args = require('yargs').argv;
//const browserSync = require('browser-sync');
const config = require('./gulp.config')();
const del = require('del');
const $ = require('gulp-load-plugins')({
  lazy: true
});
let port = process.env.PORT || config.defaultPort;

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
 * Task to start up the development environment
 */
gulp.task('serve-dev', function() {
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
      // setTimeout(function() {
      //   browserSync.notify('reloading now ...');
      //   browserSync.reload({
      //     stream: false
      //   });
      // }, config.browserReloadDelay);
    })
    .on('start', function() {
      log('*** nodemon started');
      //startBrowserSync();
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

// function startBrowserSync() {
//   if (args.nosync || browserSync.active) {
//     return;
//   }

//   log('Starting browser-sync on port ' + port);

//   // gulp.watch([config.css], ['styles']).on('change', function(event) {
//   //   changeEvent(event);
//   // });

//   let options = {
//     proxy: 'localhost:' + port,
//     port: 3000,
//     files: [
//       config.client + '**/*.*',
//       '!' + config.css,
//       config.temp + '**/*.css'
//     ],
//     ghostMode: {
//       clicks: true,
//       location: false,
//       forms: true,
//       scrolls: true
//     },
//     injectChanges: true,
//     logFileChanges: true,
//     logLevel: 'debug',
//     logPrefix: 'gulp-patterns',
//     notify: true,
//     reloadDelay: 1000
//   };

//   browserSync(options);
// }

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
