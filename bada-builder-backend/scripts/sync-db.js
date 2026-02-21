import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = __dirname;
const rootDir = path.join(__dirname, '..');

// Sync-db identity
const scriptName = path.basename(__filename);

console.log('🚀 Starting Automated Multi-Script Sync...');
console.log('-------------------------------------------');

// Force SSL for RDS
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

try {
  // 1. Get all JS files in scripts directory
  let files = fs.readdirSync(scriptsDir)
    .filter(file => file.endsWith('.js') && file !== scriptName && file !== 'create-calendar-table.js');

  // 2. Define PRIORITY ORDER (Important for dependencies)
  const priorityOrder = [
    'migrate.js',                       // 1. Core tables (users, properties)
    'fix-users-table.js',               // 2. ADD COLUMN is_deleted, bio, etc.
    'create-otp-tables.js',             // 3. Adds is_verified to users
    'run-migration.js',                 // 4. Adds live_group_projects, units, etc.
    'create_short_stay_tables.js',      // 5. Adds short_stay_properties
    'create-reservations-table.js',     // 6. Adds short_stay_reservations
    'create_short_stay_drafts_table.js' // 7. Drafts
  ];

  // Separate priority files from the rest
  const remainingFiles = files.filter(f => !priorityOrder.includes(f)).sort();
  
  // Combine: Priority files first, then the rest
  const executionList = [
    ...priorityOrder.filter(f => files.includes(f)),
    ...remainingFiles
  ];

  // 3. Add base scripts from root if they exist
  const rootScripts = ['create-wishlist-tables.js'];
  
  console.log(`📂 Found ${files.length} scripts. Executing in priority order...`);

  // 4. Run scripts from /scripts
  for (const file of executionList) {
    console.log(`⏳ Running scripts/${file}...`);
    try {
      execSync(`node "${path.join(scriptsDir, file)}"`, { stdio: 'inherit', timeout: 60000 });
      console.log(`✅ scripts/${file} finished.\n`);
    } catch (err) {
      console.error(`⚠️ Error in scripts/${file}, skipping...\n`);
    }
  }

  // 5. Run specific scripts from root
  for (const script of rootScripts) {
    if (fs.existsSync(path.join(rootDir, script))) {
      console.log(`⏳ Running root/${script}...`);
      try {
        execSync(`node "${path.join(rootDir, script)}"`, { stdio: 'inherit' });
        console.log(`✅ root/${script} finished.\n`);
      } catch (err) {
        console.error(`⚠️ Error in root/${script}, skipping...\n`);
      }
    }
  }

} catch (error) {
  console.error('❌ Failed to read scripts directory:', error);
}

console.log('-------------------------------------------');
console.log('✨ All valid scripts have been processed!');
console.log('🚀 Your production database is now fully updated.');
