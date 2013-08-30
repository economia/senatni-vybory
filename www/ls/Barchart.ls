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
        @y ?= d3.scale.linear!
            ..domain [0, Math.max ...@data.map (.pozice.length)]
            ..range [0 @height]

Bar =
    barCreator: (selection) ->
        currentHeight = 0
        selection.append \g
            .attr \transform ~> "translate(#{@x it.year}, 0)"
            .attr \class \bar
            .selectAll \.pozice
            .data (.kluby)
            .enter!
            .append \rect
                ..each (klub, index) ~>
                    if index == 0 then currentHeight := 0
                    klub.height = Math.round @y klub.pozice.length
                    currentHeight += klub.height
                    klub.offset = @height - currentHeight
                ..attr \class (klub) ->
                    css = klub.klub?css || "void"
                    "klub klub-#{css}"
                ..attr \width @x.rangeBand
                ..attr \height (.height)
                ..attr \x \0
                ..attr \y (.offset)

window.Barchart = class Barchart implements Dimensionable, XScale, YScale, Bar
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

        @bars = @content.selectAll \.bar
            .data @data
            .enter!
            .call @~barCreator
        @recomputeXScale!


