class Year
    (@year, @pozice) ->

class Pozice
    (@poslanec, @klub, @vybor) ->

class Klub
    (@nazev) ->

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
    kluby[id] = new Klub nazev

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
    new Year year, pozice
