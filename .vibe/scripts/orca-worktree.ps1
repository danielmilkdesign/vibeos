param (
    [Parameter(Mandatory=$true)]
    [string]$FeatureName,

    [Parameter(Mandatory=$false)]
    [ValidateSet("core", "client")]
    [string]$Track = "core"
)

$Prefix = if ($Track -eq "client") { "client" } else { "core" }
$Slug = $FeatureName.ToLower() -replace '\s+', '-'
$BranchName = "$Prefix/feature-$Slug"
$WorktreePath = "../worktrees/$Prefix-$Slug"

Write-Host "🚀 [Vibetech ADE] Criando Git Worktree para Track [$Track]: $FeatureName" -ForegroundColor Green

git worktree add -b $BranchName $WorktreePath main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Worktree criada em: $WorktreePath" -ForegroundColor Yellow
    Write-Host "🤖 Squad [$Track] pronta para atuar no Orca ADE nesta worktree." -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro ao criar a Git Worktree." -ForegroundColor Red
}
