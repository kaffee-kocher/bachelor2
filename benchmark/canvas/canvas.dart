import 'dart:html'; 
import 'dart:math';

List<Circle> circles = [];
Map time;
Map config;

class Performance {
  Stopwatch stopwatch;

  Performance() {
    stopwatch = new Stopwatch()
      ..start();
  }

  double now() => (stopwatch.elapsedMicroseconds / 1000);
}

Performance performance = new Performance();

class Vector {
  double x;
  double y;

  Vector(double this.x, double this.y);

  double length() => sqrt(this.x * this.x + this.y * this.y);

  double getVectorMultiplication(Vector v) => (this.x * v.x + this.y * v.y);

  void normalize() {
    double length = this.length();
    this.x /= length;
    this.y /= length;
  }
}

class Circle {
  Vector position;
  Vector velocity;
  double radius;
  double mass;

  Circle(double x, double y, double this.radius) {
    Random rnd = new Random();

    this.position = new Vector(x, y);
    this.velocity = new Vector(rnd.nextDouble(), rnd.nextDouble());
    this.mass = this.radius;
  }

  bool isCollision(Circle crl) {
    Vector distance_vector = new Vector(this.position.x - crl.position.x, this.position.y - crl.position.y);
    double radius_sum = this.radius + crl.radius;
    double vector_length = distance_vector.length();

    return (vector_length < radius_sum);
  }

  void updatePosition(double delta_time) {
    this.position.x += this.velocity.x * delta_time;
    this.position.y += this.velocity.y * delta_time;
    this.draw(); 
  }

  void draw() {
    
    var image = document.query('#image');
    var ctx = image.getContext("2d");
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * PI);
    ctx.fill();
  }
}


var image = document.query('#image');
var ctx = image.getContext("2d");

update(num delta) { 
  time['delta'] = performance.now() - time['old'];
  time['old'] = performance.now();
  time['last_frame'] = (performance.now() / config['fps']).floor();
  double calc_time = performance.now();
  int count_collision = 0;

  
  ctx.clearRect(0, 0, config['canvas']['width'], config['canvas']['height']);

  for (int i = 0; i < config['circles_number']; i++) {
    Circle current_circle = circles[i];
    current_circle.updatePosition(time['delta']);

    if (((current_circle.position.x + current_circle.radius) >= config['canvas']['width']) && (current_circle.velocity.x > 0)) {
      current_circle.velocity.x *= -1;
      current_circle.position.x = config['canvas']['width'] - current_circle.radius - 0.01;
      count_collision++;
    }

    if ((current_circle.position.x <= current_circle.radius) && (current_circle.velocity.x < 0)) {
      current_circle.velocity.x *= -1;
      current_circle.position.x = current_circle.radius + 0.01;
      count_collision++;
    }

    if (((current_circle.position.y + current_circle.radius) >= config['canvas']['height']) && (current_circle.velocity.y > 0)) {
      current_circle.velocity.y *= -1;
      current_circle.position.y = config['canvas']['height'] - current_circle.radius - 0.01;
      count_collision++;
    }

    if ((current_circle.position.y <= current_circle.radius) && (current_circle.velocity.y < 0)) {
      current_circle.velocity.y *= -1;
      current_circle.position.y = current_circle.radius + 0.01;
      count_collision++;
    }

    for (int j = i + 1; j < config['circles_number']; j++) {
      if (current_circle.isCollision(circles[j])) {
        count_collision++;
        Circle opponent_circle = circles[j];


        Vector distance_normal = new Vector(current_circle.position.x - opponent_circle.position.x, current_circle.position.y - opponent_circle.position.y);
        distance_normal.normalize();
        Vector tangent = new Vector(distance_normal.y, -distance_normal.x);
        double mass_sum = current_circle.mass + opponent_circle.mass;

        Vector current_velocity_normal = new Vector(distance_normal.x * current_circle.velocity.getVectorMultiplication(distance_normal), distance_normal.y * current_circle.velocity.getVectorMultiplication(distance_normal));
        Vector current_velocity_tangent = new Vector(tangent.x * current_circle.velocity.getVectorMultiplication(tangent), tangent.y * current_circle.velocity.getVectorMultiplication(tangent));

        Vector opponent_velocity_normal = new Vector(distance_normal.x * opponent_circle.velocity.getVectorMultiplication(distance_normal), distance_normal.y * opponent_circle.velocity.getVectorMultiplication(distance_normal));
        Vector opponent_velocity_tangent = new Vector(tangent.x * opponent_circle.velocity.getVectorMultiplication(tangent), tangent.y * opponent_circle.velocity.getVectorMultiplication(tangent));

        current_circle.velocity.x = current_velocity_tangent.x + distance_normal.x * ((current_circle.mass - opponent_circle.mass) / mass_sum * current_velocity_normal.length() + 2 * opponent_circle.mass / mass_sum * opponent_velocity_normal.length());
        current_circle.velocity.y = current_velocity_tangent.y + distance_normal.y * ((current_circle.mass - opponent_circle.mass) / mass_sum * current_velocity_normal.length() + 2 * opponent_circle.mass / mass_sum * opponent_velocity_normal.length());

        opponent_circle.velocity.x = opponent_velocity_tangent.x - distance_normal.x * ((opponent_circle.mass - current_circle.mass) / mass_sum * opponent_velocity_normal.length() + 2 * current_circle.mass / mass_sum * current_velocity_normal.length());
        opponent_circle.velocity.y = opponent_velocity_tangent.y - distance_normal.y * ((opponent_circle.mass - current_circle.mass) / mass_sum * opponent_velocity_normal.length() + 2 * current_circle.mass / mass_sum * current_velocity_normal.length());


        current_circle.position.x += current_circle.velocity.x;
        opponent_circle.position.x += opponent_circle.velocity.x;
      }
    }
    current_circle.draw(); 
  }
  window.animationFrame.then(update); 
}

//void main(List<String> args) { 
void main() {
  RegExp check_number = new RegExp(r"^\d+$");
  int end_time = 10; 
  Random rnd = new Random();

  bool isContainTime(String option) {
    return (option == "end_time");
  }

  List<String> args = []; 
  if (args.isNotEmpty) {
    if (args[0].contains(check_number)) {
      end_time = int.parse(args[0]);
    }
  }

  time = {
      'last_frame': 0,
      'delta': 0,
      'old': 0,
      'end': 0
  };

  config = {
      'circles_number': 400,
      'end': end_time * 1000,
      'radiusMin': 1,
      'radiusMax': 10,
      'fps': 1000 / 60,
      'canvas': {
          'width': 720,
          'height': 480
      }
  };

  for (int i = 0; i < config['circles_number']; i++) {
    double radius = (rnd.nextDouble() * (config['radiusMax'] - config['radiusMin'] + 1)) + config['radiusMin'];
    double x = (rnd.nextDouble() * ((config['canvas']['width'] - radius) - radius + 1)) + radius;
    double y = (rnd.nextDouble() * ((config['canvas']['height'] - radius) - radius + 1)) + radius;

    Circle circle_candidate = new Circle(x, y, radius);
    bool is_no_collision = true;
    for (int j = 0; j < i; j++) {
      if (circle_candidate.isCollision(circles[j])) {
        is_no_collision = false;
        --i;
        break;
      }
    }

    if (is_no_collision) {
      circles.add(circle_candidate);
      circle_candidate.draw();  
    }
  }


  time['end'] = (performance.now() + config['end']);
  time['last_frame'] = (performance.now() / config['fps']).floor();
  time['old'] = performance.now();
  window.animationFrame.then(update);
//  while (true) {
//    if ((performance.now() / config['fps']).floor() > time['last_frame']) {
//      update();
//    }
//
//    if (time['end'] < performance.now()) {
//      break;
//    }
//  }
}


