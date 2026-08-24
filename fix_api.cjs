const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

code = code.replace(/return data;/g, 'return data || [];');

code = code.replace(
  "export async function acceptFamilyInvite(token: string) {",
  "export async function acceptFamilyInvite(token: string): Promise<any> {"
);

code = code.replace(
  "export async function createFamilyInvite() {",
  "export async function createFamilyInvite(): Promise<any> {"
);

code = code.replace(
  "export async function getMyFamilyMemberships() {",
  "export async function getMyFamilyMemberships(): Promise<any[]> {"
);

code = code.replace(
  "export async function getFamilyMembers(familyId: string) {",
  "export async function getFamilyMembers(familyId: string): Promise<any[]> {"
);

code = code.replace(
  "export async function getFamilyInvites(familyId: string) {",
  "export async function getFamilyInvites(familyId: string): Promise<any[]> {"
);

fs.writeFileSync('src/services/api.ts', code);
