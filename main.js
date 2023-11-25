const SVG1 = d3.select("#vis-1").append("svg")
const SVG2 = d3.select("#vis-2").append("svg")
const SVG3 = d3.select("#vis-3").append("svg")


const width1 = 960;
const height1 = 600;

const equiposNBA = {
  "Hawks": "#e03a3e",
  "Celtics": "#007a33",
  "Nets": "#000000",
  "Hornets": "#1d1160",
  "Bulls": "#ce1141",
  "Cavaliers": "#6f263d",
  "Mavericks": "#00538c",
  "Nuggets": "#fec524",
  "Pistons": "#c8102e",
  "Warriors": "#006bb6",
  "Rockets": "#ce1141",
  "Pacers": "#002d62",
  "Clippers": "#1d428a",
  "Lakers": "#552583",
  "Grizzlies": "#5d76a9",
  "Heat": "#98002e",
  "Bucks": "#00471b",
  "Timberwolves": "#0c2340",
  "Pelicans": "#85714d",
  "Knicks": "#006bb6",
  "Thunder": "#007ac1",
  "Magic": "#0077c0",
  "76ers": "#ed174c",
  "Suns": "#e56020",
  "Trail Blazers": "#e03a3e",
  "Kings": "#5a2d81",
  "Spurs": "#c4ced4",
  "Raptors": "#ce1141",
  "Jazz": "#00471b",
  "Wizards": "#002b5e"
};


SVG1.attr('width', width1).attr('height', height1);

const projection = d3.geoAlbersUsa().translate([width1/2, height1/2]).scale(1200);

const path = d3.geoPath().projection(projection);

const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed);

SVG1.call(zoom);

const tooltip = d3.select("#tooltip");

function zoomed(event) {
  SVG1.selectAll('path')
    .attr('transform', event.transform);

  SVG1.selectAll('circle')
    .attr('cx', d => event.transform.applyX(projection(d.geometry.coordinates)[0]))
    .attr('cy', d => event.transform.applyY(projection(d.geometry.coordinates)[1]));

    SVG1.selectAll('text')
    .attr('x', d => event.transform.applyX(projection(d.geometry.coordinates)[0]+20))
    .attr('y', d => event.transform.applyY(projection(d.geometry.coordinates)[1]+10));

}

d3.json('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json').then(function (us) {

  SVG1.selectAll('path')
    .data(us.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', 'none')
    .style('stroke', 'white')
    .filter(x => x.properties.name == 'Alaska' || x.properties.name == 'Hawaii' || x.properties.name == 'Virginia') //Se excluyen estos 2 estados ya que no tienen equipos y no colaboran al mapa
    .style('visibility', 'hidden');

  d3.json('https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/arenas.geojson').then(function (geo_teams) {
    d3.csv('https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/PALMARES_NBA_NUEVO.csv').then(function(teams) {

    SVG1.selectAll('circle')
    .data(geo_teams.features)
    .enter()
    .append('circle')
    .attr('cx', d => projection(d.geometry.coordinates)[0])
    .attr('cy', d => projection(d.geometry.coordinates)[1])
    .attr('r', 10)
    .style('fill', d => equiposNBA[d.properties.team])
    .on('mouseover', function(event, d) {
      console.log(`Equipo: ${d.properties.team}`);
      const logo = teams.find(x => x.Equipo === d.properties.team);
      console.log(`${logo.Image}`);
      tooltip.html(`<object data="${logo.Image}" type="image/svg+xml"></object> <br> Equipo: ${d.properties.team} <br> Conferencia: ${d.properties.conference} <br> Ciudad: ${d.properties.city} <br> Estadio: ${d.properties.arena}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY -20) + 'px');
      tooltip.style('opacity', 1);
    })
    .on('mouseout', function() {
      tooltip.style('opacity', 0);
    });

  SVG1.selectAll('text')
    .data(geo_teams.features)
    .enter()
    .append('text')
    .attr('x', d => projection(d.geometry.coordinates)[0]+20)
    .attr('y', d => projection(d.geometry.coordinates)[1]+10)
    .text(d => d.properties.team)
    .attr('text-anchor', 'start')
    .attr('font-size', '12px')
    .style('fill', 'white');

    });
  });
});




















/*



SVG3.attr("width", 1200).attr("height", 900);



const data = [
    { x: 50, y: 100, r: 20 },
    { x: 150, y: 200, r: 30 },
    { x: 250, y: 150, r: 25 },
    // Puedes agregar más datos aquí
  ];


d3.csv('PLAYERS_NBA.csv').then(function(data1) {
    SVG3.selectAll("image")
    .data(data1)
    .enter().append("image")
    //.attr("class", "bubble") // Agrega una clase para aplicar estilos (opcional)
    .attr("x", 200)
    .attr("y", 200)
    .attr('width', 40)
    .attr('height', 40)
    .attr('xlink:href', d => d.Image);


    SVG3.sellectAll('circle')
    .enter()
    .append('circle')
    .attr('cx', 500)
    .attr('cy', 500)
    .attr('r', 100)
    .attr('fill', 'white');

})

const ola = SVG3.append('circle')
.attr('cx', 500)
.attr('cy', 500)
.attr('r', 100)
.attr('fill', 'white');  

*/