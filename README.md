# Background

Record is a sound visualizer app that uses Web Audio API in conjunction with JavaScript, Canvas, and CSS3 to visualize audio input. This project utilizes Web Audio API to play the audio file and analyze the frequencies of the audio input. Using the Audio Context, I have created the Analyzer Node to generate real-time frequency and time-domain analysis information of the audio file. The processed data was used to dynamically render frequency response graphics using Canvas and JavaScript. 

# Technologies Used

* JavaScript
* HTML5
* CSS3
* Canvas 
* [HTML5] Web Audio API

# Functionality

### Overlapping graphics using Canvas

Produced groups of multiple circles with varying radii and opacity to create faded effects. In order to prevent clutter on the canvas, I optimized the frequency ranges and only drew circles with higher frequencies. I applied random colors for each frequency data to create eye-catching visualizations and enhance user experience. 



### Circular graphics that produce 2D motion effects

In addition to using Canvas to produce graphics, I utilized JavaScript's interactive capabilities and directly modified stylings of individual web elements in the DOM to develop circular graphics that produced 2D animated motion effects. I assigned custom colors for groups of circles within certain frequency ranges to enhance animated effects. Additionally, I hid circles with lower frequencies and allowed only higher frequencies to show in order to prevent clutter.
