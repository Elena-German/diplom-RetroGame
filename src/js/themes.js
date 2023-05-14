const themes = {
  prairie: 'prairie',
  desert: 'desert',
  arctic: 'arctic',
  mountain: 'mountain',
};

export default themes;

/*for(let theme of themes){
  return theme;
}

themes[Symbol.iterator] = function () {
  let current = 'prairie';
  return {
    next() {
      switch (current) {
        case 'prairie': 
        current = 'desert';
        return {
          done: false,
          value: 'desert',
        };
        case 'desert': 
        current = 'arctic';
        return {
          done: false,
          value: 'arctic',
        };
        case 'arctic': 
        current = 'mountain';
        return {
          done: false,
          value: 'mountain',
        };
        case 'mountain':
          current = 'prairie'; 
        return {
          done: false,
          value: 'prairie',
        };
      }
    }
  }
};*/