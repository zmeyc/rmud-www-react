export class Dice {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}

  averageRoll = () => {
    if (this.y === 0) {
      return this.z
    }
    return (this.x * (1 + this.y)) / 2 + this.z
  }
}
