var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var PACSummary = sequelize.define('fec_pac_summary', {
        filing_id: {
            type: DataTypes.INTEGER,
            unique: true
        },
        form_type: DataTypes.STRING(100),
        filer_committee_id_number: DataTypes.STRING(100),
        committee_name: DataTypes.STRING(255),
        change_of_address: DataTypes.STRING(100),
        street_1: DataTypes.STRING(255),
        street_2: DataTypes.STRING(255),
        city: DataTypes.STRING(255),
        state: DataTypes.STRING(100),
        zip_code: DataTypes.STRING(100),
        report_code: DataTypes.STRING(100),
        election_code: DataTypes.STRING(100),
        date_of_election: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{8}$/)) {
                    this.setDataValue('date_of_election', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('date_of_election', val);
                }
            }
        },
        state_of_election: DataTypes.STRING(100),
        coverage_from_date: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{8}$/)) {
                    this.setDataValue('coverage_from_date', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('coverage_from_date', val);
                }
            }
        },
        coverage_through_date: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{8}$/)) {
                    this.setDataValue('coverage_through_date', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('coverage_through_date', val);
                }
            }
        },
        qualified_committee: DataTypes.STRING(100),
        treasurer_last_name: DataTypes.STRING(255),
        treasurer_first_name: DataTypes.STRING(255),
        treasurer_middle_name: DataTypes.STRING(255),
        treasurer_prefix: DataTypes.STRING(100),
        treasurer_suffix: DataTypes.STRING(100),
        date_signed: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{8}$/)) {
                    this.setDataValue('date_signed', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('date_signed', val);
                }
            }
        },
        col_a_cash_on_hand_beginning_period: DataTypes.DECIMAL(12,2),
        col_a_total_receipts: DataTypes.DECIMAL(12,2),
        col_a_subtotal: DataTypes.DECIMAL(12,2),
        col_a_total_disbursements: DataTypes.DECIMAL(12,2),
        col_a_cash_on_hand_close_of_period: DataTypes.DECIMAL(12,2),
        col_a_debts_to: DataTypes.DECIMAL(12,2),
        col_a_debts_by: DataTypes.DECIMAL(12,2),
        col_a_individuals_itemized: DataTypes.DECIMAL(12,2),
        col_a_individuals_unitemized: DataTypes.DECIMAL(12,2),
        col_a_individual_contribution_total: DataTypes.DECIMAL(12,2),
        col_a_political_party_committees: DataTypes.DECIMAL(12,2),
        col_a_other_political_committees_pacs: DataTypes.DECIMAL(12,2),
        col_a_total_contributions: DataTypes.DECIMAL(12,2),
        col_a_transfers_from_aff_other_party_cmttees: DataTypes.DECIMAL(12,2),
        col_a_total_loans: DataTypes.DECIMAL(12,2),
        col_a_total_loan_repayments_received: DataTypes.DECIMAL(12,2),
        col_a_offsets_to_expenditures: DataTypes.DECIMAL(12,2),
        col_a_total_contributions_refunds: DataTypes.DECIMAL(12,2),
        col_a_other_federal_receipts: DataTypes.DECIMAL(12,2),
        col_a_transfers_from_nonfederal_h3: DataTypes.DECIMAL(12,2),
        col_a_levin_funds: DataTypes.DECIMAL(12,2),
        col_a_total_nonfederal_transfers: DataTypes.DECIMAL(12,2),
        col_a_total_federal_receipts: DataTypes.DECIMAL(12,2),
        col_a_shared_operating_expenditures_federal: DataTypes.DECIMAL(12,2),
        col_a_shared_operating_expenditures_nonfederal: DataTypes.DECIMAL(12,2),
        col_a_other_federal_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_a_total_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_a_transfers_to_affiliated: DataTypes.DECIMAL(12,2),
        col_a_contributions_to_candidates: DataTypes.DECIMAL(12,2),
        col_a_independent_expenditures: DataTypes.DECIMAL(12,2),
        col_a_coordinated_expenditures_by_party_committees: DataTypes.DECIMAL(12,2),
        col_a_total_loan_repayments_made: DataTypes.DECIMAL(12,2),
        col_a_loans_made: DataTypes.DECIMAL(12,2),
        col_a_refunds_to_individuals: DataTypes.DECIMAL(12,2),
        col_a_refunds_to_party_committees: DataTypes.DECIMAL(12,2),
        col_a_refunds_to_other_committees: DataTypes.DECIMAL(12,2),
        col_a_total_refunds: DataTypes.DECIMAL(12,2),
        col_a_other_disbursements: DataTypes.DECIMAL(12,2),
        col_a_federal_election_activity_federal_share: DataTypes.DECIMAL(12,2),
        col_a_federal_election_activity_levin_share: DataTypes.DECIMAL(12,2),
        col_a_federal_election_activity_all_federal: DataTypes.DECIMAL(12,2),
        col_a_federal_election_activity_total: DataTypes.DECIMAL(12,2),
        col_a_total_federal_disbursements: DataTypes.DECIMAL(12,2),
        col_a_net_contributions: DataTypes.DECIMAL(12,2),
        col_a_total_federal_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_a_total_offsets_to_expenditures: DataTypes.DECIMAL(12,2),
        col_a_net_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_b_cash_on_hand_jan_1: DataTypes.DECIMAL(12,2),
        col_b_year: DataTypes.STRING(100),
        col_b_total_receipts: DataTypes.DECIMAL(12,2),
        col_b_subtotal: DataTypes.DECIMAL(12,2),
        col_b_total_disbursements: DataTypes.DECIMAL(12,2),
        col_b_cash_on_hand_close_of_period: DataTypes.DECIMAL(12,2),
        col_b_individuals_itemized: DataTypes.DECIMAL(12,2),
        col_b_individuals_unitemized: DataTypes.DECIMAL(12,2),
        col_b_individual_contribution_total: DataTypes.DECIMAL(12,2),
        col_b_political_party_committees: DataTypes.DECIMAL(12,2),
        col_b_other_political_committees_pacs: DataTypes.DECIMAL(12,2),
        col_b_total_contributions: DataTypes.DECIMAL(12,2),
        col_b_transfers_from_aff_other_party_cmttees: DataTypes.DECIMAL(12,2),
        col_b_total_loans: DataTypes.DECIMAL(12,2),
        col_b_total_loan_repayments_received: DataTypes.DECIMAL(12,2),
        col_b_offsets_to_expenditures: DataTypes.DECIMAL(12,2),
        col_b_total_contributions_refunds: DataTypes.DECIMAL(12,2),
        col_b_other_federal_receipts: DataTypes.DECIMAL(12,2),
        col_b_transfers_from_nonfederal_h3: DataTypes.DECIMAL(12,2),
        col_b_levin_funds: DataTypes.DECIMAL(12,2),
        col_b_total_nonfederal_transfers: DataTypes.DECIMAL(12,2),
        col_b_total_federal_receipts: DataTypes.DECIMAL(12,2),
        col_b_shared_operating_expenditures_federal: DataTypes.DECIMAL(12,2),
        col_b_shared_operating_expenditures_nonfederal: DataTypes.DECIMAL(12,2),
        col_b_other_federal_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_b_total_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_b_transfers_to_affiliated: DataTypes.DECIMAL(12,2),
        col_b_contributions_to_candidates: DataTypes.DECIMAL(12,2),
        col_b_independent_expenditures: DataTypes.DECIMAL(12,2),
        col_b_coordinated_expenditures_by_party_committees: DataTypes.DECIMAL(12,2),
        col_b_total_loan_repayments_made: DataTypes.DECIMAL(12,2),
        col_b_loans_made: DataTypes.DECIMAL(12,2),
        col_b_refunds_to_individuals: DataTypes.DECIMAL(12,2),
        col_b_refunds_to_party_committees: DataTypes.DECIMAL(12,2),
        col_b_refunds_to_other_committees: DataTypes.DECIMAL(12,2),
        col_b_total_refunds: DataTypes.DECIMAL(12,2),
        col_b_other_disbursements: DataTypes.DECIMAL(12,2),
        col_b_federal_election_activity_federal_share: DataTypes.DECIMAL(12,2),
        col_b_federal_election_activity_levin_share: DataTypes.DECIMAL(12,2),
        col_b_federal_election_activity_all_federal: DataTypes.DECIMAL(12,2),
        col_b_federal_election_activity_total: DataTypes.DECIMAL(12,2),
        col_b_total_federal_disbursements: DataTypes.DECIMAL(12,2),
        col_b_net_contributions: DataTypes.DECIMAL(12,2),
        col_b_total_federal_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_b_total_offsets_to_expenditures: DataTypes.DECIMAL(12,2),
        col_b_net_operating_expenditures: DataTypes.DECIMAL(12,2)
    }, {
        classMethods: {
            associate: function(models) {
                PACSummary.belongsTo(models.fec_filing,{
                    constraints: false,
                    foreignKey: 'filing_id'
                });

                PACSummary.belongsTo(models.fec_amended_filing,{
                    constraints: false,
                    foreignKey: 'filing_id'
                });
/*
                PACSummary.hasMany(models.cpi_group_id,{
                    constraints: false,
                    foreignKey: 'filer_committee_id_number'
                });*/
            },
            match: function (row) {
                if (row.form_type && row.form_type.match(/^(F3X)/)) {
                    return true;
                }
                return false;
            }
        },
        indexes: [{
            fields: ['filer_committee_id_number']
        }]
    });

    return PACSummary;
};
