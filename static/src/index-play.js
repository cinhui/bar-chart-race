const height = 600;
const width = 960;

const tickDuration  = 700;
const delayDuration = 1000;

let sequenceArray = [];

// const weightclass passed in from html

const title1 = "HISTORY OF UFC";
const title2 = weightclass;
const title3 = "RANKINGS";
const subTitle = "February 2013-present";

const svg = d3.select("#bar-chart").append("svg")
   .attr("width", width)
   .attr("height", height);

const margin = {
   top: 80,
   right: 50,
   bottom: 80,
   left: 0
};

const barPadding = 0;
const bar_offset = 3;
const max_value = 11;
const shift_y = 85;

// Add title
svg.append('text')
   .attr('class', 'title')
   .attr('x', 45)
   .attr('y', shift_y)
   .html(title1);
svg.append('text')
   .attr('class', 'title')
   .attr('x', 45)
   .attr('y', 40+shift_y)
   .html(title2);
svg.append('text')
   .attr('class', 'title')
   .attr('x', 45)
   .attr('y', 80+shift_y)
   .html(title3);

// Add subtitle
svg.append("text")
   .attr("class", "subTitle")
   .attr('x', 45)
   .attr("y", 110+shift_y)
   .html(subTitle);

// Add color legend
const rect_size = 15
const rect_offset = 25
const from_top = 200;

// Add subscript caption
svg.append("text")
   .attr("class", "caption")
   .attr("x", 45)
   // .attr('y', height-20)
   .attr('y', from_top+4*rect_offset+23)
   .html("Sources: https://www.kaggle.com/martj42/ufc-rankings/data");
svg.append("text")
   .attr("class", "caption")
   .attr("x", 45+42)
   // .attr('y', height-5)
   .attr('y', from_top+4*rect_offset+23+15)
   .html("http://mma-stats.com/rankings/");

svg.append("text")
   .attr("class", "caption")
   .attr("x", 45)
   .attr('y', from_top+4*rect_offset+8)
   .html("Status as of Sept 28, 2020");
   // .html("Status as of June 29, 2020");
   // .html("Status as of March 14, 2020");

svg.append("rect")
   .attr("x",50).attr("y", from_top+rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#f0a500");
svg.append("text")
   .attr("class", "legend")
   .attr("x",75).attr("y", from_top+rect_offset+10)
   .attr("alignment-baseline","middle")
   .text("UFC Roster");
svg.append("rect")
   .attr("x",50).attr("y", from_top+2*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#c1a57b");
svg.append("text")
   .attr("class", "legend")
   .attr("x",75).attr("y", from_top+2*rect_offset+10)
   .attr("alignment-baseline","middle")
   .text("Fighting Outside of UFC");
svg.append("rect")
   .attr("x",50).attr("y", from_top+3*rect_offset)
   .attr("width", rect_size).attr("height", rect_size)
   .style("fill", "#dbdbdb");
svg.append("text")
   .attr("class", "legend")   
   .attr("x",75).attr("y", from_top+3*rect_offset+10)
   .attr("alignment-baseline","middle")
   .text("Inactive/Retired");

Promise.all([
   d3.csv("sequence.csv"),
   d3.csv(weightclass+"-rankings.csv"),
   d3.json("https://raw.githubusercontent.com/cinhui/ufc-ranking-chart/master/"+weightclass+"-fighters.json"),
   ])
   .then(function(data) {
      data[0].forEach(d => {
         sequenceArray.push(d.date_formatted)
      })

      const sequenceStart     = 0;
      const sequenceEnd       = sequenceArray.length;
      let sequence = sequenceStart;

      // console.log(sequenceStart)
      // console.log(sequenceEnd)
   
      let fighters = {};
      data[2].forEach( d => {
         fighters[d.fighter] = d.bar_color
      });

      // console.log(fighters)

      // Assign colors to each 
      data[1].forEach( d => {
         // d.color = d3.hsl("Cyan");
         // d.color = d3.hsl(Math.random()*360,1,0.5);
         d.color = fighters[d["fighter"]]
      });

      // Add slider

      var startDate = sequenceStart;
      var endDate = sequenceEnd-1;
  
      const svg2 = d3.select("#slider").append("svg")
            .attr("width", width-2*margin.right)
            .attr("height", 100);

      var moving = false;
      var currentValue = 0;
      var targetValue = width-60-6*margin.right;
            
      var xslider = d3.scaleLinear()
            .domain([startDate, endDate])
            .range([0, targetValue])
            .clamp(true);
      
      var slider = svg2.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + 130 + "," + 45 + ")");
      
      slider.append("line")
            .attr("class", "track")
            .attr("x1", xslider.range()[0])
            .attr("x2", xslider.range()[1])
         .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
         .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
               .on("start.interrupt", function() { slider.interrupt(); })
               .on("start drag", function() {
                  currentValue = d3.event.x;
                  currentValue = d3.max([0,currentValue]);
                  updateSlider(xslider.invert(currentValue)); 
                  updateChart(xslider.invert(currentValue));
               })
            );
      
      slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 20 + ")");
      
      var handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 6);
      
      var label = slider.append("text")  
            .attr("class", "slider")
            .attr("text-anchor", "middle")
            .text((sequenceArray[Math.floor(startDate)]))
            .attr("transform", "translate(15," + (-15) + ")");

      function updateSlider(h) {
         console.log(currentValue)
         console.log(h + " " + Math.floor(h))
         handle.attr("cx", xslider(h));
         label.attr("x", xslider(h))
               .text(sequenceArray[Math.floor(h)]);
      }
   
      function computeDataSlice(sequence){
         const values = {};
   
         const ret = [];
         data[1].forEach( d => {
            const name = d["fighter"];
            const txt  = d[sequence];
            let val  = 0;
            val = parseFloat(txt);
            val = Math.round(val);
   
            if( val>-1){
               ret.push({
                  name     : name,
                  color   : d.color,
                  value    : val
               });
            }   
            values[name] = val;
         });
   
         return ret.sort((a,b) => b.value - a.value).slice(0, max_value);
      }
   
      let sequenceValue = computeDataSlice(sequence);
      sequenceValue.forEach((d,i) => d.rank = i);
   
      // console.log(sequenceValue)
   
      // Format axes
      let x = d3.scaleLinear()
         .domain([0, 10])
         .range([margin.left, width-margin.right-100]);
   
      let y = d3.scaleLinear()
         .domain([max_value, 0])
         .range([height-margin.bottom, margin.top]);
   
      let dateText = svg.append('text')
         .attr('class', 'dateText')
         // .attr('x', 45)
         // .attr('y', 160+shift_y)
         .attr('x', x(8))
         .attr('y', margin.top+10)
         .style('text-anchor', 'middle');
      
      let rankText = svg.append("g");
      rankText.append('text')
         .attr('class', 'annotate')
         .attr('x', x(5)+45)
         .attr('y', 1.7*margin.top)
         .style('text-anchor', 'end')
         .html("Champion");

      for (i = 1; i < 11; i++) {
         rankText.append('text')
            .attr('class', 'annotate')
            .attr('x', x(5)+45)
            .attr('y', y(i)+((y(1)-y(0))/2)+38)
            .style('text-anchor', 'end')
            .html(i);
      }
   
      // dateText.html(sequenceArray[sequence]);
      d3.selectAll(".annotate").style('visibility', 'hidden');

      svg.selectAll('rect.bar')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('rect')
         .attr('class', 'bar')
         .attr('x', x(6)+1)
         .attr('y', d => y(d.rank)+35)
         .attr('width', d => x(d.value)-x(0))
         .attr('height', y(1)-y(0)-barPadding)
         .style('fill', d => d.color);
   
      svg.selectAll('text.label')
         .data(sequenceValue, d => d.name)
         .enter()
         .append('text')
         .attr('class', 'label')
         .attr('x', d => x(10)+260)
         .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+13)
         .style('text-anchor', 'middle')
         .html(d => d.name);

      function updateChart(h) {

         sequence = Math.floor(h)
         dateText.html(sequenceArray[sequence]);
         // console.log(sequence + " " + sequenceArray[sequence])
      
         sequenceValue = computeDataSlice(sequence);
         sequenceValue.forEach((d,i) => d.rank = i);
         x.domain([0, d3.max(sequenceValue, d => d.value)]); 
   
         var bars = svg.selectAll('.bar').data(sequenceValue, d => d.name);
   
         console.log(sequenceValue)
         bars
            .enter()
            .append('rect')
            .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
            .attr('x', x(6)+45)
            .attr('y', d => y(max_value+1)+50)
            .attr('width', d => x(1.5*bar_offset))
            .attr('height', y(1)-y(0)-barPadding)
            .style('fill', d => d.color)
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+35);
   
         bars
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('width', d => x(1.5*bar_offset))
            .attr('y', d => y(d.rank)+35);
   
         bars
            .exit()
            .remove();
   
         var labels = svg.selectAll('.label')
            .data(sequenceValue, d => d.name);
   
         labels
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', x(9)+10)
            .attr('y', d => y(max_value+1)+((y(1)-y(0))/2)+38)
            .style('text-anchor', 'middle')
            .html(d => d.name)    
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+38);
   
   
         labels
            .transition()
            .duration(tickDuration)
            .ease(d3.easeLinear)
            .attr('x', x(9)+1)
            .attr('y', d => y(d.rank)+((y(1)-y(0))/2)+38);
   
         labels
            .exit()
            .remove();
   
      }

      d3.selectAll(".annotate").style('visibility', 'visible');
      updateChart(sequenceStart);

      var playButton = d3.select("#button");

      playButton
         .on("click", function() {
            var button = d3.select(this);
            // console.log(currentValue)
            if (button.text() == "Pause") {
               moving = false;
               clearInterval(timer);
               button.text("Resume");
            } else {
               moving = true;
               timer = setInterval(step, delayDuration);
               button.text("Pause");
            }
         })
      
      function step() {
            updateSlider(xslider.invert(currentValue)); 
            updateChart(xslider.invert(currentValue));
            currentValue = currentValue + 2;
            if (currentValue > targetValue) {
              moving = false;
              currentValue = 0;
              clearInterval(timer);
              playButton.text("Start");
            }
      }

}).catch(function(err) {
   // handle error here
   console.log("error")
})


