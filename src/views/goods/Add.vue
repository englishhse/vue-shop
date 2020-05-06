<template>
  <div class="add-goods">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->

    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" show-icon center>
      </el-alert>

      <!-- 步骤条 -->
      <el-steps :space="200" :active="acticveIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="acticveIndex" :before-leave=beforeTabLeave @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cascaderProps" @change="handleChange"
                clearable change-on-select></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item,i) in manyTableDate" :key="i">
              <!-- 复选框 -->
               <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox v-for="(it,index) in item.attr_vals" :key="index" :label="it" border=""></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item,i) in onlyTableDate" :key="i">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers=headeObj
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片弹出框 -->
    <el-dialog title="预览" :visible.sync="preViewDialogVisible" width="60%" >
      <img :src="preViewUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
   import {deepClone1} from '../../../common/util.js'
  export default {
    data() {
      return {
        acticveIndex: '0',
        //添加表单的数据
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: '',
          pics:[],
          goods_introduce:'',
          attrs:[]
        },
        addFormRules: {
          goods_name: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
          goods_price: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
          goods_weight: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
          goods_number: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
          goods_cat: [{
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }],
        },
        //商品分类数据
        cateList: [],
        //级联选择项规则
        cascaderProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        //商品动态参数信息、
        manyTableDate: [],
        //商品静态属性信息、
        onlyTableDate: [],
        //图片上传请求头
        headeObj:{
          Authorization:window.sessionStorage.getItem('token')
        },
        //预览视图可见性及托爱你路径
        preViewUrl:'',
        preViewDialogVisible:false,
      }
    },
    methods: {
      //获取商品分类数据
      async getCartList() {
        const {
          data: res
        } = await this.$http.get('categories')
        if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
        this.cateList = res.data
      },
      //级联选择器选项发生改变时触发
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
        console.log(this.addForm.goods_cat)
      },
      //tab页切换守卫
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName == '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择一个分类')
          return false
        }
      },
      //tab页切换触发
      async tabClick() {
        if (this.acticveIndex == '1') {
          const {
            data: res
          } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: 'many'
            }
          })
          if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
          res.data.forEach(item=>{
            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          })
          this.manyTableDate = res.data
        }else if(this.acticveIndex == '2'){
          const {
            data: res
          } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: {
              sel: 'only'
            }
          })
          if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')

          this.onlyTableDate = res.data
        }
      },
      //图片上传
      handlePreview(file){
       console.log(file)
       this.preViewUrl = file.response.data.url
       this.preViewDialogVisible = true
      },
      handleRemove(file){
        const path = file.response.data.tmp_path
        const index = this.addForm.pics.findIndex(item=>{item.pic == path})
        this.addForm.pics.splice(index,1)
        console.log(this.addForm)
      },
      handleSuccess(resbonce){
        const picInfo =  {"pic":resbonce.data.tmp_path}
        this.addForm.pics.push(picInfo)
      },
      //添加商品
      add(){
           this.$refs.addFormRef.validate(async vail => {
           if (!vail) return
           const from = deepClone1(this.addForm)
           from.goods_cat = from.goods_cat.join(',')
           // 静态属性
           this.onlyTableDate.forEach(item => {
             const tableInfo = {attr_id:item.attr_id, attr_value:item.attr_vals}
             this.addForm.attrs.push(tableInfo)
           })
           // 动态参数
           this.manyTableDate.forEach(item => {
             const Info = {attr_id:item.attr_id,attr_value:item.attr_vals.join('')}
             this.addForm.attrs.push(Info)
           })
           from.attrs = this.addForm.attrs
           console.log(this.addForm)
           console.log(from)
           const {
             data: res
           } = await this.$http.post(`goods`,from)
           console.log(res)
           if (res.meta.status !== 201) return this.$message.error('添加商品失败')
           this.$message.success('添加商品成功')
           this.$router.push('/goods')
         })
      },
    },
    created() {
      this.getCartList()
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length == 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    }
  }
</script>

<style scoped>
  .el-checkbox{
    margin: 0 10px 0 0;
  }
  .el-button {
    margin-top: 15px;
  }
</style>
