export class GameDifficultyManager {
  private difficutlyCap: number;
  private difficulty: number;
  private streak: number;

  constructor() {
    this.difficutlyCap = 10;
    this.difficulty = 1;
    this.streak = 0;
  }

  update(result: boolean) {
    if (result) {
      this.streak = Math.max(1, this.streak + 1);
      this._increaseDifficulty();
    } else {
      this.streak = Math.min(-1, this.streak - 1);
      this._decreaseDifficulty();
    }
  }

  _increaseDifficulty() {
    const increase = 0.1 + 0.05 * (this.streak - 1);
    this.difficulty = Math.min(this.difficulty + increase, this.difficutlyCap);
  }

  _decreaseDifficulty() {
    const decrease = 0.2 + 0.2 * (Math.abs(this.streak) - 1);
    this.difficulty = Math.max(this.difficulty - decrease, 1);
  }

  getDifficulty() {
    return this.difficulty / this.difficutlyCap;
  }
}
