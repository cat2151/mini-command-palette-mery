#title="コマンドパレット用リスト作成"
#include "include/MeryInfo.js"
#include "include/IO.js"

// 階層化マクロメニューのコードを参考にしています : https://www.haijin-boys.com/wiki/%E9%9A%8E%E5%B1%A4%E5%8C%96%E3%83%9E%E3%82%AF%E3%83%AD%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC

function createCustom(customSample, customName) {
  if (existsFile(customName)) return;
  var cmd = "cmd /c copy " + customSample + " " + customName;
  execCmd(cmd);
}

function createMacroTitleList(lines, charset) {
  var meryMacroFolder = new IO.Folder(MeryInfo.GetMacroFolderPath());
  RecursiveInsert(meryMacroFolder, lines, 1, charset);
}

// scriptファイルを検索しlistに挿入する（ディレクトリ再帰的に）
function RecursiveInsert(folder, list, nest, charset){
  // フォルダを再帰的にたどる
  var folders = folder.GetFolders();
  for (var i=0; i<folders.length; i++) {
    RecursiveInsert(folders[i], list, nest+1, charset);
  }
  // ファイルをlistにpushする
  var files = folder.GetFiles("*.js");
  for (var i=0; i<files.length; i++) {
    var title = LoadTitle(files[i].GetPath(), charset);
    if (!title) {
      title = files[i].GetName();
    }
    // 行を作り込む
    var filepath = files[i].GetPath();
    filepath = filepath.replace(/\\/g, '\\\\');
    var line = "/*" + title + "*/" + "execMacro(\"" + filepath + "\");";
    list.push(line);
  }

  // scriptのタイトルを得る（RecursiveInsert用）
  function LoadTitle(fullpath, charset){
    var path = fullpath.substring(IO.Path.GetParent(ScriptFullName).length+1);
    // ファイルから取得する
    var texts = IO.LoadFromFile(fullpath, charset).split("\n");
    for (var i=0; i<texts.length; i++) {
      var text = texts[i].trim();
      if (text.startsWith("#title", true)) {
        var title = text.match(/".*"/)[0];
        title = title.substring(1, title.length-1)
        return title;
      }
      if (!text.startsWith("#") && text.length > 0) {
        break;
      }
    }
    return "";
  }
}

// linesをファイルに保存する
function mixAndSaveList(lines, customName, listName, charset) {
  // mix
  var customLines = IO.LoadFromFile(customName, charset);
  var macroLines  = linesToText(lines);
  var mixLines    = customLines + macroLines;
  // save
  IO.SaveToFile(listName, mixLines, charset);

  // saveList用
  function linesToText(lines) {
    var text = "";
    for (var i=0; i<lines.length; i++) {
      var line = lines[i];
      if (!line) continue; // nullを除外する用
      text = text + line + "\r\n";
    }
    return text;
  }
}

function main() {
  var customSample = MeryInfo.GetMacroFolderPath() + "\\miniCommandPalette\\custom_sample.js";
  var customName   = MeryInfo.GetMacroFolderPath() + "\\miniCommandPalette\\custom.js";
  var listName     = MeryInfo.GetMacroFolderPath() + "\\miniCommandPalette\\work\\list.js";
  var charset      = "utf-8";

  createCustom(customSample, customName);

  var lines = [null];
  createMacroTitleList(lines, charset);

  mixAndSaveList(lines, customName, listName, charset);
}


//
main();
