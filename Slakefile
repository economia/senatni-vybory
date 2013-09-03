require! {
    async
    stylus
    fs
}

build-styles = (file) ->
    (err, data) <~ fs.readFile "#__dirname/www/styl/screen.styl"
    data .= toString!
    stylusFile = stylus data
        ..include "#__dirname/www/styl/"
    (err, css) <~ stylusFile.render
    throw err if err
    fs.writeFile "#__dirname/www/css/screen.css", css


relativizeFilename = (file) ->
    file .= replace __dirname, ''
    file .= replace do
        new RegExp \\\\, \g
        '/'
    file .= substr 1
option 'currentfile' 'Latest file that triggered the save' 'FILE'
task \build ->
task \deploy ->
task \build-styles ({currentfile}) ->
    file = relativizeFilename currentfile
    build-styles file
task \build-scripts ->

