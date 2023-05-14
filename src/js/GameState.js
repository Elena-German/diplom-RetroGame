export default class GameState {
  static from(object) {
    for (let property in object) {
      localStorage.setItem(property, object[property]);
    }
    return null;
  }
}
