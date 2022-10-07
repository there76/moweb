const baseHelper = Vuex.createNamespacedHelpers('base');
const UbPasswordChange = {
    name: 'ub-password-change',
    mixins: [],
    template: `
    <v-card outlined>
        <v-card-text>
            <div>
                <v-text-field v-model="form.data.nowPassword" label="현재 비밀번호" :type="'password'" :rules="ubicus.base.rule.required"></v-text-field>
            </div>
            <div>
                <v-text-field v-model="form.data.newPassword1" label="신규 비밀번호" :type="'password'" :rules="ubicus.base.rule.required"></v-text-field>
            </div>
            <div>
                <v-text-field v-model="form.data.newPassword2" label="신규 비밀번호 재입력" :type="'password'" :rules="ubicus.base.rule.required"></v-text-field>
            </div>
        </v-card-text>
    </v-card>
    `,
    data: function(){
        return {
            form: {
                data: {
                    nowPassword: '',
                    newPassword1: '',
                    newPassword2: ''
                },
            }
        };
    },
    methods: {
        changePassword(dialog) {
            console.log('비밀번호 변경하기 ')

            dialog.close();

        },
        initPassword(dialog) {
            console.log('비밀번호 초기화 ')

            dialog.close();

        },
        ...baseHelper.mapActions([
            "setOverlay"
        ])
    }
};

export default UbPasswordChange;