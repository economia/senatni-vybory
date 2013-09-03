require! {
    fs
}

build-styles = (options = {}) ->
    require! stylus
    (err, data) <~ fs.readFile "#__dirname/www/styl/screen.styl"
    data .= toString!
    stylusCompiler = stylus data
        ..include "#__dirname/www/styl/"
    if options.compression
        stylusCompiler.set \compress true
    (err, css) <~ stylusCompiler.render
    throw err if err
    fs.writeFile "#__dirname/www/css/screen.css", css

build-script = (file, cb) ->
    require! child_process.exec
    (err, result) <~ exec "lsc.cmd -o #__dirname/www/js -c #__dirname/#file"
    throw err if err
    cb?!

relativizeFilename = (file) ->
    file .= replace __dirname, ''
    file .= replace do
        new RegExp \\\\, \g
        '/'
    file .= substr 1
option 'currentfile' 'Latest file that triggered the save' 'FILE'
task \build ->
    build-styles compression: no
task \deploy ->
    build-styles compression: yes
task \build-styles ->
    build-styles compression: no
task \build-script ({currentfile}) ->
    file = relativizeFilename currentfile
    build-script file

