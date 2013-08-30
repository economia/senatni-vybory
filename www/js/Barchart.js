(function(){
  var Dimensionable, XScale, YScale, Bar, Filter, Barchart;
  Dimensionable = {
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    computeDimensions: function(fullWidth, fullHeight){
      this.fullWidth = fullWidth;
      this.fullHeight = fullHeight;
      this.width = this.fullWidth - this.margin.left - this.margin.right;
      return this.height = this.fullHeight - this.margin.top - this.margin.bottom;
    }
  };
  XScale = {
    recomputeXScale: function(){
      var x$, ref$;
      x$ = (ref$ = this.x) != null
        ? ref$
        : this.x = d3.scale.ordinal();
      x$.rangeRoundBands([0, this.width], 0.1);
      x$.domain(this.data.map(function(it){
        return it.year;
      }));
      return x$;
    }
  };
  YScale = {
    recomputeYScale: function(){
      var lengths, x$, ref$, this$ = this;
      lengths = this.data.map(function(it){
        var length;
        length = 0;
        it[this$.item].forEach(function(level){
          return length += level.pozice.length;
        });
        return length;
      });
      x$ = (ref$ = this.y) != null
        ? ref$
        : this.y = d3.scale.linear();
      x$.domain([0, Math.max.apply(Math, lengths)]);
      x$.range([0, this.height]);
      return x$;
    }
  };
  Bar = {
    barCreator: function(selection){
      var currentHeight, bar, x$, this$ = this;
      currentHeight = 0;
      bar = selection.append('g').attr('transform', function(it){
        return "translate(" + this$.x(it.year) + ", 0)";
      }).attr('class', 'bar');
      x$ = bar.selectAll('.klub').data(function(it){
        return it[this$.item];
      }).enter().append('rect');
      x$.each(function(level, index){
        var height;
        if (index === 0) {
          currentHeight = 0;
        }
        height = Math.round(this$.y(level.pozice.length));
        level.height = height;
        if (this$.item === 'poslanci') {
          level.height -= 0.5;
        }
        currentHeight += height;
        return level.offset = this$.height - currentHeight;
      });
      x$.attr('class', function(level){
        var css, ref$;
        css = ((ref$ = level.klub) != null ? ref$.css : void 8) || "void";
        return "klub klub-" + css;
      });
      x$.attr('data-tooltip', function(level){
        var nazev, ref$;
        if (this$.item === 'poslanci') {
          return level.poslanec.jmeno + " " + level.poslanec.prijmeni + ": " + level.pozice.length + " pozic";
        } else {
          nazev = ((ref$ = level.klub) != null ? ref$.nazev : void 8) || "Nezařazení";
          return nazev + ": " + level.pozice.length + " pozic";
        }
      });
      x$.attr('width', this.x.rangeBand);
      x$.attr('height', function(it){
        return it.height;
      });
      x$.attr('x', '0');
      x$.attr('y', function(it){
        return it.offset;
      });
      return x$;
    }
  };
  Filter = {
    filterData: function(filterFunction){
      this.dataFull == null && (this.dataFull = this.data);
      this.data = this.dataFull;
      this.data = this.data.filter(filterFunction);
      return this.redraw();
    }
  };
  window.Barchart = Barchart = (function(){
    Barchart.displayName = 'Barchart';
    var prototype = Barchart.prototype, constructor = Barchart;
    importAll$(prototype, arguments[0]);
    importAll$(prototype, arguments[1]);
    importAll$(prototype, arguments[2]);
    importAll$(prototype, arguments[3]);
    importAll$(prototype, arguments[4]);
    function Barchart(parentSelector, data){
      var x$, y$;
      this.parentSelector = parentSelector;
      this.data = data;
      this.item = 'kluby';
      this.computeDimensions(650, 600);
      this.recomputeXScale();
      this.recomputeYScale();
      x$ = this.svg = d3.selectAll(this.parentSelector).append('svg');
      x$.attr('class', 'barchart');
      x$.attr('width', this.fullWidth);
      x$.attr('height', this.fullHeight);
      y$ = this.content = this.svg.append('g');
      y$.attr('class', 'content');
      y$.attr('transform', "translate(" + this.margin.left + ", " + this.margin.top + ")");
      this.bars = this.content.selectAll('.bar').data(this.data).enter().call(bind$(this, 'barCreator'));
      this.recomputeXScale();
    }
    prototype.redraw = function(){
      console.log(this.y.domain());
      this.recomputeYScale();
      console.log(this.y.domain());
      return console.log(this.data);
    };
    return Barchart;
  }(Dimensionable, XScale, YScale, Bar, Filter));
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
