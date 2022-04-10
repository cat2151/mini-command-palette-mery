@powershell -NoProfile -ExecutionPolicy Unrestricted "$s=[scriptblock]::create((gc \"%~f0\"|?{$_.readcount -gt 1})-join\"`n\");&$s" %*&goto:eof

function install_miniCommandPalette() {
    curl.exe -L https://github.com/cat2151/mini-command-palette-mery/releases/download/v1.0.0/miniCommandPaletteMery.zip --output miniCommandPaletteMery.zip
    Expand-Archive -Path miniCommandPaletteMery.zip -DestinationPath . -Force
    del miniCommandPaletteMery.zip
}

function install_miniIncrementalSearchFilter() {
    pushd miniCommandPaletteMery
    curl.exe -L https://github.com/cat2151/mini-incremental-search-filter/releases/download/v1.0.0/miniIncrementalSearchFilter.zip --output miniIncrementalSearchFilter.zip
    Expand-Archive -Path miniIncrementalSearchFilter.zip -DestinationPath . -Force
    del miniIncrementalSearchFilter.zip
    popd
}

function install_migemo() {
    pushd miniCommandPaletteMery\miniIncrementalSearchFilter
    curl.exe -L https://raw.githubusercontent.com/cat2151/migemo-auto-install-for-windows/main/install_cmigemo.bat --output install_cmigemo.bat
    install_cmigemo.bat
    popd
}

function main() {
    install_miniCommandPalette
    install_miniIncrementalSearchFilter
    install_migemo
    del installMiniCommandPalette.bat # é©ï™é©êgÇçÌèúÇ∑ÇÈ
}


###
main
