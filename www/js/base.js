(function(){
  var Year, Pozice, Klub, Poslanec, Vybor, kluby, vybory, poslanci, this$ = this;
  new Tooltip().watchElements();
  Year = (function(){
    Year.displayName = 'Year';
    var prototype = Year.prototype, constructor = Year;
    function Year(year, pozice, kluby){
      this.year = year;
      this.pozice = pozice;
      this.kluby = kluby;
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
    function Klub(id, nazev, $class){
      this.id = id;
      this.nazev = nazev;
      this['class'] = $class;
      this.css = this.nazev.toLowerCase().replace('č', 'c').replace('ř', 'r').replace(/[^-0-9a-z]/g, '-');
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
    var id, ref$, nazev, poslanec_data, years;
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
      var year, pozice, year_kluby_ids, year_kluby, res$, id, year_pozice;
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
      pozice.forEach(function(pozice){
        var id, ref$, x$;
        id = ((ref$ = pozice.klub) != null ? ref$.id : void 8) || 'void';
        x$ = (ref$ = year_kluby_ids[id]) != null
          ? ref$
          : year_kluby_ids[id] = [];
        x$.push(pozice);
        return x$;
      });
      res$ = [];
      for (id in year_kluby_ids) {
        year_pozice = year_kluby_ids[id];
        res$.push({
          klub: kluby[id],
          pozice: year_pozice
        });
      }
      year_kluby = res$;
      return new Year(year, pozice, year_kluby);
    });
    return new Barchart('#wrap', years);
  });
}).call(this);
