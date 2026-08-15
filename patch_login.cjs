const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

code = code.replace(
  "const [password, setPassword] = useState('');",
  "const [password, setPassword] = useState('');\n  const [name, setName] = useState('');"
);

code = code.replace(
  "    if (isSignUp) {\n      const { error: authError } = await supabase.auth.signUp({\n        email,\n        password,\n      });",
  "    if (isSignUp) {\n      if (!name) {\n        setError('Por favor, informe seu nome.');\n        setLoading(false);\n        return;\n      }\n      const { error: authError } = await supabase.auth.signUp({\n        email,\n        password,\n        options: {\n          data: {\n            full_name: name,\n          }\n        }\n      });"
);

code = code.replace(
  "          <div className=\"space-y-4\">\n            <Input\n              type=\"email\"",
  "          <div className=\"space-y-4\">\n            {isSignUp && (\n              <Input\n                type=\"text\"\n                placeholder=\"Seu nome\"\n                value={name}\n                onChange={(e) => setName(e.target.value)}\n                required={isSignUp}\n              />\n            )}\n            <Input\n              type=\"email\""
);

fs.writeFileSync('src/pages/Login.tsx', code);
