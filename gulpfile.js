const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const del = require('del');

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
	})
}

function sassCompile() {
	return src('app/sass/**/*.+(sass|scss)')
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer(['last 5 versions']))
	.pipe(dest('app/css'))
	.pipe(cssnano()) 
	.pipe(rename({ suffix: '.min'}))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
	.pipe(dest('app/css'))
	.pipe(browserSync.reload({stream: true}))
}

var jsfiles = [
'app/libs/jquery/jquery-1.11.1.min.js',
'app/libs/parallax/parallax.min.js',
'app/libs/magnific-popup/magnific-popup.min.js',
'app/libs/scroll2id/pagescroll2id.min.js',
'app/libs/wow/wow.min.js',
'app/libs/slick/slick.min.js',
'app/libs/fancybox/fancybox.min.js'
];

function scripts() {
	return src(jsfiles, {base: 'app/libs'})
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js/'))
	.pipe(browserSync.stream())
}

function img() {
	return src('app/img/**/*')
	.pipe(cache(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({progressive: true}),
		imageminJpegRecompress({
			loops: 5,
			min: 65,
			max: 70,
			quality:'medium'
		}),
		imagemin.svgo(),
		imagemin.optipng({optimizationLevel: 3}),
		pngquant({quality: '65-70', speed: 5})
		],{
			verbose: true
		})))
	.pipe(dest('dist/img'))
}

async function buildAll() {
	var buildCss = src([
		'app/css/*.min.*'
		])
	.pipe(dest('dist/css'))
	
	var buildFonts = src('app/fonts/**/*')
	.pipe(dest('dist/fonts'))

	var buildJs = src('app/js/**/*')
	.pipe(dest('dist/js'))

	var buildOther = src('app/*.php')
	.pipe(dest('dist'))

	var buildHtaccess = src('app/.htaccess')
	.pipe(dest('dist'))

	var buildHtml = src('app/**/*.html')
	.pipe(dest('dist'))
}

function clean() {
	return del('dist', { force: true })
}

function watchAll() {
	watch('app/sass/**/*.sass', sassCompile)
	watch('app/**/*.html').on('change', browserSync.reload)
	watch('app/css/*.css').on('change', browserSync.reload)
	watch('app/js/**/*.js').on('change', browserSync.reload)
	watch('app/libs/**/*.js').on('change', browserSync.reload)
	watch('app/img/**/*.*').on('change', browserSync.reload)
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.sassCompile = sassCompile;
exports.img = img;
exports.watchAll = watchAll
exports.clean = clean
exports.buildAll = buildAll
exports.build = series(clean, sassCompile, scripts, img, buildAll);
exports.default = parallel(sassCompile, scripts, browsersync, watchAll);
