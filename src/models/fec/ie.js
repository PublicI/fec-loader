var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var IndependentExpenditure = sequelize.define('fec_ie', {
        filing_id: DataTypes.INTEGER,
        form_type: DataTypes.STRING(20),
        filer_committee_id_number: DataTypes.STRING(30),
        transaction_id_number: DataTypes.STRING(255),
        back_reference_tran_id_number: DataTypes.STRING(255),
        back_reference_sched_name: DataTypes.STRING(100),
        entity_type: DataTypes.STRING(5),
        payee_organization_name: DataTypes.STRING(255),
        payee_last_name: DataTypes.STRING(255),
        payee_first_name: DataTypes.STRING(255),
        payee_middle_name: DataTypes.STRING(255),
        payee_prefix: DataTypes.STRING(10),
        payee_suffix: DataTypes.STRING(10),
        payee_street_1: DataTypes.STRING(255),
        payee_street_2: DataTypes.STRING(255),
        payee_city: DataTypes.STRING(100),
        payee_state: DataTypes.STRING(30),
        payee_zip_code: DataTypes.STRING(50),
        election_code: DataTypes.STRING(30),
        election_other_description: DataTypes.STRING(255),
        dissemination_date: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.match(/^[0-9]{8}$/)) {
                    this.setDataValue('dissemination_date', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('dissemination_date', val);
                }
            }
        },
        expenditure_amount: DataTypes.DECIMAL(12, 2),
        disbursement_date: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.match(/^[0-9]{8}$/)) {
                    this.setDataValue('disbursement_date', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('disbursement_date', val);
                }
            }
        },
        calendar_y_t_d_per_election_office: DataTypes.DECIMAL(12, 2),
        expenditure_purpose_descrip: DataTypes.STRING(255),
        category_code: DataTypes.STRING(10),
        payee_cmtte_fec_id_number: DataTypes.STRING(50),
        support_oppose_code: DataTypes.STRING(10),
        candidate_id_number: DataTypes.STRING(50),
        candidate_last_name: DataTypes.STRING(255),
        candidate_first_name: DataTypes.STRING(255),
        candidate_middle_name: DataTypes.STRING(255),
        candidate_prefix: DataTypes.STRING(10),
        candidate_suffix: DataTypes.STRING(10),
        candidate_office: DataTypes.STRING(10),
        candidate_district: DataTypes.STRING(10),
        candidate_state: DataTypes.STRING(10),
        completing_last_name: DataTypes.STRING(255),
        completing_first_name: DataTypes.STRING(255),
        completing_middle_name: DataTypes.STRING(255),
        completing_prefix: DataTypes.STRING(10),
        completing_suffix: DataTypes.STRING(10),
        date_signed: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.match(/^[0-9]{8}$/)) {
                    this.setDataValue('date_signed', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('date_signed', val);
                }
            }
        },
        memo_code: DataTypes.STRING(10),
        memo_text_description: DataTypes.STRING(255)
    }, {
        classMethods: {
            match: function (row) {
                if (row.form_type && row.form_type.match(/^(SE|F57)/)) {
                    return true;
                }
                return false;
            }
        },
        indexes: [{
            fields: ['filing_id']
        }, {
            fields: ['filer_committee_id_number']
        }, {
            fields: ['memo_code']
        }]
    });

    return IndependentExpenditure;
};
