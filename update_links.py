import os
import re

files_to_update = ['d:/LEGION-WEBSITE/index.html', 'd:/LEGION-WEBSITE/shop.html']

link_mapping = {
    'Social Media Post': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Social+Media+Post+Design',
    'Logo Design': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Logo+Design',
    'Business Card': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Business+Card+Design',
    'Flyer Design': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Flyer+Design',
    'T-Shirt Design': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+T-Shirt+Design',
    'Custom Reel': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+a+Custom+Reel',
    'Starter Pack': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Starter+Pack',
    'Social Media Pro': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Social+Media+Pro+Package',
    'Brand Empire': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Brand+Empire+Package',
    'Basic Management': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+Basic+SMM+Management',
    'Growth Package': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+SMM+Growth+Package',
    'Full Management Package': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+the+Full+SMM+Package',
    'Instagram Followers': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+Instagram+Followers',
    'Facebook Followers': 'https://wa.me/94783040717?text=Hi%2C+I+want+to+order+Facebook+Followers'
}

for file_path in files_to_update:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    parts = re.split(r'(<div class="product-card[^>]*>)', content)
    new_content = parts[0]
    
    for i in range(1, len(parts), 2):
        card_start = parts[i]
        card_body = parts[i+1]
        
        match = re.search(r'<h3[^>]*>([^<]+)</h3>', card_body)
        if match:
            title = match.group(1).strip()
            if title in link_mapping:
                new_link = link_mapping[title]
                card_body = re.sub(r'href="contact\.html"', f'href="{new_link}" target="_blank"', card_body)
            else:
                print(f"Warning: Unmapped title in {file_path}: '{title}'")
        else:
            print(f"Warning: No title found in a card in {file_path}")
            
        new_content += card_start + card_body
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Successfully updated {file_path}")
