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

Bar =
    barCreator: (selection) ->
        console.log @height
        selection.append \rect
            ..attr \width @x.rangeBand
            ..attr \height 50
            ..attr \x ~> @x it.year
            ..attr \y @height - 50


window.Barchart = class Barchart implements Dimensionable, XScale, Bar
    (@parentSelector, @data) ->
        @computeDimensions 650 600
        @recomputeXScale!
        @svg = d3.selectAll @parentSelector .append \svg
            ..attr \class \barchart
            ..attr \width @fullWidth
            ..attr \height @fullHeight
        @content = @svg.append \g
            ..attr \class \content
            ..attr \transform "translate(#{@margin.left}, #{@margin.top})"

        @bars = @content.selectAll \rect
            .data @data
            .enter!
            .call @~barCreator
        @recomputeXScale!


