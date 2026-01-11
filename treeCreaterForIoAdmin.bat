@echo off
chcp 65001 > nul
set "target_path=C:\Users\mail4\OneDrive\Рабочий стол\develop\nodejs\ioServer"
set "output_file=tree_output.txt"

echo Генерация дерева...

powershell -NoProfile -Command ^
    "$target = '%target_path%';" ^
    "$out = '%output_file%';" ^
    "function Get-Tree($path, $indent = '') {" ^
    "  $items = Get-ChildItem -LiteralPath $path | Where-Object { $_.Name -notmatch 'node_modules|.git' };" ^
    "  for ($i=0; $i -lt $items.Count; $i++) {" ^
    "    $item = $items[$i];" ^
    "    $isLast = $i -eq ($items.Count - 1);" ^
    "    if ($isLast) { $prefix = '└── '; $nextIndent = $indent + '    ' } else { $prefix = '├── '; $nextIndent = $indent + '│   ' };" ^
    "    $line = $indent + $prefix + $item.Name;" ^
    "    $line | Out-File -FilePath $out -Append -Encoding utf8;" ^
    "    if ($item.PSIsContainer) {" ^
    "      Get-Tree $item.FullName $nextIndent;" ^
    "    }" ^
    "  }" ^
    "}" ^
    "Set-Content $out -Value 'Project Structure:' -Encoding utf8;" ^
    "Get-Tree $target;"

if %errorlevel% equ 0 (
    echo Готово!
    start "" "%output_file%"
) else (
    echo Ошибка.
)
pause
