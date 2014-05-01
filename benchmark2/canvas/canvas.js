(function() {
    "use strict";

    var ctx, config, circles, time, count_collision;

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
            return self;
        };

        this.getVectorMultiplication = function(vector) {
            return (self.x * vector.x + self.y * vector.y);
        };
    };

    var Circle = function(x, y, radius) {
        var self = this;
        this.position = new Vector(x, y);
        this.velocity = new Vector(Math.random()/10, Math.random()/10);
        this.radius = radius;
        this.mass = this.radius;

        /**
         * Draw circle on canvas
         */
        this.draw = function() {
            ctx.beginPath();
            ctx.arc(self.position.x, self.position.y, self.radius, 0, 2 * Math.PI);
            ctx.fill();
        };

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
        var opponent_circle, distance_normal, tangent, mass_sum, current_velocity_normal, current_velocity_tangent, opponent_velocity_normal, opponent_velocity_tangent, i, j, current_circle;
        time.delta = window.performance.now() - time.old;
        time.old = window.performance.now();
        ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);

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
                    opponent_circle.position.x += opponent_circle.velocity.x;
                }
            }
            current_circle.draw();
        }
        window.requestAnimationFrame(update);
    };

    var start = function() {
        var radius, x, y, circle_candidate, isNoCollision, i, j;
        var canvas = document.getElementById("image");
        ctx = canvas.getContext('2d');
        circles = [];
        count_collision = 0;

        time = {
            old: 0,
            delta: 0
        };

        config = {
            'circles_number': 400,
            'radiusMin': 1,
            'radiusMax': 10,
            'canvas': {
                'width': canvas.width,
                'height': canvas.height
            }
        };

        for (i = 0; i < config.circles_number; i++) {
            radius = (Math.random() * (config.radiusMax - config.radiusMin + 1)) + config.radiusMin;
            x = (Math.random() * ((config.canvas.width - radius) - radius + 1)) + radius;
            y = (Math.random() * ((config.canvas.height - radius) - radius + 1)) + radius;

            circle_candidate = new Circle(x, y, radius);
            isNoCollision = true;
            for (j = 0; j < i; j++) {
                if (circle_candidate.isCollision(circles[j])) {
                    isNoCollision = false;
                    --i;
                    break;
                }
            }

            if (isNoCollision) {
                circle_candidate.draw();
                circles.push(circle_candidate);
            }
        }
        time.old = window.performance.now();
        window.requestAnimationFrame(update);
    };

    window.addEventListener('load', start);
}());