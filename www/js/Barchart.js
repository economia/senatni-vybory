(function(){
  var Dimensionable, XScale, YScale, Bar, Barchart;
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
      var x$, ref$;
      x$ = (ref$ = this.y) != null
        ? ref$
        : this.y = d3.scale.linear();
      x$.domain([
        0, Math.max.apply(Math, this.data.map(function(it){
          return it.pozice.length;
        }))
      ]);
      x$.range([0, this.height]);
      return x$;
    }
  };
  Bar = {
    barCreator: function(selection){
      var unitHeight, x$, this$ = this;
      unitHeight = this.y(1);
      x$ = selection.append('g').attr('transform', function(it){
        return "translate(" + this$.x(it.year) + ", 0)";
      }).attr('class', 'bar').selectAll('.pozice').data(function(it){
        return it.pozice;
      }).enter().append('rect');
      x$.attr('class', 'pozice');
      x$.attr('width', this.x.rangeBand);
      x$.attr('height', unitHeight);
      x$.attr('x', '0');
      x$.attr('y', function(pozice, index){
        return this$.height - index * unitHeight;
      });
      return x$;
    }
  };
  window.Barchart = Barchart = (function(){
    Barchart.displayName = 'Barchart';
    var prototype = Barchart.prototype, constructor = Barchart;
    importAll$(prototype, arguments[0]);
    importAll$(prototype, arguments[1]);
    importAll$(prototype, arguments[2]);
    importAll$(prototype, arguments[3]);
    function Barchart(parentSelector, data){
      var x$, y$;
      this.parentSelector = parentSelector;
      this.data = data;
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
    return Barchart;
  }(Dimensionable, XScale, YScale, Bar));
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
