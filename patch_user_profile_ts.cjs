const fs = require('fs');
let code = fs.readFileSync('src/components/ui/UserProfile.tsx', 'utf8');

code = code.replace(
  "p.avatarUrlSigned = data?.signedUrl || p.avatar_url;",
  "p.avatarUrlSigned = data?.signedUrl || p.avatar_url;"
);
// wait, easier way:
code = code.replace(
  "const p = await getCurrentProfile();\n    if (p) {\n      if (p.avatar_url) {\n        const { data } = await supabase.storage.from('patient-profile').createSignedUrl(p.avatar_url, 60 * 60 * 24);\n        p.avatarUrlSigned = data?.signedUrl || p.avatar_url;\n      }\n      setProfile(p);\n    }",
  "const p = await getCurrentProfile();\n    if (p) {\n      const profileData: any = { ...p };\n      if (p.avatar_url) {\n        const { data } = await supabase.storage.from('patient-profile').createSignedUrl(p.avatar_url, 60 * 60 * 24);\n        profileData.avatarUrlSigned = data?.signedUrl || p.avatar_url;\n      }\n      setProfile(profileData);\n    }"
);

code = code.replace(
  "      const { error: updateError } = await supabase\n        .from('profiles')\n        .update({ avatar_url: filePath })\n        .eq('id', profile.id);",
  "      const { error: updateError } = await supabase\n        .from('profiles')\n        .update({ avatar_url: filePath } as any)\n        .eq('id', profile.id);"
);

fs.writeFileSync('src/components/ui/UserProfile.tsx', code);
