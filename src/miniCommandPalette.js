#title="簡易コマンドパレット"
#include "include/MeryInfo.js"
#include "include/IO.js"

// reloadを繰り返して実行できる用（IO.Includeの恩恵を受けつつ同じmacroを再帰的に実行できる用）
function miniCommandPalette_getMacroMap() {
  if (typeof miniCommandPalette_macroMap === 'undefined') return {};
  return miniCommandPalette_macroMap
}

function createList_ifNotExist(filename, macroDir) {
  if (existsFile(filename)) return;
  execMacro(macroDir + "createList.js");
}

function existsFile(filename) { // createList.js で読みやすく使える用
  return IO.Path.IsExist(filename);
}

function deleteFile(filename) {
  if (!IO.Path.IsExist(filename)) return;
  var f = new IO.File(filename).Delete();
}

function selectMacro(macroDir, listName, resultName, migemoDict) {
  var exeName = macroDir + "miniIncrementalSearchFilter\\miniIncrementalSearchFilter.exe";
  var cmd = exeName + " " + listName + " " + resultName + " --encode utf_8 --andsearch --migemo " + migemoDict;
  execCmd(cmd);
}

// custom.jsにて「指定ファイルを実行する」を記述できる用
function execCmd(cmd) {
  var shell = new ActiveXObject('Wscript.Shell');
  shell.Run(cmd, 1, true/*同期実行*/);
}

// custom.jsにて「指定マクロファイルを実行する」を記述できる用
function execMacro(filename) { // 関数名はシンプルにした。custom.jsでわかりやすい用。Meryにおいてはcustom.jsからマクロファイルを実行する際、この関数を使うものとする。Mery本体側の仕組みをシンプルに、ある程度複雑なことをマクロファイル側で受け持つ、というイメージ。
  if (filename.indexOf(':') <= 0) {
    // custom.jsで相対パス記述できる用
    filename = MeryInfo.GetMacroFolderPath() + "\\" + filename;
  }
  if (!existsFile(filename)) {
    return; // selectにてcancelした場合用
  }

  var macro;
  if (filename == resultName/*グローバル変数。custom.jsにては引数にresultNameは書かない（カスタマイズをシンプルにする）*/) {
    macro = IO.LoadFromFile(filename, "utf-8"); // includeを使わない。reload後に別の内容のresult.jsを読む用
  } else {
    if (miniCommandPalette_macroMap[filename]) {
      // reloadを繰り返して実行できる用（IO.Includeの恩恵を受けつつ同じmacroを再帰的に実行できる用）
      macro = miniCommandPalette_macroMap[filename];
    } else {
      macro = IO.Include(filename);
      miniCommandPalette_macroMap[filename] = macro;
    }
  }
  eval(macro);
}

// custom.jsにて「指定ファイルをMeryで開く」を記述できる用
function openFile(filename) {
  if (filename.indexOf(':') <= 0) {
    // custom.jsで相対パス記述できる用
    filename = MeryInfo.GetMacroFolderPath() + "\\" + filename;
  }

  var doc = FindDocument( filename );
  if( doc ){
    doc.Activate();
  }else{
    Editor.NewFile();
    if( Editor.EnableTab ){
      Editor.OpenFile( filename );
    } else {
      Editors.Item(Editors.Count-1).OpenFile( filename );
    }
    doc = FindDocument( filename );
  }

  // openFile用
  function FindDocument( path ){
    path = path.toLowerCase();
    var docs  = Editor.Documents;
    var count = docs.Count;
    for( var i = 0 ; i < Editors.Count ; ++i ){
      var docs  = Editors.Item(i).Documents;
      var count = docs.Count;
      for( var j = 0 ; j < count ; ++j ){
        var doc = docs.Item(j);
        if( doc ){
          if( doc.FullName.toLowerCase() == path ){
            return doc;
          }
        }
      }
    }
    return null;
  }
}

function main() {
  var macroDir   = MeryInfo.GetMacroFolderPath() + "\\miniCommandPalette\\"; // 当macroのあるdir
  var listName   = macroDir + "work\\list.js"
  var migemoDict = macroDir + "dict\\migemo-dict"
  miniCommandPalette_macroMap = miniCommandPalette_getMacroMap(); // uniqな名前にした。ほかのmacroと名称被りを防止する用。ここは関数内varにしない（するとreloadを3回以上できなくなる）
  resultName = macroDir + "work\\result.js"; // 関数内varにしない。custom.jsからexecMacro()で使うので。

  createList_ifNotExist(listName, macroDir);
  deleteFile(resultName); // キャンセル時に前回のmacroを実行しないよう
  selectMacro(macroDir, listName, resultName, migemoDict);
  execMacro(resultName);
}


//
main();
