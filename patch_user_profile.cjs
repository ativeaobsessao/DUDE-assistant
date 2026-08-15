const fs = require('fs');
let code = fs.readFileSync('src/components/ui/UserProfile.tsx', 'utf8');

code = code.replace(
  ".from('family-assets').createSignedUrl(p.avatar_url, 60 * 60 * 24);",
  ".from('patient-profile').createSignedUrl(p.avatar_url, 60 * 60 * 24);"
);

code = code.replace(
  ".from('family-assets')\n        .upload(filePath, file);",
  ".from('patient-profile')\n        .upload(filePath, file);"
);

fs.writeFileSync('src/components/ui/UserProfile.tsx', code);
