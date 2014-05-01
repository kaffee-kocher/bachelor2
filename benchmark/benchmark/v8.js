(function() {
    "use strict";

    var config, circles, time, count_collision;

    var Vector = function(x, y) {
        var self = this;
        this.y = y;
        this.x = x;

        this.length = function() {
            return Math.sqrt(self.x * self.x + self.y * self.y);
        };

        this.normalize = function() {
            var length = self.length();
            self.x /= length;
            self.y /= length;
        };

        this.getVectorMultiplication = function(vector) {
            return (self.x * vector.x + self.y * vector.y);
        };
    };

    var Circle = function(x, y, radius) {
        var self = this;
        this.position = new Vector(x, y);
        this.velocity = new Vector(Math.random(), Math.random());
        this.radius = radius;
        this.mass = this.radius;

        /**
         * Check collision
         */
        this.isCollision = function(circle) {
            var distance_vector = new Vector(self.position.x - circle.position.x, self.position.y - circle.position.y);
            var radius_sum = self.radius + circle.radius;
            var vector_length = distance_vector.length();

            return (vector_length < radius_sum);
        };

        /**
         * Update position
         */
        this.updatePosition = function(delta_time) {
            self.position.x += self.velocity.x * delta_time;
            self.position.y += self.velocity.y * delta_time;
        };
    };

    var update = function() {
        calc_time = performance.now();  
        time.delta = performance.now() - time.old;
        time.old = performance.now();
        time.last_frame = ~~(performance.now() / config.fps);
        

        var opponent_circle, distance_normal, tangent, mass_sum, current_velocity_normal, current_velocity_tangent, opponent_velocity_normal, opponent_velocity_tangent, i, j, current_circle, calc_time, now;
        count_collision = 0;

        for (i = 0; i < config.circles_number; i++) {
            current_circle = circles[i];
            current_circle.updatePosition(time.delta);

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

            for (j = i + 1; j < config.circles_number; j++) {
                if (current_circle.isCollision(circles[j])) {
                    count_collision++;
                    opponent_circle = circles[j];
                    

                    distance_normal = new Vector(current_circle.position.x - opponent_circle.position.x, current_circle.position.y - opponent_circle.position.y);
                    distance_normal.normalize();
                    tangent = new Vector(distance_normal.y, -distance_normal.x);
                    mass_sum = current_circle.mass + opponent_circle.mass;

                    current_velocity_normal = new Vector(distance_normal.x * current_circle.velocity.getVectorMultiplication(distance_normal), distance_normal.y * current_circle.velocity.getVectorMultiplication(distance_normal));
                    current_velocity_tangent = new Vector(tangent.x * current_circle.velocity.getVectorMultiplication(tangent), tangent.y * current_circle.velocity.getVectorMultiplication(tangent));

                    opponent_velocity_normal = new Vector(distance_normal.x * opponent_circle.velocity.getVectorMultiplication(distance_normal), distance_normal.y * opponent_circle.velocity.getVectorMultiplication(distance_normal));
                    opponent_velocity_tangent = new Vector(tangent.x * opponent_circle.velocity.getVectorMultiplication(tangent), tangent.y * opponent_circle.velocity.getVectorMultiplication(tangent));

                    current_circle.velocity.x = current_velocity_tangent.x + distance_normal.x * ((current_circle.mass - opponent_circle.mass) / mass_sum * current_velocity_normal.length() + 2 * opponent_circle.mass / mass_sum * opponent_velocity_normal.length());
                    current_circle.velocity.y = current_velocity_tangent.y + distance_normal.y * ((current_circle.mass - opponent_circle.mass) / mass_sum * current_velocity_normal.length() + 2 * opponent_circle.mass / mass_sum * opponent_velocity_normal.length());

                    opponent_circle.velocity.x = opponent_velocity_tangent.x - distance_normal.x * ((opponent_circle.mass - current_circle.mass) / mass_sum * opponent_velocity_normal.length() + 2 * current_circle.mass / mass_sum * current_velocity_normal.length());
                    opponent_circle.velocity.y = opponent_velocity_tangent.y - distance_normal.y * ((opponent_circle.mass - current_circle.mass) / mass_sum * opponent_velocity_normal.length() + 2 * current_circle.mass / mass_sum * current_velocity_normal.length());


                    current_circle.position.x += current_circle.velocity.x;
                    current_circle.position.y += current_circle.velocity.y;
                    
                    opponent_circle.position.x += opponent_circle.velocity.x;
                    opponent_circle.position.y += opponent_circle.velocity.y;
                }
            }
        }
        now = performance.now();
        print(now, ((now - calc_time) / count_collision), count_collision);
    };

    var start = function() {
        var radius, x, y, circle_candidate, is_no_collision, i, j;
        circles = [];
        count_collision = 0;

        time = {
            'last_frame': 0,
            'delta': 0,
            'old': 0,
            'end': 0
        };

        config = {
            'circles_number': 400,
            'end': end_time*1000,
            'radiusMin': 1,
            'radiusMax': 10,
            'fps': 1000 / 60,
            'canvas': {
                'width': 720,
                'height': 480
            }
        };

        for (i = 0; i < config.circles_number; i++) {
            radius = (Math.random() * (config.radiusMax - config.radiusMin + 1)) + config.radiusMin;
            x = (Math.random() * ((config.canvas.width - radius) - radius + 1)) + radius;
            y = (Math.random() * ((config.canvas.height - radius) - radius + 1)) + radius;

            circle_candidate = new Circle(x, y, radius);
            is_no_collision = true;
            for (j = 0; j < i; j++) {
                if (circle_candidate.isCollision(circles[j])) {
                    is_no_collision = false;
                    --i;
                    break;
                }
            }

            if (is_no_collision) {
                circles.push(circle_candidate);
            }
        }

        time.end = (performance.now() + config.end);
        time.last_frame = ~~(performance.now() / config.fps);
        while (true) {
            if (~~(performance.now() / config.fps) > time.last_frame) {
                update();
            }

            if (time.end < performance.now()) {
                break;
            }
        }
    };

    start();
}());