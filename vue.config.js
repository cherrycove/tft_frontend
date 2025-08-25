const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://125.208.21.128:10266',
        changeOrigin: true
      }
    }
  }
})
