Dimensionable =
    margin:
        top: 0
        right: 0
        bottom: 0
        left: 0
    computeDimensions: (@fullWidth, @fullHeight) ->
        @width = @fullWidth - @margin.left - @margin.right
        @height = @fullHeight - @margin.top - @margin.bottom

XScale =
    recomputeXScale: ->
        @x ?= d3.scale.ordinal!
            ..rangeRoundBands [0 @width], 0.1
            ..domain @data.map (.year)
YScale =
    recomputeYScale: ->
        lengths = @data.map ~>
            length = 0
            it[@item].forEach (level) ->
                length += level.pozice.length
            length
        @y ?= d3.scale.linear!
            ..domain [0, Math.max ...lengths]
            ..range [0 @height]

Bar =
    drawBars: ->
        @content.selectAll \.bar
            .data @data
            .enter!call @~barCreator
        @content.selectAll \.bar
            ..call @~drawLevels

    barCreator: (selection) ->
        bar = selection.append \g
            ..call @~barShaper

    barShaper: (selection) ->
        selection
            .attr \transform ~> "translate(#{@x it.year}, 0)"
            .attr \class \bar

Level =
    drawLevels: (bar) ->
        @levels = bar.selectAll ".#{@item}"
            .data do
                ~> it[@item]
                (.id)
        @levels
            ..enter!call @~levelCreator
            ..exit!call @~levelDestroyer

    levelCreator: (selection) ->
        currentHeight = 0
        selection.append \rect
            ..call @~levelShaper
            ..attr \class (level) ~>
                css = level.klub?css || "void"
                "#{@item} klub-#{css}"
            ..attr \data-tooltip (level) ~>
                if @item == \poslanci
                    "#{level.poslanec.jmeno} #{level.poslanec.prijmeni}: #{level.pozice.length} pozic"
                else
                    nazev = level.klub?nazev || "Nezařazení"
                    "#{nazev}: #{level.pozice.length} pozic"
            ..attr \width @x.rangeBand
            ..attr \x \0


    levelShaper: (selection) ->
        currentHeight = 0
        selection
            ..each (level, index) ~>
                if index == 0 then currentHeight := 0
                height = Math.round @y level.pozice.length
                level.height = height
                if @item == \poslanci then level.height -= 0.5
                currentHeight += height
                level.offset = @height - currentHeight
            ..attr \height (.height)
            ..attr \y (.offset)

    levelDestroyer: (selection) ->
        selection.transition!
            ..call @transitionStepper 0
            ..\attr \transform "scale(0, 1)"
            ..remove!


Filter =
    filterData: (filterFunction) ->
        @dataFull ?= @data
        @data = @dataFull.filter filterFunction
        @redraw!

Transitions =
    transitionStepper: (step) ->
        (transition) ->
            transition
                ..duration 800
                ..delay step * 800 - 150

window.Barchart = class Barchart implements Dimensionable, XScale, YScale, Bar, Level, Filter, Transitions
    (@parentSelector, @data) ->
        @item = \kluby
        @computeDimensions 650 600
        @recomputeXScale!
        @recomputeYScale!
        @svg = d3.selectAll @parentSelector .append \svg
            ..attr \class \barchart
            ..attr \width @fullWidth
            ..attr \height @fullHeight
        @content = @svg.append \g
            ..attr \class \content
            ..attr \transform "translate(#{@margin.left}, #{@margin.top})"

        @drawBars!
        @recomputeXScale!

    redraw: ->
        @recomputeYScale!
        @drawBars!


