function SvgCanvas(graphHeight, graphWidth, containerDivId)
{
     // the dimensions of the canvas we are going to draw on 
     this.graphHeight = graphHeight;
     this.graphWidth = graphWidth; 
     
     // the div we want to add the drawing to
     this.containerDivId = containerDivId; 
     
     this.namespace = "http://www.w3.org/2000/svg";
     
     // We are going to create a list of containers. The container called
     // "top" is the outermost wrapper contianer that holds all the elements in the graph. 
     this.canvas = {};
     this.canvas.containers = {};
     this.canvas.containers["top"] =  document.createElementNS(this.namespace, "svg");
     
     // add the dynamically created svg element to the containing 
     // div 
     document.getElementById(containerDivId).appendChild(this.canvas.containers["top"]);
     
     
     // set basic elements
     this.canvas.containers["top"].setAttribute("width", graphWidth);
     this.canvas.containers["top"].setAttribute("height", graphHeight);
     
     this.currContainer = "top";
     this.textSizes = [];
}

SvgCanvas.prototype = {
	constructor: SvgCanvas,
	drawLine: function(startingPt, endingPt, strokeColor, className){
		var l = document.createElementNS(this.namespace, "line");	
		 // draw x 
        l.setAttribute("x1", startingPt.x);
	    l.setAttribute("x2", endingPt.x);
	    l.setAttribute("y1", startingPt.y);
	    l.setAttribute("y2", endingPt.y);
	    l.setAttribute("stroke", strokeColor);
	    l.setAttribute("class", className);
	    
	    this.canvas.containers[this.currContainer].appendChild(l);
	},
	/* Add a group to the canvas */ 
	addGroup: function(groupName){
	    // dynamically create a group element
		this.canvas.containers[groupName] = document.createElementNS(this.namespace, "g");
		
		// add the group element to the canvas 
		this.canvas.containers["top"].appendChild(this.canvas.containers[groupName]);
	},
	/* Function draws rectangles */
	drawRectangle: function(rectHeight,rectWidth, startingValue, rectColor){
		var myRect = document.createElementNS(this.namespace, "rect");		
		
		myRect.setAttribute("x", startingValue.x); // x coordinate for center
				     
	    myRect.setAttribute("y", startingValue.y); // y coordinate for center
		myRect.setAttribute("width", rectWidth);  // radius
		myRect.setAttribute("height", rectHeight);
		myRect.setAttribute("fill", rectColor); // fill color
		myRect.setAttribute("class", "myRect");
		
		// add the rectangle to the canvas
		this.canvas.containers[this.currContainer].appendChild(myRect);
	},
	drawText: function(pt,fontFamily,fontSize, text, className, wrap, textMargins){
		var t = document.createElementNS(this.namespace, "text");
	    t.setAttribute("x", pt.x );
	    t.setAttribute("y", pt.y);
	    t.setAttribute("font-family",fontFamily);
	    t.setAttribute("font-size", fontSize);
	    
	    if(typeof className == 'string' || className instanceof String)
	       t.setAttribute("class", className);
	    
	    
        var textNode = document.createTextNode(text);
        t.appendChild(textNode);
	    
		this.canvas.containers[this.currContainer].appendChild(t);
		
		var range = document.createRange();
		range.selectNodeContents(textNode);
		var rects = range.getClientRects();
		this.textSizes.push(rects[0].width);
		
		if(wrap)
		  t.setAttribute("x", pt.x - rects[0].width - textMargins);
		
		//return {node: t, width: rects[0].width};
	},
	getContainers: function(){
		return this.canvas.containers; 
	},
	getGraphDimensions: function(){
		return {width: this.graphWidth, height: this.graphHeight};
	},
	setCurrentContainer: function(c){
	   this.currContainer = c; 
	},
	getTextSizes: function(){
		return this.textSizes;
	},
	drawSector: function(arc, color){
		var path = document.createElementNS(this.namespace, "path");		
		
		var d = "M " + 
		        arc.center.x + "," + arc.center.y + 
		        " L " + 
		        arc.startingPt.x + "," + arc.startingPt.y + 
		        " A" + 
		        arc.radius + "," + arc.radius + " " + 
		        arc.xAxisAngle + " " + arc.greaterThan180degrees + 
		        "," + arc.sweep + " " +  arc.endingPt.x + "," + arc.endingPt.y + "z";
		
		console.log("print the path string: " + d); 
		path.setAttribute("d", d); // x coordinate for center
           
        path.setAttribute("fill", color);
		
		
		// add the rectangle to the canvas
		this.canvas.containers[this.currContainer].appendChild(path);		
	}
}



// var container = new SvgCanvas("200px","300px", "programming-skills-bar-graph");
//container.drawLines({x: 0 ,y: 0}, {x:100,y:100 }, "black","grid","top");

function SimpleGraphs(){
	this.data = [];
	this.canvasInfo = {};
	this.graphPadding = {left: "25px", right: "25px", bottom: "25px", top: "25px" };
	this.axisMargins = {};
	this.labelSets = [];
	//this.currentLabel = 0; 
}

SimpleGraphs.prototype = {
	constructor: SimpleGraphs,
	dynamicSetter: function(property, value){
	     // first set the value of the property
	     this.canvasInfo[property] = value; 
	     
	     // secondly, check if all the properties have been set
	     if(this.canvasInfo.hasOwnProperty("width") && 
	        this.canvasInfo.hasOwnProperty("height") && 
	        this.canvasInfo.hasOwnProperty("topLevelContainerDiv"))
	        {
		        // create a new canvas
		        this.paper = new SvgCanvas(this.canvasInfo.height,
		                                   this.canvasInfo.width, 
		                                   this.canvasInfo.topLevelContainerDiv);
		       // delete this.canvasInfo; 
	        }
	},
	width: function(w){
	    this.dynamicSetter("width",w);
	    return this; 
	},
	height: function(h){
	    this.dynamicSetter("height",h);
	    return this; 
	},
	containingDiv: function(c){
	    this.dynamicSetter("topLevelContainerDiv",c);
	    return this; 
	},
	setData: function(d){
	    this.data = d; 
	    this.scaledData = d; 
	    return this; 
	},
	/***************************************************************************************
	 *                         Bar Graph Functions
	 ***************************************************************************************/
	bar: function(){
	   this.paper.addGroup("barGraph");
	   this.paper.setCurrentContainer("barGraph");	
	   console.log("the current container is: " + this.paper.currContainer); 
	   return this; 
	},
	orientation: function(o){
	   this.orientation = o;
	   return this; 
	},
	setGraphPadding: function(p){
	    this.graphPadding = p; 
	    return this; 
	},
	setAxisMargins: function(axis, margin, value){
	
	   this.axisMargins[axis] = {};
	   this.axisMargins[axis][margin] = value; 
	   
	   return this; 
	},
   drawAxises: function(drawX,drawY){
		// draw the y axis 
		if(drawY === "draw y"){
		    
		    var xPos = this.axisMargins.y.left + parseInt(this.graphPadding.left);
		    
			this.paper.drawLine({x: xPos,
		                     	 y: parseInt(this.graphPadding.top)},
							 	{x: xPos,
								 y: parseInt(this.canvasInfo.height) - parseInt(this.graphPadding.bottom)},
								 "black",
								 "grid");
        }
        
        if(drawX === "draw x"){
            var yPos  = parseInt(this.canvasInfo.height) - (parseInt(this.graphPadding.bottom) + this.axisMargins.x.bottom);
			this.paper.drawLine({x: parseInt(this.graphPadding.left),
		                     	 y: yPos },
							 	{x: parseInt(this.canvasInfo.width) - parseInt(this.graphPadding.right),
								 y: yPos },
								 "black",
								 "grid");	        
        }
	    return this; 
	},
	setTickHeight: function(th){
	   this.tickHeight = th;  // this should be HALF of the overall height of the tick
	   return this; 
	},
	setTickDistance: function(axis, d){
	  this.tickDistance = {};
	  this.tickDistance[axis] = d; 
	  return this; 
	},
	drawTicks: function(axis){
		var startingPt = {};
		startingPt.x = (axis === "x") ? parseInt(this.graphPadding.left) + this.axisMargins.y.left : 
		                                parseInt(this.graphPadding.left) + this.axisMargins.y.left - this.tickHeight;
		startingPt.y = (axis === "x") ? parseInt(this.canvasInfo.height) - (parseInt(this.graphPadding.bottom) + this.axisMargins.x.bottom + this.tickHeight) :
		                                parseInt(this.canvasInfo.height) - (parseInt(this.graphPadding.bottom) + this.axisMargins.x.bottom);
		
		
		// determine the number of ticks
		var lineLength = (axis === "x")? parseInt(this.canvasInfo.width) - 
			                            ( parseInt(this.graphPadding.left) + parseInt(this.graphPadding.right) + this.axisMargins.y.left) :
			                            parseInt(this.canvasInfo.height) - 
		                                (parseInt(this.graphPadding.top) + parseInt(this.graphPadding.bottom) + this.axisMargins.x.bottom);
		
		
		var numTicks = (lineLength/this.tickDistance[axis]) - 1;
			
		
		
		for(var i = 0; i < numTicks; i++)
		{
			    
			this.paper.drawLine({x: (axis === "x")? startingPt.x + this.tickDistance.x*(i+1) : startingPt.x,
					             y: (axis === "x")? startingPt.y                             : startingPt.y - this.tickDistance.y*(i+1)},
				                {x: (axis === "x")? startingPt.x + this.tickDistance.x*(i+1) : startingPt.x + 2*(this.tickHeight),
				                 y: (axis === "x")? startingPt.y + 2*(this.tickHeight)       : startingPt.y - this.tickDistance.y*(i+1) },
				                    "black",
				                    "ticks");
		}
			
		
		return this; 
	},
	setBarThickness: function(t){
	    this.barThickness = t;
	    return this; 
	},
	scale: function(scaleFn){
		this.scaledData = this.data.map(scaleFn);
		console.log("the scaled data: " + this.scaledData);
		return this; 
	},
	setBarMargins: function(bm){
	    this.barMargins = bm;
	    return this; 	
	},
	drawBars: function(){
		if(this.orientation === "horizontal"){
			                          
			for(var i = 0; i < this.scaledData.length; i++)
			{
		    	this.paper.drawRectangle(this.barThickness,
		    	                         this.scaledData[i],
                                         {x: parseInt(this.graphPadding.left) 
                                             + this.axisMargins.y.left, 
                                          y: parseInt(this.canvasInfo.height) - 
                                             (parseInt(this.graphPadding.bottom) 
                                                       + this.axisMargins.x.bottom 
                                                       + this.barThickness*(i+1) 
                                                       + this.barMargins*i)},
                                          "black" );
			}
		}
		return this; 
	},
	setDistBtwnLabels: function(d){
	    this.distBtwnLabels = d; 
	    return this; 
	},
	setLabels: function(l){
	    this.labelSets.push(l); 
	    return this;
	},
	makeLabels: function(axis, fontSize, fontFamily){
	   		                       
	  for(var i = 0; i < this.labelSets[this.labelSets.length - 1].length; i++)
	  {
	      var extraPadding = i > 0 ? this.paper.getTextSizes()
	                                          .reduce(function(a,b)
	                                                  {return a+b;},0) : 0; 
	      
	      this.paper.drawText({x: parseInt(this.graphPadding.left) 
	                             + this.axisMargins.y.left
	                             + this.distBtwnLabels*(i+1)
	                             + extraPadding,
			                   y: parseInt(this.canvasInfo.height) 
			                      - parseInt(this.graphPadding.bottom)},
			                   fontFamily,
			                   fontSize,
			                   this.labelSets[this.labelSets.length-1][i],
			                   null, 
			                   false,
			                   null);
	  }	                       
	   
	 //  this.paper.getRidOfTextSizes();
	   return this; 
	},
	// labels that are inside the bars themselves
	addInnerLabels: function(textMargins,fontFamily,fontSize){
         
         for(var i = 0; i < this.labelSets[this.labelSets.length - 1].length; i++){
	         this.paper.drawText({x: parseInt(this.graphPadding.left) 
	                                 + this.axisMargins.y.left 
	                                 + this.scaledData[i],
	                              y: parseInt(this.canvasInfo.height) 
	                                 - (parseInt(this.graphPadding.bottom) 
	                                    + this.axisMargins.x.bottom 
	                                    + this.barThickness*i + this.barMargins*(i+1) 
	                                    + textMargins)},
	                             fontFamily,
	                             fontSize, 
	                             this.labelSets[this.labelSets.length - 1][i],
	                             "barText", 
	                             true, 
	                             textMargins)
         }
         
		 return this; 
	},
/*****************************************************************************************
 *                  PIE CHART FUNCTIONS
 *****************************************************************************************/
	pieChart: function(){
	   this.paper.addGroup("pieChart");
	   this.paper.setCurrentContainer("pieChart");	
	  // console.log("the current container is: " + this.paper.currContainer);
	   return this; 
	},
	calculatePercentages: function(){	    
	    // the accumulator is zero 
	    var sum = this.data.reduce(function(a,b){
	                                   return a + b; },0);
	    
	    // calculate the percentage for each data point (relative to the entire data set), 
	    this.percentages = this.data.map(function(n){
		                                     return (n/sum).toPrecision(5);});
		                                     
		//console.log("the percentages are " + this.percentages); 
	    
		return this;
	},
	calculateRelativeAngles: function(){
	
	    this.relativeAngles = this.percentages.map(function(p){
	        var angle = {radians: 2*Math.PI*p, degrees: p*360};
	       // console.log("the relative angle is in degrees: " + angle.degrees);
	        return angle; 
	    });
		return this; 
	},
	calculateAbsoluteAngles: function(){
		this.absoluteAngles = this.relativeAngles.map(function(a){
		
		    var initiialArray = arguments[2];
		    
		    var subArray = initiialArray.slice(0,arguments[1] + 1);
		    
		    var currentSum = {radians: 0, degrees: 0}; 
		   
		    for(var i = 0; i < subArray.length; i++){
			   currentSum = {radians: currentSum.radians + subArray[i].radians, 
				             degrees: currentSum.degrees + subArray[i].degrees};   
		    }
            //console.log("the current absolute angle is: " + currentSum.degrees);
		    return currentSum; 
		
		}); // end of the map function 
		
		return this; 
	},
	determineStartingPts: function(c,r){
	   var startingAngles = [{radians: 0, degrees: 0}].concat(this.absoluteAngles.slice(0, this.absoluteAngles.length - 1));
	  // startingAngles.forEach(function(a){
	  //    console.log("the starting angle: " + a.degrees); 
	  // });
	   
	   this.startingPts = startingAngles.map(function(a){
	       return {x: c.x + r*Math.cos(a.radians), y: c.y - r*Math.sin(a.radians)};
	   });
	   
	   return this; 
	},
	determineEndingPts: function(c,r){
		this.endingPts = this.absoluteAngles.map(function(a){
		   return {x: c.x + r*Math.cos(a.radians), y: c.y - r*Math.sin(a.radians)};
		});
		return this; 
	},
	// c: the center of the pie chart, an object with two properties x and y
	// r: the radius of the pie chart
	drawPieChart: function(c,r){
	//	var arc = { center: c,
	//	            radius: r, 
	//	            startingPt: s, 
	//	            endingPt: e, 
	//	            greaterThan180degrees: arcGreaterThan180,
	//	            xAxisAngle: 0,
	//	            sweep: 0};
		var deltaColor = 1/this.percentages.length; 
		 
		for(var i = 0; i < this.percentages.length; i++)
		{
		      var arcGreaterThan180 = this.relativeAngles[i].degrees > 180 ? 1 : 0; 
		      var arc = {center: c, 
			             radius: r, 
			             startingPt: this.startingPts[i],
			             endingPt: this.endingPts[i],
			             greaterThan180degrees: arcGreaterThan180,
			             xAxisAngle: 0, 
			             sweep: 0};
			             
			  this.paper.drawSector(arc, "rgba(0,0,0," + deltaColor*(i+1) + ")");
		}
		return this; 
	}
}

var SCALING_VALUE = 35;  
var graph = new SimpleGraphs();

// var fn = function(value){ return Math.ceil(value*SCALING_VALUE); };
// create the svg canvas
graph.width("450px")
     .height("270px")
     .containingDiv("programming-skills-bar-graph");
     
graph.bar()
     .orientation("horizontal")
     .setAxisMargins("y","left", 10)
     .setAxisMargins("x","bottom",20)
     .drawAxises("draw x", "draw y")
     .setTickHeight(4)
     .setTickDistance("x",20)
     .drawTicks("x")
     .setBarThickness(25)
     .setData([6.5,9,10.8,5,8.5,5,7])
     .scale(function(value){ return Math.ceil(value*SCALING_VALUE); })
     .setBarMargins(2)
     .drawBars()
     .setDistBtwnLabels(65)
     .setLabels(["Familiar", "Proficient", "Advanced"])
     .makeLabels("x" ,"15px", "Arial")
     .setLabels(["C++", "PHP", "HTML","Java", "CSS", "Javascript", "Python"])
     .addInnerLabels(5, "Arial", "16px");
     
     
var graph2 = new SimpleGraphs();

// set up the canvas 
graph2.width("450px")
      .height("185px")
      .containingDiv("dev-tools-skills-bar-graph");
      
      
graph2.bar()
     .orientation("horizontal")
     .setAxisMargins("y","left", 10)
     .setAxisMargins("x","bottom",20)
     .drawAxises("draw x", "draw y")
     .setTickHeight(4)
     .setTickDistance("x",20)
     .drawTicks("x")
     .setBarThickness(25)
     .setData([6.5,9,10.8,5])
     .scale(function(value){ return Math.ceil(value*SCALING_VALUE); })
     .setBarMargins(2)
     .drawBars()
     .setDistBtwnLabels(65)
     .setLabels(["Familiar", "Proficient", "Advanced"])
     .makeLabels("x" ,"15px", "Arial")
     .setLabels(["Android Development", "Eclipse", "Visual Studio","Git"])
     .addInnerLabels(5, "Arial", "16px");
     
var graph3 = new SimpleGraphs();
graph3.width("200px")
      .height("200px")
      .containingDiv("programming-skills-by-projects");
graph3.pieChart()
      .setData([3,2,4,4,3])
      .calculatePercentages()
      .calculateRelativeAngles()
      .calculateAbsoluteAngles()
      .determineStartingPts({x: 100, y: 100}, 100)
      .determineEndingPts({x: 100, y: 100}, 100)
      .drawPieChart({x: 100, y: 100}, 100);
                    
