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
            it.kluby.forEach (level) ->
                length += level.pozice.length
            length
        @y ?= d3.scale.linear!
            ..domain [0, Math.max ...lengths]
            ..range [0 @height]

Bar =
    drawBars: (item) ->
        @lastItem = @item
        @item = item
        @content.selectAll \.bar
            .data @data
            .enter!call @~barCreator
        @content.selectAll \.bar
            ..call @~drawLevels
        if @lastItem and @lastItem != @item
            transition = @content.selectAll ".bar .#{@lastItem}"
                .classed \notHiding no
                .classed \toDestroy yes
                .attr \opacity 1
                .transition!
                    ..call @transitionStepper "lastItemDestroy-#{@lastItem}"
            if @lastItem == \poslanci
                d3.selectAll ".bar .toDestroy"
                    ..transition!
                        ..delay 600
                        ..remove!
                transition
                    ..attr \transform "scale(0, 1)"
                    ..remove!
            else
                transition
                    ..attr \opacity 0.5

    barCreator: (selection) ->
        bar = selection.append \g
            ..call @~barShaper

    barShaper: (selection) ->
        selection
            .attr \transform ~> "translate(#{@x it.year}, 0)"
            .attr \class \bar


Level =
    drawLevels: (bar) ->
        @levels = bar.selectAll ".#{@item}.notHiding"
            .data do
                ~> it[@item]
                (.id)
        @levels
            ..exit!call @~levelDestroyer
            ..enter!call @~levelCreator
        bar.selectAll ".#{@item}.notHiding"
            .call @~levelUpdater

    levelCreator: (selection) ->
        currentHeight = 0
        selection.append \rect
            ..call @~levelShaper
            ..attr \transform "scale(0, 1)"
            ..attr \class (level) ~>
                css = level.klub?css || "void"
                "notHiding #{level.type} klub-#{css}"
            ..attr \data-tooltip (level) ~>
                if level.type == \poslanci
                    "#{level.poslanec.jmeno} #{level.poslanec.prijmeni}: #{level.pozice.length} pozic"
                else
                    nazev = level.klub?nazev || "Nezařazení"
                    "#{nazev}: #{level.pozice.length} pozic"
            ..on \click (level) ->
                if level.type == \kluby
                    window.filterParty level.klub.css
                else
                    window.killFilter!
            ..attr \width @x.rangeBand
            ..attr \x \0

    levelShaper: (selection) ->
        currentHeight = 0
        heightError = 0
        selection
            ..each (level, index) ~>
                if index == 0 then currentHeight := 0
                correctHeight = heightError + @y level.pozice.length
                height = Math.round correctHeight
                heightError := correctHeight - height
                level.height = height
                if level.type == \poslanci then level.height -= 1
                currentHeight += height
                level.offset = @height - currentHeight
            ..attr \height (.height)
            ..attr \y (.offset)
            ..attr \transform "scale(1, 1)"

    levelUpdater: (selection) ->
        selection.transition!
            ..call @transitionStepper \levelUpdate
            ..call @~levelShaper

    levelDestroyer: (selection) ->
        selection
            ..classed \notHiding no
            ..transition!
                ..call @transitionStepper \levelDestroy
                ..attr \transform "scale(0, 1)"
                ..remove!


Filter =
    filterData: (filterFunction) ->
        @dataFull ?= @data
        @data = @dataFull.filter filterFunction


Transitions =
    anyLevelCreated: no
    nowDisplayed: null
    transitionStepper: (transitionId) ->
        duration       = 800
        baseDelay      = duration
        delayMultipier = 0
        switch transitionId
        | \lastItemDestroy-poslanci
            @nowDisplayed = \kluby
            delayMultipier = 1
        | \lastItemDestroy-kluby
            @nowDisplayed = \poslanci
            delayMultipier = 1.5
        | \levelDestroy
            delayMultipier = 0
        | \levelUpdate
            delayMultipier = if @anyLevelCreated then 1 else 0
            if @nowDisplayed == \poslanci
                delayMultipier = 0
                duration = 600
            @anyLevelCreated = yes

        return (transition) ~>
            transition
                ..duration duration
                ..delay baseDelay * delayMultipier

window.Barchart = class Barchart implements Dimensionable, XScale, YScale, Bar, Level, Filter, Transitions
    (@parentSelector, @data) ->
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

    redraw: ->
        @recomputeYScale!
        @drawBars ...


