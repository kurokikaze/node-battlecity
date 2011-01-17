exports = {
        crawler: {
            speed: 1,
            direction: 's',
            mindset: function(map, players) {
                // Этот танк просто сворачивает, сталкиваясь со стеной, и стреляет как только сможет
                // Должен быть одним из самых слабых противников, но может быть опасным в больших количествах
                var direction =  this.getDir();
                switch (direction) {
                    case 'u':
                        if (map.getMapSquare(this.getX(), this.getY() - 1) != ' ') {
                            direction = 'r';
                        }
                        break;
                    case 'd':
                        if (map.getMapSquare(this.getX(), this.getY() + 1) != ' ') {
                            direction = 'l';
                        }
                        break;
                    case 'l':
                        if (map.getMapSquare(this.getX() - 1 , this.getY() - 1) != ' ') {
                            direction = 'u';
                        }
                        break;
                    case 'r':
                        if (map.getMapSquare(this.getX() + 1, this.getY() - 1) != ' ') {
                            direction = 'd';
                        }
                        break;
                }
                return {'turn':direction, 'move': true, 'shoot': (this.getHeat() == 0)};
            }
        },
        runner: {
            speed: 2,
            mindset: function(map, players) {}
        },
        heavy: {
            speed: 1,
            mindset: function(map, players) {}
        },
        hunter: {
            speed: 1,
            mindset: function(map, players) {}
        },
        digger: {
            speed: 1,
            mindset: function(map, players) {}
        },
        vindicator: {
            speed: 1,
            mindset: function(map, players) {}
        }
    };