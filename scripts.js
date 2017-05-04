var game = new Phaser.Game(1000, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var numberOfShips = 150;
var centerOfMassX;
var centerOfMassY;
var Boids = [];
var neighborDist = 175;
var separationDist = 10;
var turnspeed = 25;
// var parameter = Math.PI * Math.random() / 1.1;
var parameter = 0;
var star;
var velocity = 100;

function randPlusMinus(){
  if (Math.random() > .5){
    return 1;
  } else {
    return -1;
  }
}

//interesting configs
//this forms spirals most of the time but will also form a grid like pattern
//numberOfShips = 200
//neighborDist = 200
//parameter = Math.PI * Math.random() / 1.1

function preload() {
  game.load.image('red-ship', './assets/black-ship.png');
  game.load.image('green-ship', './assets/green-ship.png');
  game.load.image('star', './assets/star.png');
  game.load.image('sky', './assets/sky.jpg')
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.tileSprite(0, 0, game.width, game.height, 'sky');
  function Boid(sprite, neighbors, velocity, rotation, id){
    this.sprite = sprite;

    //set Phaser physics
    this.sprite.scale.setTo(.25, .25);
    game.physics.arcade.enable(this.sprite);
    // this.sprite.body.collideWorldBounds = true;
    this.sprite.anchor.set(0.5);
    this.sprite.body.angularVelocity = 200;
    // this.sprite.body.collideWorldBounds = true;
    //
    // //  By default the Signal is empty, so we create it here:
    // this.sprite.body.onWorldBounds = new Phaser.Signal();
    //
    // //  And then listen for it
    // this.sprite.body.onWorldBounds.add(hitWorldBounds, this);

    function hitWorldBounds(){
      console.log("WALL");
      this.sprite.rotation = this.sprite.rotation - Math.PI;
    }
    //
    this.noNeighbors = true;
    this.id = id;
    this.neighbors = neighbors;
    this.sprite.rotation = rotation;
    this.velocity = velocity;
    this.neighborhoodCenterOfMass;
    this.x = function(){
        return this.sprite.body.center.x;
    }
    this.y = function(){
        return this.sprite.body.center.y;
    }

    this.turn = 0;
    this.neighborCount = function(){
      count = this.neighbors.reduce(function(accumulator, isNeighbor){
        if (isNeighbor) {
          return accumulator + 1;
        } else {
          return accumulator;
        }
      }, 0);

      if (count === 0) {
        this.noNeighbors = true;
        return 1;
      } else {
        this.noNeighbors = false;
        return count;
      }

    }

    this.getNeighbors = function(){
      Boids.forEach(function(boid, i){
        if (Math.abs(this.x() - boid.x()) < neighborDist && Math.abs(this.y() - boid.y()) < neighborDist && this.x !== boid.x && this.y !== boid.y){
          this.neighbors[i] = {
            x: boid.x(),
            y: boid.y(),
            dist: game.physics.arcade.distanceBetween(this.sprite, boid.sprite),
            angle: game.physics.arcade.angleBetween(this.sprite, boid.sprite)
          };
        }
        else {
          this.neighbors[i] = false;
        }
      }, this);
    };
    //returns a phaser point representing the average position of all neighbors
    this.getNeighborhoodCenterOfMass = function(){
      neighborCount = this.neighborCount(this.neighbors);

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

      return new Phaser.Point(neighborhoodCenterOfMassX, neighborhoodCenterOfMassY);
    };
    //returns an angle representing the direction to move away from all neighbors which are too close.
    this.getSeparationAdj = function() {
      // tooCloseCount = this.neighbors.reduce(function(accumulator, neighbor){
      //   if (neighbor && neighbor.dist < separationDist){
      //     return accumulator + 1;
      //   } else {
      //     return accumulator;
      //   }
      // }, 0);

      // return this.neighbors.reduce(function(accumulator, neighbor, i){
      //     if (neighbor && neighbor.dist < separationDist) {
      //       return accumulator + neighbor.angle - 180;
      //     } else {
      //       return accumulator;
      //     }
      //   }, 0) / tooCloseCount;

      this.neighbors.forEach(function(neighbor, i){
        if (neighbor && Math.abs(neighbor.x - this.sprite.x) < separationDist ){
          this.sprite.x = this.sprite.x  + (this.sprite.x - neighbor.x ) / 2;
        }
        if (neighbor && Math.abs(neighbor.y - this.sprite.y) < separationDist ){
          this.sprite.y = this.sprite.y  + (this.sprite.y - neighbor.y ) / 2;
        }

      }, this);



    };
    //returns an angle representing the averaged direction of all neighbors
    this.getNeighborhoodDirection = function(){
      neighborCount = this.neighborCount(this.neighbors);
      return this.neighbors.reduce(function(accumulator, neighbor){
        if (neighbor) {
          return accumulator + neighbor.angle;
        } else {
          return accumulator;
        }
      }, 0) / neighborCount;
    }

    this.turnToAngle = function(angle){

    }

    this.move = function(){
      this.getNeighbors();
      this.neighborCount();
      if (this.noNeighbors) {
        movementAngle = Math.PI * Math.random() * randPlusMinus();
      } else {
        angleToCenterOfMass = game.physics.arcade.angleBetween(this.sprite, this.getNeighborhoodCenterOfMass());
        // separationAdj = this.getSeparationAdj();
        neighborhoodDirection = this.getNeighborhoodDirection();
        // if (separationAdj){
        //   movementAngle = (neighborhoodDirection + angleToCenterOfMass + separationAdj) / 3;
        // } else {
        //   movementAngle = (neighborhoodDirection + angleToCenterOfMass) / 2;
        // }

        movementAngle = (neighborhoodDirection + angleToCenterOfMass) / 2;

        if (this.sprite.rotation < movementAngle ) {
          this.turn = turnspeed;
        } else if (this.sprite.rotation > movementAngle){
          this.turn = -turnspeed;
        }
        else {
          this.turn = 0;
        }
      }

      screenWrap(this.sprite);


    }
  }


  for (var i = 0; i < numberOfShips; i++) {
    Boids[i] = new Boid(game.add.sprite(Math.random() * 1000, Math.random() * 800, 'red-ship'), [], velocity, Math.PI * Math.random() * randPlusMinus(), i);
  }




}


function screenWrap (sprite) {

    if (sprite.x < 0)
    {
        sprite.x = game.width;
    }
    else if (sprite.x > game.width)
    {
        sprite.x = 0;
    }
}

function update() {
  Boids.forEach(function(boid){
    // boid.getSeparationAdj();
    boid.move();
    boid.sprite.body.angularVelocity = boid.turn;
    game.physics.arcade.velocityFromRotation(boid.sprite.rotation, boid.velocity, boid.sprite.body.velocity);
  });
}
