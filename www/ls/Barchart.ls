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
    barCreator: (selection) ->
        bar = selection.append \g
            .attr \transform ~> "translate(#{@x it.year}, 0)"
            .attr \class \bar
        bar.selectAll \.klub
            .data do
                ~> it[@item]
                (.id)
            .enter!
            .call @~levelCreator

Level =
    levelCreator: (selection) ->
        currentHeight = 0
        selection.append \rect
            ..each (level, index) ~>
                if index == 0 then currentHeight := 0
                height = Math.round @y level.pozice.length
                level.height = height
                if @item == \poslanci then level.height -= 0.5
                currentHeight += height
                level.offset = @height - currentHeight
            ..attr \class (level) ->
                css = level.klub?css || "void"
                "klub klub-#{css}"
            ..attr \data-tooltip (level) ~>
                if @item == \poslanci
                    "#{level.poslanec.jmeno} #{level.poslanec.prijmeni}: #{level.pozice.length} pozic"
                else
                    nazev = level.klub?nazev || "Nezařazení"
                    "#{nazev}: #{level.pozice.length} pozic"
            ..attr \width @x.rangeBand
            ..attr \height (.height)
            ..attr \x \0
            ..attr \y (.offset)

Filter =
    filterData: (filterFunction) ->
        @dataFull ?= @data
        @data = @dataFull
        @data .= filter filterFunction
        @redraw!

window.Barchart = class Barchart implements Dimensionable, XScale, YScale, Bar, Level, Filter
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

        @bars = @content.selectAll \.bar
            .data @data
            .enter!
            .call @~barCreator
        @recomputeXScale!

    redraw: ->
        console.log @y.domain!
        @recomputeYScale!
        console.log @y.domain!
        console.log @data


