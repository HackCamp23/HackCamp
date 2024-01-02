//function to load data from branches.csv
function loadBranchesData() {
    return d3.csv('assets/csv/branches.csv');
}

//function to load data from commits.csv
function loadCommitsData() {
    return d3.csv('assets/csv/commits.csv', function (d) {
        // Check if date is valid
        if (d.date) {
            // Parse the date string into a JavaScript Date object
            d.date = new Date(d.date);
        }

        return d;
    });
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
            
            loadCommitsData().then(function(commitsData) {
                commitsData = commitsData.filter(function(d) {
                    return d.date !== undefined && d.date !== null;
                });
            
                createAuthorBarChart(commitsData);
                createBranchBarChart(commitsData)
                createBarChart(commitsData);

                // Call render to display the charts
                dc.renderAll();
            })
        });
    });
}

function createBarChart(data, languageIdToName) {
    // Use Crossfilter to enable filtering
    var ndx = crossfilter(data);

    // Define dimensions and groups
    var languageDim = ndx.dimension(function (d) { return languageIdToName[d.language_id]; });
    var languageGroup = languageDim.group().reduceCount();

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
        .dimension(languageDim)
        .group(languageGroup)
        .x(d3.scaleBand().domain(languageDim.group().all().map(function (d) { return d.key; }))) // Set domain based on language names
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .brushOn(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .colors("steelblue")
        .xAxisLabel("Programming Languages")
        .yAxisLabel("Number of Repositories");
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
        .x(d3.scaleBand().domain(authorDim.group().all().map(function (d) { return d.key; }))) // Set domain based on author IDs
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
    var width = 1200 - margin.left - margin.right;
    var height = 600 - margin.top - margin.bottom;

    // Create the bar chart for branches
    var branchChart = dc.barChart("#commits_per_branch");

    branchChart
        .width(width)
        .height(height)
        .margins(margin)
        .dimension(branchDim)
        .group(branchGroup)
        .x(d3.scaleBand().domain(branchDim.group().all().map(function (d) { return d.key; }))) // Set domain based on branch IDs
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .brushOn(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .colors("steelblue")
        .xAxisLabel("Branches")
        .yAxisLabel("Number of Commits");
}

loadData();