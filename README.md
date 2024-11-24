This is an implementation of the Vicsek Model of the collective motion of populations of organisms, created in Javascript, using the p5js library. The user designates world size by way of the canvas size, and population count, thereby determining a population density. The organisms move around and at each time step calculate the average velocity of their neighbors, within their radius of awareness (interaction radius), and then align their own motion with those neighbors, then some noise is added to create some imprecision in their alignment. For various parameter combinations different flocking behaviors emerge. The simulation tracks an order parameter which quantifies global degree of alignment. By running ensembles of these simulations for different values of noise and population density, and tracking the trajectory of the order parameter, you can study nature of phase transitions in collective motion. There are sliders to dynamically play with the parameters. Additionally, the recent path history of each organism is displayed. Have fun!
