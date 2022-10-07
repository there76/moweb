import UbMenuGroup from "/static/apps/components/navigation/UbMenuGroup.js";

const UbNavigationDrawer = {
    name: 'ub-navigation-drawer',
    template: `
        <div class="ubcs-navigation-drawer">
            <v-navigation-drawer app v-model="drawer" :width="width">
                <template #prepend>
                    <v-toolbar flat dense>
                        <a href="/" class="d-flex align-center app-logo">
                            <v-img v-if="logo.src" :src="logo.src" :alt="logo.title" class="shrink" :width="logo.width" :height="logo.height"/>
                            <span v-if="logo.title" class="title" style="color:#ff7f00 !important;">{{ logo.title }}</span>
                        </a>
                    </v-toolbar>
                </template>
    
                <v-list expand v-if="serviceMenu.children && serviceMenu.children.length > 0">
                    <template v-for="(menu, index) in serviceMenu.children">
                        <template v-if="!menu.children || menu.children.length === 0" >
                            <v-list-item :to="menu.path" tag="a" dense :key="menu.id">
                                <v-list-item-content>
                                    <v-list-item-title v-if="menu.name" v-text="menu.name"/>
                                </v-list-item-content>
                            </v-list-item>
                            <v-divider :key="index"></v-divider>
                        </template>
                        <ub-menu-group v-else :menu="menu" :key="menu.id"/>
                    </template>
                </v-list>
            </v-navigation-drawer>
        </div>
    `,
    components: {
        UbMenuGroup: UbMenuGroup
    },
    model: {
        prop: 'show',
        event: 'change'
    },
    props: {
        logo: {
            type: Object,
            default: () => ({})
        },
        serviceMenu: {
            type: Object,
            default: () => ({})
        },
        show: {
            type: Boolean,
            default: null
        },
        width: {
            type: [Number, String],
            default: 190,
        }
    },
    computed: {
        drawer: {
            get() {
                return this.show;
            },
            set(drawer) {
                this.$emit('change', drawer);
            }
        }
    }
};

export default UbNavigationDrawer;
