<template>
  <div class="cate">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table :data="cateList" :columns="columns" :show-index="true" border :selection-type="false" :expand-type="false"
        class="tree-table">
        <!-- 是否有效列模板 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序列模板 -->
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 编辑列模板 -->
        <template slot="edit"  slot-scope="scope">
          <el-button type="primary" size="mini" @click="editCateName(scope.row.cat_id)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button type="danger" size="mini" @click="deleteCate(scope.row.cat_id)">
            <i class="el-icon-delete"></i>
          </el-button>
        </template>
      </tree-table>

      <!-- 分页条 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
         :page-sizes="[5, 7, 10, 15]" :page-size="queryInfo.pagesize"
         layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </el-card>

    <!-- 分配权限弹出框 -->、
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose" ref="addDialogRef">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>

        <!-- 级联选择器 -->
        <el-form-item label="父级分类">
          <el-cascader
             v-model="selectedKeys"
             :options="parentCateList"
             :props="cascaderProps"
             @change="handleChange"
             clearable
             change-on-select
             ></el-cascader>
        </el-form-item>
      </el-form>

          <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNewCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类弹出框 -->
    <el-dialog title="分类编辑" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
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
        //分类页面渲染的数据列表
        cateList: [],
        //总数据条数
        total: 0,
        //添加分类父分类列表
        parentCateList:[],
        //编辑分类页面开关
        editDialogVisible:false,
        editForm: {
          cat_name:''
        },
        editRules: {
          cat_name: [{
            required: true,
            message: '请输入新名称',
            trigger: 'blur'
          }]
        },

        //添加分类页面开关
        addDialogVisible: false,
        //即将要修改的分类数据
        addForm: {
          cat_pid:0,
          cat_name: '',
          cat_level:0
        },
        //添加用户的表单数据验证规则
        addRules: {
          cat_name: [{
            required: true,
            message: '请输入分类名',
            trigger: 'blur'
          }],
        },
        // 表格各列设置
        columns: [{
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            type: 'template',
            template: 'isok'
          },
          {
            label: '排序',
            type: 'template',
            template: 'sort'
          },
          {
            label: '编辑',
            type: 'template',
            template: 'edit'
          }
        ],
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5,
        },
        //级联选择器选中的id值
        selectedKeys:[],
        //级联选择项规则
        cascaderProps:{
          expandTrigger: 'hover',
          label:'cat_name',
          value:'cat_id',
          children:'children'
        },
      }
    },
    methods: {
      //获取商品分类数据
      async getCartList() {
        const {data:res} = await this.$http.get('categories', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
        this.cateList = res.data.result
        this.total = res.data.total
      },

      //获取父级分类数据
      async getParentCartList() {
        const {data:res} = await this.$http.get('categories', {
          params: {type:2}
        })

        if (res.meta.status !== 200) return this.$message.error('获取父级商品分类数据失败')
        this.parentCateList= res.data
      },

      //分页条每页数量发生改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCartList()
      },

      //分页条页码发生改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCartList()
      },

      //添加分类
      addCate() {
        console.log(this.cateList)
        console.log(this.parentCateList)
        this.getParentCartList()
        this.addDialogVisible = true
      },

      //级联选择器选项发生改变时触发
      handleChange(){
        console.log(this.selectedKeys)
        if(this.selectedKeys.length!==0) {
          this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
          this.addForm.cat_level = this.selectedKeys.length
        }else {
           this.addForm.cat_pid = 0
           this.addForm.cat_level = 0
        }
      },

       //携带addForm向服务器发送请求
      addNewCate(){
        this.$refs.addFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.post('categories',this.addForm)
          if (res.meta.status !== 201) return this.$message.error('添加分类失败')
          this.$message.success('添加分类成功')
          this.addDialogVisible = false
          this.getCartList()
        })
      },

      //添加分类弹出框关闭后
      addDialogClose(){
        this.$refs.addFormRef.resetFields()
        this.selectedKeys = []
        this.addForm.cat_level = 0
        this.addForm.cat_pid = 0
      },

      //编辑分类名
      async editCateName(id){
        const {
          data: res
        } = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
        console.log(res)
        this.editForm = res.data
        this.editDialogVisible = true
      },
      //向服务器发送修改后的数据
      editUser(){
        this.$refs.editFormRef.validate(async vail => {
          if (!vail) return
          const {
            data: res
          } = await this.$http.put('categories/' + this.editForm.cat_id, {
            cat_name: this.editForm.cat_name
          })
          console.log(res)
          if (res.meta.status !== 200) return this.$message.error('修改分类信息失败')
          this.$message.success('修改分类信息成功')
          this.editDialogVisible = false
          this.getCartList()
        })
      },
      //编辑页面关闭后清空表单
      editDialogClose(){
        this.$refs.editFormRef.resetFields()
      },

      //删除分类
      async deleteCate(id){
        const res = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (res !== 'confirm') return this.$message.info('已取消删除')
        const {
          data: result
        } = await this.$http.delete('categories/' + id)
        if (result.meta.status !== 200) return this.$message.error('删除分类信息失败')
        this.$message.success('删除分类信息成功')
        this.getCartList()
      }
    },
    created() {
      this.getCartList()
    }
  }
</script>

<style scoped>
  .el-breadcrumb {
    margin-bottom: 15px;
  }

  .tree-table {
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
