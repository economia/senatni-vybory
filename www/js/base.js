(function(){
  var Year, Pozice, Klub, Poslanec, Vybor, kluby, vybory, poslanci, this$ = this;
  new Tooltip().watchElements();
  Year = (function(){
    Year.displayName = 'Year';
    var prototype = Year.prototype, constructor = Year;
    function Year(year, pozice, kluby, poslanci){
      this.year = year;
      this.pozice = pozice;
      this.kluby = kluby;
      this.poslanci = poslanci;
    }
    return Year;
  }());
  Pozice = (function(){
    Pozice.displayName = 'Pozice';
    var prototype = Pozice.prototype, constructor = Pozice;
    function Pozice(poslanec, klub, vybor){
      this.poslanec = poslanec;
      this.klub = klub;
      this.vybor = vybor;
    }
    return Pozice;
  }());
  Klub = (function(){
    Klub.displayName = 'Klub';
    var prototype = Klub.prototype, constructor = Klub;
    function Klub(id, nazev){
      this.id = id;
      this.nazev = nazev;
      this.css = this.nazev.toLowerCase().replace('č', 'c').replace('ř', 'r').replace(/[^-0-9a-z]/g, '-');
      this.pozice = this.css.charCodeAt(0);
      if (this.css === 'kscm') {
        this.pozice = 5;
      }
      if (this.css === 'nezaraz') {
        this.pozice = 129;
      }
    }
    return Klub;
  }());
  Poslanec = (function(){
    Poslanec.displayName = 'Poslanec';
    var prototype = Poslanec.prototype, constructor = Poslanec;
    function Poslanec(id, arg$){
      this.id = id;
      this.jmeno = arg$.jmeno, this.prijmeni = arg$.prijmeni;
    }
    return Poslanec;
  }());
  Vybor = (function(){
    Vybor.displayName = 'Vybor';
    var prototype = Vybor.prototype, constructor = Vybor;
    function Vybor(id, nazev){
      this.id = id;
      this.nazev = nazev;
    }
    return Vybor;
  }());
  kluby = {};
  vybory = {};
  poslanci = {};
  d3.json("../data/data.json", function(err, data){
    var id, ref$, nazev, poslanec_data, years, barchart;
    console.log(data);
    for (id in ref$ = data.kluby_ids) {
      nazev = ref$[id];
      kluby[id] = new Klub(id, nazev);
    }
    for (id in ref$ = data.vybory_ids) {
      nazev = ref$[id];
      vybory[id] = new Vybor(id, nazev);
    }
    for (id in ref$ = data.poslanci_ids) {
      poslanec_data = ref$[id];
      poslanci[id] = new Poslanec(id, poslanec_data);
    }
    years = data.years.map(function(arg$){
      var year, pozice, year_kluby_ids, year_poslanci_ids, year_kluby, res$, id, year_pozice, year_poslanci, year_poslanec;
      year = arg$.year, pozice = arg$.pozice;
      pozice = pozice.map(function(arg$){
        var poslanec_id, vybor_id, klub_id, klub, vybor, poslanec;
        poslanec_id = arg$[0], vybor_id = arg$[1], klub_id = arg$[2];
        klub = kluby[klub_id];
        vybor = vybory[vybor_id];
        poslanec = poslanci[poslanec_id];
        return new Pozice(poslanec, klub, vybor);
      });
      year_kluby_ids = {};
      year_poslanci_ids = {};
      pozice.forEach(function(pozice){
        var klub_id, ref$, x$, y$, key$;
        klub_id = ((ref$ = pozice.klub) != null ? ref$.id : void 8) || 'void';
        x$ = (ref$ = year_kluby_ids[klub_id]) != null
          ? ref$
          : year_kluby_ids[klub_id] = [];
        x$.push(pozice);
        y$ = (ref$ = year_poslanci_ids[key$ = pozice.poslanec.id]) != null
          ? ref$
          : year_poslanci_ids[key$] = {
            poslanec: pozice.poslanec,
            pozice: [],
            klub: kluby[klub_id],
            id: klub_id
          };
        y$.pozice.push(pozice);
        return y$;
      });
      res$ = [];
      for (id in year_kluby_ids) {
        year_pozice = year_kluby_ids[id];
        res$.push({
          klub: kluby[id],
          pozice: year_pozice,
          id: id
        });
      }
      year_kluby = res$;
      res$ = [];
      for (id in year_poslanci_ids) {
        year_poslanec = year_poslanci_ids[id];
        res$.push(year_poslanec);
      }
      year_poslanci = res$;
      year_kluby.sort(function(a, b){
        var ref$;
        return ((ref$ = a.klub) != null ? ref$.pozice : void 8) - ((ref$ = b.klub) != null ? ref$.pozice : void 8);
      });
      year_poslanci.sort(function(a, b){
        return a.pozice.length - b.pozice.length;
      });
      return new Year(year, pozice, year_kluby, year_poslanci);
    });
    barchart = new Barchart('#wrap', years);
    return setTimeout(function(){
      barchart.item = 'poslanci';
      return barchart.filterData(function(year){
        year.klubyFull == null && (year.klubyFull = year.kluby);
        year.kluby = year.kluby.filter(function(level){
          var ref$;
          return ((ref$ = level.klub) != null ? ref$.css : void 8) === 'cssd';
        });
        return true;
      });
    }, 500);
  });
}).call(this);
