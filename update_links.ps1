$files = @("d:\LEGION-WEBSITE\index.html", "d:\LEGION-WEBSITE\shop.html")

$mapping = @{
    "Social Media Post" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Social+Media+Post+Design"
    "Logo Design" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Logo+Design"
    "Business Card" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Business+Card+Design"
    "Flyer Design" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Flyer+Design"
    "T-Shirt Design" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+T-Shirt+Design"
    "Custom Reel" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Custom+Reel"
    "Starter Pack" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Starter+Pack"
    "Social Media Pro" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Social+Media+Pro+Package"
    "Brand Empire" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Brand+Empire+Package"
    "Basic Management" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+Basic+SMM+Management"
    "Growth Package" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+SMM+Growth+Package"
    "Full Management Package" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Full+SMM+Package"
    "Instagram Followers" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+Instagram+Followers"
    "Facebook Followers" = "https://wa.me/94783040717?text=Hi%2C+I+want+to+order+Facebook+Followers"
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        
        # Split by product-card
        $parts = $content -split '(<div class="product-card[^>]*>)'
        
        $newContent = $parts[0]
        
        for ($i = 1; $i -lt $parts.Length; $i += 2) {
            $cardStart = $parts[$i]
            $cardBody = $parts[$i+1]
            
            if ($cardBody -match '<h3[^>]*>([^<]+)</h3>') {
                $title = $matches[1].Trim()
                if ($mapping.ContainsKey($title)) {
                    $newLink = $mapping[$title]
                    $cardBody = $cardBody -replace 'href="contact\.html"', "href=`"$newLink`" target=`"_blank`""
                } else {
                    Write-Host "Warning: Title not found in map: $title"
                }
            }
            
            $newContent += $cardStart + $cardBody
        }
        
        [System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Successfully updated $file"
    } else {
        Write-Host "File not found: $file"
    }
}
