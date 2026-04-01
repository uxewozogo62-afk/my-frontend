<template>
  <div class="permission-management">
    <h2 class="page-title">系统权限与子管理员管理</h2>
    
    <a-card class="admin-list-card" title="子管理员账号列表">
      <a-table :columns="columns" :data-source="adminList" row-key="_id" :loading="loading">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'buildings'">
            <a-tag v-for="b in record.buildings" :key="b" color="blue" style="margin-right: 4px;">
              {{ b }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <a-space>
                <a-button size="small" @click="editAdmin(record)">编辑</a-button>
                <a-button size="small" danger @click="deleteAdmin(record._id)">删除</a-button>
              </a-space>
            </div>
          </template>
        </template>
      </a-table>
      <div class="add-admin" style="margin-top: 16px;">
        <a-button type="primary" @click="openAddAdminModal">添加子管理员</a-button>
      </div>
    </a-card>
    
    <a-modal
      :title="adminForm._id ? '编辑管理员' : '添加子管理员'"
      v-model:open="adminModalVisible"
      @ok="saveAdmin"
      :confirmLoading="submitting"
    >
      <a-form layout="vertical">
        <a-form-item label="姓名" required>
          <a-input v-model:value="adminForm.name" placeholder="请输入管理员姓名" />
        </a-form-item>
        <a-form-item label="登录账号" required>
          <a-input v-model:value="adminForm.account" placeholder="请输入登录账号" :disabled="!!adminForm._id" />
        </a-form-item>
        <a-form-item label="登录密码" :required="!adminForm._id">
          <a-input-password v-model:value="adminForm.password" :placeholder="adminForm._id ? '不修改请留空' : '请输入密码'" />
        </a-form-item>
        <a-form-item label="管辖楼栋">
          <a-checkbox-group v-model:value="adminForm.buildings" :options="['1号楼', '2号楼', '3号楼', '5号楼', '6号楼']" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="adminForm.remark" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '../../utils/request'
import { message, Modal } from 'ant-design-vue'

const adminList = ref([])
const loading = ref(false)
const submitting = ref(false)
const adminModalVisible = ref(false)

const adminForm = ref({
  _id: '',
  name: '',
  account: '',
  password: '',
  buildings: [],
  remark: ''
})

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '账号', dataIndex: 'account', key: 'account' },
  { title: '管辖范围', key: 'buildings' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'action' }
]

// 2. 从后端加载真实数据
const loadAdminList = async () => {
  loading.value = true
  try {
    const data = await request.get('/admin/sub-admins')
    // 适配后端返回的数组
    adminList.value = data || []
  } catch (e) {
    console.error('加载管理员列表失败:', e)
  } finally {
    loading.value = false
  }
}

const openAddAdminModal = () => {
  adminForm.value = { _id: '', name: '', account: '', password: '', buildings: [], remark: '' }
  adminModalVisible.value = true
}

const editAdmin = (record: any) => {
  // 深拷贝，防止修改表单时直接改变列表显示
  adminForm.value = { ...record, password: '' }
  adminModalVisible.value = true
}

// 3. 保存数据到后端（新增或更新）
const saveAdmin = async () => {
  if (!adminForm.value.name || !adminForm.value.account) {
    return message.warning('请填写必填项')
  }

  submitting.value = true
  try {
    if (adminForm.value._id) {
      // 更新逻辑
      await request.put(`/admin/sub-admins/${adminForm.value._id}`, adminForm.value)
      message.success('资料更新成功')
    } else {
      // 新增逻辑
      await request.post('/admin/sub-admins', adminForm.value)
      message.success('子管理员创建成功')
    }
    adminModalVisible.value = false
    loadAdminList() // 刷新列表
  } catch (e) {
    console.error('保存失败:', e)
  } finally {
    submitting.value = false
  }
}

// 4. 从后端删除
const deleteAdmin = (id: string) => {
  Modal.confirm({
    title: '确定删除该管理员吗？',
    content: '删除后该账号将无法再登录系统。',
    onOk: async () => {
      try {
        await request.delete(`/admin/sub-admins/${id}`)
        message.success('账号已注销')
        loadAdminList()
      } catch (e) {
        console.error('删除失败:', e)
      }
    }
  })
}

onMounted(loadAdminList)
</script>

<style scoped>
.permission-management { padding: 24px; }
.add-admin { display: flex; justify-content: flex-end; }
</style>