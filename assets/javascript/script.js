
function loadBranchesData() {
    return d3.csv('assets/csv/branches.csv');
}

function loadCommitsData() {
    return d3.csv('assets/csv/commits.csv')
}


// Load data from CSV files
function loadData() {
    // Load language names from the first CSV file
    d3.csv('assets/csv/languages.csv').then(function (languageNames) {
        // Load data from the second CSV file
        d3.csv('assets/csv/repository_languages.csv').then(function (data) {
            // Map language_id to language name
            var languageIdToName = {};
            languageNames.forEach(function (d) {
                languageIdToName[d.id] = d.name;
            });

            // Call to charts
            createBarChart(data, languageIdToName);

            // Load commits data
            loadCommitsData().then(function (commitsData) {
                // Additional charts or rendering if needed
                createBarChart(data, languageIdToName);
                createBranchBarChart(commitsData);
                createAuthorBarChart(commitsData);

                // Create scatter plot after loading commits data
                createScatterPlot(commitsData);

                // Call render to display the charts
                dc.renderAll();
            }).catch(function (error) {
                console.error("Error loading commits data:", error);
            });
        });
    });
}

function createBarChart(data, languageIdToName) {
    // Use Crossfilter to enable filtering
    var ndx = crossfilter(data);

    // Define dimensions and groups
    var repositoryDim = ndx.dimension(function (d) { return d.repository_id; });
    var languageDim = ndx.dimension(function (d) { return languageIdToName[d.language_id]; });
    var repositoryLanguageGroup = repositoryDim.group().reduce(
        function (p, v) {
            p[languageIdToName[v.language_id]] = (p[languageIdToName[v.language_id]] || 0) + 1;
            return p;
        },
        function (p, v) {
            p[languageIdToName[v.language_id]] = (p[languageIdToName[v.language_id]] || 0) - 1;
            return p;
        },
        function () {
            return {};
        }
    );

    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 60, left: 60 };
    var width = 1200 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // Create the bar chart
    var chart = dc.barChart("#languages_per_repositories_used");

    chart
        .width(width)
        .height(height)
        .margins(margin)
        .dimension(repositoryDim)
        .group(repositoryLanguageGroup)
        .keyAccessor(function (d) { return d.key; })
        .valueAccessor(function (d) {
            var total = 0;
            for (var lang in d.value) {
                if (d.value.hasOwnProperty(lang)) { 
                    total += d.value[lang];
                }
            }
            return total;
        })
        .stack(repositoryLanguageGroup, function (d) { return d.value; })
        .x(d3.scaleBand().domain(repositoryDim.group().all().map(function (d) { return d.key; })))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .brushOn(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .colors("steelblue")
        .xAxisLabel("Repositories")
        .yAxisLabel("Number of Languages Used")
        .on("renderlet", function (chart) {
            chart.selectAll("rect.bar")
                .on("mouseover", function (event, d) {
                    // Display repository information on hover
                    if (d.data.key && d.data.value) {
                        var languages = Object.keys(d.data.value).join(", ");
                        d3.select("#repo-info").text("Repo ID: " + d.data.key + ", Languages: " + languages);
                    }
                })
                .on("mouseout", function () {
                    // Clear repository information on mouseout
                    d3.select("#repo-info").text("");
                });
        });
}



function createAuthorBarChart(commitsData) {
    // Use Crossfilter to enable filtering
    var ndx = crossfilter(commitsData);

    // Define dimensions and groups for the author chart
    var authorDim = ndx.dimension(function (d) { return d.author_id; });
    var authorGroup = authorDim.group().reduceCount();

    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 60, left: 60 }; 
    var width = 1200 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // Create the bar chart for authors
    var authorChart = dc.barChart("#commits_per_author");

    authorChart
        .width(width)
        .height(height)
        .margins(margin)
        .dimension(authorDim)
        .group(authorGroup)
        .x(d3.scaleBand().domain(authorDim.group().all().map(function (d) { return d.key; })))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .brushOn(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .colors("steelblue")
        .xAxisLabel("Authors")
        .yAxisLabel("Number of Commits");
}

function createBranchBarChart(commitsData) {
    // Use Crossfilter to enable filtering
    var ndx = crossfilter(commitsData);

    // Define dimensions and groups for the branches chart
    var branchDim = ndx.dimension(function (d) { return d.branch_id; });
    var branchGroup = branchDim.group().reduceCount();

    // Set up the chart dimensions
    var margin = { top: 20, right: 20, bottom: 60, left: 60 }; 
    var width = 1600 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // Create the bar chart for branches
    var branchChart = dc.barChart("#commits_per_branch");

    branchChart
        .width(width)
        .height(height)
        .margins(margin)
        .dimension(branchDim)
        .group(branchGroup)
        .x(d3.scaleBand().domain(branchDim.group().all().map(function (d) { return d.key; }))) 
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .brushOn(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .colors("steelblue")
        .xAxisLabel("Branches")
        .yAxisLabel("Number of Commits");
}
  
function createScatterPlot(commitsData) {
    // Set up the chart dimensions
    var margin = { top: 30, right: 120, bottom: 70, left: 120 };
    var width = 1800 - margin.left - margin.right;
    var height = 1000 - margin.top - margin.bottom;

    // Create SVG container
    var svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create scales for x and y axes
    var xMinDate = d3.min(commitsData, function (d) { return new Date(d.date); });
    var xMaxDate = d3.max(commitsData, function (d) { return new Date(d.date); });

    // Add a buffer zone to the x-axis domain
    xMinDate.setDate(xMinDate.getDate() - 100);
    xMaxDate.setDate(xMaxDate.getDate() + 7);

    var xScale = d3.scaleTime()
        .domain([xMinDate, xMaxDate])
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(commitsData, function (d) { return +d.id; })])
        .range([height, 0]);

    // Create x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(30));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Date");

    // Create y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(40));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Commit ID");

    // Create circles for each data point
    svg.selectAll("circle")
        .data(commitsData)
        .enter().append("circle")
        .attr("cx", function (d) { return xScale(new Date(d.date)); })
        .attr("cy", function (d) { return yScale(+d.id); })
        .attr("r", 8)
        .style("fill", "steelblue")
        .on("mouseover", function (event, d) {
            // Show data on mouseover directly on the circle
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 8); // Increase circle size on mouseover

            // Display data as text near the circle
            svg.append("text")
                .attr("class", "data-label")
                .attr("x", xScale(new Date(d.date)))
                .attr("y", yScale(+d.id) - 15) // Adjusted y position
                .text("Author ID: " + d.author_id + ", Date: " + d.date) // Include both Author ID and Date
                .style("text-anchor", "middle");
        })
        .on("mouseout", function () {
            // Hide data and restore circle size on mouseout
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 2); // Restore circle size

            // Remove data label on mouseout
            svg.select(".data-label").remove();
        });
}





loadData();

