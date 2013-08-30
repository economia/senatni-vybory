(function(){
  var Dimensionable, XScale, YScale, Bar, Level, Filter, Transitions, Barchart;
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
        it.kluby.forEach(function(level){
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
    drawBars: function(item){
      var x$, y$, z$;
      this.lastItem = this.item;
      this.item = item;
      this.content.selectAll('.bar').data(this.data).enter().call(bind$(this, 'barCreator'));
      x$ = this.content.selectAll('.bar');
      x$.call(bind$(this, 'drawLevels'));
      if (this.lastItem && this.lastItem !== this.item) {
        y$ = this.content.selectAll(".bar ." + this.lastItem);
        z$ = y$.transition();
        z$['attr']('transform', "scale(0, 1)");
        z$.remove();
        return y$;
      }
    },
    barCreator: function(selection){
      var x$, bar;
      x$ = bar = selection.append('g');
      x$.call(bind$(this, 'barShaper'));
      return x$;
    },
    barShaper: function(selection){
      var this$ = this;
      return selection.attr('transform', function(it){
        return "translate(" + this$.x(it.year) + ", 0)";
      }).attr('class', 'bar');
    }
  };
  Level = {
    drawLevels: function(bar){
      var x$, this$ = this;
      this.levels = bar.selectAll("." + this.item).data(function(it){
        return it[this$.item];
      }, function(it){
        return it.id;
      });
      x$ = this.levels;
      x$.call(bind$(this, 'levelUpdater'));
      x$.enter().call(bind$(this, 'levelCreator'));
      x$.exit().call(bind$(this, 'levelDestroyer'));
      return x$;
    },
    levelCreator: function(selection){
      var currentHeight, x$, this$ = this;
      currentHeight = 0;
      x$ = selection.append('rect');
      x$.call(bind$(this, 'levelShaper'));
      x$.attr('class', function(level){
        var css, ref$;
        css = ((ref$ = level.klub) != null ? ref$.css : void 8) || "void";
        return level.type + " klub-" + css;
      });
      x$.attr('data-tooltip', function(level){
        var nazev, ref$;
        if (level.type === 'poslanci') {
          return level.poslanec.jmeno + " " + level.poslanec.prijmeni + ": " + level.pozice.length + " pozic";
        } else {
          nazev = ((ref$ = level.klub) != null ? ref$.nazev : void 8) || "Nezařazení";
          return nazev + ": " + level.pozice.length + " pozic";
        }
      });
      x$.on('click', function(level){
        if (level.type === 'kluby') {
          return window.filterParty(level.klub.css);
        }
      });
      x$.attr('width', this.x.rangeBand);
      x$.attr('x', '0');
      return x$;
    },
    levelShaper: function(selection){
      var currentHeight, x$, this$ = this;
      currentHeight = 0;
      x$ = selection;
      x$.each(function(level, index){
        var height;
        if (index === 0) {
          currentHeight = 0;
        }
        height = Math.round(this$.y(level.pozice.length));
        level.height = height;
        if (level.type === 'poslanci') {
          level.height -= 0.5;
        }
        currentHeight += height;
        return level.offset = this$.height - currentHeight;
      });
      x$.attr('height', function(it){
        return it.height;
      });
      x$.attr('y', function(it){
        return it.offset;
      });
      return x$;
    },
    levelUpdater: function(selection){
      var x$;
      x$ = selection.transition();
      x$.call(this.transitionStepper(1));
      x$.call(bind$(this, 'levelShaper'));
      return x$;
    },
    levelDestroyer: function(selection){
      var x$;
      x$ = selection.transition();
      x$.call(this.transitionStepper(0));
      x$['attr']('transform', "scale(0, 1)");
      x$.remove();
      return x$;
    }
  };
  Filter = {
    filterData: function(filterFunction){
      this.dataFull == null && (this.dataFull = this.data);
      return this.data = this.dataFull.filter(filterFunction);
    }
  };
  Transitions = {
    transitionStepper: function(step){
      return function(transition){
        var delay, x$;
        delay = Math.max(0, step * 800 - 200);
        x$ = transition;
        x$.duration(800);
        x$.delay(delay);
        return x$;
      };
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
    importAll$(prototype, arguments[5]);
    importAll$(prototype, arguments[6]);
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
    }
    prototype.redraw = function(){
      this.recomputeYScale();
      return this.drawBars.apply(this, arguments);
    };
    return Barchart;
  }(Dimensionable, XScale, YScale, Bar, Level, Filter, Transitions));
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);
