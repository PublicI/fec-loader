var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var Expenditure = sequelize.define('fec_expenditure', {
        // cycle: DataTypes.STRING(5),
        filing_id: DataTypes.INTEGER,
        form_type: DataTypes.STRING(20),
        filer_committee_id_number: DataTypes.STRING(30),
        transaction_id_number: DataTypes.STRING(30),
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
        expenditure_date: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.match(/^[0-9]{8}$/)) {
                    this.setDataValue('expenditure_date', moment(val, 'YYYYMMDD').toDate());
                }
                else {
                    this.setDataValue('expenditure_date', val);
                }
            }
        },
        expenditure_amount: DataTypes.DECIMAL(12,2),
        semi_annual_refunded_bundled_amt: DataTypes.STRING(50),
        expenditure_purpose_descrip: DataTypes.STRING(255),
        category_code: DataTypes.STRING(10),
        beneficiary_committee_fec_id: DataTypes.STRING(50),
        beneficiary_committee_name: DataTypes.STRING(100),
        beneficiary_candidate_fec_id: DataTypes.STRING(50),
        beneficiary_candidate_last_name: DataTypes.STRING(100),
        beneficiary_candidate_first_name: DataTypes.STRING(100),
        beneficiary_candidate_middle_name: DataTypes.STRING(100),
        beneficiary_candidate_prefix: DataTypes.STRING(10),
        beneficiary_candidate_office: DataTypes.STRING(50),
        beneficiary_candidate_suffix: DataTypes.STRING(10),
        beneficiary_candidate_state: DataTypes.STRING(10),
        beneficiary_candidate_district: DataTypes.STRING(10),
        conduit_name: DataTypes.STRING(255),
        conduit_street_1: DataTypes.STRING(200),
        conduit_street_2: DataTypes.STRING(200),
        conduit_city: DataTypes.STRING(100),
        conduit_state: DataTypes.STRING(10),
        conduit_zip_code: DataTypes.STRING(50),
        memo_code: DataTypes.STRING(5),
        memo_text_description: DataTypes.STRING(200),
        back_reference_tran_id_number: DataTypes.STRING(255),
        back_reference_sched_name: DataTypes.STRING(100),
        reference_to_si_or_sl_system_code_that_identifies_the_account: DataTypes.STRING(50)
    },{
        classMethods: {
            associate: function(models) {
                Expenditure.hasMany(models.cpi_exp_code_match,{
                    constraints: false
                });

                Expenditure.belongsTo(models.fec_filing,{
                    as: 'Filing',
                    constraints: false,
                    foreignKey: 'filing_id'
                });
            },
            match: function (row) {
                if (row.form_type && row.form_type.match(/^SA/)) {
                    return true;
                }
                return false;
            }
        },
        indexes: [{
            fields: ['filing_id']
        },{
            fields: ['filer_committee_id_number']
        }, {
            fields: ['memo_code']
        }]
    });

    return Expenditure;
};
