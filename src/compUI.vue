<template>
    <div :showShiTiBox="showShiTiBox" :showImgBox="showImgBox" :showSvgBox="showSvgBox" :showVideoBox="showVideoBox" :showTableBox="showTableBox">
        <!--图片-->
        <div class="dask" v-show="showImgBox">
            <div class="dialg">
                <div class="dlg-title">
                    <h1>插入图片</h1>
                    <span class="close" @click="close()">&times;</span>
                </div>
                <div class="dlg-content">
                    <div class="img-box">
                        <div class="imgs">
                            <span v-for="(img,i) in imageList" @click="$emit('addComponent','image',{src:img.path||img.thumb})" :key="i">
                                <img :src="img.thumbnail||img.thumb" alt="">
                            </span>
                        </div>
                        <div class="page"></div>
                    </div>
                    <div class="category">
                        <div class="search-box">
                            <input type="text" v-model="imgKey" placeholder="请输入关键字">
                            <input type="button" @click="searchImage(imgKey)" value="搜索">
                        </div>
                        <div class="cate" v-for="(item,i) in imageCate" :key="i">
                            <h1>{{item.category_name}}</h1>
                            <div class="cate-sub">
                                <span v-for="(cate,i) in item.children" @click="getImageList(cate.category_id)" :key="i">{{cate.category_name}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--svg-->
        <div class="dask" v-show="showSvgBox">
            <div class="dialg">
                <div class="dlg-title">
                    <h1>插入图标</h1>
                    <span class="close" @click="close()">&times;</span>
                </div>
                <div class="dlg-content">
                    <div class="img-box">
                        <div class="imgs">
                            <span v-for="(svg,i) in svgList" @click="$emit('addComponent','svg',{src:svg.path})" :key="i">
                                <img :src="svg.thumbnail" alt="" class="svg">
                            </span>
                        </div>
                        <div class="page"></div>
                    </div>
                    <div class="category">
                        <div class="cate">
                            <div class="cate-sub">
                                <span v-for="(svg,i) in svgCate" @click="getIcon(svg.id)" :key="i">{{svg.name}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--视频-->
        <div class="dask" v-show="showVideoBox">
            <div class="dialg">
                <div class="dlg-title">
                    <h1>插入视频</h1>
                    <span class="close" @click="close();videoList=[]">&times;</span>
                </div>
                <div class="dlg-content">
                    <div class="img-box">
                        <div class="imgs">
                            <span v-for="(v,i) in videoList" @click="$emit('addComponent','video',{src:v.video_url})" :key="i">
                                <video :src="v.video_url" class="video" controls="controls"></video>
                                <p>{{v.video_name}}</p>
                            </span>
                        </div>
                        <div class="page"></div>
                    </div>
                    <div class="category">
                        <div class="cate">
                            <div class="cate-sub">
                                <span v-for="(v,i) in videoCate" @click="getVideo(v.id)" :key="i">{{v.name}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--表格-->
        <div class="dask" v-show="showTableBox">
            <div class="dialg">
                <div class="dlg-title">
                    <h1>插入表格</h1>
                    <span class="close" @click="close()">&times;</span>
                </div>
                <div class="dlg-content flex-column">
                    <div class="title-sub">
                        表格宽度：
                        <input type="text" maxlength="3" v-model="tableWidth" @change="tableWidth=tableWidth>750?750:(tableWidth<=100?100:tableWidth)"> 行：
                        <input type="text" maxlength="1" v-model="rowCount" @keyup="rowCount=rowCount>9?9:(rowCount<=0?1:rowCount)"> 列：
                        <input type="text" maxlength="1" v-model="colCount" @keyup="colCount=colCount>9?9:(colCount<=0?1:colCount)">
                        <input type="button" value="确定" @click="insertTable()">
                    </div>
                    <div class="table-con" ref="table">
                        <div class="col" v-for="(x,index) in parseInt(colCount)" :key="index">
                            <input type="text" v-for="(y,i) in parseInt(rowCount)" :key="i">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--试题-->
        <div class="dask" v-show="showShiTiBox">
            <div class="dialg st">
                <div class="dlg-title">
                    <h1>插入测试题</h1>
                    <span class="close" @click="close()">&times;</span>
                </div>
                <div class="dlg-content flex-column">
                    <div class="type-sub">
                        <span :class="x.active&&'active'" v-for="(x,index) in st" @click="st.map(x=>x.active=false);x.active=true;" :key="index">{{x.text}}</span>
                    </div>
                    <div class="table-con">
                        <!-- 单选 -->
                        <div class="tab" v-show="st[0].active">
                            <h1>题目：
                                <input type="text" placeholder="请输入题目内容" v-model="r_dx.title">
                                <input type="button" value="增" @click="r_dx.keys.length<=6&&r_dx.keys.push({text:'',checked:false})">
                                <input type="button" value="确定" @click="insertShiTi(1)">
                            </h1>
                            <label for="" v-for="(x,i) in r_dx.keys" :key="i">
                                <input type="radio" name="r_dx" :checked="x.checked" @change="r_dx.keys.map(x=>x.checked=false);r_dx.keys[i].checked=true;">
                                <input type="text" :placeholder="`答案${i}`" maxlength="15" v-model="x.text">
                                <input type="button" value="删" @click="r_dx.keys.length>1&&r_dx.keys.splice(i,1)">
                            </label>
                        </div>
                        <!-- 多选 -->
                        <div class="tab" v-show="st[1].active">
                            <h1>题目：
                                <input type="text" placeholder="请输入题目内容" v-model="c_dx.title">
                                <input type="button" value="增" @click="c_dx.keys.length<=6&&c_dx.keys.push({text:'',checked:false})">
                                <input type="button" value="确定" @click="insertShiTi(2)">
                            </h1>
                            <label for="" v-for="(x,i) in c_dx.keys" :key="i">
                                <input type="checkbox" name="c_dx" v-model="x.checked">
                                <input type="text" v-model="x.text" maxlength="15" :placeholder="`答案${i}`">
                                <input type="button" value="删" @click="c_dx.keys.length>1&&c_dx.keys.splice(i,1)">
                            </label>
                        </div>
                        <!-- 判断题 -->
                        <div class="tab" v-show="st[2].active">
                            <h1>题目：
                                <input type="text" placeholder="请输入题目内容" v-model="pd.title">
                                <input type="button" value="确定" @click="insertShiTi(3)">
                            </h1>
                            <label for="" v-for="(x,i) in pd.keys" :key="i">
                                <input type="radio" name="pd" :checked="x.checked" @change="pd.keys.map(x=>x.checked=false);pd.keys[i].checked=true;">
                                <input type="text" v-model="x.text" maxlength="10" :placeholder="`答案${i}`">
                            </label>
                        </div>
                        <!-- 问答题 -->
                        <div class="tab" v-show="st[3].active">
                            <h1>题目：
                                <input type="text" placeholder="请输入题目内容" v-model="wd.A">
                                <input type="button" value="确定" @click="insertShiTi(4)">
                            </h1>
                            <textarea name="" id="" cols="30" rows="10" v-model="wd.Q" placeholder="请在此输入答案..."></textarea>
                        </div>
                        <!-- 连线题 -->
                        <div class="tab" v-show="st[4].active">
                            <h1>题目：
                                <input type="text" placeholder="请输入题目内容" v-model="lx.title" maxlength="50">
                                <input type="button" value="增" @click="actionlx('add')">
                                <input type="button" value="确定" @click="insertShiTi(5)">
                            </h1>
                            <canvas width="80" height="265" id="stLine"></canvas>
                            <div class="left">
                                <label for="" v-for="(x,i) in lx.keys.filter(x=>x.type==1)" :key="i">
                                    <input type="text" v-model="x.text" maxlength="15">
                                    <span class="b-l" @mousedown="test($event)">&nbsp;</span>
                                </label>
                            </div>
                            <div class="right">
                                <label for="" v-for="(x,i) in lx.keys.filter(x=>x.type==2)" :key="i">
                                    <span class="b-r">&nbsp;</span>
                                    <input type="text" v-model="x.text" maxlength="15">
                                    <input type="button" value="删" @click="actionlx('del',x.value)">
                                </label>
                            </div>
                        </div>
                        <!-- 填空题 -->
                        <div class="tab" v-show="st[5].active">
                            <h1>
                                <span>在下方输入题目，答案标识为鼠标选择部分</span>
                                <input type="button" value="确定" @click="insertShiTi(5)">
                            </h1>
                            <textarea name="" id="" cols="30" rows="5" v-model="tk.A" placeholder="请输入题目内容..."></textarea>
                            {{tk.A}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import component from './comp'

export default {
    name: 'compUI',
    props: {
        'showShiTiBox': { type: Boolean, default: false },
        'showImgBox': { type: Boolean, default: false },
        'showSvgBox': { type: Boolean, default: false },
        'showVideoBox': { type: Boolean, default: false },
        'showTableBox': { type: Boolean, default: false },
    },
    data() {
        return {
            r_dx: { title: '', keys: [{ text: '', checked: false }] },
            c_dx: { title: '', keys: [{ text: '', checked: false }] },
            pd: { title: '', keys: [{ text: '', checked: false }, { text: '', checked: false }] },
            wd: { A: '', Q: '' },tk:{A:'',Q:''},
            lx: { title: '', keys: [{ text: '', type: '1', value: 1, index: 0 }, { text: '', type: '2', value: 1, index: 0 }] },
            st: [{ text: '单选题', active: true }, { text: '多选题', active: false }, { text: '判断题', active: false }, { text: '问答题', active: false }, { text: '连线题', active: false }, { text: '填空题', active: false }],
            tableWidth: 800, rowCount: 5, colCount: 5, imgKey: '',
            imageList: [], imageCate: [], svgList: [], videoList: [], videoCate: [],
            svgCate: [
                { id: '58748f83c765ac6654ff83f5', name: '箭头' },
                { id: '5861c63257dccb0f98db4c59', name: '人物' },
                { id: '5861c63857dccb0f9aabad1a', name: '表情包' },
                { id: '5861c64357dccb0f936cfa91', name: '生活' },
                { id: '5861c64a57dccb0f936cfa92', name: '学习' },
                { id: '5861c65557dccb0f98db4c5a', name: '通讯' },
                { id: '586dec3057dccb2f1bde4b14', name: '数学符号' },
                { id: '586dec3057dccb2f1bde4b15', name: '其他符号' },
                { id: '58748f28c765ac665a7aaa68', name: '交通' },
            ],
        }
    },
    watch: {
        // showShiTiBox(v) { },
        showImgBox(v) { v && this.getImageCategory() },
        showSvgBox(v) { v && this.getIcon() },
        showVideoBox(v) { v && this.getVideoCate() },
        showTableBox(v) {
            if (v) {
                let t = this.$refs.table.querySelectorAll('input');
                for (var x of t) { x.value = '' };
            }
        }
    },
    mounted() {
        var canvas = document.getElementById("stLine");
        var ctx = canvas.getContext("2d");

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        var oX, oY;
        var flag = false;
        function draw(sx, sy, ex, ey) {
            ctx.clearRect(0, 0, 500, 260);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.restore()
        }
        canvas.onmousemove = function (e) {
            if (flag) {
                draw(oX, oY, e.offsetX, e.offsetY);
            }
        }
        canvas.onmousedown = function (e) {
            console.log(e)
            flag = true
            oX = e.offsetX
            oY = e.offsetY
        }
        canvas.onmouseup = (e) => { flag = false }
    },
    methods: {
        test(e) {
            console.log(e)
        },
        close() {
            this.$emit('close')
        },
        actionlx(t, value) {
            if (t == 'add') {
                let value = (this.lx.keys.length / 2) + 1
                this.lx.keys.length < 14 && this.lx.keys.push({ text: '', type: '1', value: value, index: value }, { text: '', type: '2', value: value, index: value })
            } else {
                if (this.lx.keys.length <= 2) {
                    //   this.lx.keys.map(x => x.value = 1)
                    return
                }
                this.lx.keys = this.lx.keys.filter(x => x.value != value)
            }
        },
        insertShiTi(type) {
            let root = ''
            switch (type) {
                case 1: root = new component.radio(this.r_dx); break;
                case 2: root = new component.checkbox(this.c_dx); break;
                case 3: root = new component.radio(this.pd); break;
                case 4: root = new component.sqa(this.wd); break;
                case 5: root = new component.line(this.lx); break;
            }
            if (root.outerHTML) {
                this.$emit('addComponent', 'svg', { data: root.outerHTML, options: { hasControls: false } })
                this.close()
            }
        },
        insertTable() {
            let tableData = [];
            let col = this.$refs.table.querySelectorAll('.col')
            // console.log(col)
            for (var x = 0; x < col.length; x++) {
                let row = col[x].querySelectorAll('input')
                !tableData[x] && (tableData[x] = [])
                for (var y = 0; y < row.length; y++) {
                    tableData[x][y] = row[y].value
                }
            }
            let table = new component.table(this.tableWidth, 300, {
                colCount: this.colCount,
                rowCount: this.rowCount,
                texts: tableData,
            })
            this.$emit('addComponent', 'svg', { data: table.outerHTML })
            this.close()
        },
        getImageCategory() { // 获取图片类型 
            if (this.imageCate.length > 0) return;
            this.$http.get('//id.91jianke.com:1081/operation_api/v0/image_category/image_category_list?manage_id=1').then(res => {
                this.imageCate = res.body.data.map(x => x[0])
                this.getImageList(this.imageCate[0].category_id)
            })
        },
        getImageList(cid) { // 获取图片列表
            this.$http.get(`//id.91jianke.com:1081/operation_api/v0/image_template/get_image_list?category=${cid}&page=1&page_num=40&sort_by=&manage_id=1`).then(res => {
                this.imageList = res.body.data.image_items
            })
        },
        searchImage(key) { // 搜索图片
            this.$http.get(`//id.91jianke.com:1081/api/v2.0/image/search?q=${key}&page_no=1&page_size=40`).then(res => {
                if (res.body.msg != 'success') {
                    alert(res.body.msg);
                    return;
                }
                this.imageList = res.body.data
            })
        },
        getIcon(cid) { // 获取图标
            cid = cid || this.svgCate[0].id
            this.$http.get(`//id.91jianke.com:1081/operation_api/v0/shape_template/get_shape_list?category=${cid}&page=1&page_num=150&sort_by=&manage_id=1`).then(res => {
                this.svgList = res.body.data.shape_items
            })
        },
        getVideoCate() {// 获取影片类型
            if (this.videoList.length == 0 && this.videoCate.length > 0) this.getVideo(this.videoCate[0].id)
            if (this.videoCate.length > 0) return;
            this.$http.get('//id.91jianke.com:1081/operation_api/v0/video_category/video_category_list?manage_id=1').then(res => {
                let data = res.body.data.map(x => x[0])
                data.map((x) => {
                    if (x.children.length == 0) {
                        this.videoCate.push({ id: x.category_id, name: x.category_name })
                    } else {
                        x.children.map((y) => {
                            this.videoCate.push({ id: y.category_id, name: y.category_name })
                        })
                    }
                })
                this.getVideo(this.videoCate[0].id)
            })
        },
        getVideo(cid) { // 获取类别下的影片
            this.$http.get(`//id.91jianke.com:1081/operation_api/v0/video_template/get_video_list?category=${cid}&page=1&page_num=30&sort_by=&manage_id=1`).then(res => {
                this.videoList = res.body.data.video_items
            })
        },
    }
}
</script>

