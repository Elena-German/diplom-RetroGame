import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import { generateTeam } from './generators';
import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Undead from './Undead';
import Daemon from './Daemon';
import GamePlay from './GamePlay';
import GameState from './GameState';


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.NewGame = this.NewGame.bind(this);
    this.onSaveGameClick = this.onSaveGameClick.bind(this);
    this.onLoadGameClick = this.onLoadGameClick.bind(this);
    this.PositionedCharacters = [];// массив объектов игрок-позиция      
    this.gameBoardCoordinates = []; // хранит массив клеток с координатами
    this.selectCharacterPosition = undefined; //выбранный (активный) персонаж
    this.playerMove = true;//ход игрока
    this.score = { player: 0, opponent: 0 }; //общий счет
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.Coordinates(this.gamePlay.boardSize);
    this.distributeCharasters();
    this.gamePlay.redrawPositions(this.PositionedCharacters);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addNewGameListener(this.NewGame);
    this.gamePlay.addSaveGameListener(this.onSaveGameClick);
    this.gamePlay.addLoadGameListener(this.onLoadGameClick);
    
  }

  NewGame() {
    localStorage.clear();
    GameState.from({
      score: JSON.stringify(this.score),
    });

    if (this.selectCharacterPosition) {
      this.gamePlay.deselectCell(this.selectCharacterPosition);
      this.selectCharacterPosition = undefined;
    }
    this.PositionedCharacters.length =0;
    this.distributeCharasters();
    this.gamePlay.redrawPositions(this.PositionedCharacters);
    console.log('NewGame');
    console.log(localStorage);
  }

  onSaveGameClick() {
    GameState.from({
      PositionedCharacters: JSON.stringify(this.PositionedCharacters),
      selectCharacterPosition: this.selectCharacterPosition,
      score: JSON.stringify(this.score),      
    });
    alert('Игра сохранена');
    console.log('SaveGame');
    console.log(localStorage);
  }

  onLoadGameClick() {
    let savePositionedCharacters = JSON.parse(localStorage.getItem('PositionedCharacters'));
    if (savePositionedCharacters) {
      function greatePositionedCharacters(arr) {
        let arrPositionedCharacters = [];
        for (let i = 0; i < arr.length; i++) {
          let character;
          switch (arr[i].character.type) {
            case 'swordsman': character = new Swordsman(arr[i].character.level);
              break;
            case 'undead': character = new Undead(arr[i].character.level);
              break;
            case 'bowman': character = new Bowman(arr[i].character.level);
              break;
            case 'vampire': character = new Vampire(arr[i].character.level);
              break;
            case 'magician': character = new Magician(arr[i].character.level);
              break;
            case 'daemon': character = new Daemon(arr[i].character.level);
              break;
          }
          character.attack = arr[i].character.attack;
          character.defence = arr[i].character.defence;
          character.health = arr[i].character.health;
          arrPositionedCharacters.push(new PositionedCharacter(character, arr[i].position));
        }
        return arrPositionedCharacters;
      }
      this.PositionedCharacters.length = 0;
      this.PositionedCharacters = this.PositionedCharacters.concat(greatePositionedCharacters(JSON.parse(localStorage.getItem('PositionedCharacters'))));
      this.gamePlay.deselectCell(this.selectCharacterPosition);
      this.selectCharacterPosition = localStorage.getItem('selectCharacterPosition');
      this.gamePlay.selectCell(this.selectCharacterPosition);
      this.gamePlay.redrawPositions(this.PositionedCharacters);
    } else {
      alert('нет сохраненной игры');
    }
  }

  distributeCharasters() {    //Разместить на поле игровых персонажей 
    const numberPlayersInTeam = 3;
    let playerTeam = generateTeam([Bowman, Swordsman, Magician], 1, numberPlayersInTeam); //типы, уровень, количество
    let opponentTeam = generateTeam([Vampire, Undead, Daemon], 1, numberPlayersInTeam);

    this.PositionedCharacters.forEach(item =>{
      if(['bowman', 'swordsman', 'magician'].includes(item.character.type)){
        playerTeam.characters.push(item.character);
      } else {
        opponentTeam.characters.push(item.character);
      }
    }); 
    let startPositionsPlayerTeam = []; //массив возможных начальных позиций игрока
    let startPositionsOpponentTeam = []; //массив возможных начальных позиций противника
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
      if (i % this.gamePlay.boardSize === 0 || i % this.gamePlay.boardSize === 1) {
        startPositionsPlayerTeam.push(i);
      }
      if (i % this.gamePlay.boardSize == this.gamePlay.boardSize - 2 || i % this.gamePlay.boardSize == this.gamePlay.boardSize - 1) {
        startPositionsOpponentTeam.push(i);
      }
    }

    function createPositionedCharacters(startPositionsTeam, team) { //функция распределения игроков команды по позициям
      let positionIndexBysy = []; //массив занятых клеток(индекс -номер клетки)
      let teamPositions = []; //массив объектов (игрок-позиция) переданной команды
      for (let i = 0; i < team.characters.length; i++) {
        let positionIndex = Math.floor(Math.random() * startPositionsTeam.length); //рандомим индекс позиции
        while (positionIndexBysy.includes(positionIndex)) {//если занята ранее
          positionIndex = Math.floor(Math.random() * startPositionsTeam.length);// еще рандомим индекс позиции (до тех пор, пока не выпадет свободная)
        }
        const posCharacter = new PositionedCharacter(team.characters[i], startPositionsTeam[positionIndex]);
        positionIndexBysy.push(positionIndex);
        teamPositions.push(posCharacter);
      }
      return teamPositions;
    }
    
    this.PositionedCharacters = createPositionedCharacters(startPositionsPlayerTeam, playerTeam).concat(createPositionedCharacters(startPositionsOpponentTeam, opponentTeam));    
  }

  Coordinates(size) {
    for (let str = 0; str > -size; str--) {
      for (let col = 0; col < size; col++) {
        this.gameBoardCoordinates.push({ x: col, y: str });
      }
    }
  }

  characterZoneMove(characterType, position) {
    let zoneMove = [];
    const characterCoordinates = this.gameBoardCoordinates[position];
    let moveLimit = 0;
    switch (characterType) {
      case 'swordsman':
      case 'undead':
        moveLimit = 4;
        break;
      case 'bowman':
      case 'vampire':
        moveLimit = 2;
        break;
      case 'magician':
      case 'daemon':
        moveLimit = 1;
        break;
    }

    // по диагоналям        
    let xTopLeftBottomRight = characterCoordinates.x - moveLimit;
    let xTopRightBottomLeft = characterCoordinates.x + moveLimit;
    for (let j = characterCoordinates.y - moveLimit; j <= characterCoordinates.y + moveLimit; j++) {//координата y
      if (!zoneMove.some(item => JSON.stringify(item) === JSON.stringify({ x: xTopLeftBottomRight, y: j }))) {
        let pos = this.gameBoardCoordinates.findIndex(item => item.x === xTopLeftBottomRight && item.y === j);
        if (pos >= 0) {
          zoneMove.push(pos);
        }
      }
      let pos = this.gameBoardCoordinates.findIndex(item => item.x === xTopRightBottomLeft && item.y === j);
      if (!zoneMove.some(item => JSON.stringify(item) === JSON.stringify({ x: xTopRightBottomLeft, y: j }))) {
        if (pos >= 0) {
          zoneMove.push(pos)
        }
      };
      xTopLeftBottomRight++;
      xTopRightBottomLeft--;
    }

    //по горизонтали  
    for (let i = characterCoordinates.x - moveLimit; i <= characterCoordinates.x + moveLimit; i++) {
      let addPosition = this.gameBoardCoordinates.findIndex(item => item.x === i && item.y === characterCoordinates.y);
      if (addPosition >= 0) {
        if (!zoneMove.includes(addPosition)) {
          zoneMove.push(addPosition);
        }
      }
    }
    //по вертикали
    for (let j = characterCoordinates.y - moveLimit; j <= characterCoordinates.y + moveLimit; j++) {
      let addPosition = this.gameBoardCoordinates.findIndex(item => item.x === characterCoordinates.x && item.y === j);
      if (addPosition >= 0) {
        if (!zoneMove.includes(addPosition)) {
          zoneMove.push(addPosition);
        }
      }
    }
    return zoneMove;
  }

  characterZoneAttack(characterType, position) {
    let zoneAttack = [];
    const characterCoordinates = this.gameBoardCoordinates[position];
    let attackLimit = 0;
    switch (characterType) {
      case 'swordsman':
      case 'undead':
        attackLimit = 1;
        break;
      case 'bowman':
      case 'vampire':
        attackLimit = 2;
        break;
      case 'magician':
      case 'daemon':
        attackLimit = 4;
        break;
    }
    for (let i = characterCoordinates.x - attackLimit; i <= characterCoordinates.x + attackLimit; i++) {
      for (let j = characterCoordinates.y - attackLimit; j <= characterCoordinates.y + attackLimit; j++) {
        let pos = this.gameBoardCoordinates.findIndex(item => item.x === i && item.y === j);
        if (pos >= 0) {
          zoneAttack.push(pos);
        }
      }
    }
    return zoneAttack;
  }

  levelUp() {
    console.log(this.PositionedCharacters);
    this.PositionedCharacters.forEach(item => {
      item.character.health += 80;
      if (item.character.health > 100) {
        item.character.health = 100;
      }
      item.character.attack = Math.max(item.character.attack, item.character.attack * (80 + item.character.health) / 100);
      item.character.level += 1;

      if (item.character.level > 1) {     //наипростейшая логика по начислению баллов, нет времени на реализацию полноценного алгоритма   
        if(this.PositionedCharacters.findIndex(item => ['bowman', 'swordsman', 'magician'].includes(item.character.type)) >= 0){
          this.score.player += 100; 
          this.score.opponent -= 100; 
          alert(`Вы выиграли! +100 баллов
          Общий счет:
           ипользователь ${this.score.player}
           компьютер ${this.score.opponent}`)
        } else {
          this.score.opponent += 100; 
          this.score.player -= 100;
          alert(`Вы проиграли! -100 баллов
          Общий счет:
           ипользователь ${this.score.player}
           компьютер ${this.score.opponent}`)
        }
       
        this.NewGame();
      }
    });
    this.playerMove = false;
  }

  attackCharacter(attacker, attacked) {
    let damage = Math.max(attacker.attack - attacked.character.defence, attacker.attack * 0.1);
    attacked.character.health = attacked.character.health - damage;
    this.gamePlay.showDamage(attacked.position, damage).then(() => {

      if (attacked.character.health <= 0) {// если умер        
        this.PositionedCharacters.splice(this.PositionedCharacters.findIndex(item => item.position === attacked.position), 1)// удаляем персонажа из массива PositionedCharacters                      
        
        if (
          this.PositionedCharacters.findIndex(item => ['bowman', 'swordsman', 'magician'].includes(item.character.type)) < 0 ||
          this.PositionedCharacters.findIndex(item => ['undead', 'vampire', 'daemon'].includes(item.character.type)) < 0
        ) {// если у команды не осталось персонажей
          this.levelUp();
          this.selectCharacterPosition = undefined;
          this.gamePlay.drawUi(themes.desert);
          this.distributeCharasters();
        }
        this.gamePlay.deselectCell(attacked.position);
      } //если не умер
      this.gamePlay.redrawPositions(this.PositionedCharacters);
      if (this.playerMove) {
        this.playerMove = false;
        this.opponentResponse();
      } else {
        this.playerMove = true;
      }

    });
  }

  opponentResponse() {// наипростейшая логика (просто демострация ответа пк) т.к. нет времени на реализацию полноценной стратегии
    if (!this.playerMove) {
      let wasAttacked = false;
      for (let i = 0; i < this.PositionedCharacters.length; i++) { //перебираем персонажей опонента у кого есть в зоне атаки персонажи игрока
        let positionedCharacterItem = this.PositionedCharacters[i];
        if (['undead', 'vampire', 'daemon'].includes(positionedCharacterItem.character.type)) {
          const zoneAttack = this.characterZoneAttack(positionedCharacterItem.character.type, positionedCharacterItem.position);
          let attacked = this.PositionedCharacters.find(item => ['bowman', 'swordsman', 'magician'].includes(item.character.type) && zoneAttack.includes(item.position));
          if (attacked) {//есть в зоне атаки игрок
            this.attackCharacter(positionedCharacterItem.character, attacked);
            wasAttacked = true;
            break;
          }
        }
      }
      if (!wasAttacked) {// если атаки не было - двигаем персонажа
        let opponentCharacter = this.PositionedCharacters.find(item => ['undead', 'vampire', 'daemon'].includes(item.character.type));
        let zoneMove = this.characterZoneMove(opponentCharacter.character.type, opponentCharacter.position);
        if (opponentCharacter.position === zoneMove[0]) {
          opponentCharacter.position = zoneMove[zoneMove.length - 1];
        } else {
          opponentCharacter.position = zoneMove[0];
        }
        this.playerMove = true;
        this.gamePlay.redrawPositions(this.PositionedCharacters);
      }
    }
  }

  onCellClick(index) {
    if (this.playerMove) { //если доступен ход игрока
      const contentCellClick = this.PositionedCharacters.find(item => item.position === index);
      const activeCharacter = this.PositionedCharacters.find(item => item.position === this.selectCharacterPosition);
      if (contentCellClick) {//если клетка занята
        if (['bowman', 'swordsman', 'magician'].includes(contentCellClick.character.type)) {//если в клетке наш персонаж               
          if (this.selectCharacterPosition) {
            this.gamePlay.deselectCell(this.selectCharacterPosition);
          }
          this.gamePlay.selectCell(index);
          this.selectCharacterPosition = index;
        }
      }
      if (activeCharacter) { //если есть выделенный персонаж 
        if (contentCellClick) {//если клетка занята        
          if (['undead', 'vampire', 'daemon'].includes(contentCellClick.character.type)) {//если в клетке противник  
            const zoneAttackActiveCharacter = this.characterZoneAttack(activeCharacter.character.type, activeCharacter.position);
            if (zoneAttackActiveCharacter.includes(index)) {//если в зоне атаки                     
              this.attackCharacter(activeCharacter.character, contentCellClick); //атакуем 
            }
          }
        } else {//если клетка свободна
          const zoneMoveActiveCharacter = this.characterZoneMove(activeCharacter.character.type, activeCharacter.position);
          if (zoneMoveActiveCharacter.includes(index)) { //клетка в зоне хождения активного персонажа? 
            this.PositionedCharacters.forEach(item => {
              if (item.position === this.selectCharacterPosition) {
                item.position = index;
              }
            })
            this.gamePlay.deselectCell(this.selectCharacterPosition);
            this.selectCharacterPosition = index;
            this.gamePlay.selectCell(index);
            this.gamePlay.redrawPositions(this.PositionedCharacters);
            this.playerMove = false;
            this.opponentResponse();
          }

        }
      } else { //нет выделенного персонажа
        if (contentCellClick) {
          if (['undead', 'vampire', 'daemon'].includes(contentCellClick.character.type)) {
            GamePlay.showError('Это персонаж противника');
          }
        }
      }
    }
  }

  onCellEnter(index) {
    if (this.playerMove) {
      const contentCellClick = this.PositionedCharacters.find(item => item.position === index);
      const activeCharacter = this.PositionedCharacters.find(item => item.position === this.selectCharacterPosition);
      if (contentCellClick) {// если клетка занята показываем инфо о персонаже
        this.gamePlay.showCellTooltip(`🎖${contentCellClick.character.level} ⚔${contentCellClick.character.attack} 🛡${contentCellClick.character.defence} ❤${contentCellClick.character.health}`, index);
      }
      if (activeCharacter) { //если есть выделенный персонаж       
        if (contentCellClick) {// занята ли клетка?             
          if (['bowman', 'swordsman', 'magician'].includes(contentCellClick.character.type)) {//если в клетке игрок
            this.gamePlay.setCursor('pointer');
          } else { //если в клетке противник
            const zoneAttackActiveCharacter = this.characterZoneAttack(activeCharacter.character.type, activeCharacter.position);
            if (zoneAttackActiveCharacter.includes(index)) {
              this.gamePlay.setCursor('crosshair');
              this.gamePlay.selectCell(index, 'red');
            } else {
              this.gamePlay.setCursor('not-allowed');
            }
          }
        } else { //если клетка свободна 
          const zoneMoveActiveCharacter = this.characterZoneMove(activeCharacter.character.type, activeCharacter.position);
          if (zoneMoveActiveCharacter.includes(index)) { //клетка в зоне хождения выделенного персонажа? 
            this.gamePlay.selectCell(index, 'green');
          }
        }
      } else this.gamePlay.setCursor('default'); //если нет выделенного персонажа
    }
  }

  onCellLeave(index) {
    if (!(this.selectCharacterPosition == index)) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.setCursor('default');
  }

}
