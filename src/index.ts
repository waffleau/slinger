import { degToRad, init, initKeys, keyPressed, radToDeg, GameLoop, Scene, Sprite } from "kontra";

init();
initKeys();

let image = new Image();
image.src = require("../assets/rocket.png").default;
image.onload = startGame;

// How much force the player's thrust adds
const PLAYER_THRUST = 0.1;

function createPlanet(radius: number, x: number, y: number) {
  const gravityFieldRange = radius * 4.0;
  const gravityForce = 0.05;

  const gravityFieldSprite = Sprite({
    x,
    y,
    color: "#004",
    anchor: { x: 0.5, y: 0.5 },
    radius: gravityFieldRange,

    render: function () {
      this.context.fillStyle = this.color;
      this.context.beginPath();
      this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
      this.context.fill();
    },
  });

  return Sprite({
    x,
    y,
    color: "#00f",
    anchor: { x: 0.5, y: 0.5 },
    radius,
    gravityFieldRange,
    gravityFieldSprite,
    gravityForce,

    render: function () {
      this.context.fillStyle = this.color;
      this.context.beginPath();
      this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
      this.context.fill();
    },
  });
}

// Applies thrust in the direction the player is facing
function forwardThrust(player: Sprite) {
  let rotation = radToDeg(player.rotation) % 360;
  let rotX = 0;
  let rotY = 0;

  rotation = rotation > 180 ? -360 + rotation : rotation;
  rotation = rotation < -180 ? 360 + rotation : rotation;

  if (rotation >= 0 && rotation < 90) rotX = 1 - rotation / 90;
  if (rotation >= 90 && rotation < 180) rotX = -((rotation % 90) / 90);
  if (rotation >= -90 && rotation < 0) rotX = 1 + rotation / 90;
  if (rotation >= -180 && rotation < -90) rotX = (rotation % 90) / 90;

  if (rotation >= 0 && rotation < 90) rotY = rotation / 90;
  if (rotation >= 90 && rotation < 180) rotY = 1 - (rotation % 90) / 90;
  if (rotation >= -90 && rotation < 0) rotY = rotation / 90;
  if (rotation >= -180 && rotation < -90) rotY = -(1 + (rotation % 90) / 90);

  player.dx += rotX * PLAYER_THRUST;
  player.dy += rotY * PLAYER_THRUST;
}

function startGame() {
  const player = Sprite({
    x: 16,
    y: 16,
    height: 32,
    width: 32,
    anchor: { x: 0.5, y: 0.5 },
    image,

    update: function () {
      if (keyPressed("left")) {
        this.rotation -= degToRad(4);
      }

      if (keyPressed("right")) {
        this.rotation += degToRad(4);
      }

      if (keyPressed("up")) {
        forwardThrust(this);
      }

      this.advance();
    },
  });

  const planets = [createPlanet(100, 300, 300), createPlanet(100, 700, 500)];

  const scene = Scene({
    id: "game",
    children: [...planets.map((planet) => planet.gravityFieldSprite), ...planets, player],
    cullObjects: false,
  });

  const calculateRocketVelocity = () => {
    const rx = player.x;
    const ry = player.y;

    let deltaX = player.dx;
    let deltaY = player.dy;

    planets.forEach((planet) => {
      const px = planet.x;
      const py = planet.y;
      const distanceRatio = Math.hypot(rx - px, ry - py) / planet.gravityFieldRange;
      console.log(distanceRatio);
      const gravityScale = distanceRatio > 0 && distanceRatio < 1 ? 1 - Math.pow(distanceRatio, 3) : 0;
      const flipX = rx < px ? 1 : -1;
      const flipY = ry < py ? 1 : -1;

      deltaX += flipX * gravityScale * planet.gravityForce;
      deltaY += flipY * gravityScale * planet.gravityForce;
    });

    player.dx = deltaX;
    player.dy = deltaY;
  };

  const loop = GameLoop({
    update: function () {
      calculateRocketVelocity();

      scene.update();
      scene.lookAt(player);
    },
    render: function () {
      scene.render();
    },
  });

  loop.start();
}
