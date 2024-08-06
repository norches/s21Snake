function matrix(m, n) {
  return Array.from(
    {
      length: m,
    },
    () => new Array(n).fill(0)
  );
}

class Grid {
  width = 10;
  height = 10;
  snake = null; // [{xy},{xy},{xy}]
  direction = "Right"; //Down, Left , Up
  element = null;
  game_interval = null;
  game_listener = null;
  food = this.getRandomCoordinates();

  getRandomCoordinates() {
    return {
      x: Math.floor(Math.random() * (this.width - 1)),
      y: Math.floor(Math.random() * (this.height - 1)),
    };
  }

  nextHeadCoordinate() {
    if (this.direction == "Right") {
      return { x: (this.snake[0].x + 1) % this.width, y: this.snake[0].y };
    }
    if (this.direction == "Left") {
      if (this.snake[0].x - 1 < 0) {
        const newX = this.width - 1;
        return {
          x: newX,
          y: this.snake[0].y,
        };
      }
      return {
        x: this.snake[0].x - 1,
        y: this.snake[0].y,
      };
    }
    if (this.direction == "Down") {
      return { x: this.snake[0].x, y: (this.snake[0].y + 1) % this.height };
    }
    if (this.direction == "Up") {
      if (this.snake[0].y - 1 < 0) {
        const newY = this.height - 1;
        return {
          x: this.snake[0].x,
          y: newY,
        };
      }
      return {
        x: this.snake[0].x,
        y: this.snake[0].y - 1,
      };
    }
  }

  // Возвращает false если после движения наступили в тело
  move() {
    let previousCellCoordinate = this.snake[0];
    const nextCoordinate = this.nextHeadCoordinate();
    if (
      this.snake.find(
        (coord) => coord.x == nextCoordinate.x && coord.y == nextCoordinate.y
      )
    ) {
      return false;
    }
    this.snake[0] = nextCoordinate;
    if (this.snake.length > 0) {
      for (let coord = 1; coord < this.snake.length; coord++) {
        let tmp = this.snake[coord];
        this.snake[coord] = previousCellCoordinate;
        previousCellCoordinate = tmp;
      }
    }
    return true;
  }

  drawGrid() {
    const table = document.createElement("table");

    this.element.appendChild(table);
    for (let i = 0; i < this.width; i++) {
      const tr = document.createElement("tr");
      table.appendChild(tr);

      for (let j = 0; j < this.height; j++) {
        const td = document.createElement("td");
        td.classList.add(this.getCellClassName(this.matrix[j][i]));
        tr.appendChild(td);
      }
    }
  }

  clearMatrix() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.matrix[i][j] = 0;
      }
    }
  }

  getCellClassName(state) {
    if (state === 0) return "empty-cell";
    if (state === 1) return "snake-cell";
    if (state === 2) return "snake-head";
    if (state === 3) return "food-cell";
  }

  changeDirection(newDirection) {
    if (
      (this.direction == "Left" || this.direction == "Right") &&
      (newDirection === "Left" || newDirection === "Right")
    )
      return;
    if (
      (this.direction == "Up" || this.direction == "Down") &&
      (newDirection === "Up" || newDirection === "Down")
    )
      return;
    this.direction = newDirection;
  }

  setUpListeners() {
    this.game_listener = document.addEventListener("keyup", (e) => {
      if (e.key == "ArrowUp") {
        this.changeDirection("Up");
      }
      if (e.key == "ArrowDown") {
        this.changeDirection("Down");
      }
      if (e.key == "ArrowRight") {
        this.changeDirection("Right");
      }
      if (e.key == "ArrowLeft") {
        this.changeDirection("Left");
      }
      if (e.key == "p") {
        clearInterval(this.game_interval);
      }
    });
  }

  generateFood() {
    let randCoordinates = this.getRandomCoordinates();
    while (
      this.snake.find(
        (s) => s.x == randCoordinates.x && s.y == randCoordinates.y
      )
    ) {
      randCoordinates = this.getRandomCoordinates();
    }
    this.food.x = randCoordinates.x;
    this.food.y = randCoordinates.y;
  }

  updateState() {
    this.element.innerHTML = "";
    this.clearMatrix();

    if (this.move() === false) {
      console.log("GAME OVER");
      this.element.innerHTML = "GAME OVER";
      clearInterval(this.game_interval);
      return;
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        //нахождение змеи
        const snakeCellIndex = this.snake.findIndex(
          (piece) => piece.x == i && piece.y == j
        );
        if (snakeCellIndex >= 0) {
          this.matrix[i][j] = 1;
          if (snakeCellIndex === 0) {
            this.matrix[i][j] = 2;
          }
        }

        //нахождение змеи над едой
        if (this.food) {
          //нахождение еды
          const hasFoodInThisCell = this.food.x == i && this.food.y == j;
          if (hasFoodInThisCell) {
            this.matrix[i][j] = 3;
          }

          if (
            this.food.x == this.snake[0].x &&
            this.food.y === this.snake[0].y
          ) {
            this.generateFood();
            const nextCoords = this.nextHeadCoordinate();
            this.snake.unshift(nextCoords);
          }
        }
      }
    }

    this.drawGrid();
  }

  constructor(element, width, height) {
    this.element = element;
    this.width = width || this.width;
    this.height = height || this.height;
    this.matrix = matrix(this.width, this.height);

    this.snake = [
      {
        x: Math.floor((this.width - 1) / 2),
        y: Math.floor((this.height - 1) / 2),
      },
      {
        x: Math.floor((this.width - 1) / 2) - 1,
        y: Math.floor((this.height - 1) / 2),
      },
      // { x: Math.floor(this.width / 2) - 2, y: Math.floor(this.height / 2) },
      // { x: Math.floor(this.width / 2) - 3, y: Math.floor(this.height / 2) },
      // { x: Math.floor(this.width / 2) - 4, y: Math.floor(this.height / 2) },
      // { x: Math.floor(this.width / 2) - 5, y: Math.floor(this.height / 2) },
    ];
    this.generateFood();
    this.game_interval = setInterval(() => {
      this.updateState();
    }, 250);
    this.setUpListeners();
  }
}
const grid_element = document.getElementById("grid-element");

const game_grid = new Grid(grid_element, 6, 6);
