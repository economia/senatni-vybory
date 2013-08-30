(function(){
  var Year, Pozice, Klub, Poslanec, Vybor, kluby, vybory, poslanci, this$ = this;
  Year = (function(){
    Year.displayName = 'Year';
    var prototype = Year.prototype, constructor = Year;
    function Year(year, pozice){
      this.year = year;
      this.pozice = pozice;
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
    function Klub(nazev){
      this.nazev = nazev;
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
      kluby[id] = new Klub(nazev);
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
      var year, pozice;
      year = arg$.year, pozice = arg$.pozice;
      pozice = pozice.map(function(arg$){
        var poslanec_id, vybor_id, klub_id, klub, vybor, poslanec;
        poslanec_id = arg$[0], vybor_id = arg$[1], klub_id = arg$[2];
        klub = kluby[klub_id];
        vybor = vybory[vybor_id];
        poslanec = poslanci[poslanec_id];
        return new Pozice(poslanec, klub, vybor);
      });
      return new Year(year, pozice);
    });
    return new Barchart('#wrap', years);
  });
}).call(this);
