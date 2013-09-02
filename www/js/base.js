(function(){
  var Year, Pozice, Klub, Poslanec, Vybor, Level, kluby, vybory, poslanci, this$ = this;
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
    function Pozice(poslanec, klub, vybor, year){
      this.poslanec = poslanec;
      this.klub = klub;
      this.vybor = vybor;
      this.year = year;
    }
    return Pozice;
  }());
  Klub = (function(){
    Klub.displayName = 'Klub';
    var prototype = Klub.prototype, constructor = Klub;
    function Klub(id, nazev){
      this.id = id;
      this.nazev = nazev;
      this.css = this.nazev.toLowerCase().replace('č', 'c').replace('ř', 'r').replace('í', 'i').replace(/[^-0-9a-z]/g, '-');
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
  Level = (function(){
    Level.displayName = 'Level';
    var prototype = Level.prototype, constructor = Level;
    function Level(type, id){
      this.type = type;
      this.id = id;
      this.pozice = [];
    }
    return Level;
  }());
  kluby = {};
  vybory = {};
  poslanci = {};
  d3.json("../data/data.json", function(err, data){
    var id, ref$, nazev, nullKlub, poslanec_data, years, height, width, x$, barchart, y$, backButton;
    for (id in ref$ = data.kluby_ids) {
      nazev = ref$[id];
      kluby[id] = new Klub(id, nazev);
    }
    nullKlub = kluby[9999] = new Klub(9999, 'Nezařazení');
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
        klub = kluby[klub_id] || nullKlub;
        vybor = vybory[vybor_id];
        poslanec = poslanci[poslanec_id];
        return new Pozice(poslanec, klub, vybor, year);
      });
      year_kluby_ids = {};
      year_poslanci_ids = {};
      pozice.forEach(function(pozice){
        var klub_id, x$, ref$, y$, key$;
        klub_id = pozice.klub.id;
        x$ = (ref$ = year_kluby_ids[klub_id]) != null
          ? ref$
          : year_kluby_ids[klub_id] = new Level('kluby', klub_id);
        x$.klub = kluby[klub_id];
        x$.pozice.push(pozice);
        y$ = (ref$ = year_poslanci_ids[key$ = pozice.poslanec.id]) != null
          ? ref$
          : year_poslanci_ids[key$] = new Level('poslanci', pozice.poslanec.id);
        y$.poslanec = pozice.poslanec;
        y$.klub = kluby[klub_id];
        y$.pozice.push(pozice);
        return y$;
      });
      res$ = [];
      for (id in year_kluby_ids) {
        year_pozice = year_kluby_ids[id];
        res$.push(year_pozice);
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
    height = 700;
    width = 650;
    x$ = barchart = new Barchart('#wrap', years, {
      height: height,
      width: width
    });
    x$.redraw('kluby');
    window.filterParty = function(partyCss){
      var x$, this$ = this;
      backButton.classed('disabled', false);
      x$ = barchart;
      x$.filterData(function(year){
        year.klubyFull == null && (year.klubyFull = year.kluby);
        year.poslanciFull == null && (year.poslanciFull = year.poslanci);
        year.kluby = year.klubyFull.filter(function(level){
          var ref$;
          return ((ref$ = level.klub) != null ? ref$.css : void 8) === partyCss;
        });
        year.poslanci = year.poslanciFull.filter(function(level){
          var ref$;
          return ((ref$ = level.klub) != null ? ref$.css : void 8) === partyCss;
        });
        return true;
      });
      x$.redraw('kluby');
      return setTimeout(function(){
        return barchart.redraw('poslanci');
      }, 600);
    };
    window.killFilter = function(){
      var x$, this$ = this;
      barchart.redraw('kluby');
      x$ = barchart;
      x$.filterData(function(year){
        year.kluby = year.klubyFull;
        year.poslanci = year.poslanciFull;
        return true;
      });
      barchart.redraw('kluby');
      return setTimeout(function(){
        return backButton.classed('disabled', true);
      }, 200);
    };
    window.goToPoslanec = function(level, yearIndex){
      var year, obdobi;
      year = level.pozice[0].year;
      obdobi = (function(){
        switch (false) {
        case !(year <= 1996):
          return 1;
        case !(year <= 1998):
          return 2;
        case !(year <= 2002):
          return 3;
        case !(year <= 2006):
          return 4;
        case !(year <= 2010):
          return 5;
        default:
          return 6;
        }
      }());
      return window.open("http://www.psp.cz/sqw/detail.sqw?id=" + level.poslanec.id + "&o=" + obdobi);
    };
    y$ = backButton = d3.select('#wrap').append('a');
    y$.attr('class', 'backButton disabled');
    y$.on('click', window.killFilter);
    return y$;
  });
}).call(this);
