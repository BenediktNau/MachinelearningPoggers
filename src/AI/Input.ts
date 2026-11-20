type Vector = number[];
type Matrix = number[][];

export interface NetworkData {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  w1: Matrix;
  b1: Vector;
  w2: Matrix;
  b2: Vector;
}

export class DrivingNetwork {
  readonly inputSize: number;
  readonly hiddenSize: number;
  readonly outputSize: number;

  private w1: Matrix; // [hidden][input]
  private b1: Vector;
  private w2: Matrix; // [output][hidden]
  private b2: Vector;

  constructor(hiddenSize = 11, inputSize = 11, outputSize = 2) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;

    this.w1 = DrivingNetwork.randomMatrix(hiddenSize, inputSize);
    this.b1 = new Array(hiddenSize).fill(0);
    this.w2 = DrivingNetwork.randomMatrix(outputSize, hiddenSize);
    this.b2 = new Array(outputSize).fill(0);
  }
  //Initialisieren mit random Werten um halt individualism zu erhalen
  private static randomMatrix(rows: number, cols: number): Matrix {
    const limit = Math.sqrt(6 / (rows + cols));
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() * 2 - 1) * limit)
    );
  }

  private checkInput(x: Vector): void {
    if (x.length !== this.inputSize) {
      throw new Error(`Erwartet ${this.inputSize} Eingaben, erhalten ${x.length}`);
    }
  }

  private forward(x: Vector): { hidden: Vector; output: Vector } {
    const hidden = this.w1.map((row, j) =>
      Math.tanh(row.reduce((sum, w, i) => sum + w * x[i], this.b1[j]))
    );

    const output = this.w2.map((row, k) =>
      Math.tanh(row.reduce((sum, w, j) => sum + w * hidden[j], this.b2[k]))
    );

    return { hidden, output };
  }

  //output der beiden werte (Gas und lenken)
  predict(x: Vector): Vector {
    this.checkInput(x);
    return this.forward(x).output;
  }

  //Gewichte kopieren weitergeben
  clone(): DrivingNetwork {
    return DrivingNetwork.fromJSON(this.toJSON());
  }

  //Zufalls Rotation der Gewichte, damit man überhaupt entwicklung hat (survival of the fittest)
  mutate(rate: number, strength: number): this {
    const m = (w: number) =>
      Math.random() < rate ? w + (Math.random() * 2 - 1) * strength : w;
    this.w1 = this.w1.map((row) => row.map(m));
    this.b1 = this.b1.map(m);
    this.w2 = this.w2.map((row) => row.map(m));
    this.b2 = this.b2.map(m);
    return this;
  }


  //Export
  toJSON(): NetworkData {
    return structuredClone({
      inputSize: this.inputSize,
      hiddenSize: this.hiddenSize,
      outputSize: this.outputSize,
      w1: this.w1,
      b1: this.b1,
      w2: this.w2,
      b2: this.b2,
    });
  }

  //Import
  static fromJSON(data: NetworkData): DrivingNetwork {
    const net = new DrivingNetwork(data.hiddenSize, data.inputSize, data.outputSize);
    net.w1 = data.w1;
    net.b1 = data.b1;
    net.w2 = data.w2;
    net.b2 = data.b2;
    return net;
  }
}
