new Tooltip!watchElements!
class Year
    (@year, @pozice, @kluby, @poslanci) ->

class Pozice
    (@poslanec, @klub, @vybor) ->

class Klub
    (@id, @nazev) ->
        @css = @nazev.toLowerCase!
            .replace \č \c
            .replace \ř \r
            .replace /[^-0-9a-z]/g '-'
        @pozice = @css.charCodeAt 0
        if @css == \kscm
            @pozice = 5
        if @css == \nezaraz
            @pozice = 129

class Poslanec
    (@id, {@jmeno, @prijmeni}) ->

class Vybor
    (@id, @nazev) ->
kluby = {}
vybory = {}
poslanci = {}
(err, data) <~ d3.json "../data/data.json"
console.log data
for id, nazev of data.kluby_ids
    kluby[id] = new Klub id, nazev

for id, nazev of data.vybory_ids
    vybory[id] = new Vybor id, nazev

for id, poslanec_data of data.poslanci_ids
    poslanci[id] = new Poslanec id, poslanec_data

years = data.years.map ({year, pozice}) ->
    pozice .= map ([poslanec_id, vybor_id, klub_id]) ->
        klub     = kluby[klub_id]
        vybor    = vybory[vybor_id]
        poslanec = poslanci[poslanec_id]
        new Pozice poslanec, klub, vybor
    year_kluby_ids = {}
    year_poslanci_ids = {}
    pozice.forEach (pozice)->
        klub_id = pozice.klub?id || \void
        year_kluby_ids[klub_id] ?= []
            ..push pozice
        year_poslanci_ids[pozice.poslanec.id] ?= {poslanec: pozice.poslanec, pozice: [], klub: kluby[klub_id], id: klub_id}
            ..pozice.push pozice

    year_kluby = for id, year_pozice of year_kluby_ids
        {klub: kluby[id], pozice:year_pozice, id}
    year_poslanci = for id, year_poslanec of year_poslanci_ids
        year_poslanec
    year_kluby.sort (a, b) ->
        a.klub?pozice - b.klub?pozice
    year_poslanci.sort (a, b) -> a.pozice.length - b.pozice.length

    new Year year, pozice, year_kluby, year_poslanci

barchart = new Barchart \#wrap years
<~ setTimeout _, 500
barchart.item = \poslanci
barchart.filterData (year) ->
    year.klubyFull ?= year.kluby
    year.kluby = year.klubyFull.filter (level) ->
        level.klub?css == \cssd
    true
