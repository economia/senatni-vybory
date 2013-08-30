(function(){
  var Dimensionable, XScale, Barchart;
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
      return this.height = this.fullWidth - this.margin.top - this.margin.bottom;
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
  window.Barchart = Barchart = (function(){
    Barchart.displayName = 'Barchart';
    var prototype = Barchart.prototype, constructor = Barchart;
    importAll$(prototype, arguments[0]);
    importAll$(prototype, arguments[1]);
    function Barchart(parentSelector, data){
      var x$, y$;
      this.parentSelector = parentSelector;
      this.data = data;
      this.computeDimensions(650, 600);
      this.recomputeXScale();
      x$ = this.svg = d3.selectAll(this.parentSelector).append('svg');
      x$.attr('class', 'barchart');
      x$.attr('width', this.fullWidth);
      x$.attr('height', this.fullHeight);
      y$ = this.content = this.svg.append('g');
      y$.attr('class', 'content');
      y$.attr('transform', "translate(" + this.margin.left + ", " + this.margin.top + ")");
      this.recomputeXScale();
    }
    return Barchart;
  }(Dimensionable, XScale));
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);
