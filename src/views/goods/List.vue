<template>
  <div class="list">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable>
            <el-button slot="append" icon="el-icon-search" @click="serchGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量"  prop="goods_weight"  width="70px"></el-table-column>
        <el-table-column label="创建时间" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time|showDate}}
          </template>
        </el-table-column>
        <!-- 操作按钮区域 -->
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="editgoods(scope.row.goods_id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deletegoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页条 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
        :page-sizes="[5,10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"
        background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import {Format} from '../../../common/util.js'
  export default {
    data() {
      return {
        //查询商品参数
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        //返回的商品数据
        goodsList:[],
        //数据总数
        total:0,
      }
    },
    methods: {
      async getGoodsList() {
        const {
          data: res
        } = await this.$http.get('goods',{params:this.queryInfo})
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        console.log(res)
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      //编辑按钮
      editgoods(){},
      //删除按钮
      async deletegoods(id){
        const res = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (res !== 'confirm') return this.$message.info('已取消删除')
        const {
          data: result
        } = await this.$http.delete(`goods/${id}`)
        if (result.meta.status !== 200) return this.$message.error('删除商品失败')
        this.$message.success('删除商品成功')
        this.getGoodsList()
      },
      //分页条发生变化
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      handleCurrentChange(newSize) {
        this.queryInfo.pagenum = newSize
        this.getGoodsList()
      },
      //搜索框搜索商品
      serchGoods(){
        this.getGoodsList()
      },
      //新增商品
      goAddPage(){
        this.$router.push('goods/add')
      },
    },
    filters:{
      showDate(value){
        const date = new Date(value*1000)
        Date.prototype.Format = Format
        return date.Format('yyyy-MM-dd')
      }
    },
    created() {
      this.getGoodsList()
    }
  }
</script>

<style scoped>
</style>
