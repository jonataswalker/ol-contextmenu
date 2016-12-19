var fs = require('fs'),
    boxen = require('boxen'),
    chalk = require('chalk'),
    gzip = require('gzip-size'),
    bytes = require('bytes'),
    sass = require('node-sass'),
    jsonImporter = require('node-sass-json-importer'),
    autoprefixer = require('autoprefixer'),
    postcss = require('postcss'),
    postcssImport = require('postcss-import'),
    postcssReport = require('postcss-reporter'),
    styleLint = require('stylelint'),
    cssnano = require('cssnano'),
    pkg = require('./package.json');

var banner = fs.readFileSync('banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${version}', pkg.version)
  .replace('${time}', new Date());


sass.render({
  file: pkg.build.entrySass,
  importer: jsonImporter
}, (err, result) => {
  if (err) throw err.message;
  let css, cssMin;
  const prefixer = postcss([
    postcssImport({ plugins: [styleLint()] }),
    autoprefixer({ browsers: ['> 5%'] }),
    postcssReport({ clearMessages: true })
  ]);
  prefixer.process(result.css).then((res) => {
    res.warnings().forEach((warn) => {
      console.warn(warn.toString());
    });
    css = res.css;
    fs.writeFileSync(pkg.build.destCSS, banner + css);

    cssnano.process(css).then((r) => {
      cssMin = r.css;
      fs.writeFileSync(pkg.build.destMinCSS, banner + cssMin);

      const cssSize = bytes(Buffer.byteLength(css));
      const cssMinSize = bytes(Buffer.byteLength(cssMin));
      const cssGzip = bytes(gzip.sync(css));
      const cssMinGzip = bytes(gzip.sync(cssMin));

      // eslint-disable-next-line no-console
      console.log(boxen([
        chalk.green.bold('CSS: '),
        chalk.yellow.bold(cssSize), ', ',
        chalk.green.bold('Gzipped: '),
        chalk.yellow.bold(cssGzip), '\n',
        chalk.green.bold('Minified: '),
        chalk.yellow.bold(cssMinSize), ', ',
        chalk.green.bold('Gzipped: '),
        chalk.yellow.bold(cssMinGzip), '\n',
        chalk.green.bold('Now: '),
        chalk.yellow.bold(new Date())
      ].join(''), { padding: 1 }));
    });
  });
});
