module.paths.push('/usr/local/lib/node_modules');
var
  fs = require('fs'),
  path = require('path'),
  read = function(f) {
    return fs.readFileSync(f).toString();
  },
  log = function(t){console.log(t)},
  js_str = '',
  src_dir = __dirname + '/src/',
  js_files = [
    'base.js',
    'internal.js',
    'html.js',
    'constants.js',
    'utils.js'
  ],
  
  out_dir = __dirname + '/build/',
  out_js_file_combined = out_dir + 'ol3-contextmenu-debug.js',
  i = -1
;


//JS
while(++i < js_files.length){
  js_str += read(src_dir + js_files[i]);
}
var wrapper = read(fs.realpathSync(src_dir + 'wrapper.js'));
var js_str_combined = wrapper.replace('/*{CODE_HERE}*/', js_str);

fs.writeFileSync(out_js_file_combined, js_str_combined);