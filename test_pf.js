const p = require('mineflayer-pathfinder');
console.log('pathfinder:', typeof p.pathfinder);
console.log('goals:', Object.keys(p.goals || {}));
console.log('movements:', typeof p.movements);
console.log('all keys:', Object.keys(p));
