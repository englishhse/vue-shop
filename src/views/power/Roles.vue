<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    
    <!-- 卡片视图 -->
    <!-- 添加角色按钮 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="item in scope.row.children" :key=item.id class="['border']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteTag(scope.row,item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <el-row v-for="it in item.children" :key=it.id class="['border']">
                  <!-- 二级权限名 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteTag(scope.row,it.id)">{{it.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" closable v-for="i in it.children" :key=i.id @close="deleteTag(scope.row,i.id)">
                      {{i.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="230px">
          
          <!-- 按钮区域 -->
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editDialog(scope.row.id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="changeRights(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 修改用户弹出框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    
    <!-- 添加用户弹出框 -->
    <el-dialog title="添加角色" @close="dialogClose" :visible.sync="dialogVisible" width="30%">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限弹出框 -->、
    <el-dialog title="权限分配" :visible.sync="rightsDialogVisible" width="50%">
      <el-tree :data="rightsListTree" :props="defaultProps" default-expand-all
      show-checkbox node-key="id" :default-checked-keys="defaultKeys"
      ref="tree"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
  export default {
    data() {
      return {
        rolesList: [],
        //属性控件数据
        rightsListTree: [],
        defaultProps:{
          children: 'children',
          label: 'authName'
        },
        defaultKeys:[],
        //即将被分配权限的角色id
        roleId:'',
        //弹出框显示隐藏属性
        editDialogVisible: false,
        dialogVisible: false,
        rightsDialogVisible: false,
        //修改用户的表单数据
        editForm: {},
        editRules: {
          roleName: [{
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }],
          roleDesc: [{
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }]
        },
        //添加用户的表单数据
        addForm: {
          roleName: '',
          roleDesc: '',
        },
        //添加用户的表单数据验证规则
        addRules: {
          roleName: [{
            required: true,
            message: '请输入角色名',
            trigger: 'blur'
          }],
          roleDesc: [{
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }],
        },
      }
    },
    methods: {
      //获取角色列表
      async getRolesList() {
        const {
          data: res
        } = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
      },
      
      //添加角色的操作
      addUser() {
        this.$refs.addFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('添加角色失败')
          this.$message.success('添加角色成功')
          this.dialogVisible = false
          this.getRolesList()
        })
      },
      
      //添加角色视图关闭后清空表单
      dialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      
      //根据id获取角色信息
      async editDialog(id) {
        const {
          data: res
        } = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
        this.editForm = res.data
        this.editDialogVisible = true
        console.log(this.editForm)
      },
      
      //表单验证通过后想服务器发送修改数据的请求
      editUser() {
        this.$refs.editFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.put('roles/' + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('修改角色信息失败')
          this.$message.success('修改角色信息成功')
          this.editDialogVisible = false
          this.getRolesList()
        })
      },
      
      //关闭编辑角色表单后对表单进行清空
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      
      //删除角色根据id发送请求
      async deleteUser(id) {
        const res = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (res !== 'confirm') return this.$message.info('已取消删除')
        const {
          data: result
        } = await this.$http.delete('roles/' + id)
        if (result.meta.status !== 200) return this.$message.error('删除角色信息失败')
        this.$message.success('删除角色信息成功')
        this.getRolesList()
      },
      
      //三级标签删除
      async deleteTag(rid, id) {
        const res = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (res !== 'confirm') return this.$message.info('已取消删除')
        const {
          data: result
        } = await this.$http.delete('roles/' + rid.id + '/' + 'rights/' + id)
        if (result.meta.status !== 200) return this.$message.error('删除用户权限失败')
        this.$message.success('删除用户权限成功')
        rid.children = result.data
      },
      async changeRights(row) {
        const {
          data: res
        } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
        this.rightsListTree = res.data
        //把当前角色拥有的三级权限id放入defaultKeys数组中
        this.defaultKeys = []
         //拿到所有一级权限
         for(const item of row.children){
           //拿到所有二级权限
            for(const it of item.children){
              //拿到所有三级权限
              for(const i of it.children){
                this.defaultKeys.push(i.id)
              }
            }
          }
        this.roleId = row.id
        this.rightsDialogVisible = true
      },
      //点击确定按钮根据当前选定的权限id向服务器发送请求
      async allotRights(){
        const rid = [
          ...this.$refs.tree.getCheckedKeys(),
          ...this.$refs.tree.getHalfCheckedKeys()
        ]
        const idStr = rid.join(',')
        const {data:res} = await this.$http.post('roles/'+this.roleId+'/rights',{
          rids:idStr
        })
        if (res.meta.status !== 200) return this.$message.error('修改角色权限失败')
        this.$message.success('修改角色权限成功')
        this.getRolesList()
      }
    },
    created() {
      this.getRolesList()
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

  .el-tag {
    margin: 7px;
  }

  .border {
    border-bottom: 1px solid #eee;
  }

  .el-row {
    display: flex;
    align-items: center;
  }
</style>
