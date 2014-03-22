/**
 * Created with PyCharm.
 * User: spencertank
 * Date: 3/19/14
 * Time: 12:05 PM
 * To change this template use File | Settings | File Templates.
 */


var fill = d3.scale.category20();

function draw(data) {
    if (data.length > 0) {
        $(data[0].globalId).empty();
        d3.select(data[0].globalId).append("svg")
            .attr("width", data[0].globalWidth)
            .attr("height", 300)
            .append("g")
            .attr("transform", "translate(260,150)")
            .selectAll("text")
            .data(data)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
}

function drawCloud(cloudId, words, numTerms) {
    var wordsList = [],
        mostCommonWordsList = [],
        finalWordsList = null,
        width;

    for (var word in words) {
        wordsList.push({text:word, count:words[word]})
    }
    wordsList.sort(function(a,b) {
        return b.count - a.count
    });

    width = $(cloudId).width();
    mostCommonWordsList = wordsList.slice(0,numTerms);
    finalWordsList = mostCommonWordsList.map(function(item, index) {
        return {text:item.text, size:(51-index)}
    });

    d3.layout.cloud().size([width, 300])
        .words({id:cloudId, words:finalWordsList, width:width})
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();

}
