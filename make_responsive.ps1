$files = @(
    "d:\LEGION-WEBSITE\index.html",
    "d:\LEGION-WEBSITE\shop.html",
    "d:\LEGION-WEBSITE\portfolio.html",
    "d:\LEGION-WEBSITE\about.html",
    "d:\LEGION-WEBSITE\contact.html"
)

foreach ($file in $files) {
    if (-not (Test-Path $file)) { continue }
    $content = Get-Content -Path $file -Raw -Encoding UTF8

    # 1. Navbar Height & Logo
    $content = $content -replace 'h-20', 'h-16 md:h-20'
    $content = $content -replace 'text-2xl font-black', 'text-xl md:text-3xl font-black'
    
    # 2. Hero Heading (index.html)
    $content = $content -replace 'text-3xl sm:text-4xl md:text-6xl', 'text-5xl md:text-7xl flex-wrap break-words w-full'
    $content = $content -replace 'text-4xl md:text-6xl', 'text-3xl md:text-5xl lg:text-7xl break-words w-full'
    $content = $content -replace 'text-2xl md:text-3xl', 'text-3xl md:text-5xl lg:text-7xl break-words w-full'
    
    # 3. Font Sizes
    $content = $content -replace 'text-sm md:text-lg', 'text-sm md:text-base'
    $content = $content -replace 'text-3xl font-bold text-white', 'text-xl md:text-2xl font-bold text-white'

    # 4. Buttons Mobile touch target & Full width (not nav links)
    # Adding min-h-[44px] to buttons/links that are primary actions
    $content = $content -replace 'px-6 py-3 rounded-full', 'px-6 py-3 rounded-full min-h-[44px] flex items-center justify-center'
    $content = $content -replace 'py-4 px-10 rounded-full', 'py-4 px-10 rounded-full min-h-[44px] w-full md:w-auto flex items-center justify-center text-center'

    # 5. Grid Layouts
    $content = $content -replace 'sm:grid-cols-2', 'md:grid-cols-2'
    $content = $content -replace 'columns-1 md:columns-2 lg:columns-3', 'columns-1 sm:columns-2 lg:columns-3'
    
    # 6. Padding/Margin (Sections)
    $content = $content -replace 'px-6 pt-44 pb-32', 'px-4 py-6 md:px-8 md:py-12 md:pt-44 md:pb-32'
    $content = $content -replace 'px-4 sm:px-6 lg:px-8 py-12', 'px-4 py-6 md:px-8 md:py-12'

    # 7. Images
    $content = $content -replace '<img([^>]*)class="([^"]*)"', '<img$1class="$2 max-w-full h-auto"'
    
    # Clean up duplicate classes if they exist
    $content = $content -replace 'h-auto max-w-full h-auto', 'h-auto max-w-full'
    $content = $content -replace 'w-full h-auto object-cover max-w-full h-auto', 'w-full h-auto object-cover max-w-full'

    # 8. Mobile Menu Visibility
    # "Menu open වුනාම links clearly පේන්න ඕනි"
    # Update mobile menu wrapper to ensure it covers properly and uses flex column
    $content = $content -replace 'class="md:hidden hidden bg-black bg-opacity-95 backdrop-blur-xl border-t border-gray-800"', 'class="md:hidden hidden bg-black/95 backdrop-blur-2xl border-t border-gray-800 absolute w-full left-0 top-[100%] shadow-2xl z-50"'

    # 9. Cards - ensure text wrap and height auto
    $content = $content -replace 'h-full flex flex-col', 'h-auto min-h-full flex flex-col break-words'

    # 10. Footer stacking
    $content = $content -replace '<footer class="bg-black py-12 border-t border-gray-800">', '<footer class="bg-black py-8 md:py-12 border-t border-gray-800 flex flex-col items-center justify-center">'

    [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Processed $file"
}
