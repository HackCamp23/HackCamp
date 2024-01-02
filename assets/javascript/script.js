// Load data from CSV file
function loadData() {
    return d3.csv('assets/csv/redocelot.csv').then(function(data) {
        console.log(data);

        //call to charts
    });
}
