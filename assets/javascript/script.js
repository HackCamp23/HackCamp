// Load data from CSV file
d3.csv('assets/javascript/redocelot.csv').then(instagramData => {

    // Calculate language frequencies
    const languageFrequencies = d3.rollup(instagramData, v => v.length, d => d.languages); 

    // Convert frequency data to an array of objects
    const frequencyData = Array.from(languageFrequencies, ([language, frequency]) => ({ language, frequency }));

    // Set up the SVG container
    const margin = { top: 20, right: 20, bottom: 50, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Set up the SVG container
    const svg = d3.select('#histogram')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // X-axis scale
    const x = d3.scaleBand()
        .domain(frequencyData.map(d => d.language))
        .range([0, width])
        .padding(0.1);

    // Y-axis scale
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(frequencyData, d => d.frequency)]);

    // Define colors for each language
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // X-axis
    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45)');

    // Y-axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll('rect')
        .data(frequencyData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.language))
        .attr('y', height)  
        .attr('width', x.bandwidth())
        .attr('height', 0)  
        .attr('fill', d => colorScale(d.language))
        .transition() 
        .duration(1000)
        .attr('y', d => y(d.frequency))  
        .attr('height', d => height - y(d.frequency));
        
    // Set up the SVG container for pie chart
    const radius = Math.min(width, height) / 2;
    const svgPieChart = d3.select('#pieChart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create an arc generator for pie slices
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Generate pie chart data
    const pieData = d3.pie().value(d => d.frequency)(frequencyData);

    // Draw pie chart slices
    const pieSlices = svgPieChart.selectAll('path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => d3.schemeCategory10[i]);

    // Create an arc generator for labeling
    const labelArc = d3.arc()
        .outerRadius(radius + 20);  // Adjust the radius for label placement

    // Create a legend
    const legend = svgPieChart.append('g')
        .attr('transform', `translate(${width + 20}, 20)`);

    // Add legend items
    const legendItems = legend.selectAll('.legend-item')
        .data(pieData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', (d, i) => d3.schemeCategory10[i]);

    legendItems.append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(d => d.data.language);

    const commitSizeData = instagramData.map(d => +d.commitSize);

    // Filter out any values outside the range of 0 to 200
    const filteredCommitSizeData = commitSizeData.filter(d => d >= 0 && d <= 200);

    // Set up the SVG container for the scatter plot
    const svgScatterPlot = d3.select('#scatterPlot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScatter = d3.scaleLinear()
        .domain([0, d3.max(filteredCommitSizeData)])
        .range([0, width]);

    const yScatter = d3.scaleLinear()
        .domain([0, 200])
        .range([height, 0]);

    svgScatterPlot.selectAll('circle')
        .data(filteredCommitSizeData)
        .enter()
        .append('circle')
        .attr('cx', d => xScatter(d))
        .attr('cy', d => yScatter(Math.random() * 200))  // Randomize y values for better visualization
        .attr('r', 5)
        .attr('fill', 'steelblue');

    const xAxisScatter = d3.axisBottom(xScatter);
    const yAxisScatter = d3.axisLeft(yScatter);

    svgScatterPlot.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxisScatter);

    svgScatterPlot.append('g')
        .call(yAxisScatter);
});
