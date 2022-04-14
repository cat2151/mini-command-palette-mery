#title="編集中ファイルの絞り込み"
#include "include/MeryInfo.js"
#include "include/IO.js"

function deleteFile(filename) {
  if (!IO.Path.IsExist(filename)) return;
  var f = new IO.File(filename).Delete();
}

function getEncode() {
  switch (Document.Encoding) {
    case meEncodingUTF8WithSignature:
    case meEncodingUTF8WithoutSignature: return "utf_8";
    case meEncodingShiftJIS:             return "cp932";
  }
  MessageBox("ERROR : encode [" + Document.Encoding + "]");
  exit();
}

function filterEditing(macroDir, nowEditName, resultName, migemoDict, encode) {
  var exeName = macroDir + "miniIncrementalSearchFilter\\miniIncrementalSearchFilter.exe";
  var cmd = exeName + " " + nowEditName + " " + resultName + " --encode " + encode + " --andsearch --migemo " + migemoDict;
  execCmd(cmd);
}

function execCmd(cmd) {
  var shell = new ActiveXObject('Wscript.Shell');
  shell.Run(cmd, 1, true/*同期実行*/);
}

function existsFile(filename) {
  return IO.Path.IsExist(filename);
}

function moveCursorToFileTop() {
  Document.selection.StartOfDocument(! Document.selection.IsEmpty);
}

function moveCursorToLineTop() {
  Document.selection.StartOfLine(false, mePosLogical);
}

function searchNext(searchString) {
  Document.selection.find(searchString, meFindNext);
}

function jump(resultName) {
  // read
  var searchString = IO.LoadFromFile(resultName, Document.Encoding);
  // jump
  moveCursorToFileTop();
  searchNext(searchString);
  // 選択範囲を解除
  moveCursorToLineTop();
}

function main() {
  var macroDir    = MeryInfo.GetMacroFolderPath() + "\\miniCommandPalette\\"; // 当macroのあるdir
  var nowEditName = document.FullName;
  var resultName  = macroDir + "work\\result.js";
  var migemoDict  = macroDir + "miniIncrementalSearchFilter\\dict\\migemo-dict"

  deleteFile(resultName); // キャンセル時に前回のjumpを実行しないよう
  filterEditing(macroDir, nowEditName, resultName, migemoDict, getEncode());
  if (existsFile(resultName)) {
    jump(resultName);
  }
}


//
main();
