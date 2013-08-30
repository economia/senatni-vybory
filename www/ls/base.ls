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

class Level
    (@type, @id) ->
        @pozice = []

kluby = {}
vybory = {}
poslanci = {}
(err, data) <~ d3.json "../data/data.json"
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
        year_kluby_ids[klub_id] ?= new Level \kluby klub_id
            ..klub = kluby[klub_id]
            ..pozice.push pozice
        year_poslanci_ids[pozice.poslanec.id] ?= new Level \poslanci pozice.poslanec.id
            ..poslanec = pozice.poslanec
            ..klub = kluby[klub_id]
            ..pozice.push pozice

    year_kluby = for id, year_pozice of year_kluby_ids
        year_pozice
    year_poslanci = for id, year_poslanec of year_poslanci_ids
        year_poslanec
    year_kluby.sort (a, b) ->
        a.klub?pozice - b.klub?pozice
    year_poslanci.sort (a, b) -> a.pozice.length - b.pozice.length

    new Year year, pozice, year_kluby, year_poslanci

barchart = new Barchart \#wrap years
    ..redraw \kluby
window.filterParty = (partyCss) ->
    barchart
        ..filterData (year) ->
            year.klubyFull ?= year.kluby
            year.poslanciFull ?= year.poslanci
            year.kluby = year.klubyFull.filter (level) ->
                level.klub?css == partyCss
            year.poslanci = year.poslanciFull.filter (level) ->
                level.klub?css == partyCss
            true
        ..redraw \kluby
    <~ setTimeout _, 600
    barchart.redraw \poslanci
window.killFilter = ->
    barchart.redraw \kluby
    barchart
        ..filterData (year) ->
            year.kluby = year.klubyFull
            year.poslanci = year.poslanciFull
            true
    <~ setTimeout _, 600
    barchart.redraw \kluby
