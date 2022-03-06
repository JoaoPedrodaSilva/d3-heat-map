const req = new XMLHttpRequest()
req.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', true)
req.onload = () => {
  const {baseTemperature, monthlyVariance} = JSON.parse(req.responseText)
  const dataSet = monthlyVariance.map( d => ({
    ...d,
    temp: Number(baseTemperature) + Number(d.variance)
  }))
  
  createCanvas()
  createScales(dataSet)
  createAxes(dataSet)
  createCells(dataSet)
  createLegend(dataSet)
}
req.send()

const colors = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
const w = 700
const h = 550
const pad = 60
let xScale
let yScale
let temperatureScale
let minimumYear
let maximumYear

const createCanvas = () => {
  d3.select('#heatmap')
    .attr('width', w)
    .attr('height', h)
}

const createScales = (dataSet) => {
  minimumYear = d3.min(dataSet, d => d.year)
  maximumYear = d3.max(dataSet, d => d.year)
  
  xScale = d3.scaleLinear()
             .domain([minimumYear,
                      maximumYear + 1])
             .range([pad, w - pad])
  yScale = d3.scaleTime()
             .domain([new Date(0, 0, 0, 0, 0, 0, 0),
                      new Date(0, 12, 0, 0, 0, 0, 0)])
             .range([pad, h - pad])
  
  temperatureScale = d3.scaleLinear()
                       .domain([d3.min(dataSet, d => d.temp),
                                d3.max(dataSet, d => d.temp)])
                       .range([0, colors.length])
}

const createAxes = (dataSet) => {
  const xAxis = d3.axisBottom(xScale)
                  .tickFormat(d3.format('d'))
                d3.select('#heatmap')
                  .append('g')
                  .attr('id', 'x-axis')
                  .attr('transform', 'translate(0, ' + (h - pad) + ')')
                  .call(xAxis)
  
  const yAxis = d3.axisLeft(yScale)
                  .tickFormat(d3.timeFormat('%B'))                  
                d3.select('#heatmap')
                  .append('g')
                  .attr('id', 'y-axis')
                  .attr('transform', 'translate(' + (pad) + ',0)')
                  .call(yAxis)
}

const createCells = (dataSet) => {
  const cellWidth = (w - 2 * pad) / (maximumYear - minimumYear)
  const cellHeight = (h - 2 * pad) / 12
  const tooltip = document.querySelector('#tooltip')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  d3.select('#heatmap')
    .selectAll('rect')
    .data(dataSet)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', d => d.month - 1)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => d.temp)
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    .attr('x', d => xScale(d.year))
    .attr('y', d => yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0)))
    .attr('fill', d => colors[Math.floor(temperatureScale(d.temp))])
    .on('mouseover', (e, d, i) => {
      tooltip.classList.add('visible')
      tooltip.setAttribute('data-year', d.year)
      tooltip.style.left = e.pageX + 'px'
      tooltip.style.top = e.pageY + 'px'
      tooltip.innerHTML = (`
        <p>${d.year} - ${months[d.month - 1]}</p>
        <p>Temperature: ${d.temp.toFixed(3)}°C</p>
        <p>Variance: ${d.variance.toFixed(3)}°C</p>`)
    })
    .on('mouseout', () => tooltip.classList.remove('visible'))
}

const createLegend = (dataSet) => {
  const legendWidth = 400
  const legendHeight = 70  
  const legendPad = 30
  const legendRectWidth = legendWidth / colors.length
  
  d3.select('#legend')
    .attr('width', legendWidth)
    .attr('height', legendHeight) 
  
  const legendXScale = d3.scaleLinear()
                       .domain([d3.min(dataSet, d => d.temp),
                                d3.max(dataSet, d => d.temp)])
                       .range([0, legendWidth])
  
  const legendXAxis = d3.axisBottom(legendXScale)
                        .tickFormat(d3.format('.1f'))
                      d3.select('#legend')
                        .append('g')
                        .attr('transform', 'translate(0, ' + (legendHeight - legendPad) + ')')
                        .call(legendXAxis)
  
  d3.select('#legend')
    .selectAll('rect')
    .data(colors)
    .enter()
    .append('rect')
    .attr('width', legendRectWidth)
    .attr('height', (legendHeight - 2 * legendPad))
    .attr('x', (_, i) => i * legendRectWidth)
    .attr('y', legendPad)
    .attr('fill', c => c)
}