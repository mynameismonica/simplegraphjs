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
	/*=======================================================================	
	   Function lets users draw lines on the canvas
	   Input: 1) startingPt: An object that represents a point on a 
	                         Cartesian graph. It has two data members, x and 
	                         y. Both of the data members are integers. It
	                         represents the starting point of the line.
	          2) endingPt: An object that represents a point in Cartesian 
	                       graph. It represents the ending point in the graph. 
	                       Like the previous parameter, it has two data 
	                       members, x and y, and both of the data members are
	                       integers. 
	          3) strokeColor: A string that represents a color. This 
	                          can be a hex code, or a color name (for common
	                          colors, like black).
	          4) className: A name of a class 
	          5) containerName: The name of the container this class is in. 
	=======================================================================*/

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
	drawText: function(pt,fontFamily,fontSize, text){
		var t = document.createElementNS(this.namespace, "text");
	    t.setAttribute("x", pt.x);
	    t.setAttribute("y", pt.y);
	    t.setAttribute("font-family",fontFamily);
	    t.setAttribute("font-size", fontSize);
	    
        var textNode = document.createTextNode(text);
        t.appendChild(textNode);
	    
		this.canvas.containers[this.currContainer].appendChild(t);
		
		var range = document.createRange();
		range.selectNodeContents(textNode);
		var rects = range.getClientRects();
		this.textSizes.push(rects[0].width);
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
			                   this.labelSets[this.labelSets.length-1][i]);
	  }	                       
	   
	 //  this.paper.getRidOfTextSizes();
	   return this; 
	}
}

var SCALING_VALUE = 30;  
var graph = new SimpleGraphs();

// var fn = function(value){ return Math.ceil(value*SCALING_VALUE); };
// create the svg canvas
graph.width("400px")
     .height("225px")
     .containingDiv("programming-skills-bar-graph");
     
graph.bar()
     .orientation("horizontal")
     .setAxisMargins("y","left", 25)
     .setAxisMargins("x","bottom",20)
     .drawAxises("draw x", "draw y")
     .setTickHeight(4)
     .setTickDistance("x",20)
     .drawTicks("x")
     .setBarThickness(25)
     .setData([5,7,9,5,8.5,5])
     .scale(function(value){ return Math.ceil(value*SCALING_VALUE); })
     .setBarMargins(2)
     .drawBars()
     .setDistBtwnLabels(65)
     .setLabels(["Familiar", "Proficient", "Advanced"])
     .makeLabels("x" ,"11px", "Arial");
     