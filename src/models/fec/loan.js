var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var Loan = sequelize.define('fec_loan', {
        filing_id: DataTypes.INTEGER,
        form_type: DataTypes.STRING(50),
        filer_committee_id_number: DataTypes.STRING(50),
        transaction_id_number: DataTypes.STRING(50),
        receipt_line_number: DataTypes.STRING(50),
        entity_type: DataTypes.STRING(10),
        lender_organization_name: DataTypes.STRING(255),
        lender_last_name: DataTypes.STRING(255),
        lender_first_name: DataTypes.STRING(255),
        lender_middle_name: DataTypes.STRING(255),
        lender_prefix: DataTypes.STRING(20),
        lender_suffix: DataTypes.STRING(20),
        lender_street_1: DataTypes.STRING(255),
        lender_street_2: DataTypes.STRING(255),
        lender_city: DataTypes.STRING(100),
        lender_state: DataTypes.STRING(30),
        lender_zip_code: DataTypes.STRING(30),
        election_code: DataTypes.STRING(30),
        election_other_description: DataTypes.STRING(255),
        loan_amount_original: DataTypes.DECIMAL(12, 2),
        loan_payment_to_date: DataTypes.DECIMAL(12, 2),
        loan_balance: DataTypes.DECIMAL(12, 2),
        loan_incurred_date_terms: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.match(/^[0-9]{8}$/)) {
                    this.setDataValue('loan_incurred_date_terms', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('loan_incurred_date_terms', val);
                }
            }
        },
        loan_due_date_terms: DataTypes.STRING(255),
        loan_interest_rate_terms: DataTypes.DECIMAL(12, 2),
        secured: DataTypes.STRING(10),
        personal_funds: DataTypes.STRING(10),
        lender_committee_id_number: DataTypes.STRING(50),
        lender_candidate_id_number: DataTypes.STRING(50),
        lender_candidate_last_name: DataTypes.STRING(255),
        lender_candidate_first_name: DataTypes.STRING(255),
        lender_candidate_middle_nm: DataTypes.STRING(255),
        lender_candidate_prefix: DataTypes.STRING(20),
        lender_candidate_suffix: DataTypes.STRING(20),
        lender_candidate_office: DataTypes.STRING(20),
        lender_candidate_state: DataTypes.STRING(30),
        lender_candidate_district: DataTypes.STRING(30),
        memo_code: DataTypes.STRING(5),
        memo_text_description: DataTypes.STRING(200)
    }, {
        classMethods: {
            associate: function(models) {
                Loan.belongsTo(models.fec_filing, {
                    constraints: false,
                    foreignKey: 'filing_id'
                });
            },
            match: function(row) {
                if (row.form_type && row.form_type.match(/^SC/)) {
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

    return Loan;
};
