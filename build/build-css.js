const { writeFileSync, readFileSync } = require('fs');
const boxen = require('boxen');
const chalk = require('chalk');
const gzip = require('gzip-size');
const bytes = require('bytes');
const sass = require('node-sass');
const jsonImporter = require('node-sass-json-importer');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const postcssReport = require('postcss-reporter');
const cssnano = require('cssnano');
const pkg = require('../package.json');

var banner = readFileSync('./build/banner.js', 'utf-8')
  .replace('${name}', pkg.name)
  .replace('${description}', pkg.description)
  .replace('${homepage}', pkg.homepage)
  .replace('${version}', pkg.version)
  .replace('${time}', new Date());


sass.render({
  file: './src/sass/main.scss',
  importer: jsonImporter
}, (err, result) => {
  if (err) throw err.message;

  const prefixer = postcss([
    autoprefixer({ browsers: ['> 5%'] }),
    postcssReport({ clearMessages: true })
  ]);
  prefixer.process(result.css, { from: undefined }).then(res => {
    res.warnings().forEach((warn) => {
      console.warn(warn.toString());
    });

    writeFileSync('./dist/ol-contextmenu.css', banner + res.css);

    cssnano.process(res.css).then(min => {
      writeFileSync('./dist/ol-contextmenu.min.css', banner + min.css);

      const cssSize = bytes(Buffer.byteLength(res.css));
      const cssMinSize = bytes(Buffer.byteLength(min.css));
      const cssGzip = bytes(gzip.sync(res.css));
      const cssMinGzip = bytes(gzip.sync(min.css));

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
