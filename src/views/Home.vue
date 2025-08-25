<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h1>云顶之奕组合工具</h1>
            <p>这是一个用于云顶之奕的组合计算工具，可以穷举在不同人口下棋子的羁绊组合。</p>

            <div class="feature-list">
              <h2>功能特点</h2>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-card class="feature-card">
                    <el-icon><DataAnalysis /></el-icon>
                    <h3>组合穷举</h3>
                    <p>穷举不同人口下棋子的羁绊组合</p>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="feature-card">
                    <el-icon><FilterIcon /></el-icon>
                    <h3>多维筛选</h3>
                    <p>按费用、羁绊、人口等多维度筛选</p>
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="feature-card">
                    <el-icon><Refresh /></el-icon>
                    <h3>自动更新</h3>
                    <p>棋子或羁绊变动时自动更新组合</p>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <div class="action-buttons">
              <el-button type="primary" size="large" @click="goToCompositions">
                开始查询组合
              </el-button>
              <el-button size="large" @click="goToChampions">
                查看棋子库
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { DataAnalysis, Filter as FilterIcon, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'HomeView',
  components: {
    DataAnalysis,
    FilterIcon,
    Refresh
  },
  setup () {
    const router = useRouter()

    const goToCompositions = () => {
      router.push('/compositions')
    }

    const goToChampions = () => {
      router.push('/champions')
    }

    return {
      goToCompositions,
      goToChampions
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.welcome-content h1 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #303133;
}

.welcome-content p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 40px;
}

.feature-list {
  margin: 40px 0;
}

.feature-list h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.feature-card {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card .el-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  margin: 10px 0;
  color: #303133;
}

.feature-card p {
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.action-buttons {
  margin-top: 40px;
}

.action-buttons .el-button {
  margin: 0 10px;
}
</style>
