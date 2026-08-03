<#
================================================================================
  ОТКРЫТИЕ ПУТИ · Genesis Solar Life
  build.ps1 — сборка одного автономного файла для раздачи участникам
================================================================================
  ЗАЧЕМ ЭТО НУЖНО
    Разрабатывать удобно в четырёх файлах (index.html + css + 2 js).
    А раздавать участникам нужно ОДИН файл: его можно переслать в Telegram,
    открыть на телефоне без интернета и без папок рядом.
    Этот скрипт превращает первое во второе.

  КАК ЗАПУСТИТЬ
    Правой кнопкой по build.ps1 → «Выполнить с помощью PowerShell»
    либо в терминале:  powershell -ExecutionPolicy Bypass -File build.ps1

  РЕЗУЛЬТАТ
    dist\index.html — один файл, ~80 КБ, работает офлайн.
================================================================================
#>

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Кириллица в консоли Windows. ВАЖНО: сам этот файл должен быть сохранён
# в UTF-8 СО ЗНАКОМ BOM — иначе Windows PowerShell 5.1 прочитает его как ANSI
# и рассыплется на русских буквах. Если правите файл в редакторе — следите
# за кодировкой (в VS Code: «UTF-8 with BOM» в правом нижнем углу).
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

function Read-Utf8($relativePath){
    $full = Join-Path $root $relativePath
    if (-not (Test-Path $full)) { throw "Не найден файл: $relativePath" }
    return [System.IO.File]::ReadAllText($full, [System.Text.Encoding]::UTF8)
}

Write-Host ""
Write-Host "  ОТКРЫТИЕ ПУТИ — сборка одного файла" -ForegroundColor DarkYellow
Write-Host "  ------------------------------------" -ForegroundColor DarkGray

$html = Read-Utf8 'index.html'
$css  = Read-Utf8 'css\style.css'

# Порядок важен: config → языки → логика
$jsFiles = @('js\config.js', 'js\content-ru.js', 'js\content-ua.js', 'js\script.js')

Write-Host ("  index.html      {0,7:N0} байт" -f $html.Length)
Write-Host ("  style.css       {0,7:N0} байт" -f $css.Length)

$out = $html
$linkTag = '<link rel="stylesheet" href="css/style.css">'
if ($out.IndexOf($linkTag) -lt 0) { throw "В index.html не найден тег: $linkTag" }
$out = $out.Replace($linkTag, "<style>`r`n$css`r`n</style>")

foreach ($f in $jsFiles) {
    $code = Read-Utf8 $f
    $name = Split-Path $f -Leaf
    Write-Host ("  {0,-15} {1,7:N0} байт" -f $name, $code.Length)

    $tag = '<script src="' + $f.Replace('\', '/') + '"></script>'
    if ($out.IndexOf($tag) -lt 0) { throw "В index.html не найден тег: $tag" }
    $out = $out.Replace($tag, "<script>`r`n// ===== $name =====`r`n$code`r`n</script>")
}

# Помечаем сборку, чтобы не путать её с исходником
$stamp = "<!-- СОБРАНО build.ps1 {0} · исходники: index.html + css/style.css + js/*.js -->" -f (Get-Date -Format 'dd.MM.yyyy HH:mm')
$out = $out.Replace('<!DOCTYPE html>', "<!DOCTYPE html>`r`n$stamp")

# --- Записываем UTF-8 без BOM --------------------------------------------------
$distDir = Join-Path $root 'dist'
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
$distFile = Join-Path $distDir 'index.html'
[System.IO.File]::WriteAllText($distFile, $out, (New-Object System.Text.UTF8Encoding($false)))

$size = (Get-Item $distFile).Length
Write-Host "  ------------------------------------" -ForegroundColor DarkGray
Write-Host ("  ГОТОВО: dist\index.html  {0:N0} байт" -f $size) -ForegroundColor Green
Write-Host "  Этот файл можно отправлять участникам — он работает без интернета."
Write-Host ""
