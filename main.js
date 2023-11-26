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

// Visualización 1 - Mapa de Estados Unidos con equipos de la NBA

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
    d3.dsv(';', 'https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/PALMARES_NBA_NUEVO_.csv').then(function(teams) {

    SVG1.selectAll('circle')
    .data(geo_teams.features)
    .enter()
    .append('circle')
    .attr('cx', d => projection(d.geometry.coordinates)[0])
    .attr('cy', d => projection(d.geometry.coordinates)[1])
    .attr('r', 10)
    .style('fill', d => equiposNBA[d.properties.team])
    .on('mouseover', function(event, d) {
      //console.log(`Equipo: ${d.properties.team}`);
      const logo = teams.find(x => x.Equipo.split(' ').pop() === d.properties.team.split(' ').pop()); //el split().pop() es para agarrar la ultima palabra del nombre del equipo ya que los datasets difieren en los nombres por las ciudades
      //console.log(`${logo.Image}`);
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

// Visualización 2 - Gráfico de barras agrupado
// 2 filtros: Conferencia y Palmares
// Para Conferencia, filtro de season

SVG2.attr('width', 1200).attr('height', 900);

// Definimos las dimensiones del gráfico
const margin = {top: 20, right: 20, bottom: 30, left: 40};
const width = +SVG2.attr('width') - margin.left - margin.right;
const height = +SVG2.attr('height') - margin.top - margin.bottom;

// Definimos las escalas
const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
const x1 = d3.scaleBand().padding(0.05);
const y = d3.scaleLinear().rangeRound([height, 0]);

// Agregamos el svg al div
const g = SVG2.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

const tooltip2 = d3.select("#tooltip2");

// Carga de datos
const data_conferencia = d3.json('https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/arenas.geojson');
const data_palmares = d3.dsv(';', 'https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/PALMARES_NBA_NUEVO_.csv');
const data_season = d3.csv('https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/teams_nba.csv');

function parseo_conferencia(d) {
  return {
    team: d.properties.team,
    conference: d.properties.conference,
  };
}

function parseo_palmares(d) {
  return {
    Equipo: d.Equipo,
    Campeonatos: +d.Campeonatos,
    Subcampeonatos: +d.Subcampeonatos,
    Titulos: d.Títulos,
    Image: d.Image,
  }
}

function parseo_season(d) {
  return {
    Team: d.Nombre,
    Season: d.Temporada,
    Victorias: +d.Victorias,
    Derrotas: +d.Derrotas,
  }
}

Promise.all([data_conferencia, data_palmares, data_season]).then(function(data) {
  const conferencia = data[0];
  const palmares = data[1];
  const season = data[2];

  const conferenciasMap = conferencia.features.map(parseo_conferencia);
  const palmaresMap = palmares.map(parseo_palmares);
  const seasonMap = season.map(parseo_season);

  // Función para ver si se cambió el filtro de conferencia
  d3.select('#conferencia').on('change', function() {
    update_vis_2(true);
  });

  // Función para ver si se cambió el boton de palmares
  d3.select('#palmares').on('click', function() {
    update_vis_2(false);
  });

  // Función para ver si se cambió el filtro de season
  d3.select('#season').on('change', function() {
    update_vis_2(true);
  });

  // Función para actualizar el gráfico
  function update_vis_2(bool_conferencia) {
    const selected_conferencia = d3.select('#conferencia').property('value');
    const selected_season = d3.select('#season').property('value');

    const filtered_conferencia = conferenciasMap.filter(x => x.conference === selected_conferencia);
    const filtered_palmares = palmaresMap;
    const filtered_season = seasonMap.filter(x => x.Season === selected_season);

     //console.log("Palmares filtrados: ", filtered_palmares);

    // Definimos las escalas
    if (bool_conferencia) {
      x0.domain(filtered_conferencia.map(d => d.team));
      x1.domain(['Victorias', 'Derrotas']).rangeRound([0, x0.bandwidth()]);
      y.domain([0, d3.max(filtered_season, d => d3.max([d.Victorias, d.Derrotas]))]).nice();
    }

    else {
      x0.domain(filtered_palmares.map(d => d.Equipo));
      x1.domain(['Campeonatos', 'Subcampeonatos']).rangeRound([0, x0.bandwidth()]);
      y.domain([0, d3.max(filtered_palmares, d => d3.max([d.Campeonatos, d.Subcampeonatos]))]).nice();
    }

    // Agregamos los ejes
    g.selectAll('.axis').remove();
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x0));

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(null, 's'))
      .append('text')
      .attr('x', 2)
      .attr('y', y(y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start');

    // Agregamos las barras
    g.selectAll('.bar').remove();

     console.log("Datos seleccionados: ", bool_conferencia ? filtered_season : filtered_palmares);
    const bars = g.selectAll('g')
      .data(bool_conferencia ? filtered_season : filtered_palmares)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${bool_conferencia ? x0(d.Team) : x0(d.Equipo)}, 0)`);

    console.log(bool_conferencia);

    bars.selectAll('rect')
    .data(d => {
      // Crear los datos para las barras
      const barData = bool_conferencia ? 
          [{key: 'Victorias', value: d.Victorias}, {key: 'Derrotas', value: d.Derrotas}] : 
          [{key: 'Campeonatos', value: d.Campeonatos}, {key: 'Subcampeonatos', value: d.Subcampeonatos}];

      // Imprimir los datos en la consola
      console.log("Datos de la barra:", barData)

      // Retornar los datos para usarlos en las barras
      return barData;
  })
      .enter()
      .append('rect')
      .attr('x', d => x1(d.key))
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', d => d.key === 'Victorias' || d.key === 'Campeonatos' ? '#003da5' : '#ce1141')
      .on('mouseover', function(event, d) {
        tooltip2.html(`${d.key}: ${d.value}`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY -20) + 'px');
        tooltip2.style('opacity', 1);
      })
      .on('mouseout', function() {
        tooltip2.style('opacity', 0);
      });

    // Agregamos la leyenda
    g.selectAll('.legend').remove();
    const legend = g.selectAll('.legend')
      .data(bool_conferencia ? ['Victorias', 'Derrotas'] : ['Campeonatos', 'Subcampeonatos'])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legend.append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', d => d === 'Victorias' || d === 'Campeonatos' ? '#003da5' : '#ce1141');

    legend.append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .text(d => d);

  }

  update_vis_2(true);

});






// Visualizacion 3 -------------------------------------------

const width3 = 1200;
const height3 = 900;

SVG3.attr('width', width3 ).attr('height', height3);

    
d3.csv('https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/PLAYERS_NBA.csv').then(function (jugadores) {


  const sorted_pts = jugadores.slice().sort((a, b) => b.PTS - a.PTS);
  const filtered_jugadores = sorted_pts.slice(0, 20);



  const simulation = d3.forceSimulation(filtered_jugadores)
    .force('attractToCenterX', d3.forceX(width3 / 2).strength(0.05)) 
    .force('attractToCenterY', d3.forceY(height3 / 2).strength(0.05))
    .force('collision', d3.forceCollide(d => d.PTS*3).strength(0.5)) 
    .on('tick', ticked);


  const circles = SVG3.selectAll('.circle')
    .data(filtered_jugadores)
    .enter().append('g')
    .attr('class', 'circle')
    .call(drag(simulation));

  circles.append('image')
    .attr('href', d => d.Image)
    .attr('width', d => d.PTS*3)
    .attr('height', d => d.PTS*3)
    .attr('x', d => -d.PTS*3)
    .attr('y', d => -d.PTS*3);
    //.attr('x', (d, i) => circulos_agregados.nodes()[i].getAttribute('cx') + d.PTS*5)
    //.attr('y', (d, i) => circles_agregados.nodes()[i].getAttribute('cy') + d.PTS*5);

    circles.append('circle')
    .attr('cx', Math.random()*(width3-200))
    .attr('cy', Math.random()*(height3-100))
    .attr('r', d => d.PTS*3);


  function ticked() {
    circles.attr('transform', d => `translate(${d.x},${d.y})`);
      //.attr('cx', d => d.x)
      //.attr('cy', d => d.y);
  }


  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }


});


