const { defineConfig } = require('@vue/cli-service')
const path = require('path');
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: 'cordova_app/www',
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'
    : '/',
    configureWebpack: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src')
        }
      }
    }
})


// export default defineConfig({
//   plugins: [vue()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src')
//     }
//   }
// });