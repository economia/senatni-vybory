(function(){
  var Dimensionable, XScale, YScale, XAxis, YAxis, Bar, Level, Filter, Transitions, Barchart;
  Dimensionable = {
    margin: {
      top: 10,
      right: 0,
      bottom: 22,
      left: 40
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
      x$.range([this.height, 0]);
      return x$;
    }
  };
  XAxis = {
    drawXAxis: function(){
      var x$, xAxis, y$, z$;
      x$ = xAxis = d3.svg.axis();
      x$.scale(this.x);
      x$.ticks(d3.time.years);
      x$.tickSize(3);
      x$.tickFormat(function(it){
        return it.toString().substr(2);
      });
      x$.outerTickSize(0);
      x$.orient('bottom');
      y$ = this.xAxisGroup = this.axesGroup.append('g');
      y$.attr('class', 'x');
      y$.attr('transform', "translate(" + this.margin.left + ", " + (this.height + this.margin.top) + ")");
      y$.call(xAxis);
      z$ = y$.selectAll('text');
      z$.attr('dy', 12);
      return y$;
    }
  };
  YAxis = {
    drawYAxis: function(){
      var x$, yAxis, y$;
      x$ = yAxis = d3.svg.axis();
      x$.scale(this.y);
      x$.tickSize(3);
      x$.tickFormat(d3.format(".0f"));
      x$.outerTickSize(0);
      x$.orient('left');
      y$ = this.yAxisGroup = this.axesGroup.append('g');
      y$.attr('transform', "translate(" + this.margin.left + "," + this.margin.top + ")");
      y$.attr('class', 'y');
      y$.call(yAxis);
      return y$;
    }
  };
  Bar = {
    drawBars: function(item){
      var x$, y$, transition, z$, z1$, z2$, z3$;
      this.lastItem = this.item;
      this.item = item;
      this.content.selectAll('.bar').data(this.data).enter().call(bind$(this, 'barCreator'));
      x$ = this.content.selectAll('.bar');
      x$.call(bind$(this, 'drawLevels'));
      if (this.lastItem && this.lastItem !== this.item) {
        y$ = transition = this.content.selectAll(".bar ." + this.lastItem).classed('notHiding', false).classed('toDestroy', true).attr('opacity', 1).transition();
        y$.call(this.transitionStepper("lastItemDestroy-" + this.lastItem));
        if (this.lastItem === 'poslanci') {
          z$ = d3.selectAll(".bar .toDestroy");
          z1$ = z$.transition();
          z1$.delay(600);
          z1$.remove();
          z2$ = transition;
          z2$.attr('transform', "scale(0, 1)");
          z2$.remove();
          return z2$;
        } else {
          z3$ = transition;
          z3$.attr('opacity', 0.5);
          return z3$;
        }
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
      this.levels = bar.selectAll("." + this.item + ".notHiding").data(function(it){
        return it[this$.item];
      }, function(it){
        return it.id;
      });
      x$ = this.levels;
      x$.exit().call(bind$(this, 'levelDestroyer'));
      x$.enter().call(bind$(this, 'levelCreator'));
      return bar.selectAll("." + this.item + ".notHiding").call(bind$(this, 'levelUpdater'));
    },
    levelCreator: function(selection){
      var x$, this$ = this;
      x$ = selection.append('rect');
      x$.call(bind$(this, 'levelShaper'));
      x$.attr('transform', "scale(0, 1)");
      x$.attr('class', function(level){
        var css, ref$;
        css = ((ref$ = level.klub) != null ? ref$.css : void 8) || "void";
        return "notHiding " + level.type + " klub-" + css;
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
        } else {
          return window.killFilter();
        }
      });
      x$.attr('width', this.x.rangeBand);
      x$.attr('x', '0');
      return x$;
    },
    levelShaper: function(selection){
      var currentOffset, offsetError, x$, this$ = this;
      currentOffset = 0;
      offsetError = 0;
      x$ = selection;
      x$.each(function(level, index){
        var correctOffset, offset;
        if (index === 0) {
          currentOffset = 0;
          offsetError = 0;
        }
        correctOffset = offsetError + this$.y(level.pozice.length);
        offset = Math.round(correctOffset);
        offsetError = correctOffset - offset;
        level.offset = offset - currentOffset;
        level.height = this$.height - offset;
        currentOffset += level.height;
        if (level.type === 'poslanci') {
          return level.height -= 1;
        }
      });
      x$.attr('height', function(it){
        return it.height;
      });
      x$.attr('y', function(it){
        return it.offset;
      });
      x$.attr('transform', "scale(1, 1)");
      return x$;
    },
    levelUpdater: function(selection){
      var x$;
      x$ = selection.transition();
      x$.call(this.transitionStepper('levelUpdate'));
      x$.call(bind$(this, 'levelShaper'));
      return x$;
    },
    levelDestroyer: function(selection){
      var x$, y$;
      x$ = selection;
      x$.classed('notHiding', false);
      y$ = x$.transition();
      y$.call(this.transitionStepper('levelDestroy'));
      y$.attr('transform', "scale(0, 1)");
      y$.remove();
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
    anyLevelCreated: false,
    nowDisplayed: null,
    transitionStepper: function(transitionId){
      var duration, baseDelay, delayMultipier, this$ = this;
      duration = 800;
      baseDelay = duration;
      delayMultipier = 0;
      switch (transitionId) {
      case 'lastItemDestroy-poslanci':
        this.nowDisplayed = 'kluby';
        delayMultipier = 1;
        break;
      case 'lastItemDestroy-kluby':
        this.nowDisplayed = 'poslanci';
        delayMultipier = 1.5;
        break;
      case 'levelDestroy':
        delayMultipier = 0;
        break;
      case 'levelUpdate':
        delayMultipier = this.anyLevelCreated ? 1 : 0;
        if (this.nowDisplayed === 'poslanci') {
          delayMultipier = 0;
          duration = 600;
        }
        this.anyLevelCreated = true;
      }
      return function(transition){
        var x$;
        x$ = transition;
        x$.duration(duration);
        x$.delay(baseDelay * delayMultipier);
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
    importAll$(prototype, arguments[7]);
    importAll$(prototype, arguments[8]);
    function Barchart(parentSelector, data){
      var x$, y$, z$;
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
      z$ = this.axesGroup = this.svg.append('g');
      z$.attr('class', 'axes');
      this.drawXAxis();
      this.drawYAxis();
    }
    prototype.redraw = function(){
      this.recomputeYScale();
      return this.drawBars.apply(this, arguments);
    };
    return Barchart;
  }(Dimensionable, XScale, YScale, XAxis, YAxis, Bar, Level, Filter, Transitions));
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
  function importAll$(obj, src){
    for (var key in src) obj[key] = src[key];
    return obj;
  }
}).call(this);
