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
        console.log @height
        selection.append \rect
            ..attr \class \bar
            ..attr \width @x.rangeBand
            ..attr \height ~> @y it.pozice.length
            ..attr \x ~> @x it.year
            ..attr \y ~> @height - @y it.pozice.length

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


