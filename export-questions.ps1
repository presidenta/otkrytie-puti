<#
================================================================================
  ОТКРЫТИЕ ПУТИ · Genesis Solar Life
  export-questions.ps1 — выгрузка всех вопросов и ответов в текстовые файлы
================================================================================
  ЗАЧЕМ
    Показать анкету людям без доступа к коду: психологам, коучам, партнёрам.
    Документы собираются ИЗ js/content-*.js, поэтому всегда совпадают
    с тем, что реально видит участник.

  ЗАПУСК
    powershell -ExecutionPolicy Bypass -File export-questions.ps1

  РЕЗУЛЬТАТ
    Анкета RU.txt  и  Анкета UA.txt — можно пересылать и распечатывать.

  ВАЖНО: этот файл должен быть сохранён в UTF-8 СО ЗНАКОМ BOM.
================================================================================
#>

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Какие языки выгружать: код → имя файла и подписи в документе
$langs = @(
    @{ code = 'ru'; file = 'Анкета RU.txt'; head = 'ОТКРЫТИЕ ПУТИ'; qword = 'ВОПРОС';
       scoredMark = 'даёт баллы'; freeMark = 'БАЛЛОВ НЕ ДАЁТ · идёт в результат дословно';
       pickWord = 'отмечается вариантов'; total = 'ИТОГО'; vectors = '8 ВЕКТОРОВ' }
    @{ code = 'ua'; file = 'Анкета UA.txt'; head = 'ВІДКРИТТЯ ШЛЯХУ'; qword = 'ПИТАННЯ';
       scoredMark = 'дає бали'; freeMark = 'БАЛІВ НЕ ДАЄ · іде в результат дослівно';
       pickWord = 'позначається варіантів'; total = 'РАЗОМ'; vectors = '8 ВЕКТОРІВ' }
)

foreach ($lang in $langs) {

    $srcPath = Join-Path $root ("js\content-{0}.js" -f $lang.code)
    if (-not (Test-Path $srcPath)) { throw "Не найден файл: $srcPath" }
    $src = [System.IO.File]::ReadAllText($srcPath, [System.Text.Encoding]::UTF8)

    # --- названия векторов ---
    $types = @{}
    foreach ($m in [regex]::Matches($src, "(?m)^\s{2}(\d):\s*\{\s*\r?\n\s*name:\s*'([^']+)'")) {
        $types[[int]$m.Groups[1].Value] = $m.Groups[2].Value
    }

    # --- блок вопросов ---
    $qStart = $src.IndexOf('questions: [')
    if ($qStart -lt 0) { throw "В $srcPath не найден блок questions" }
    $qPart  = $src.Substring($qStart)
    # Блок вопроса заканчивается там, где начинается следующий: строка ровно "  {"
    # (у вариантов ответа отступ 6 пробелов, поэтому спутать нельзя).
    # Так разбор не ломается, если перед id стоит строка комментария.
    $blocks = [regex]::Matches($qPart, '(?s)\bid:\s*(\d+),(.*?)(?=\r?\n  \{\r?\n|\r?\n\]\r?\n)')

    $out = New-Object System.Text.StringBuilder
    $null = $out.AppendLine($lang.head + ' · Genesis Solar Life')
    $null = $out.AppendLine(('=' * 78))
    $null = $out.AppendLine('Выгружено из кода: ' + (Get-Date -Format 'dd.MM.yyyy HH:mm'))
    $null = $out.AppendLine('')
    $null = $out.AppendLine('На экране варианты перемешиваются случайно, номера векторов участник')
    $null = $out.AppendLine('не видит — они указаны здесь только для проверки методики.')
    $null = $out.AppendLine('')

    $scoredCount = 0
    foreach ($b in $blocks) {
        $id   = $b.Groups[1].Value
        $body = $b.Groups[2].Value

        $isScored = -not ($body -match 'scored:\s*false')
        if ($isScored) { $scoredCount++ }

        $picks = 3
        $pm = [regex]::Match($body, 'picks:\s*(\d+)')
        if ($pm.Success) { $picks = [int]$pm.Groups[1].Value }

        $title = [regex]::Match($body, "title:\s*'(.*?)',\s*\r?\n").Groups[1].Value

        $mark = if ($isScored) { $lang.scoredMark } else { $lang.freeMark }
        $null = $out.AppendLine(('-' * 78))
        $null = $out.AppendLine(("{0} {1}   [{2} · {3}: {4}]" -f $lang.qword, $id, $mark, $lang.pickWord, $picks))
        $null = $out.AppendLine(('-' * 78))
        $null = $out.AppendLine($title)
        $null = $out.AppendLine('')

        foreach ($o in [regex]::Matches($body, "\{\s*text:\s*'(.*?)',\s*type:\s*(\d)\s*\}")) {
            $t = [int]$o.Groups[2].Value
            $name = if ($isScored) { $types[$t] } else { '—' }
            $null = $out.AppendLine(("  [{0}] {1}" -f $t, $name))
            $null = $out.AppendLine(("      {0}" -f $o.Groups[1].Value))
        }
        $null = $out.AppendLine('')
    }

    $null = $out.AppendLine(('=' * 78))
    $null = $out.AppendLine(("{0}: {1} / {2}" -f $lang.total, $blocks.Count, $scoredCount))
    $null = $out.AppendLine('')
    $null = $out.AppendLine($lang.vectors + ':')
    foreach ($k in ($types.Keys | Sort-Object)) {
        $null = $out.AppendLine(("  {0}. {1}" -f $k, $types[$k]))
    }

    $dest = Join-Path $root $lang.file
    [System.IO.File]::WriteAllText($dest, $out.ToString(), (New-Object System.Text.UTF8Encoding($true)))
    Write-Host ("  {0,-16} вопросов: {1}, в подсчёте: {2}, {3:N0} байт" -f $lang.file, $blocks.Count, $scoredCount, (Get-Item $dest).Length) -ForegroundColor Green
}

Write-Host ""
