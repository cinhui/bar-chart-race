const top_n = 11;
const height = 600;
const width = 900;

const tickDuration  = 1000; //delay of an animation
const delayDuration = 1000; //delay in between

const sequenceStart     = 1;
const sequenceEnd       = 228;

const title = "";
const subTitle = "";

const svg = d3.select("#bar-chart").append("svg")
   .attr("width", width)
   .attr("height", height);

const margin = {
   top: 80,
   right: 0,
   bottom: 5,
   left: 0
};

const barPadding = 0;

svg.append('text')
   .attr('class', 'title')
   .attr('y', 24)
   .html(title);

svg.append("text")
   .attr("class", "subTitle")
   .attr("y", 55)
   .html( subTitle );

let sequence = sequenceStart;

// d3.csv("testdata.csv").then(function(data) {
d3.csv("lightweight.csv").then(function(data) {

    console.log(data);

    // Assign random color
    data.forEach( d => {
       d.colour = d3.hsl(Math.random()*360,0.75,0.75);
    });
 
    let lastValues = {};
 
    function _normalizeData(){
        const values = {};
 
        const ret = [];
        data.forEach( d => {
           const name = d["fighter"];
           const txt  = d[sequence];
           let val  = 0;
           val = parseFloat(txt);
           val = Math.round( val);
 
           let lastValue = lastValues[ name ];
           if( lastValue == null )
             lastValue = 0;
 
           ret.push({
               name     : name,
               colour   : d.colour,
               value    : val,
               lastValue: lastValue
           });
           
        //    console.log(val)
           values[name] = val;
        });
        
        lastValues = values;
 
        return ret.sort((a,b) => b.value - a.value).slice(0, top_n);
    }
 
    let sequenceValue = _normalizeData();
    sequenceValue.forEach((d,i) => d.rank = i);
 
   //  console.log('sequenceValue: ', sequenceValue)
 
    let x = d3.scaleLinear()
       .domain([0, d3.max(sequenceValue, d => d.value)])
       .range([margin.left, width-margin.right-65]);
 
    let y = d3.scaleLinear()
       .domain([top_n, 0])
       .range([height-margin.bottom, margin.top]);
 
    let xAxis = d3.axisTop()
       .scale(x)
       .ticks(width > 500 ? 5:2)
       .tickSize(-(height-margin.top-margin.bottom))
       .tickFormat(d => d3.format(',')(d));
 
    // svg.append('g')
    //    .attr('class', 'axis xAxis')
    //    .attr('transform', `translate(0, ${margin.top})`)
    //    .call(xAxis)
    //    .selectAll('.tick line')
    //    .classed('origin', d => d == 0);
 
    svg.selectAll('rect.bar')
       .data(sequenceValue, d => d.name)
       .enter()
       .append('rect')
       .attr('class', 'bar')
       .attr('x', x(0)+1)
       .attr('width', d => x(d.lastValue)-x(0))
       .attr('y', d => y(d.rank)+5)
       .attr('height', y(1)-y(0)-barPadding)
       .style('fill', d => d.colour);
 
    svg.selectAll('text.label')
       .data(sequenceValue, d => d.name)
       .enter()
       .append('text')
       .attr('class', 'label')
       .attr('x', d => x(d.lastValue)-8)
       .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2)
       .style('text-anchor', 'end')
       .html(d => d.name);
 
    // svg.selectAll('text.valueLabel')
    //    .data(sequenceValue, d => d.name)
    //    .enter()
    //    .append('text')
    //    .attr('class', 'valueLabel')
    //    .attr('x', d => x(d.lastValue)+5)
    //    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2)
    //    .text(d => d.lastValue);
 
    let dateText = svg.append('text')
       .attr('class', 'dateText')
       .attr('x', width-margin.right)
       .attr('y', 55)
       .style('text-anchor', 'end')
       .html(~~sequence);
 
    let ticker = d3.interval(e => {
 
       sequenceValue = _normalizeData();
       sequenceValue.forEach((d,i) => d.rank = i);
       x.domain([0, d3.max(sequenceValue, d => d.value)]); 
 
       svg.select('.xAxis')
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .call(xAxis);
 
       const bars = svg.selectAll('.bar').data(sequenceValue, d => d.name);
 
       bars
          .enter()
          .append('rect')
          .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
          .attr('x', x(0)+1)
          .attr( 'width', d => x(d.value)-x(0))
          .attr('y', d => y(top_n+1)+5)
          .attr('height', y(1)-y(0)-barPadding)
          .style('fill', d => d.colour)
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5);
 
       bars
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', d => Math.max(0, x(d.value)-x(0)))
          .attr('y', d => y(d.rank)+5);
 
       bars
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('width', d => Math.max(0, x(d.value)-x(0)))
          .attr('y', d => y(top_n+1)+5)
          .remove();
 
       const labels = svg.selectAll('.label')
          .data(sequenceValue, d => d.name);
 
       labels
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => x(d.value)-8)
          .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2)+2)
          .style('text-anchor', 'end')
          .html(d => d.name)    
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2);
 
 
       labels
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value)-8)
          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2);
 
       labels
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attr('x', d => x(d.value)-8)
          .attr('y', d => y(top_n+1)+5)
          .remove();
 
    //    const valueLabels = svg.selectAll('.valueLabel').data(sequenceValue, d => d.name);
 
    //    valueLabels
    //       .enter()
    //       .append('text')
    //       .attr('class', 'valueLabel')
    //       .attr('x', d => x(d.value)+5)
    //       .attr('y', d => y(top_n+1)+5)
    //       .text(d => d.value)
    //       .transition()
    //       .duration(tickDuration)
    //       .ease(d3.easeLinear)
    //       .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2);
 
    //    valueLabels
    //       .transition()
    //       .duration(tickDuration)
    //       .ease(d3.easeLinear)
    //       .attr('x', d => x(d.value)+5)
    //       .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+2)
    //       .tween("text", function(d) {
    //          const i = d3.interpolateNumber(d.lastValue, d.value);
    //          //return i(interpolator);
    //          return function(t) {
    //             let v = i(t);
    //             if( v < 0 )
    //                 v = 0;
    //             this.textContent = v;
    //          };
    //       });
 
 
    //    valueLabels
    //       .exit()
    //       .transition()
    //       .duration(tickDuration)
    //       .ease(d3.easeLinear)
    //       .attr('x', d => x(d.value)+5)
    //       .attr('y', d => y(top_n+1)+5)
    //       .remove();
 
       dateText.html(~~sequence);
 
       sequence++;
       if(sequence> sequenceEnd) ticker.stop();
    }, delayDuration);
 
 }); 

//  d3.select("button").on("click", function() {
//    if (this.innerHTML === "Pause") {
//      this.innerHTML = "Resume";

//    } else if (this.innerHTML === "Resume") {
//      this.innerHTML = "Pause";

//    } else {
//      this.innerHTML = "Pause";

//    }
//  });