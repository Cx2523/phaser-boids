var game = new Phaser.Game(1000, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var numberOfShips = 400;
var centerOfMassX;
var centerOfMassY;
var Boids = [];
var neighborDist = 200;
var parameter = Math.PI * Math.random() / 1.1;
// var parameter = 0;
var star;

//interesting configs
//this forms spirals most of the time but will also form a grid like pattern
//numberOfShips = 200
//neighborDist = 200
//parameter = Math.PI * Math.random() / 1.1


function pythag(a, b) {
  return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
}

function preload() {
  game.load.image('red-ship', './assets/circle.png');
  game.load.image('green-ship', './assets/green-ship.png');
  game.load.image('star', './assets/star.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  function Boid(sprite, neighbors, velocity, acceleration, id){
    this.sprite = sprite;

    //set Phaser physics
    this.sprite.scale.setTo(.25, .25);
    game.physics.arcade.enable(this.sprite);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.anchor.set(0.5);
    //
    this.id = id;
    // this.x = this.sprite.body.center.x;
    // this.y = this.sprite.body.center.y;
    this.neighbors = neighbors;
    this.rotation = this.sprite.body.rotation;
    this.velocity = velocity;
    this.accleration = acceleration;
    this.neighborhoodCenterOfMass;
    // && this.x !== boid.x && this.y !== boid.y
    this.getNeighbors = function(){
      Boids.forEach(function(boid, i){
        if (Math.abs(this.x() - boid.x()) < neighborDist && Math.abs(this.y() - boid.y()) < neighborDist){
          this.neighbors[i] = true;
        }
        else {
          this.neighbors[i] = false;
        }
      }, this);
    };

    this.x = function(){
      return this.sprite.body.center.x;
    }

    this.y = function(){
      return this.sprite.body.center.y;
    }

    this.getNeighborhoodCenterOfMass = function(){
      // if(star){
      //   star.destroy();
      // };

      neighborCount = this.neighbors.reduce(function(accumulator, isNeighbor){
        if (isNeighbor) {
          return accumulator + 1;
        } else {
          return accumulator;
        }
      }, 0);

      neighborhoodCenterOfMassX =
        this.neighbors.reduce(function(accumulator, isNeighbor, i){
          if (isNeighbor) {
            return Boids[i].x() + accumulator;
          } else {
            return accumulator;
          }
        }, 0) / neighborCount;

      neighborhoodCenterOfMassY =
        this.neighbors.reduce(function(accumulator, isNeighbor, i){
          if (isNeighbor) {
            return Boids[i].y() + accumulator;
          } else {
            return accumulator;
          }
        }, 0) / neighborCount;

      // star = game.add.sprite(neighborhoodCenterOfMassX, neighborhoodCenterOfMassY, 'star');
      // star.anchor.set(0.5);
      this.neighborhoodCenterOfMass = new Phaser.Point(neighborhoodCenterOfMassX, neighborhoodCenterOfMassY);

    };

    this.moveToCenterOfMass = function() {

      this.sprite.rotation = game.physics.arcade.angleBetween(this.sprite, this.neighborhoodCenterOfMass) + parameter;
      if (game.physics.arcade.distanceBetween(this.sprite, this.neighborhoodCenterOfMass) > 20 ) {
        game.physics.arcade.accelerationFromRotation(this.sprite.rotation, 300, this.sprite.body.velocity);
      } else {
        game.physics.arcade.accelerationFromRotation(this.sprite.rotation, 0, this.sprite.body.velocity);
      }
    };

  }

  for (var i = 0; i < numberOfShips; i++) {
    Boids[i] = new Boid(game.add.sprite(Math.random() * 1000, Math.random() * 800, 'red-ship'), [], 0, 0, i);
  }


}


// var counter = 0;

function update() {

    Boids.forEach(function(boid){
      boid.getNeighbors();
      boid.getNeighborhoodCenterOfMass();
      boid.moveToCenterOfMass();
    });
}
