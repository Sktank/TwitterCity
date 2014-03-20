/**
 * Created with PyCharm.
 * User: spencertank
 * Date: 3/19/14
 * Time: 12:05 PM
 * To change this template use File | Settings | File Templates.
 */

    var fill = d3.scale.category20();

    function draw(words) {
        $('#tweet-cloud').empty();
        d3.select("#tweet-cloud").append("svg")
            .attr("width", 300)
            .attr("height", 300)
            .append("g")
            .attr("transform", "translate(150,150)")
            .selectAll("text")
            .data(words)
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

    function drawHashs(words) {
        $('#tweet-cloud').empty();
        d3.select("#tweet-cloud").append("svg")
            .attr("width", 300)
            .attr("height", 300)
            .append("g")
            .attr("transform", "translate(150,150)")
            .selectAll("text")
            .data(words)
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

    function drawCloud(words, totalCount) {
        var wordsList = [];
        for (var word in words) {
            wordsList.push({text:word, count:words[word]})
        }
        wordsList.sort(function(a,b) {
            return b.count - a.count
        });

        var mostCommonWordsList = wordsList.slice(0,50);

        d3.layout.cloud().size([300, 300])
            .words(mostCommonWordsList.map(function(item, index) {
                return {text:item.text, size:51-index}
        }))
            .padding(5)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();
    }
