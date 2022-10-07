import UbCategorySelect from '/static/apps/components/admin/base/category/UbCategorySelect.js';
import UbAttachFile from '/static/apps/components/ui/UbAttachFile.js';
import UbTextEditor from '/static/apps/components/admin/base/common/UbTextEditor.js';
import UbSimpleFileSelector from '/static/apps/components/ui/UbSimpleFileSelector.js';
import ProductList from '/static/apps/components/admin/product/ProductList.js';
import ProductSelectorDialog from '/static/apps/components/admin/product/ProductSelectorDialog.js';

import crudMixIn from '/static/apps/mixin/crudMixIn.js';

import LoadTempProduct from './LoadTempProduct.js';

const baseHelper = Vuex.createNamespacedHelpers('base');

const ProductManager = {
    name: 'product-manager',
    components: {
        UbCategorySelect,
        UbTextEditor,
        UbAttachFile,
        UbSimpleFileSelector,
        ProductList,
        ProductSelectorDialog,
        LoadTempProduct
    },
    template: `
        <div>
            <v-dialog v-model="imageSliderShow" scrollable overlay-color="#fff">
                <v-card>
                    <v-card-title v-if="allProductImages && allProductImages[imageSliderIndex]">
                            <span style=" margin-right: 10px;">
                                [{{imageUseOptions.find(e => e.value == allProductImages[imageSliderIndex].attachDivCd).text}}]
                            </span>
                        <span style="max-width:600px;
                                  overflow:hidden;
                                  text-overflow:ellipsis;
                                  white-space:nowrap;">
                               {{allProductImages[imageSliderIndex].name}}
                            </span>
                        <v-spacer></v-spacer>
                        {{allProductImages[imageSliderIndex].dimensions.width}} * {{allProductImages[imageSliderIndex].dimensions.height}}
                        ({{allProductImages[imageSliderIndex].sizeText}})
                    </v-card-title>
                    <v-carousel :show-arrows="true" :height="1000" style="background-color: #fff" v-model="imageSliderIndex">
                        <v-carousel-item
                                v-for="(item,i) in allProductImages"
                                :key="i">
                            <div style="display: flex;align-items: baseline;justify-content: center; height: 100%; overflow: auto; padding: 20px;">
                                <img :src="item.src" :width="item.dimensions.width"
                                     style="box-shadow: 0px 0px 5px #000; margin: auto; max-width:100%;"/>
                            </div>
                        </v-carousel-item>
                    </v-carousel>
                </v-card>
            </v-dialog>
            <v-sheet>
                <product-list :headers="tbl.headers" @select="selectItem" @preFetch="onPreFetch" @fetched="onFetched" ref="productList">
                    <template v-slot:item.thumbnail="{ item }">
                        <template v-if="item.thumbnailImageUrl">
                            <img :src="item.thumbnailImageUrl" style="max-width: 50px;"/>
                        </template>
                    </template>
                    
                    <template v-slot:item.dplyYn="{ item }">
                        <v-chip v-if="item.dplyYn === 'Y'" color="success">
                          Y
                        </v-chip>
                        <v-chip v-else>
                          N
                        </v-chip>
                    </template>
                    
                    <template v-slot:item.eolYn="{ item }">
                        <v-chip v-if="item.eolYn === 'Y'" color="success">
                          Y
                        </v-chip>
                        <v-chip v-else>
                          N
                        </v-chip>
                    </template>
                    
                    <template v-slot:item.spcYn="{ item }">
                        <v-chip v-if="item.spcYn === 'Y'" color="success">
                          Y
                        </v-chip>
                        <v-chip v-else>
                          N
                        </v-chip>
                    </template>
                    
                    <template v-slot:item.sortNo="{ item }">
                        {{item.sortNo == null || item.sortNo == undefined ? '-' : item.sortNo}}
                    </template>
        
                    <template v-slot:item.category="{ item }">
                        {{item.productCategories[0].cate1Nm}}
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <template v-if="item.delYn == 'N'">
                        <v-btn x-small color="danger" @click.stop="deleteItem(item)" v-if="item.delYn == 'N'">
                            삭제
                        </v-btn>
                        <v-btn x-small :color="item.dplyYn === 'Y' ? 'success' : 'warning'" @click.stop="updateDisplay(item)">
                            {{item.dplyYn === 'Y' ? '진열정지로' : '진열중으로'}} 변경
                        </v-btn>
                         </template>
                        <template v-else>
                            <v-btn x-small color="green" @click.stop="restoreItem(item)">
                            복원
                        </v-btn>
                        <v-btn x-small color="danger" @click.stop="clearItem(item)">
                            영구삭제
                        </v-btn>
                        </template>
                    </template>
        
                    <template v-slot:searchFormButtons>
                        <!--<ub-button color="info" label="엑셀다운로드" icon="mdi-download" @click="excelData"></ub-button>-->
                        <ub-button color="info" label="새로입력" icon="mdi-plus" @click="newItem()"></ub-button>
                        <!--<ub-button color="info" mode="text" label="임시저장 불러오기" icon="mdi-plus" @click="newItem()"></ub-button>-->
                        <load-temp-product @select="selectTempProduct"/>
                        <v-btn color="primary" @click="clearCache"><v-icon>mdi-refresh</v-icon>캐시 데이터 초기화</v-btn>
                    </template>
        
                </product-list>
            </v-sheet>
            <ub-view :view.sync="view">
                <template v-slot:head="{edit}">
                    <v-card-actions>
                        <template v-if="form.data.tmpYn == 'Y'">
                          <v-chip
                              class="ma-2"
                              color="red"
                              text-color="white"
                            >
                              임시저장 시간: {{form.data.updDt || form.data.regDt}}, 임시저장 제목: {{form.data.tmpNm}}
                            </v-chip>
                        </template>
                        <v-spacer></v-spacer>
                        <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-check" @click="saveItem()"></ub-button>
                        <ub-button v-if="view.edit" mode="text" color="warning" label="복사" icon="mdi-text-box-check" @click="saveAsItem()"></ub-button>
                        <ub-button v-if="!view.edit || form.data.tmpYn == 'Y'" mode="text" color="warning" label="임시저장" icon="mdi-text-box-check" @click="saveItem(true)"></ub-button>
                        <ub-button v-if="edit && form.data.delYn == 'N'" mode="text" color="danger" label="삭제" icon="mdi-delete" @click="deleteItem(form.data)"></ub-button>
                        <ub-button v-if="edit && form.data.delYn == 'Y'" mode="text" color="green" label="복원" icon="mdi-backup-restore" @click="restoreItem(form.data)"></ub-button>
                        <ub-button v-if="edit && form.data.delYn == 'Y'" mode="text" color="danger" label="영구삭제" icon="mdi-delete" @click="clearItem(form.data)"></ub-button>
                    </v-card-actions>
                </template>
        
                <template v-slot:body="{edit}">
                    <v-form class="input-form" ref="form" v-model="form.valid">
                        <v-row>
                            <v-col cols="12" md="3">
                                <ub-category-select label="대분류" :parent="'-1'" :rules="ubicus.base.rule.required" 
                                                    :search-mode="false" :selected.sync="form.data.productCategory1" category-type="PRODUCT"></ub-category-select>
                            </v-col>
                            <!--<v-col cols="12" md="3">
                                <ub-category-select label="중분류" :rules="ubicus.base.rule.required"
                                                    :parent="form.data.productCategory1" :search-mode="false" :selected.sync="form.data.productCategory2"
                                                    category-type="PRODUCT"></ub-category-select>
                            </v-col>
                            <v-col cols="12" md="6">
                                <ub-category-select label="소분류" :multiple="true" :rules="ubicus.base.rule.requiredMulti"
                                                    :parent="form.data.productCategory2" :search-mode="false" :selected.sync="form.data.productCategory3"
                                                    category-type="PRODUCT"></ub-category-select>
                            </v-col>-->
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="12">
                                <!--<v-list dense>
                                     <v-list-item v-for="(item,index) in category2Options" :key="index">
                                        {{item.cateNm}}
                                    </v-list-item>
                                </v-list>-->
                                
                                <v-simple-table dense class="ml-0">
                                    <template v-slot:default>
                                        <colgroup>
                                            <col width="100px"/>
                                            <col/>
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th>중분류</th>
                                                <th>소분류</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(cate2,index) in category2Options" :key="index">
                                                <th>{{cate2.cateNm}}</th>
                                                <td>
                                                    <div class="d-flex">
                                                        <v-checkbox v-for="cate3 in cate2.children" v-model="form.data.productCategory3"
                                                           class="mt-0 mr-2" 
                                                           hide-details
                                                          :label="cate3.cateNm"
                                                          :value="form.data.productCategory1 + ':' + cate2.cateId + ':' + cate3.cateId"
                                                    ></v-checkbox>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>
                                
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="3">
                                <v-text-field label="상품명" v-model="form.data.prdtNm" :rules="ubicus.base.rule.required"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-text-field label="제품크기" v-model="form.data.prdtSize" :rules="ubicus.base.rule.required"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="1">
                                 <v-text-field type="number" label="순서(내림)" v-model="form.data.sortNo"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <div class="d-flex">
                                    <v-switch
                                            class="ml-5"
                                            true-value="Y"
                                            false-value="N"
                                            v-model="form.data.spcYn"
                                            inset
                                            label="특가상품"
                                    ></v-switch>
                                    <v-switch
                                            class="ml-5"
                                            true-value="Y"
                                            false-value="N"
                                            v-model="form.data.eolYn"
                                            inset
                                            label="단종상품"
                                    ></v-switch>
                                    <v-switch
                                            class="ml-5"
                                            true-value="Y"
                                            false-value="N"
                                            v-model="form.data.dplyYn"
                                            inset
                                            label="진열여부"
                                    ></v-switch>
                                    <v-switch
                                            class="ml-5"
                                            true-value="Y"
                                            false-value="N"
                                            v-model="form.data.assgnYn"
                                            inset
                                            label="할당여부"
                                    ></v-switch>
                                    <!--<v-switch v-if="search.delYn == 'Y'"
                                    class="ml-5"
                                     true-value="Y"
                                     false-value="N"
                                     v-model="form.data.delYn"
                                     inset
                                     label="삭제여부"
                                   ></v-switch>-->
                                </div>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="12">
                                <v-textarea label="상품간단설명" v-model="form.data.prdtDsc" :rules="ubicus.base.rule.required"></v-textarea>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="12">
                                <v-card-subtitle class="pa-0 pb-1 pl-1 text-truncate">
                                    <v-icon x-small color="teal" class="a_link">mdi-chevron-right</v-icon>
                                    상품태그
                                </v-card-subtitle>
                                <v-combobox
                                        v-model="form.data.tagList"
                                        :items="[]"
                                        chips
                                        clearable
                                        label="상품태그"
                                        multiple
                                        solo
                                >
                                    <template v-slot:selection="{ attrs, item, select, selected }">
                                        <v-chip
                                                v-bind="attrs"
                                                :input-value="selected"
                                                close
                                                @click="select"
                                                @click:close="removeTag(item)"
                                        >
                                            <strong>{{ item }}</strong>
                                        </v-chip>
                                    </template>
                                </v-combobox>
                            </v-col>
                        </v-row>
        
        
                        <!--<v-card-subtitle class="pa-0 pb-1 pl-1 text-truncate">
                                <v-icon x-small color="teal" class="a_link">mdi-chevron-right</v-icon>
                                상품상세
                                <v-btn
                                  color="secondary"
                                  x-small
                                  @click="addDetailItem(-1)">
                                  <v-icon x-small>mdi-plus</v-icon>
                                </v-btn>
                         </v-card-subtitle>-->
        
                        <v-row>
                            <v-col cols="12" md="12">
                                <ub-button mode="text" color="success" label="상품상세 추가" icon="mdi-plus" @click="addDetailItem(-1)"></ub-button>
        
                                <v-simple-table class="ml-0">
                                    <template v-slot:default>
                                        <colgroup>
                                            <col/>
                                            <col width="200px"/>
                                            <col width="200px"/>
                                            <col width="200px"/>
                                            <col width="200px"/>
                                            <col width="200px"/>
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th class="text-left">
                                                Name
                                            </th>
                                            <th class="text-left">
                                                Part
                                            </th>
                                            <th class="text-left">
                                                Material
                                            </th>
                                            <th class="text-left">
                                                Size(mm)
                                            </th>
                                            <th class="text-left">
                                                Quantity per box
                                            </th>
                                            <th class="text-left">
                                                추가삭제
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="(item, index) in form.data.productDetails" :key="item.prdtDtNo">
                                            <td>
                                                <v-text-field :class="item.deleted ? 'text-decoration-line-through' : ''" :disabled="item.deleted" label="Name" v-model="item.prdtDtNm" :rules="item.deleted ? [] : ubicus.base.rule.required"></v-text-field>
                                            </td>
                                            <td>
                                                <v-text-field :class="item.deleted ? 'text-decoration-line-through' : ''" :disabled="item.deleted" label="Part" v-model="item.prdtDtPt"></v-text-field>
                                            </td>
                                            <td>
                                                <v-text-field :class="item.deleted ? 'text-decoration-line-through' : ''" :disabled="item.deleted" label="Material" v-model="item.prdtDtMtrl"></v-text-field>
                                            </td>
                                            <td>
                                                <v-text-field :class="item.deleted ? 'text-decoration-line-through' : ''" :disabled="item.deleted" label="Size(mm)" v-model="item.prdtDtSize" :rules="item.deleted ? [] : ubicus.base.rule.required"></v-text-field>
                                            </td>
                                            <td>
                                                <v-text-field type="number" :class="item.deleted ? 'text-decoration-line-through' : ''" :disabled="item.deleted" label="Quantity per box" v-model="item.prdtDtQntyPerBox" :rules="item.deleted ? [] : ubicus.base.rule.number"></v-text-field>
                                            </td>
                                            <td>
                                                <v-btn small tile color="success" @click="addDetailItem(index)">
                                                    <v-icon x-small left>
                                                        mdi-plus
                                                    </v-icon>
                                                    추가
                                                </v-btn>
                                                <v-btn small tile color="danger" @click="deleteDetailItem(item, index)">
                                                    <v-icon x-small left>
                                                        {{item.deleted ? 'mdi-backup-restore' : 'mdi-minus'}}
                                                    </v-icon>
                                                    {{item.deleted ? '복원' : '삭제'}}
                                                </v-btn>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>
        
                            </v-col>
                        </v-row>
        
                        <v-row class="">
                            <v-col cols="12" md="12">
                                <v-card-subtitle class="mt-5 pa-0 pb-1 pl-1 text-truncate">
                                    <v-icon x-small color="teal" class="a_link">mdi-chevron-right</v-icon>
                                    상품상세설명
                                </v-card-subtitle>
                                <ub-text-editor ref="textEditor" v-model="form.data.prdtDtDsc" :height="600" :value="form.data.prdtDtDsc"></ub-text-editor>
                            </v-col>
                        </v-row>
        
                        <v-row class="">
                            <v-col cols="12" md="12">
                                <ub-simple-file-selector ref="fileSelector" v-model="form.data.productImageFiles" @fileSelection="fileSelection"
                                                         label="상품이미지 추가" :multiple="true" accept="image/*" attachDivCd="PRDT_TP01">
                                    <template v-slot:activator="{on}">
                                        <ub-button mode="text" color="success" label="상품이미지 추가" icon="mdi-plus" v-on="on"></ub-button>
                                        <small class="ml-1 blue pa-1">버튼 클릭 또는 이미지 파일을 끌어다 놓으세요.</small>
                                        <small class="ml-1 green pa-1">"작은이미지(썸네일)"를 별도로 지정하지 않으면 확대이미지를 자동으로 축소(500x500)시켜서 생성합니다.</small>
                                    </template>
                                    <template v-slot:list="{files}">
                                        <v-simple-table class="ml-0">
                                            <template v-slot:default>
                                                <colgroup>
                                                    <col width="310"/>
                                                    <col/>
                                                    <col width="200"/>
                                                    <col width="150"/>
                                                    <col width="250"/>
                                                </colgroup>
                                                <thead>
                                                <tr>
                                                    <th class="text-center">
                                                        이미지
                                                    </th>
                                                    <th class="text-left">
                                                        파일명
                                                    </th>
                                                    <th class="text-center">
                                                        크기
                                                    </th>
                                                    <th class="text-center">
                                                        사용처
                                                    </th>
                                                    <th class="text-left">
                                                        설명
                                                    </th>
                                                    <th class="text-center">
                                                        다운/삭제
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr v-for="(file, index) in files" :key="index">
                                                    <td class="text-center pa-5" @click="showImageSlider(index)" style="cursor: pointer">
                                                        <img :src="file.dataURL" style="max-width: 270px; max-height: 200px; box-shadow: 0px 0px 5px #000;"/>
                                                    </td>
                                                    <td>
                                                        <span>{{file.name }}</span>
                                                    </td>
                                                    <td class="text-center">
                                                        <p class="mb-0">{{file.dimensions.width}} * {{file.dimensions.height}}</p>
                                                        <small>[{{file.sizeText}}]</small>
                                                    </td>
        
                                                    <td class="text-center">
                                                        <v-select :rules="ubicus.base.rule.required" v-model="file.attachDivCd"
                                                                  :items="imageUseOptions"></v-select>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-text-field label="설명" v-model="file.fileDsc"></v-text-field>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-btn small tile color="danger" @click="deleteImage(file, index)">
                                                            <v-icon x-small left>
                                                                mdi-minus
                                                            </v-icon>
                                                            취소
                                                        </v-btn>
                                                    </td>
                                                </tr>
        
                                                <tr v-for="(file, index) in form.data.productSavedImageFiles" :key="file.fileKey">
                                                    <td class="text-center pa-5" @click="showImageSlider(form.data.productImageFiles.length + index)" style="cursor: pointer">
                                                        <img :src="file.dataURL" :style="{'max-width':'270px', 'max-height': '200px', 'box-shadow': '0px 0px 5px #000', 'filter' : (file.workType === 'DELETE' ? 'grayscale(100%)' : 'none')}"/>
                                                    </td>
                                                    <td :class="file.workType === 'DELETE' ? 'text-decoration-line-through' : ''">
                                                        <span>{{ file.name }}</span>
                                                    </td>
                                                    <td class="text-center" :class="file.workType === 'DELETE' ? 'text-decoration-line-through' : ''">
                                                        <p class="mb-0">{{file.dimensions.width}} * {{file.dimensions.height}}</p>
                                                        <small>[{{file.sizeText}}]</small>
                                                    </td>
        
                                                    <td class="text-center">
                                                        <v-select :rules="ubicus.base.rule.required" v-model="file.attachDivCd"
                                                                  :disabled="file.workType === 'DELETE'"
                                                                  :items="imageUseOptions"></v-select>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-text-field label="설명" v-model="file.fileDsc"></v-text-field>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-btn small tile color="success" @click="downloadImage(file)">
                                                            <v-icon x-small left>
                                                                mdi-download
                                                            </v-icon>
                                                            다운로드
                                                        </v-btn>
                                                        <v-btn small tile color="danger" @click="deleteImage(file, index)">
                                                            <v-icon x-small left>
                                                                {{file.workType === 'DELETE' ? 'mdi-backup-restore' : 'mdi-minus'}}
                                                            </v-icon>
                                                            {{file.workType === 'DELETE' ? '복원' : '삭제'}}
                                                        </v-btn>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </template>
                                        </v-simple-table>
                                    </template>
                                </ub-simple-file-selector>
        
                            </v-col>
                        </v-row>
        
                        <v-row class="">
                            <v-col cols="12" md="12">
                                <product-selector-dialog title="관련상품 등록" :selectedProducts.sync="form.data.relProducts">
                                    <template v-slot:activator="{ on, attrs }">
                                        <ub-button mode="text" color="success" label="관련상품 추가" icon="mdi-plus" v-bind="attrs" v-on="on"></ub-button>
                                        <small class="ml-1"> * 드래그&드랍으로 순서를 조정하세요.</small>
                                    </template>
                                </product-selector-dialog>
                                <v-simple-table class="ml-0">
                                    <template v-slot:default>
                                        <colgroup>
                                            <col width="50px"/>
                                            <col width="100px"/>
                                            <col width="140px"/>
                                            <col/>
                                            <col width="100px"/>
                                        </colgroup>
                                        <thead>
                                        <tr>
                                            <th class="text-center">
                                                이동
                                            </th>
                                            <th class="text-center">
                                                순서
                                            </th>
                                            <th class="text-center">
                                                이미지
                                            </th>
                                            <th class="text-left">
                                                상품명
                                            </th>
                                            <th class="text-center">
                                                삭제
                                            </th>
                                        </tr>
                                        </thead>
                                        <draggable v-model="form.data.relProducts" tag="tbody" handle=".handle">
                                            <tr v-if="element.prdtKey != form.data.prdtKey" v-for="(element,index) in form.data.relProducts" :key="element.prdtKey">
                                                <td class="handle text-center cursor-pointer">
                                                    <v-btn
                                                            color="secondary"
                                                            x-small
                                                            dark
                                                    >
                                                        <v-icon>mdi-format-align-justify</v-icon>
                                                    </v-btn>
                                                </td>
                                                <td class="text-center">{{index+1}}</td>
                                                <td class="text-center">
                                                    <img :src="element.thumbnailImageUrl" style="max-width: 50px;"/>
                                                </td>
                                                <td>{{element.prdtNm}}</td>
                                                <td class="text-center">
                                                    <v-btn small tile color="danger" @click="deleteRelProduct(element, index)">
                                                        <v-icon x-small left>mdi-minus</v-icon>
                                                        삭제
                                                    </v-btn>
                                                </td>
                                            </tr>
                                        </draggable>
                                    </template>
                                </v-simple-table>
        
                            </v-col>
                        </v-row>
        
                    </v-form>
                </template>
        
                <template v-slot:control="{edit}">
                    <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-check" @click="saveItem()"></ub-button>
                    <ub-button v-if="view.edit" mode="text" color="warning" label="복사" icon="mdi-text-box-check" @click="saveAsItem()"></ub-button>
                    <ub-button v-if="!view.edit || form.data.tmpYn == 'Y'" mode="text" color="warning" label="임시저장" icon="mdi-text-box-check" @click="saveItem(true)"></ub-button>
                    <ub-button v-if="edit && form.data.delYn == 'N'" mode="text" color="danger" label="삭제" icon="mdi-delete" @click="deleteItem(form.data)"></ub-button>
                    <ub-button v-if="edit && form.data.delYn == 'Y'" mode="text" color="green" label="복원" icon="mdi-backup-restore" @click="restoreItem(form.data)"></ub-button>
                    <ub-button v-if="edit && form.data.delYn == 'Y'" mode="text" color="danger" label="영구삭제" icon="mdi-delete" @click="clearItem(form.data)"></ub-button>
                </template>
        
            </ub-view>
            
        </div>
    `,
    mixins: [crudMixIn],
    data: () => ({
        url: '/admin/product',
        imageUseOptions: [
            {text: '확대이미지', value: 'PRDT_TP01'},
            {text: '작은이미지', value: 'PRDT_TP02'},
            {text: '추가이미지', value: 'PRDT_TP03'},
            {text: '다른색상이미지', value: 'PRDT_TP04'},
            {text: '아웃이미지', value: 'PRDT_TP05'}
        ],
        tbl: {
            headers: [
                {text: 'No', value: 'prdtNo', width: 60, sortable: false},
                {text: '순서', value: 'sortNo', width: 60, sortable: true},
                {text: '이미지', value: 'thumbnail', width: 140, sortable: false, align: 'center'},
                {text: '카테고리', value: 'category', width: 140, sortable: false},
                {text: '상품명', value: 'prdtNm',  sortable: true, class: 'min-width--300'},
                {text: '진열여부', value: 'dplyYn', width: 100, align: 'center', sortable: true},
                {text: '단종여부', value: 'eolYn', width: 100, align: 'center', sortable: true},
                {text: '특가여부', value: 'spcYn', width: 100, align: 'center', sortable: true},
                {text: '등록일', value: 'regDt', width: 160, align: 'center', sortable: true},
                {text: '조회수', value: 'viewCnt', width: 80, align: 'right', sortable: true},
                {text: '편집', value: 'actions', width: 200, align: 'center', sortable: false}
            ]
        },
        form: {
            init: {
                prdtNo: undefined,
                prdtKey: undefined,
                prdtNm: undefined,
                prdtDsc: undefined,
                prdtSize: undefined,
                prdtDtDsc: undefined,
                dplyYn: 'N',
                eolYn: 'N',
                assgnYn: 'N',
                regDt: undefined,
                updDt: undefined,
                tagList: [],
                productCategories: [],
                productDetails: [],
                productCategory1: undefined,
                productCategory2: [],
                productCategory3: [],
                productCategory3backup: [],
                productImageFiles: [],
                productSavedImageFiles: [],
                relProducts: []
            },
            data: {},
        },
        view: {
            outlined: true
        },
        imageSliderShow: false,
        imageSliderIndex: 0,
        productSelectorShow: false,
        currentList: []
    }),
    computed: {
        ...baseHelper.mapGetters(['getProductCategories']),
        category2Options() {
            if (!this.form.data.productCategory1) {
                return [];
            }
            const category1 = this.getProductCategories.find(e => e.cateId == this.form.data.productCategory1);
            if (!category1) {
                return [];
            }
            return category1.children;
        },
        $productList() {
            return this.$refs['productList'];
        },
        relProducts() {
            return this.form.data.relProducts.filter(e => e.prdtNo != this.form.data.prdtNo);
        },
        allProductImages() {

            if (!this.form.data.productImageFiles) {
                this.form.data.productImageFiles = [];
            }

            if (!this.form.data.productSavedImageFiles) {
                this.form.data.productSavedImageFiles = [];
            }

            return [
                ...this.form.data.productImageFiles.map(e => ({
                    src: e.dataURL,
                    workType: e.workType,
                    sizeText: e.sizeText,
                    attachDivCd: e.attachDivCd,
                    name: e.name,
                    dimensions: e.dimensions
                })),
                ...this.form.data.productSavedImageFiles.map(e => ({
                    src: e.dataURL,
                    workType: e.workType,
                    sizeText: e.sizeText,
                    attachDivCd: e.attachDivCd,
                    name: e.name,
                    dimensions: e.dimensions
                }))
            ];
        }
    },
    methods: {
        onPreFetch(isAuto) {
            if (!isAuto) {
                this.view.show = false;
            }
        },
        onFetched(resp, isAuto) {

            if (!isAuto) {
                // 사용자가 직접 조회를 누른경우라면..
                // 상세 영역 숨기고 selectedItem 초기화
                this.view.show = false;
                this.resetItem();
            } else {
                this.currentList = resp.data;

                console.log('this.currentList', this.currentList);
                if (this.form.data.prdtKey) {
                    const target = this.currentList.find(e => e.prdtKey == this.form.data.prdtKey);
                    console.log('target', target);
                    if (target) {
                        this.selectItem(target);
                    } else {
                        this.view.show = false;
                    }
                } else {
                    this.view.show = false;
                }
            }

            this.$setOverlay(false);

            console.log('this.currentList', this.currentList);

        },
        clearCache() {
            this.ubicus.base.lib.confirm('상품 캐시데이터를 삭제 하시겠습니까?').then(result => {
                if (result.isConfirmed) {
                    this.xAjax({
                        url: `/admin/product/clearCache`,
                        method: 'DELETE',
                    }).then((resp) => {
                        this.ubicus.base.lib.notify('상품 캐시데이터가 초기화 되었습니다.');
                    });
                }
            })
        },
        showImageSlider(index = 0) {
            this.imageSliderIndex = index;
            this.imageSliderShow = true;
        },
        fetchData(isSearchFirst, isAuto = false) {
            if(!isAuto) {
                this.view.show = false;
            }
            this.$productList.fetchData(isSearchFirst, isAuto);
        },

        clearItem(item) {
            this.ubicus.base.lib.confirm('해당 상품정보를 영구삭제 하시겠습니까?\n영구삭제가 되면 복원할수 없습니다.').then(result => {
                if (result.isConfirmed) {
                    this.xAjax({
                        url: `/admin/product/permanentlyDelete/${item.prdtKey}`,
                        method: 'DELETE',
                    }).then((resp) => {
                        this.ubicus.base.lib.notify('영구삭제 되었습니다.');
                        this.fetchData(true);
                    });
                }
            })
        },

        restoreItem(item) {
            this.ubicus.base.lib.confirm('복원 하시겠습니까?').then(result => {
                if (result.isConfirmed) {
                    this.xAjaxJson({
                        url: '/admin/product/base',
                        method: 'PATCH',
                        data: {
                            prdtKey: item.prdtKey,
                            delYn: 'N'
                        }
                    }).then((resp) => {
                        this.ubicus.base.lib.notify(resp);
                        this.fetchData(false);
                    });
                }
            });
        },
        selectItem(item) {
            this.view.edit = true;
            this.view.show = true;


            const formData = Object.assign({}, this._.cloneDeep(this.form.init), item);

            if (item.productCategories && item.productCategories.length > 0) {
                formData.productCategory1 = String(item.productCategories[0].cate1Id);
                //formData.productCategory2 = String(item.productCategories[0].cate2Id);
                formData.productCategory3 = item.productCategories.map(e => e.cate1Id + ':' + e.cate2Id + ':' + e.cate3Id);
                formData.productCategory3backup = formData.productCategory3;
            }

            const sortedAttachFiles = this._.sortBy(item.attachFiles, (item) => {
                return [item.attachDivCd, item.userFileNm];
            });

            formData.productSavedImageFiles = sortedAttachFiles.map(e => {
                const meta = e.meta ? JSON.parse(e.meta) : {};
                return {
                    name: e.userFileNm,
                    fileNm: e.fileNm,
                    fileKey: e.fileKey,
                    sizeText: this.ubicus.base.util.fileSize(e.fileSize),
                    dataURL: e.url,
                    attachDivCd: e.attachDivCd,
                    filePath: e.filePath,
                    fileDsc: e.fileDsc,
                    workType: 'SELECTED',
                    dimensions: {
                        width: meta.width,
                        height: meta.height
                    }
                };
            });

            formData.relProducts.push(formData);

            if (!formData.prdtDtDsc) {
                formData.prdtDtDsc = '';
            }

            this.form.data = formData;
        },
        onCrudMixInActions(actionName, item, options) {
        },
        downloadImage(file) {
            location.href = `${this.$settings.requestMapping}/base/files/${file.fileKey}/download`;
        },
        deleteImage(file, index) {
            if (file.workType === 'INSERT') {
                this.form.data.productImageFiles.splice(index, 1);
            } else {
                if (file.workType === 'DELETE') {
                    file.workType = 'SELECTED';
                } else if (file.workType === 'SELECTED') {
                    file.workType = 'DELETE';
                }
            }
        },
        deleteRelProduct(relProduct, index) {
            this.form.data.relProducts.splice(index, 1);
        },
        fileSelection(files) {
            console.log('fileSelection', files, this.form.data.productImageFiles);
        },
        removeTag(item) {
            this.form.data.tagList.splice(this.form.data.tagList.indexOf(item), 1);
            this.form.data.tagList = [...this.form.data.tagList];
        },
        async updateDisplay(item) {

            const updateValue = item.dplyYn === 'Y' ? 'N' : 'Y';

            await this.xAjaxJson({
                url: '/admin/product/base',
                method: 'PATCH',
                data: {
                    prdtKey: item.prdtKey,
                    dplyYn: updateValue
                }
            });

            item.dplyYn = updateValue;

            if (this.view.edit) {
                this.form.data.dplyYn = updateValue;
            }

            this.ubicus.base.lib.notify(`진열상태가 ${item.dplyYn == 'Y' ? '[진열중]' : '[진열정지]'} 상태로 변경되었습니다.`);

        },
        addDetailItem(index) {

            const newDetail = {
                prdtDtMtrl: '',
                prdtDtNm: '',
                prdtDtPt: '',
                prdtDtQntyPerBox: 0,
                prdtDtSize: '',
                prdtNo: this.form.data.prdtNo
            };

            if (index == -1) {
                this.form.data.productDetails.push(newDetail);
            } else {
                this.form.data.productDetails.splice(index + 1, 0, newDetail);
            }

        },
        deleteDetailItem(item, index) {

            if (!item.prdtDtMtrl && !item.prdtDtNm && !item.prdtDtPt && !item.prdtDtSize && !item.prdtDtSize && !item.prdtDtQntyPerBox) {
                this.$delete(this.form.data.productDetails, index);
            } else {
                this.$set(this.form.data.productDetails, index, {
                    ...item,
                    deleted: !!!item.deleted
                });
            }
        },

        async saveAsItem() {
            await this.saveItem(false, true);
        },
        async saveItem(isTemp = false, copy = false) {

            const details = this.form.data.productDetails.filter(e => !!!e.deleted);

            let categories = [];

            if (this.form.data.productCategory3.length == 0) {
                if (this.form.data.productCategory2.length == 0) {
                    categories = [{
                        cate1Id: this.form.data.productCategory1,
                        cate2Id: -1,
                        cate3Id: -1,
                        prdtNo: this.form.data.prdtNo
                    }]
                }else {
                    categories = this.form.data.productCategory2.map(e => {
                        const split = e.split(':');
                        return {
                            cate1Id: split[0],
                            cate2Id: split[1],
                            cate3Id: -1,
                            prdtNo: this.form.data.prdtNo
                        }
                    })
                }
            }else {
                categories = this.form.data.productCategory3.map(e => {
                    const split = e.split(':');
                    return {
                        cate1Id: split[0],
                        cate2Id: split[1],
                        cate3Id: split[2],
                        prdtNo: this.form.data.prdtNo
                    }
                });
            }


            if (!isTemp && !this.form.valid) {
                this.ubicus.base.lib.notify('필수입력 항목이 누락되었습니다.', {title: '필수값 입력'}, {type: 'error'});
                return this.$refs.form.validate();
            }

            if (!isTemp && !this.form.data.prdtDtDsc) {
                this.ubicus.base.lib.notify('상품상세설명은 필수값입니다.', {title: '필수값 입력'}, {type: 'error'});
                return;
            }

            if (!isTemp) {

                let category2s = categories.map(e => e.cate2Id);
                // 중복제거
                category2s = category2s.filter((element, index) => {
                    return category2s.indexOf(element) === index;
                });

                /*if(this.category2Options.length > category2s.length) {
                    this.ubicus.base.lib.notify('누락된 카테고리값이 존재합니다.', {title: '필수값 입력'}, {type: 'error'});
                    return;
                }*/

                if(!categories || categories.length == 0) {
                    this.ubicus.base.lib.notify('대분류는 필수값입니다.', {title: '필수값 입력'}, {type: 'error'});
                    return
                }
            }

            /*if (!isTemp && (!details || details.length == 0)) {
                this.ubicus.base.lib.notify('상품상세는 필수값입니다.', {title: '필수값 입력'}, {type: 'error'});
                return;
            }*/

            const isUpdate = !!this.form.data.prdtKey;
            let tmpNm = this.form.data.tmpNm;

            if (isTemp) {

                const res = await this.ubicus.base.lib.confirm(`상품정보를 임시저장 하시겠습니까?`,
                    {
                        input: 'text',
                        inputValue: tmpNm,
                        inputLabel: '임시저장 제목',
                        inputPlaceholder: '임시저장 제목을 입력하세요.',
                        inputValidator: (value) => {
                            if (!value) {
                                return '임시저장 제목이 필요합니다.';
                            }
                        }
                    });

                if (!res.isConfirmed) {
                    return;
                }

                tmpNm = res.value;

            } else {

                if (copy === true) {
                    if (!(await this.ubicus.base.lib.confirm(`해당 상품정보를 복사하여 새로 저장하시겠습니까?`)).isConfirmed) {
                        return;
                    }
                } else {
                    if (!(await this.ubicus.base.lib.confirm(`상품정보를 ${isUpdate ? '수정' : '신규로 등록'} 하시겠습니까?`)).isConfirmed) {
                        return;
                    }
                }
            }

            this.$setOverlay(true);

            try {

                const deleteImageFiles = this.form.data.productSavedImageFiles.filter(e => e.workType === 'DELETE');
                const useImageFiles = this.form.data.productSavedImageFiles.filter(e => e.workType !== 'DELETE');

                await this.$refs['textEditor'].uploadImages();

                const resp = await this.xAjaxMultipart({
                    url: '/admin/product/overall',
                    method: 'POST',
                    fileParts: {
                        // 신규 업로드 이미지
                        productImageFiles: this.form.data.productImageFiles.map(e => e.file)
                    },
                    parts: {
                        isCopy: copy ? 'Y' : null,
                        product: {
                            prdtNo: this.form.data.prdtNo,
                            prdtKey: this.form.data.prdtKey,
                            prdtNm: this.form.data.prdtNm,
                            prdtDsc: this.form.data.prdtDsc,
                            prdtDtDsc: this.form.data.prdtDtDsc,
                            dplyYn: this.form.data.dplyYn,
                            eolYn: this.form.data.eolYn,
                            assgnYn: this.form.data.assgnYn,
                            regDt: this.form.data.regDt,
                            updDt: this.form.data.updDt,
                            tmpYn: isTemp ? 'Y' : 'N',
                            tmpNm: tmpNm,
                            spcYn: this.form.data.spcYn,
                            prdtSize: this.form.data.prdtSize,
                            sortNo: this.form.data.sortNo
                        },
                        productCategories: categories,
                        productDetails: details,
                        relProducts: this.relProducts.map((e, index) => ({
                            prdtNo: this.form.data.prdtNo,
                            relPrdtNo: e.prdtNo,
                            sortNo: index
                        })),
                        productTags: this.form.data.tagList ? this.form.data.tagList.map(e => ({prdtNo: this.form.data.prdtNo, tagTxt: e})) : [],
                        productImageFilesDivCd: this.form.data.productImageFiles.map(e => e.attachDivCd),
                        productImageDsc: this.form.data.productImageFiles.map(e => e.fileDsc),
                        // 삭제 이미지
                        productDeleteImageFiles: deleteImageFiles,
                        // 삭제 안되고 유지 되는 이미지
                        productUseImageFiles: useImageFiles
                    }
                });

                this.form.data.productDetails = details;
                this.form.data.productCategories = categories;

                if(isTemp) {
                    this.ubicus.base.lib.notify(`상품정보가 임시저장 되었습니다.`);
                }else {

                    if (copy === true) {
                        this.ubicus.base.lib.notify(`해당 상품이 복사되어 새로 저장되었습니다.`);
                    }else {
                        this.ubicus.base.lib.notify(`상품정보가 ${isUpdate ? '수정' : '신규로 등록'} 되었습니다.`);
                    }
                }

                if(!isUpdate) {
                    this.form.data.prdtKey = resp.prdtKey;
                    this.fetchData(true, true);
                }else {
                    this.fetchData(false, true);
                }

                this.$refs['fileSelector'].clear();

                //this.fetchData(true);
            }catch (e) {
                this.ubicus.base.lib.notify(e, {title: '에러발생'}, {type: 'error'});
                this.$setOverlay(false);
            }

        },
        deleteItem(item) {
            this.ubicus.base.lib.confirm('삭제 하시겠습니까?').then(result => {
                if (result.isConfirmed) {
                    this.xAjaxJson({
                        url: this.url + '/' + item.prdtKey,
                        method: 'DELETE'
                    }).then((resp) => {
                        this.ubicus.base.lib.notify(resp);
                        this.fetchData(false);
                    });
                }
            });
        },
        async selectTempProduct(item) {
            this.selectItem(item);
        }
    },
    watch: {
        'form.data.productCategory1'(category1) {
            const category3 = this.form.data.productCategory3backup;
            if (category3 && category3[0] && category3[0].split(':')[0] == category1) {
                this.form.data.productCategory3 = this.form.data.productCategory3backup;
            } else {
                this.form.data.productCategory3 = [];
            }
        }
    },
    async created() {

        this.form.init.productDetails = [{
            prdtDtMtrl: '',
            prdtDtNm: '',
            prdtDtPt: '',
            prdtDtQntyPerBox: 0,
            prdtDtSize: ''
        }];
    }
};
export default ProductManager;
