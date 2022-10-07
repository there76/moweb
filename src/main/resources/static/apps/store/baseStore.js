export default {
    namespaced: true,
    state: {
        overlay: false,
        user: {},
        productCategories: []
    },
    getters: {
        getOverlay: state => state.overlay,
        getUser: state => state.user,
        getProductCategories: state => state.productCategories
    },
    mutations: {
        setOverlay: (state, overlay) => {
            state.overlay = overlay;
        },
        setUser: (state, user) => {
            state.user = user;
        },
        setProductCategories: (state, productCategories) => {
            state.productCategories = productCategories;
        }
    },
    actions: {
        setOverlay({commit}, overlay) {
            commit('setOverlay', overlay);
        },
        setUser({commit}, user) {
            commit('setUser', user);
        },
        initBaseStore({commit}, data) {
            if(data !== undefined){
                commit('setUser', data['user']);
                commit('setUsers', data['users']);
                commit('setProductCategories', data['productCategories']);
            }

            //this.$store.dispatch('base/getUser', '112121'); 로 호출가능
            //store 내에서는 this._vm으로 vm 접근 가능
        }
    }
};