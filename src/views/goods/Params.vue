<template>
  <div class="params">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意:只允许为第三级别分类设置相关参数" type="warning" :closable="false" class="alert"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleChange"
            clearable change-on-select></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="addDialogVisible=true">添加参数</el-button>

          <!-- 表格区域 -->
          <el-table :data="manyTableDate" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环创建tag -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="closeHandle(i,scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                v-else
                class="button-new-tag" size="small"
                 @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
             <!-- 添加标签以及输入框 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>


        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isButtonDisabled" @click="addDialogVisible=true">添加属性</el-button>

          <!-- 表格区域 -->
          <el-table :data="onlyTableDate" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环创建tag -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="closeHandle(i,scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                v-else
                class="button-new-tag" size="small"
                 @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)"></el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加弹出框 -->
    <el-dialog :title="titleText+'编辑'" :visible.sync="addDialogVisible" width="60%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="110px">
        <el-form-item :label="titleText+'名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改弹出框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="60%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        cateList: [],
        //级联选择器选中的id值
        selectedKeys: [],
        //级联选择项规则
        cascaderProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        //tab页活跃项
        activeName: 'many',
        //动态表格参数
        manyTableDate: [],
        //动态表格参数
        onlyTableDate: [],
        //添加框可见性
        addDialogVisible: false,
        // 要添加的数据
        addForm: {
          attr_name: ''
        },
        //添加用户的表单数据验证规则
        addRules: {
          attr_name: [{
            required: true,
            message: '请输入属性名',
            trigger: 'blur'
          }]
        },
        //修改框可见性
        editDialogVisible: false,

        //要修改的属性
        editForm: {
          attr_name: ''
        },
        //修改用户的表单数据验证规则
        editRules: {
          attr_name: [{
            required: true,
            message: '请输入分类名',
            trigger: 'blur'
          }]
        },


      }
    },
    methods: {
      async getCartList() {
        const {
          data: res
        } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
        this.cateList = res.data
      },
      //级联选择器选项发生改变触发
      handleChange() {
        if (this.selectedKeys.length !== 3) {
          this.selectedKeys = []
          this.manyTableDate = []
          this.onlyTableDate = []
          return
        }
        this.getParamsDate()
      },
      //tab页改变时触发
      handleClick() {
        this.getParamsDate()
      },
      //获取商品参数
      async getParamsDate() {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })

        if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [],
          console.log(item.attr_vals)
          // 每行单独控制自己input显示与隐藏
           item.inputVisible = false
           item.inputValue = ''
        })
        if (this.activeName == 'many') {
          this.manyTableDate = res.data
        }
        if (this.activeName == 'only') {
          this.onlyTableDate = res.data
        }
      },
      //添加框关闭后清空表单
      addDialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      //发送新增请求
      addUser() {
        this.$refs.addFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          console.log(res)
          if (res.meta.status !== 201) return this.$message.error('添加信息失败')
          this.$message.success('添加信息成功')
          this.addDialogVisible = false
          this.getParamsDate()
        })
      },
      //点击编辑按钮
      async showEditDialog(id) {
        const {
          data: res
        } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
          params: {
            attr_sel: this.activeName
          }
        })
        if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //修改框关闭后
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      //发送修改请求
      editUser() {
        this.$refs.editFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('修改分类信息失败')
          this.$message.success('修改分类信息成功')
          this.editDialogVisible = false
          this.getParamsDate()
        })
      },
      //删除参数
      async deleteParams(id) {
        const res = await this.$confirm('此操作将永久删除该' + this.titleText + ', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (res !== 'confirm') return this.$message.info('已取消删除')
        const {
          data: result
        } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
        if (result.meta.status !== 200) return this.$message.error('删除参数失败')
        this.$message.success('删除参数成功')
        this.getParamsDate()
      },
      //添加标签失去焦点或者按下回车键
      async handleInputConfirm(row) {
        //检测用户输入内容是否合法
        if(row.inputValue.trim().length===0){
          row.inputValue = ''
          row.inputVisible=false
          return
        }
        //用户输入了有效的内容
        row.attr_vals.push(row.inputValue.trim())
        console.log(row.attr_vals)
        row.inputValue = ''
        row.inputVisible=false

        this.saveChange(row)
      },

      //标签删除改变数组的值并且向服务器发送请求保存
      closeHandle(i,row){
        row.attr_vals.splice(i,1)
        this.saveChange(row)
      },

      //向服务器发送请求保存这次更改
      async saveChange(row){
        const {
          data: res
        } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
          attr_name:row.attr_name,
          attr_sel:row.attr_sel,
          attr_vals:row.attr_vals.join(',')
        })
        if (res.meta.status !== 200) return this.$message.error('修改标签失败')
        this.$message.success('修改标签成功')
      },
      //展示input
      showInput(row) {
        row.inputVisible = true
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        })
      }
    },
    created() {
      this.getCartList()
    },
    computed: {
      //添加按钮是否许需要被禁用
      isButtonDisabled() {
        if (this.selectedKeys.length !== 3) return true
        return false
      },
      //级联选择器id
      cateId() {
        if (this.selectedKeys.length !== 3) return null
        return this.selectedKeys[2]
      },
      titleText() {
        if (this.activeName == 'many') {
          return '动态参数'
        } else
          return '静态属性'
      }
    }
  }
</script>

<style scoped>
  .alert {
    margin-bottom: 15px;
  }

  .input-new-tag {
    width: 150px;
  }
  .el-tag {
    margin: 0 10px;
  }
</style>
