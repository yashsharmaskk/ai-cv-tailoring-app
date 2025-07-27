import ngrok from 'ngrok';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startAppWithNgrok() {
  console.log('🚀 Starting CV Tailoring Application with ngrok...\n');

  // Start the development server
  console.log('📦 Starting development server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  let serverReady = false;

  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Check if server is ready
    if (output.includes('localhost:5000') || output.includes('Local:') || serverReady) {
      if (!serverReady) {
        serverReady = true;
        startNgrok();
      }
    }
  });

  devServer.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  async function startNgrok() {
    try {
      console.log('\n🌐 Starting ngrok tunnel...');
      
      // Wait a bit for the server to fully start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const url = await ngrok.connect({
        port: 5000,
        proto: 'http'
      });

      console.log('\n🎉 SUCCESS! Your CV Tailoring App is now public!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🌍 Public URL: ${url}`);
      console.log(`🏠 Local URL:  http://localhost:5000`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📱 Features available:');
      console.log('   ✅ AI-powered CV tailoring');
      console.log('   ✅ Location intelligence (300+ cities)');
      console.log('   ✅ Professional PDF export');
      console.log('   ✅ ATS score calculation');
      console.log('\n🔗 Share this URL with anyone to try your app!');
      console.log('📝 Note: Free ngrok URLs expire after 8 hours');
      console.log('\n🛑 Press Ctrl+C to stop both servers');

    } catch (error) {
      console.error('\n❌ Error starting ngrok:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure port 5000 is not in use');
      console.log('   2. Check your internet connection'); 
      console.log('   3. Try restarting the script');
      console.log('\n🌐 Manual ngrok: npx ngrok http 5000');
    }
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down servers...');
    
    try {
      await ngrok.kill();
      console.log('✅ ngrok tunnel closed');
    } catch (error) {
      console.log('⚠️ ngrok cleanup:', error.message);
    }

    devServer.kill();
    console.log('✅ Development server stopped');
    
    console.log('👋 Thanks for using CV Tailoring App!');
    process.exit(0);
  });
}

startAppWithNgrok().catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
