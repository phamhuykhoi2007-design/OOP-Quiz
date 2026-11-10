param([string]$OutputDirectory, [switch]$RunSmoke)
$ErrorActionPreference = 'Stop'
if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path $env:LOCALAPPDATA ('Temp\opencode\oop-quiz-csharp-' + [guid]::NewGuid().ToString('N'))
}
$dotnetRoot = Split-Path (Get-Command dotnet -ErrorAction Stop).Source
$sdk = Get-ChildItem (Join-Path $dotnetRoot 'sdk') -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName 'Roslyn\bincore\csc.dll') } |
    Sort-Object { [version](($_.Name -split '-')[0]) } -Descending | Select-Object -First 1
$pack = Get-ChildItem (Join-Path $dotnetRoot 'packs\Microsoft.NETCore.App.Ref') -Directory |
    Sort-Object { [version](($_.Name -split '-')[0]) } -Descending | Select-Object -First 1
if (-not $sdk -or -not $pack) { throw 'Requires a .NET SDK and local reference assemblies.' }
$refs = Get-ChildItem (Join-Path $pack.FullName 'ref') -Directory | Select-Object -First 1
$compiler = Join-Path $sdk.FullName 'Roslyn\bincore\csc.dll'
& node (Join-Path $PSScriptRoot 'export-solved.cjs') $OutputDirectory
if ($LASTEXITCODE -ne 0) { throw 'Failed to export solved programs.' }
$referenceArguments = Get-ChildItem $refs.FullName -Filter '*.dll' | ForEach-Object { '-r:"' + $_.FullName + '"' }
$count = 0
$target = if ($RunSmoke) { '-target:exe' } else { '-target:library' }
foreach ($source in (Get-ChildItem $OutputDirectory -Filter '*.cs')) {
    $dll = Join-Path $OutputDirectory ($source.BaseName + '.dll')
    $response = Join-Path $OutputDirectory ($source.BaseName + '.rsp')
    $arguments = @('-nologo', $target, '-nostdlib+', ('-out:"' + $dll + '"')) + $referenceArguments + @('"' + $source.FullName + '"')
    [IO.File]::WriteAllLines($response, [string[]]$arguments, [Text.UTF8Encoding]::new($false))
    & dotnet $compiler "@$response"
    if ($LASTEXITCODE -ne 0) { throw ('C# compilation failed: ' + $source.Name) }
    if ($RunSmoke) {
        $version = [version](($pack.Name -split '-')[0])
        $config = @{ runtimeOptions = @{ tfm = $refs.Name; framework = @{ name = 'Microsoft.NETCore.App'; version = ('{0}.{1}.0' -f $version.Major, $version.Minor) } } } | ConvertTo-Json -Depth 5
        [IO.File]::WriteAllText((Join-Path $OutputDirectory ($source.BaseName + '.runtimeconfig.json')), $config, [Text.UTF8Encoding]::new($false))
        $output = '0' | & dotnet $dll
        if ($LASTEXITCODE -ne 0 -or -not ($output -match 'Tam biet') -or ($output -match 'Gia tri khong hop le')) {
            throw ('C# start/exit smoke check failed: ' + $source.Name)
        }
    }
    $count++
}
Write-Output "Compiled $count solved C# programs successfully. Artifacts: $OutputDirectory"
if ($RunSmoke) {
    Write-Output "Runtime start/exit smoke checks: $count passed."
    & node (Join-Path $PSScriptRoot 'verify-essay-runtime.cjs') $OutputDirectory
    if ($LASTEXITCODE -ne 0) { throw 'Solved-program runtime business checks failed.' }
}
