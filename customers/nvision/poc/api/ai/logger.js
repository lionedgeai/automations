const EventEmitter = require('events');

class AILogger extends EventEmitter {
  constructor() {
    super();
    this.logs = [];
    this.maxLogs = 100;
    this.nextId = 1;
  }

  log(event) {
    const entry = {
      id: this.nextId++,
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.emit('log', entry);
    return entry;
  }

  getRecent(count = 50) {
    return this.logs.slice(-count);
  }
}

const aiLogger = new AILogger();

function getRecentLogs(count = 50) {
  return aiLogger.getRecent(count);
}

function logAIEvent(event) {
  return aiLogger.log(event);
}

module.exports = { aiLogger, getRecentLogs, logAIEvent };
