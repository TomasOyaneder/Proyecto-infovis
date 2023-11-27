const SVG1 = d3.select("#vis-1").append("svg")
const SVG2 = d3.select("#vis-2").append("svg")
const SVG3 = d3.select("#vis-3").append("svg")
const SVG3_2 = d3.select("#vis-3").append("svg")


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

    let equipos_seleccionados = new Set();

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
    })
    .on('click', function(event, d) {
      //console.log(d.properties.team);
      const circle = d3.select(this);
      const nombre = d.properties.team;

      if (equipos_seleccionados.has(nombre)) {
        equipos_seleccionados.delete(nombre);
        circle.classed('selected', false);
        // Le sacamos el contorno al equipo
        circle.attr('stroke', 'none');
        // Llamamos a la función para actualizar la visualización 2
        update_vis_2(false, equipos_seleccionados);
      }

      else {
        equipos_seleccionados.add(nombre);
        circle.classed('selected', true);
        // Le ponemos un contorno al equipo
        circle.attr('stroke', 'white');
        circle.attr('stroke-width', '2.5px');
        // Llamamos a la función para actualizar la visualización 2
        update_vis_2(false, equipos_seleccionados);
      }

      //console.log(equipos_seleccionados);
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

  d3.select('#Eastern').on('click', function() {
    console.log('Eastern');

    // Rellenamos el contorno de los estados de la conferencia Este
    SVG1.selectAll('circle')
      .data(geo_teams.features)
      .attr('stroke', d => d.properties.conference === 'Eastern' ? 'white' : 'none')
      .attr('stroke-width', d => d.properties.conference === 'Eastern' ? '2.5px' : '1.0px');

    SVG1.selectAll('text')
      .data(geo_teams.features)
      .attr('stroke', d => d.properties.conference === 'Eastern' ? 'white' : 'none')
      .attr('stroke-width', d => d.properties.conference === 'Eastern' ? '1.5px' : '1.0px');
  });

  d3.select('#Western').on('click', function() {
    console.log('Western');

    // Rellenamos los equipos de la conferencia Oeste
    SVG1.selectAll('circle')
      .data(geo_teams.features)
      .attr('stroke', d => d.properties.conference === 'Western' ? 'white' : 'none')
      .attr('stroke-width', d => d.properties.conference === 'Western' ? '2.5px' : '1.0px');

    SVG1.selectAll('text')
      .data(geo_teams.features)
      .attr('stroke', d => d.properties.conference === 'Western' ? 'white' : 'none')
      .attr('stroke-width', d => d.properties.conference === 'Western' ? '1.5px' : '1.0px');

  });

  d3.select('#reset').on('click', function() {
    console.log('Reset');

    // No se rellena ningún equipo
    SVG1.selectAll('circle')
      .data(geo_teams.features)
      .attr('stroke', 'none');

    SVG1.selectAll('text')
      .data(geo_teams.features)
      .attr('stroke', 'none');

  });

  });

  });

});


// Visualización 2 - Gráfico de barras agrupado
// 2 filtros: Conferencia y Palmares
// Para Conferencia, filtro de season

SVG2.attr('width', 1200).attr('height', 900);

// Definimos las dimensiones del gráfico
const margin = {top: 75, right: 20, bottom: 90, left: 40};
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
    Image: d.Image,
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
    update_vis_2(true, equipos_seleccionados);
  });

  // Función para ver si se cambió el boton de palmares
  d3.select('#palmares').on('click', function() {
    update_vis_2(false, equipos_seleccionados);
  });

  // Función para ver si se cambió el filtro de season
  d3.select('#season').on('change', function() {
    update_vis_2(true, equipos_seleccionados);
  });

  // Función para actualizar el gráfico
  function update_vis_2(bool_conferencia, equipos_seleccionados) {
    const selected_conferencia = d3.select('#conferencia').property('value');
    const selected_season = d3.select('#season').property('value');

    const filtered_conferencia = conferenciasMap.filter(x => x.conference === selected_conferencia);
    const filtered_palmares = palmaresMap;
    const filtered_season = seasonMap.filter(x => x.Season === selected_season);

    // Filtramos los equipos que se encuentren en filtered_conferencia y filtered_season
    const equipos_comunes = filtered_season.filter(season =>
      filtered_conferencia.some(conferencia =>
        season.Team.includes(conferencia.team) || conferencia.team.includes(season.Team)
      )
    );

    console.log(equipos_comunes);

    // Definimos las escalas
    if (bool_conferencia) {
      x0.domain(equipos_comunes.map(d => d.Team));
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
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '-.55em')
      .attr('transform', 'rotate(-45)')
      .attr('font-size', '12px')
      .attr('fill', 'white');

    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(null, 's'))
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .append('text')
      .attr('x', 2)
      .attr('y', y(y.ticks().pop()) + 0.5)
      .attr('dy', '0.32em')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')
      .attr('font-size', '12px')
      .text('Victorias')
      .attr('fill', 'white');

    // Cambiamos el color de los ejes
    g.selectAll('.axis').selectAll('path').attr('stroke', 'white');
    g.selectAll('.axis').selectAll('line').attr('stroke', 'white');

    // Definimos la data
    const data = bool_conferencia ? equipos_comunes : filtered_palmares;

    // Agregamos las barras que funcionen con enter, update y exit
    if (bool_conferencia) {
      g.selectAll('.bar').remove();
      const bars = g.selectAll('g.bar')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'bar')
        .attr('transform', d => `translate(${x0(d.Team)}, 0)`);
    
      bars.selectAll('rect')
        .data(d => ['Victorias', 'Derrotas'].map(key => ({team: d.Team,  image: d.Image, key, value: d[key]})))
        .enter()
        .append('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', d => d.key === 'Victorias' ? '#003da5' : '#ce1141')
        .on('mouseover', function(event, d) {
          tooltip2.html(`<img src="${d.image}" alt="Imagen de ${d.team}" style="width:50px;height:auto;"><br>Equipo: ${d.team} <br> ${d.key}: ${d.value}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY -20) + 'px');
          tooltip2.style('opacity', 1);
        })
        .on('mouseout', function() {
          tooltip2.style('opacity', 0);
        });

      g.selectAll('.axis text')
        .on('mouseover', function(event, d) {
          const dataPoint = x0.domain().find(x => x === d);
          const logo = seasonMap.find(x => x.Team === dataPoint);
          tooltip2.html(`<img src="${logo.Image}" alt="Imagen de ${d}" style="width:50px;height:auto;"><br>Equipo: ${d} <br> Temporada: ${selected_season} <br> ${bool_conferencia ? 'Victorias' : 'Campeonatos'}: ${bool_conferencia ? logo.Victorias : logo.Campeonatos} <br> ${bool_conferencia ? 'Derrotas' : 'Subcampeonatos'}: ${bool_conferencia ? logo.Derrotas : logo.Subcampeonatos}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY -20) + 'px');
          tooltip2.style('opacity', 1);
        })
        .on('mouseout', function() {
          tooltip2.style('opacity', 0);
        });

    }

    else {
      console.log(data);
      g.selectAll('.bar').remove();
      const bars = g.selectAll('g.bar')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'bar')
        .attr('transform', d => `translate(${x0(d.Equipo)}, 0)`);

      bars.selectAll('rect')
        .data(d => ['Campeonatos', 'Subcampeonatos'].map(key => ({Equipo: d.Equipo,  image: d.Image, key, value: d[key]})))
        .enter()
        .append('rect')
        .attr('x', d => x1(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', d => d.key === 'Campeonatos' ? '#003da5' : '#ce1141')
        //tooltip para palmares con el nombre del equipo, campeonatos y subcampeonatos y el logo
        .on('mouseover', function(event, d) {
          const logo = data.find(x => x.Equipo === d.Equipo);
          tooltip2.html(`<img src="${logo.Image}" alt="Imagen de ${d.Equipo}" style="width:50px;height:auto;"><br>Equipo: ${d.Equipo} <br> ${d.key}: ${d.value}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY -20) + 'px');
          tooltip2.style('opacity', 1);
        })
        .on('mouseout', function() {
          tooltip2.style('opacity', 0);
        })

      const datos_filtrados = data.filter(x => equipos_seleccionados.has(x.Equipo));
      console.log(datos_filtrados);

      bars.selectAll('rect')
        .transition()
        .attr('stroke', d => equipos_seleccionados.has(d.Equipo) ? 'white' : 'none')
        .attr('stroke-width', d => equipos_seleccionados.has(d.Equipo) ? '2.5px' : '1.0px');

        

      g.selectAll('.axis text')
        .on('mouseover', function(event, d) {
          const dataPoint = x0.domain().find(x => x === d);
          const logo = palmaresMap.find(x => x.Equipo === dataPoint);
          tooltip2.html(`<img src="${logo.Image}" alt="Imagen de ${d}" style="width:50px;height:auto;"><br>Equipo: ${d} <br> ${bool_conferencia ? 'Victorias' : 'Campeonatos'}: ${bool_conferencia ? logo.Victorias : logo.Campeonatos} <br> ${bool_conferencia ? 'Derrotas' : 'Subcampeonatos'}: ${bool_conferencia ? logo.Derrotas : logo.Subcampeonatos}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY -20) + 'px');
          tooltip2.style('opacity', 1);

        })
        .on('mouseout', function() {
          tooltip2.style('opacity', 0);
        });
    }

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
      .text(d => d)
      .attr('fill', 'white');

  }

  update_vis_2(true, 'none');

});






// Visualizacion 3 -------------------------------------------

const width3 = 1200;
const height3 = 900;
const width3_2 = 300;
const height3_2 = 300;

SVG3.attr('width', width3 ).attr('height', height3);

    
d3.csv('https://raw.githubusercontent.com/TomasOyaneder/Datos-proyecto/main/PLAYERS_NBA.csv').then(function (jugadores) {


SVG3_2.attr('width', width3_2).attr('height', height3_2);

SVG3_2.append('g')
.append('text')
.attr('x', 10)
.attr('y', 10)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '16px')
.text('Estadísticas jugador')
.attr('fill', 'white');

const info = SVG3_2.append('g')
.style('visibility', 'hidden');

const nombre = info.append('text')
.attr('x', 10)
.attr('y', 30)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '12px')
.attr('fill', 'white');

const mvp = info.append('text')
.attr('x', 10)
.attr('y', 50)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '12px')
.attr('fill', 'white');

const pts = info.append('text')
.attr('x', 10)
.attr('y', 70)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '12px')
.attr('fill', 'white');

const tri = info.append('text')
.attr('x', 10)
.attr('y', 90)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '12px')
.attr('fill', 'white');

const fg = info.append('text')
.attr('x', 10)
.attr('y', 110)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '12px')
.attr('fill', 'white');

const ft = info.append('text')
.attr('x', 10)
.attr('y', 130)
.attr('dy', '0.32em')
.attr('text-anchor', 'start')
.attr('font-size', '12px')
.attr('fill', 'white');

const imagen = info.append('image')
.attr('x', 70)
.attr('y', 130)
.attr('width', 180)
.attr('height', 180);

function actualizar_vis_32(d) {
  nombre.style('font-weight', 'bold').text(`Nombre: ${d.Player}`);
  mvp.style('font-weight', 'bold').text(`MVP: ${d.MVP}`);
  pts.style('font-weight', 'bold').text(`Promedio de puntos p/p: ${parseFloat(d.PTS).toFixed(2)}`);
  tri.style('font-weight', 'bold').text(`% triples p/p: ${parseFloat(d.TRI).toFixed(2)}`);
  fg.style('font-weight', 'bold').text(`% de tiros de campo p/p: ${parseFloat(d.FG).toFixed(2)}`);
  ft.style('font-weight', 'bold').text(`% de tiros libres p/p: ${parseFloat(d.FT).toFixed(2)}`);
  imagen.attr('href', d.Image);
  info.style('visibility', 'visible');
}

function limpiar_vis_32() {
  nombre.text('');
  mvp.text('');
  pts.text('');
  tri.text('');
  fg.text('');
  ft.text('');
  imagen.attr('href', '');
  info.style('visibility', 'hidden');
}


  // const sorted_pts = jugadores.slice().sort((a, b) => b.PTS - a.PTS);
  // const filtered_jugadores = sorted_pts.slice(0, 20);

  // Función para preprocesar los datos según el filtro
  function preprocesar_vis_3(filtro) {
    // Cada vez que se cambie el filtro, se debe volver a preprocesar los datos
    d3.select('#MVP')
    .classed('button-gold', true)
    .on('click', (event) => {
      filtro = '0';
      preprocesar_vis_3(filtro);
      limpiar_vis_32();
    });

    d3.select('#no-MVP')
    .classed('button-white', true)
    .on('click', (event) => {
      filtro = '1';
      preprocesar_vis_3(filtro);
      limpiar_vis_32();
    });

    d3.select('#ALL').on('click', (event) => {
      filtro = '2';
      preprocesar_vis_3(filtro);
      limpiar_vis_32();
    });


    // Cada vez que cambia el selector de orden, se llama nuevamente a create_vis_3
    // para que se actualice la visualización
    d3.select('#order-by').on('change', (_) => {
      let orden = document.getElementById('order-by').selectedOptions[0].value;
      create_vis_3_aux(orden, filtro);
      limpiar_vis_32();
    })

    // Llamamos a la función para crear la visualización
    let orden = document.getElementById('order-by').selectedOptions[0].value;
    create_vis_3_aux(orden, filtro);


  // Función para crear la visualización
  function create_vis_3_aux(orden, filtro) {
    let variable = 'PTS';
    // console.log(orden, filtro);
    // Se filtran los datos según el filtro
    let filtered_jugadores = jugadores;
    if (filtro === '0') {
      filtered_jugadores = jugadores.filter(x => x.MVP > 0);
    }

    else if (filtro === '1') {
      filtered_jugadores = jugadores.filter(x => x.MVP == 0);
    }

    // Se ordenan los datos según el orden
    if (orden === 'PTS') {
      filtered_jugadores.sort((a, b) => b.PTS - a.PTS);
      variable = 'PTS';
    }

    else if (orden === 'TRI') {
      filtered_jugadores.sort((a, b) => b.TRI - a.TRI);
      variable = 'TRI';
    }

    else if (orden === 'FG') {
      filtered_jugadores.sort((a, b) => b.FG - a.FG);
      variable = 'FG';
    }

    else {
      filtered_jugadores.sort((a, b) => b.FT - a.FT);
      variable = 'FT';
    }

    // console.log(variable);

    // Nos quedamos con los 20 primeros
    filtered_jugadores = filtered_jugadores.slice(0, 25);


    const escala_pts = d3 
        .scaleLinear()
        //.domain([d3.min(jugadores, d => d.PTS), d3.max(jugadores, d => d.PTS)])
        .domain([d3.min(filtered_jugadores , d => d.PTS), d3.max(filtered_jugadores , d => d.PTS)])
        //.domain([15, 30])
        .range([30, 120]);

    const escala_3p = d3 
        .scaleLinear()
        //.domain([d3.min(jugadores, d => d.TRI), d3.max(jugadores, d => d.TRI)])
        .domain([d3.min(filtered_jugadores , d => d.TRI), d3.max(filtered_jugadores , d => d.TRI)])
        //.domain([0.35, 0.55])
        .range([30, 120]);

    const escala_fg = d3 
        .scaleLinear()
        //.domain([d3.min(jugadores, d => d.FG), d3.max(jugadores, d => d.FG)])
        .domain([d3.min(filtered_jugadores , d => d.FG), d3.max(filtered_jugadores , d => d.FG)])
        //.domain([0.5, 0.7])
        .range([30, 120]);

    const escala_ft = d3 
        .scaleLinear()
        //.domain([d3.min(jugadores, d => d.FT), d3.max(jugadores, d => d.FT)])
        .domain([d3.min(filtered_jugadores , d => d.FT), d3.max(filtered_jugadores , d => d.FT)])
        //.domain([0.75, 0.95])
        .range([30, 100]);


    const escalas = {
      'PTS': escala_pts,
      'TRI': escala_3p,
      'FG': escala_fg,
      'FT': escala_ft
    }

    function obtenerEscala(stat) {
      return escalas[stat];
    }

    // console.log(filtered_jugadores);

    const escala = obtenerEscala(variable);

    const simulation = d3.forceSimulation(filtered_jugadores)
    .force('attractToCenterX', d3.forceX(width3 / 2).strength(0.05)) 
    .force('attractToCenterY', d3.forceY(height3 / 2).strength(0.05))
    .force('collision', d3.forceCollide(d => escala(d[variable])).strength(0.5)) 
    .on('tick', ticked);

    const burbujas = SVG3.selectAll('.circle')
      .data(filtered_jugadores, d => d.Player)
      .join(
        enter => {

          // console.log(variable);

          const circles = enter.append('g')
            .attr('class', 'circle')
            .call(drag(simulation));

          // Si hay presencia de jugadores MVP, el contorno de su círculo es dorado
          circles.append('circle')
            .attr('r', d => escala(d[variable]))
            .style('stroke', d => d.MVP > 0 ? 'gold' : 'white')
            .style('stroke-width', d => d.MVP > 0 ? '2.5px' : '1.5px')
            .on('click', function(event, d) {
              // console.log(d);
              actualizar_vis_32(d);
            });


          circles.append('image')
            .attr('href', d => d.Image)
            .attr('width', d => escala(d[variable])*3/2)
            .attr('height', d => escala(d[variable])*3/2)
            .attr('y', d => -escala(d[variable])*3/4)
            .attr('x', (d, i) => {
              // console.log(d.Player); 
              // console.log(`La variable es ${variable}`)
              // console.log(`El dato es ${d[variable]}`)
              // console.log(`La escala a usar es ${obtenerEscala(variable)}`)
              // console.log(escala(d[variable]))
              return -escala(d[variable])*3/4;
            })
            .on('click', function(event, d) {
              // console.log(d);
              actualizar_vis_32(d);
            })



          return circles;
        },
        update => {

          update.call(drag(simulation));

          update.select('circle')
            .attr('r', d => escala(d[variable]));

          update.select('image')
          .attr('href', d => d.Image)
          .attr('width', d => escala(d[variable])*3/2)
          .attr('height', d => escala(d[variable])*3/2)
          .attr('y', d => -escala(d[variable])*3/4)
          .attr('x', d => -escala(d[variable])*3/4);
          
          return update;
        },
        exit => {
          exit.remove();
        }
      );

    function ticked() {
      burbujas.attr('transform', d => `translate(${d.x},${d.y})`);
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

  // Creamos un zoom para la visualización
    const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed);

    SVG3.call(zoom);

    function zoomed(event) {
      SVG3.selectAll('circle')
        .attr('transform', event.transform);

      SVG3.selectAll('image')
        .attr('transform', event.transform);

      SVG3.selectAll('text')
        .attr('transform', event.transform);
    }

  }

  // create_vis_3_aux(orden, filtro);

  }

  preprocesar_vis_3('2');

});






