const LoadTempProduct = {
    name: 'load-temp-product',
    template: `
    <v-dialog
            v-model="dialog"
            persistent
            hide-overlay
            :retain-focus="false"
            no-click-animation
            max-width="800px">
            
       <template v-slot:activator="{ on, attrs }">
       
               <v-badge
                bordered
                color="error"
                :value="tempProducts.length"
                :content="tempProducts.length"
                overlap
              >
                 <v-btn
              color="success"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>
              임시저장 불러오기
            </v-btn>
              </v-badge>
      </template>
      
      <v-card>
         <v-card-title>
                <span class="headline">임시저장 상품 리스트</span>
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
         </v-card-title>
         <v-card-text>
            <v-container>
                <v-simple-table dense fix-header>
                    <template v-slot:default>
                      <colgroup>
                        <col width="160"/>
                        <col width="200"/>
                        <col/>
                      </colgroup>
                      <thead>
                        <tr>
                          <th class="text-left">
                            최근저장일
                          </th>
                          <th class="text-left">
                            상품명
                          </th>
                          <th class="text-left">
                            저장명
                          </th>
                        </tr>
                      </thead>
                      <tbody v-if="tempProducts.length > 0">
                        <tr
                          v-for="item in tempProducts"
                          :key="item.prdtKey"
                        >
                          <td>{{ item.updDt || item.regDt }}</td>
                          <td>{{ item.prdtNm }}</td>
                          <td>
                            <a class="ellipsis cursor-pointer blue--text text-lighten-3" @click="selectItem(item)">{{ item.tmpNm }}</a>
                          </td>
                        </tr>
                      </tbody>
                      <tbody v-else>
                        <tr>
                           <td colspan="3" class="text-center">임시저장 리스트가 존재하지 않습니다.</td> 
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
            </v-container>
         </v-card-text>
      </v-card>
            
    </v-dialog>
    `,
    data: () => ({
        dialog: false,
        tempProducts: []
    }),
    methods: {
        async fetchData() {
            const response = await this.xAjax({
                url: '/admin/tempProduct',
                method: 'GET'
            });
            this.tempProducts = response;
        },
        selectItem(item) {
            this.$emit('select', item);
            this.dialog = false;
        }
    },
    async created() {
        await this.fetchData();
    },
    watch: {
        async 'dialog'(dialog) {
            if (dialog) {
                await this.fetchData();
            }
        }
    }
}

export default LoadTempProduct;