<template>
  <div class="user">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <!-- 搜索与添加区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable v-model="params.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="users" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作按钮区域 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editDialog(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="allotRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页条 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="params.pagenum"
        :page-sizes="[1, 2, 3, 4]" :page-size="params.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="0">
      </el-pagination>
    </el-card>
    <!-- 添加用户弹出框 -->
    <el-dialog title="添加用户" @close="dialogClose" :visible.sync="dialogVisible" width="30%">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户弹出框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色弹出框 -->
    <el-dialog title="角色分配" :visible.sync="allotDialogVisible"
    width="50%" ref="allotRef" @close="allotDialogClose">
      <p>当前用户为：{{currentUserName}}</p>
      <p>当前角色为：{{currentRoleName}}</p>
      <el-select  placeholder="请选择" v-model="selectedRId">
        <el-option v-for="item in roleNames" :key="item.id"
        :label="item.roleName" :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendNewRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        params: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        users: [],
        total: 0,
        dialogVisible: false,
        editDialogVisible: false,
        allotDialogVisible: false,
        //当前进行角色编辑角色信息
        currentUserName: '',
        currentRoleName: '',
        currentId:'',
        //用于接收所有角色名称的数组，分配角色时可让用户选择
        roleNames: [],
        //记录用户选择的角色id
        selectedRId:'',
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //添加用户的表单数据验证规则
        addRules: {
          username: [{
              required: true,
              message: '请输入用户名',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在3到10个字符',
              trigger: 'blur'
            },
          ],
          password: [{
              required: true,
              message: '请输入密码',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 10,
              message: '长度在3到10个字符',
              trigger: 'blur'
            }
          ],
          email: [{
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          }],
          mobile: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }]
        },
        //修改用户的表单数据
        editForm: {},
        editRules: {
          email: [{
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          }],
          mobile: [{
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }]
        }
      }
    },
    methods: {
      async getUserList() {
        const {
          data: res
        } = await this.$http.get('users', {
          params: this.params
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.users = res.data.users
        this.total = res.data.total
      },
      //分页每页数量改变时的方法
      handleSizeChange(newSize) {
        this.params.pagesize = newSize
        this.getUserList()
      },
      handleCurrentChange(newSize) {
        this.params.pagenum = newSize
        this.getUserList()
      },
      async userStateChange(payload) {
        const {
          data: res
        } = await this.$http.put(`users/${payload.id}/state/${payload.mg_state}`)
        if (res.meta.status !== 200) {
          payload.mg_state = !payload.mg_state
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('更新成功')
      },
      dialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      addUser() {
        this.$refs.addFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.dialogVisible = false
          this.getUserList()
        })
      },
      async editDialog(id) {
        this.editDialogVisible = true
        const {
          data: res
        } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取用户失败')
        this.editForm = res.data
      },
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      editUser() {
        this.$refs.editFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')
          this.$message.success('修改用户信息成功')
          this.editDialogVisible = false
          this.getUserList()
        })
      },
      async deleteUser(id) {
        const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (res === 'cancel') return this.$message.info('已取消删除')
        const {
          data: result
        } = await this.$http.delete('users/' + id)
        if (result.meta.status !== 200) return this.$message.error('删除用户信息失败')
        this.$message.success('删除用户信息成功')
        this.getUserList()
      },
      // 分配角色按钮点击触发
      async allotRoles(info) {
        this.currentRoleName = info.role_name
        this.currentUserName = info.username
        this.currentId = info.id
        const {
          data: res
        } = await this.$http.get('roles')

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.roleNames = res.data
        this.allotDialogVisible = true
      },
      //发送用户新选择的角色
        async sendNewRole(){
          if(!this.selectedRId) return this.$message.error('请选择一个角色')
          const {
            data: res
          } = await this.$http.put('users/' + this.currentId+'/role', {
            rid:this.selectedRId
          })
          if (res.meta.status !== 200) return this.$message.error('修改用户角色信息失败')
          this.$message.success('修改用户角色信息成功')
        },

        //关闭分配角色提升框后进行刷新操作
        allotDialogClose(){
          this.selectedRId = ''
        }

    },
    created() {
      this.getUserList()
    }
  }
</script>

<style scoped>
  .el-breadcrumb {
    margin-bottom: 15px;
  }

  .el-table {
    margin-top: 15px;
    font-size: 12px
  }

  .el-pagination {
    margin-top: 15px;
  }
</style>
