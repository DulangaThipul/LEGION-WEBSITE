const fs = require('fs');
const path = require('path');

const files = ['d:/LEGION-WEBSITE/index.html', 'd:/LEGION-WEBSITE/shop.html'];

const linkMapping = {
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
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const parts = content.split(/(<div class="product-card[^>]*>)/);
  let newContent = parts[0];
  
  for (let i = 1; i < parts.length; i += 2) {
    let cardStart = parts[i];
    let cardBody = parts[i+1];
    
    let match = cardBody.match(/<h3[^>]*>([^<]+)<\/h3>/);
    if (match) {
      let title = match[1].trim();
      if (linkMapping[title]) {
        let newLink = linkMapping[title];
        cardBody = cardBody.replace(/href="contact\.html"/, `href="${newLink}" target="_blank"`);
      } else {
        console.log(`Warning: Unmapped title in ${file}: "${title}"`);
      }
    } else {
       console.log(`Warning: No title found in a card in ${file}`);
    }
    
    newContent += cardStart + cardBody;
  }
  
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Successfully updated ${file}`);
});
