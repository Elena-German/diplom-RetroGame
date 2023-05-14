import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {

  if (allowedTypes.length > 0) {
    const randomClass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const randomLevel = Math.floor(Math.random() * maxLevel + 1);
    const randomPlayer = new randomClass(randomLevel);
    yield randomPlayer;
  }

}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * 
 */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let generatedTeam = [];
  for (let i=0; i< characterCount; i++){
    generatedTeam.push(characterGenerator(allowedTypes, maxLevel).next().value);
  }
  return new Team(...generatedTeam);
}
