const UbDateTimePicker = {
    name: 'ub-date-time-picker',
    template: `
        <div>
        <v-dialog
                ref="dateDialog"
                v-model="dateModal"
                :return-value.sync="date"
                persistent
                width="290px"
        >
            <template v-slot:activator="{ on }">
                <v-text-field
                        v-model="innerText"
                        :label="label"
                        hide-details
                        readonly
                        outlined
                        dense
                        v-on="on"
                ></v-text-field>
            </template>
            <v-date-picker v-model="date" :locale="locale" scrollable>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="dateModal = false">Cancel</v-btn>
                <v-btn color="primary" @click="timeModal = true">OK</v-btn>
            </v-date-picker>
        </v-dialog>

        <v-dialog
                ref="timeDialog"
                v-model="timeModal"
                :return-value.sync="time"
                persistent
                width="290px"
        >
            <v-time-picker
                    v-if="timeModal"
                    v-model="time"
                    full-width
                    :locale="locale"
            >
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="timeModal = false">Cancel</v-btn>
                <v-btn color="primary" @click="set()">OK</v-btn>
            </v-time-picker>
        </v-dialog>
    </div>
    `,
    props: {
        label: {
            type: String
        },
        dateFormat: {
            type: String,
            default: 'YYYY-MM-DD'
        },
        timeFormat: {
            type: String,
            default: 'HH:mm'
        },
        locale: {
            type: String,
            default: 'ko-kr'
        }
    },
    data: () => ({
        date: "",
        time: "",
        dateModal: false,
        timeModal: false,
        innerMoment: null
    }),
    computed: {
        innerText() {
            return this.innerMoment == null ? '' : this.innerMoment.format(`${this.dateFormat} ${this.timeFormat}`);
        }
    },
    created() {
        this.setData();
    },
    methods: {
        setData() {
            if (moment.isMoment(this.$attrs.value)) {
                this.innerMoment = this.$attrs.value;
            } else {
                this.innerMoment = moment();
            }

            this.date = this.innerMoment.format(this.dateFormat);
            this.time = this.innerMoment.format(this.timeFormat);
        },
        set() {

            this.$refs.dateDialog.save(this.date);
            this.$refs.timeDialog.save(this.time);

            this.innerMoment = moment(`${this.date} ${this.time}`);

            this.$emit('input', this.innerMoment);
        }
    },
    watch: {
        '$attrs.value'(value) {
            this.setData();
        }
    }
}

export default UbDateTimePicker;