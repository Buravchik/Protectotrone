var Protectotrone = function () {
  var firebaseUrl = "https://protectotron.firebaseio.com/";
  var secret = PropertiesService.getScriptProperties().getProperty("secret");
  this._db = getDatabaseByUrl(firebaseUrl, secret);
  this._salt = "abcde";//соль, чтобы пользователи не смешивались в бд. Обычно такое не нужно. Соль можно выдавать сервером один раз и потом прописывать в Properties. Но это после того, как реализуем ограничение прав по ветвям
  this._user = Session.getActiveUser().getEmail().replace('@','_').replace('.','_');
  var that = this;
  this._addToWatch = function (ssid,sheets,ranges) {
    that._sheetArr = (Array.isArray(sheets)) ? (sheets) : ([sheets]);
    that._ranges = (Array.isArray(ranges[0])) ? (ranges) : ([ranges]); // [ [ begRow, begCol, rows, cols], [ begRow, begCol, rows, cols], ... ]
    
    var obj = that._db.getData(that._user + '_' + that._salt + '/watchList') || {};
    for (var sheet in sheets) {
      ranges.forEach(function(range){
        var txtRange = range.toString();
        if (!obj.hasOwnProperty(ssid)) obj[ssid] = {};
        if (!obj[ssid].hasOwnProperty(sheets[sheet])) obj[ssid][sheets[sheet]] = [];
        if (obj[ssid][sheets[sheet]].indexOf(txtRange) == -1)
          obj[ssid][sheets[sheet]].push(txtRange);
      });
    }
    that._db.updateData(that._user + '_' + that._salt + '/watchList',obj);
  }
  this._listWatch = function (ssid, sheet) {//без аргументов () - все на этого пользователя, (ssid) - все защиты для этой таблицы, (ssid,sheet) - на конкретный лист
    switch (arguments.length) {
      case 2://ssid,sheet
        return that._db.getData(that._user + '_' + that._salt + '/watchList/' + ssid + '/' + sheet);
        break;
      case 1://ssid
        return Object.keys(that._db.getData(that._user + '_' + that._salt + '/watchList/' + ssid));
        break;
      case 0:
        return Object.keys(that._db.getData(that._user + '_' + that._salt + '/watchList'));
    }
  }
  this._onEdit = function (curSS) {

  }
  this._deleteWatch = function (ssid, sheet) {
    switch (arguments.length) {
      case 2://ssid,sheet
        return that._db.removeData(that._user + '_' + that._salt + '/watchList/' + ssid + '/' + sheet);
        break;
      case 1://ssid
        return Object.keys(that._db.removeData(that._user + '_' + that._salt + '/watchList/' + ssid));
        break;
      case 0:
        return Object.keys(that._db.removeData(that._user + '_' + that._salt + '/watchList'));
    }
  }
  this._getQueue = function () {
    that._queue = that._db.getData(that._user + '_' + that._salt + '/queue');
    return that._queue;
  }
  this._addToQueue = function (ssid, sheet, cell) {
    var q = that._getQueue();
    for (key in q) {
      if ((q[key].ssid == ssid) && (q[key].sheet == sheet) && (q[key].cell == cell)) return false
    }
    that._db.pushData(that._user + '_' + that._salt + '/queue',{ssid: ssid, sheet:sheet, cell: cell});
    return true;
  }
  this._removeFromQueue = function (arrOfID) {
    //TODO
    that._db.getData(that._user + '_' + that._salt + '/queue');
  }
  this._protect = function (ssid, sheet, range) {
    //TODO
    return true; 
  }
  this._getQueueNext = function () {
   //TODO 
  }
  return {
    addToWatch: this._addToWatch,
    listWatch: this._listWatch,
    deleteWatch: this._deleteWatch,
    getQueueNext: this._getQueueNext,
    addToQueue: this._addToQueue,
    listQueue: this._getQueue
  }
}

function test() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheets()[0];
  var p = new Protectotron();
  Logger.log(p.listQueue());
  p.addToQueue(ss.getId(), 'Лист1', "1,2");
  p.addToWatch(ss.getId(), ['Лист1'], [[1,1,10,10],[3,1,13,10]]);
//  Logger.log("\n" + p.listWatch(ss.getId(), 'Лист1'));
  Logger.log(p.listWatch());
//  Logger.log(p.deleteWatch(ss.getId(),'Лист1'));
  
//  Logger.log(p);
}

