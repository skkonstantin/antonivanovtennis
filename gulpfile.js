import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import del from "del";
import browserSync from "browser-sync";
import cleanCSS from "gulp-clean-css";
import sourcemaps from "gulp-sourcemaps";
import gulpif from "gulp-if";
import gcmq from "gulp-group-css-media-queries";
import gulpSass from "gulp-sass";
import sass from "sass";
import htmlmin from "gulp-htmlmin";
import rename from "gulp-rename";
import cache from "gulp-cache";
import imagemin from "gulp-imagemin";
import imageResize from "gulp-image-resize";

import webp from "gulp-webp";

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const browser = browserSync.create();
const cssPrep = gulpSass(sass);

const sizes = [576, 768, 992, 1200];

function clear() {
  return del("dist/*");
}

function styles() {
  return gulp
    .src("./src/styles/main.scss")
    .pipe(gulpif(isDev, sourcemaps.init()))
    .pipe(cssPrep({ errLogToConsole: true }))
    .pipe(gcmq())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .on("error", console.error.bind(console))
    .pipe(
      gulpif(
        isProd,
        cleanCSS({
          level: 2,
        })
      )
    )
    .pipe(gulpif(isDev, sourcemaps.write()))
    .pipe(rename("styles.min.css"))
    .pipe(gulp.dest("./dist"))
    .pipe(gulpif(isDev, browser.stream()));
}

function optSvg(from = "src/assets/images/*.svg", to = "dist/images") {
  return function optSVG() {
    return gulp.src(from).pipe(imagemin()).pipe(gulp.dest(to));
  };
}

function resizeAndOpt(
  width,
  from = "src/assets/images/*.{jpg,jpeg,png}",
  to = "dist/images"
) {
  return function imagesOpt() {
    return gulp
      .src(from)
      .pipe(
        imageResize({
          width,
        })
      )
      .pipe(
        rename((path) => {
          path.basename = `${path.basename}-${width}`;
        })
      )
      .pipe(imagemin())
      .pipe(gulp.dest(to));
  };
}

function resizeAndWebP(
  width,
  from = "src/assets/images/*.{jpg,jpeg,png}",
  to = "dist/images"
) {
  return function imagesOptWebp() {
    return gulp
      .src(from)
      .pipe(
        imageResize({
          width,
        })
      )
      .pipe(
        rename(function (path) {
          path.basename = `${path.basename}-${width}`;
        })
      )
      .pipe(webp())
      .pipe(gulp.dest(to));
  };
}

function html() {
  return (
    gulp
      .src("./src/*.html")
      //.pipe(htmlmin({ collapseWhitespace: false }))
      .pipe(gulp.dest("./dist"))
      .pipe(gulpif(isDev, browser.stream()))
  );
}
function js() {
  return gulp
    .src("src/script.js")
    .pipe(gulp.dest("dist/js"))
    .pipe(gulpif(isDev, browser.stream()));
}

const imagesTask = gulp.parallel([
  ...sizes.map((size) =>
    gulp.parallel(resizeAndOpt(size), resizeAndWebP(size))
  ),
  ...[100, 200].map((size) =>
    gulp.parallel(
      resizeAndOpt(
        size,
        "src/assets/logo/*.{jpg,jpeg,png}",
        "dist/images/logo"
      ),
      resizeAndWebP(
        size,
        "src/assets/logo/*.{jpg,jpeg,png}",
        "dist/images/logo"
      )
    )
  ),
  optSvg(),
]);

function watch() {
  browser.init({
    server: {
      baseDir: "./dist/",
      index: "index.html",
    },
  });

  gulp.watch("./src/styles/**/*.scss", styles);
  gulp.watch("./src/index.html", html);
  gulp.watch("./src/assets/images/*.*", imagesTask);
  gulp.watch("./src/script.js", js);
}

let build = gulp.series(clear, gulp.parallel(styles, imagesTask, html, js));

gulp.task("build", build);
gulp.task("watch", gulp.series(build, watch));
