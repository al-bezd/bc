const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
   outputDir: 'cordova_app/www',
  //  publicPath: process.env.NODE_ENV === 'production'
  //   ? '/bc/'
  //   : '/'
   publicPath: process.env.NODE_ENV === 'production'
    ? '/'
    : '/'
})
