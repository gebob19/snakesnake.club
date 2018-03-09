// import lib from './lib/*';
/* eslint-env browser */
export default class JobThread {
  constructor(workerName) {
    switch (workerName) {
      case 'worker.js':
        this.worker = new Worker('./worker.js');
        break;

      case 'cryptonight.asm.js':
        this.worker = new Worker('./cryptonight.asm.js');
        break;

      default:
    }
    this.worker.addEventListener('message', this.onReceiveMsg.bind(this));
    this.currentJob = null;
    this.jobCallback = () => {};
    this.verifyCallback = () => {};
    this._isReady = false;
    this.hashesPerSecond = 0;
    this.hashesTotal = 0;
    this.running = false;
    this.lastMessageTimestamp = Date.now();
  }

  onReceiveMsg(msg) {
    this._isReady = true;
    if (this.currentJob) {
      this.running = true;
      this.worker.postMessage(this.currentJob);
    }
    if (typeof msg.data === 'object') {
      if (msg.data.verify_id) {
        this.verifyCallback(msg.data);
        return;
      }
      if (msg.data.result) {
        this.jobCallback(msg.data);
      }
      if (msg.data.hashesPerSecond && msg.data.hashes) {
        this.hashesPerSecond = (this.hashesPerSecond + msg.data.hashesPerSecond) / 2;
        this.hashesTotal += msg.data.hashes;
        this.lastMessageTimestamp = Date.now();
        if (this.running) {
          this.worker.postMessage(this.currentJob);
        }
      }
    }
  }

  setJob(job, callback) {
    this.currentJob = job;
    this.jobCallback = callback;
    if (this._isReady && !this.running) {
      this.running = true;
      this.worker.postMessage(this.currentJob);
    }
  }

  verify(job, callback) {
    if (!this._isReady) {
      return;
    }
    this.verifyCallback = callback;
    this.worker.postMessage(job);
  }

  stop() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.running = false;
  }
}