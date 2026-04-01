<template>
  <div class="elderly-list">
    <a-card title="老人档案管理">
      <a-table 
        :columns="columns" 
        :data-source="elderlyData" 
        :pagination="{ pageSize: 5 }" 
        row-key="_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click="$router.push('/admin/elderly-detail/' + record._id)">查看详情</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../../utils/request'
import { message } from 'ant-design-vue'

const elderlyData = ref([])
const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
  { title: '社区', dataIndex: 'community', key: 'community' },
  { title: '联系电话', dataIndex: 'phone', key: 'phone' },
  { title: '操作', key: 'action' }
]

const loadData = async () => {
  try {
    // 拦截器已经把 res.data.data 剥开了
    const data = await request.get('/admin/elderly'); 
    elderlyData.value = data; // 直接赋值数组
  } catch (err) {
    // 这里不需要写 message.error，拦截器已经帮你弹窗了
  }
}

onMounted(loadData)
</script>