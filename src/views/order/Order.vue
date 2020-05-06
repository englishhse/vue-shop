<template>
  <div class="order">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable>
              <el-button slot="append" icon="el-icon-search"  @click="serchOrder"></el-button>
            </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="230px"></el-table-column>
        <el-table-column label="订单价格(元)" prop="order_price" width="110px"></el-table-column>
        <el-table-column label="是否付款"   width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.order_pay==1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货"  prop="is_send"  width="80px"></el-table-column>
        <el-table-column label="下单时间" width="140px">
          <template slot-scope="scope">
            {{scope.row.create_time|showDate}}
          </template>
        </el-table-column>
        <!-- 操作按钮区域 -->
        <el-table-column label="操作" width="130px">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="changeAddress"></el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="shouProgress"></el-button>
        </el-table-column>
      </el-table>

      <!-- 分页条 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
        :page-sizes="[5,10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"
        background>
      </el-pagination>
    </el-card>
    <!-- 修改地址弹出框 -->
    <el-dialog title="修改地址" :visible.sync="changeDialogVisible" width="60%" @close="changeDialogClose">
      <el-form :model="changeForm" :rules="changeRules" ref="changeFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
              v-model="addressForm.address1"
              :options="address"
              :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取 消</el-button>
        <el-button type="primary">确 定</el-button>
      </span>
    </el-dialog>

   <!-- 物流进度弹出框 -->
    <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="60%" >
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import {Format} from '../../../common/util.js'
  import address from './city_data2017_element.js'
  export default {
    data(){
      return {
        //查询商品参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        //返回的商品数据
        orderList:[],
        //数据总数
        total:0,
        //弹出框相关属性
        changeDialogVisible:false,
        changeRules:{
          address1: [{
            required: true,
            message: '请输入地区名',
            trigger: 'blur'
          }],
          address2: [{
            required: true,
            message: '请输入地区名',
            trigger: 'blur'
          }]
        },
        //要修改的数据
        changeForm:{},
        addressForm:{
          address1:'',
          address2:''
        },
        //地址数据
        address:address,
        //物流框相关属性
        progressDialogVisible:false,
        //物流数据
        progressInfo:[],
      }
    },
    methods:{
      async getOrdersList() {
        const {
          data: res
        } = await this.$http.get('orders',{params:this.queryInfo})
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        console.log(res)
        this.orderList = res.data.goods
        this.total = res.data.total
      },
      //分页条发生变化
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        this.getOrdersList()
      },
      handleCurrentChange(newSize) {
        this.queryInfo.pagenum = newSize
        this.getOrdersList()
      },
      //顶部搜索框搜索按钮点击触发
      serchOrder(){
        console.log(this.queryInfo.query)
        this.getOrdersList()
      },
      //修改信息弹出框相关方法
      changeDialogClose(){
        this.$refs.changeFormRef.resetFields()
      },
      changeAddress(){
        this.changeDialogVisible = true
      },
      //物流信息相关方法
      async shouProgress(){
        const {
          data: res
        } = await this.$http.get('/kuaidi/804909574412544580')
        if (res.meta.status !== 200) return this.$message.error('获取快递信息失败')
        console.log(res)
        this.progressInfo = res.data
        this.progressDialogVisible = true
      },
    },
    created() {
      this.getOrdersList()
    },
    filters:{
      showDate(value){
        const date = new Date(value*1000)
        Date.prototype.Format = Format
        return date.Format('yyyy-MM-dd')
      }
    }
  }
</script>

<style scoped>
</style>
