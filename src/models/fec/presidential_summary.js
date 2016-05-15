var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var PresidentialSummary = sequelize.define('fec_presidential_summary', {
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
        activity_primary: DataTypes.STRING(100),
        activity_general: DataTypes.STRING(100),
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
        col_a_expenditures_subject_to_limits: DataTypes.DECIMAL(12,2),
        col_a_net_contributions: DataTypes.DECIMAL(12,2),
        col_a_net_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_a_federal_funds: DataTypes.DECIMAL(12,2),
        col_a_individuals_itemized: DataTypes.DECIMAL(12,2),
        col_a_individuals_unitemized: DataTypes.DECIMAL(12,2),
        col_a_individual_contribution_total: DataTypes.DECIMAL(12,2),
        col_a_political_party_committees_receipts: DataTypes.DECIMAL(12,2),
        col_a_other_political_committees_pacs: DataTypes.DECIMAL(12,2),
        col_a_the_candidate: DataTypes.DECIMAL(12,2),
        col_a_total_contributions: DataTypes.DECIMAL(12,2),
        col_a_transfers_from_aff_other_party_cmttees: DataTypes.DECIMAL(12,2),
        col_a_received_from_or_guaranteed_by_cand: DataTypes.DECIMAL(12,2),
        col_a_other_loans: DataTypes.DECIMAL(12,2),
        col_a_total_loans: DataTypes.DECIMAL(12,2),
        col_a_operating: DataTypes.DECIMAL(12,2),
        col_a_fundraising: DataTypes.DECIMAL(12,2),
        col_a_legal_and_accounting: DataTypes.DECIMAL(12,2),
        col_a_total_offsets_to_expenditures: DataTypes.DECIMAL(12,2),
        col_a_other_receipts: DataTypes.DECIMAL(12,2),
        col_a_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_a_transfers_to_other_authorized_committees: DataTypes.DECIMAL(12,2),
        col_a_fundraising_disbursements: DataTypes.DECIMAL(12,2),
        col_a_exempt_legal_accounting_disbursement: DataTypes.DECIMAL(12,2),
        col_a_made_or_guaranteed_by_candidate: DataTypes.DECIMAL(12,2),
        col_a_other_repayments: DataTypes.DECIMAL(12,2),
        col_a_total_loan_repayments_made: DataTypes.DECIMAL(12,2),
        col_a_individuals: DataTypes.DECIMAL(12,2),
        col_a_political_party_committees_refunds: DataTypes.DECIMAL(12,2),
        col_a_other_political_committees: DataTypes.DECIMAL(12,2),
        col_a_total_contributions_refunds: DataTypes.DECIMAL(12,2),
        col_a_other_disbursements: DataTypes.DECIMAL(12,2),
        col_a_items_on_hand_to_be_liquidated: DataTypes.DECIMAL(12,2),
        col_a_alabama: DataTypes.DECIMAL(12,2),
        col_a_alaska: DataTypes.DECIMAL(12,2),
        col_a_arizona: DataTypes.DECIMAL(12,2),
        col_a_arkansas: DataTypes.DECIMAL(12,2),
        col_a_california: DataTypes.DECIMAL(12,2),
        col_a_colorado: DataTypes.DECIMAL(12,2),
        col_a_connecticut: DataTypes.DECIMAL(12,2),
        col_a_delaware: DataTypes.DECIMAL(12,2),
        col_a_dist_of_columbia: DataTypes.DECIMAL(12,2),
        col_a_florida: DataTypes.DECIMAL(12,2),
        col_a_georgia: DataTypes.DECIMAL(12,2),
        col_a_hawaii: DataTypes.DECIMAL(12,2),
        col_a_idaho: DataTypes.DECIMAL(12,2),
        col_a_illinois: DataTypes.DECIMAL(12,2),
        col_a_indiana: DataTypes.DECIMAL(12,2),
        col_a_iowa: DataTypes.DECIMAL(12,2),
        col_a_kansas: DataTypes.DECIMAL(12,2),
        col_a_kentucky: DataTypes.DECIMAL(12,2),
        col_a_louisiana: DataTypes.DECIMAL(12,2),
        col_a_maine: DataTypes.DECIMAL(12,2),
        col_a_maryland: DataTypes.DECIMAL(12,2),
        col_a_massachusetts: DataTypes.DECIMAL(12,2),
        col_a_michigan: DataTypes.DECIMAL(12,2),
        col_a_minnesota: DataTypes.DECIMAL(12,2),
        col_a_mississippi: DataTypes.DECIMAL(12,2),
        col_a_missouri: DataTypes.DECIMAL(12,2),
        col_a_montana: DataTypes.DECIMAL(12,2),
        col_a_nebraska: DataTypes.DECIMAL(12,2),
        col_a_nevada: DataTypes.DECIMAL(12,2),
        col_a_new_hampshire: DataTypes.DECIMAL(12,2),
        col_a_new_jersey: DataTypes.DECIMAL(12,2),
        col_a_new_mexico: DataTypes.DECIMAL(12,2),
        col_a_new_york: DataTypes.DECIMAL(12,2),
        col_a_north_carolina: DataTypes.DECIMAL(12,2),
        col_a_north_dakota: DataTypes.DECIMAL(12,2),
        col_a_ohio: DataTypes.DECIMAL(12,2),
        col_a_oklahoma: DataTypes.DECIMAL(12,2),
        col_a_oregon: DataTypes.DECIMAL(12,2),
        col_a_pennsylvania: DataTypes.DECIMAL(12,2),
        col_a_rhode_island: DataTypes.DECIMAL(12,2),
        col_a_south_carolina: DataTypes.DECIMAL(12,2),
        col_a_south_dakota: DataTypes.DECIMAL(12,2),
        col_a_tennessee: DataTypes.DECIMAL(12,2),
        col_a_texas: DataTypes.DECIMAL(12,2),
        col_a_utah: DataTypes.DECIMAL(12,2),
        col_a_vermont: DataTypes.DECIMAL(12,2),
        col_a_virginia: DataTypes.DECIMAL(12,2),
        col_a_washington: DataTypes.DECIMAL(12,2),
        col_a_west_virginia: DataTypes.DECIMAL(12,2),
        col_a_wisconsin: DataTypes.DECIMAL(12,2),
        col_a_wyoming: DataTypes.DECIMAL(12,2),
        col_a_puerto_rico: DataTypes.DECIMAL(12,2),
        col_a_guam: DataTypes.DECIMAL(12,2),
        col_a_virgin_islands: DataTypes.DECIMAL(12,2),
        col_a_totals: DataTypes.DECIMAL(12,2),
        col_b_federal_funds: DataTypes.DECIMAL(12,2),
        col_b_individuals_itemized: DataTypes.DECIMAL(12,2),
        col_b_individuals_unitemized: DataTypes.DECIMAL(12,2),
        col_b_individual_contribution_total: DataTypes.DECIMAL(12,2),
        col_b_political_party_committees_receipts: DataTypes.DECIMAL(12,2),
        col_b_other_political_committees_pacs: DataTypes.DECIMAL(12,2),
        col_b_the_candidate: DataTypes.DECIMAL(12,2),
        col_b_total_contributions_other_than_loans: DataTypes.DECIMAL(12,2),
        col_b_transfers_from_aff_other_party_cmttees: DataTypes.DECIMAL(12,2),
        col_b_received_from_or_guaranteed_by_cand: DataTypes.DECIMAL(12,2),
        col_b_other_loans: DataTypes.DECIMAL(12,2),
        col_b_total_loans: DataTypes.DECIMAL(12,2),
        col_b_operating: DataTypes.DECIMAL(12,2),
        col_b_fundraising: DataTypes.DECIMAL(12,2),
        col_b_legal_and_accounting: DataTypes.DECIMAL(12,2),
        col_b_total_offsets_to_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_b_other_receipts: DataTypes.DECIMAL(12,2),
        col_b_total_receipts: DataTypes.DECIMAL(12,2),
        col_b_operating_expenditures: DataTypes.DECIMAL(12,2),
        col_b_transfers_to_other_authorized_committees: DataTypes.DECIMAL(12,2),
        col_b_fundraising_disbursements: DataTypes.DECIMAL(12,2),
        col_b_exempt_legal_accounting_disbursement: DataTypes.DECIMAL(12,2),
        col_b_made_or_guaranteed_by_the_candidate: DataTypes.DECIMAL(12,2),
        col_b_other_repayments: DataTypes.DECIMAL(12,2),
        col_b_total_loan_repayments_made: DataTypes.DECIMAL(12,2),
        col_b_individuals: DataTypes.DECIMAL(12,2),
        col_b_political_party_committees_refunds: DataTypes.DECIMAL(12,2),
        col_b_other_political_committees: DataTypes.DECIMAL(12,2),
        col_b_total_contributions_refunds: DataTypes.DECIMAL(12,2),
        col_b_other_disbursements: DataTypes.DECIMAL(12,2),
        col_b_total_disbursements: DataTypes.DECIMAL(12,2),
        col_b_alabama: DataTypes.DECIMAL(12,2),
        col_b_alaska: DataTypes.DECIMAL(12,2),
        col_b_arizona: DataTypes.DECIMAL(12,2),
        col_b_arkansas: DataTypes.DECIMAL(12,2),
        col_b_california: DataTypes.DECIMAL(12,2),
        col_b_colorado: DataTypes.DECIMAL(12,2),
        col_b_connecticut: DataTypes.DECIMAL(12,2),
        col_b_delaware: DataTypes.DECIMAL(12,2),
        col_b_dist_of_columbia: DataTypes.DECIMAL(12,2),
        col_b_florida: DataTypes.DECIMAL(12,2),
        col_b_georgia: DataTypes.DECIMAL(12,2),
        col_b_hawaii: DataTypes.DECIMAL(12,2),
        col_b_idaho: DataTypes.DECIMAL(12,2),
        col_b_illinois: DataTypes.DECIMAL(12,2),
        col_b_indiana: DataTypes.DECIMAL(12,2),
        col_b_iowa: DataTypes.DECIMAL(12,2),
        col_b_kansas: DataTypes.DECIMAL(12,2),
        col_b_kentucky: DataTypes.DECIMAL(12,2),
        col_b_louisiana: DataTypes.DECIMAL(12,2),
        col_b_maine: DataTypes.DECIMAL(12,2),
        col_b_maryland: DataTypes.DECIMAL(12,2),
        col_b_massachusetts: DataTypes.DECIMAL(12,2),
        col_b_michigan: DataTypes.DECIMAL(12,2),
        col_b_minnesota: DataTypes.DECIMAL(12,2),
        col_b_mississippi: DataTypes.DECIMAL(12,2),
        col_b_missouri: DataTypes.DECIMAL(12,2),
        col_b_montana: DataTypes.DECIMAL(12,2),
        col_b_nebraska: DataTypes.DECIMAL(12,2),
        col_b_nevada: DataTypes.DECIMAL(12,2),
        col_b_new_hampshire: DataTypes.DECIMAL(12,2),
        col_b_new_jersey: DataTypes.DECIMAL(12,2),
        col_b_new_mexico: DataTypes.DECIMAL(12,2),
        col_b_new_york: DataTypes.DECIMAL(12,2),
        col_b_north_carolina: DataTypes.DECIMAL(12,2),
        col_b_north_dakota: DataTypes.DECIMAL(12,2),
        col_b_ohio: DataTypes.DECIMAL(12,2),
        col_b_oklahoma: DataTypes.DECIMAL(12,2),
        col_b_oregon: DataTypes.DECIMAL(12,2),
        col_b_pennsylvania: DataTypes.DECIMAL(12,2),
        col_b_rhode_island: DataTypes.DECIMAL(12,2),
        col_b_south_carolina: DataTypes.DECIMAL(12,2),
        col_b_south_dakota: DataTypes.DECIMAL(12,2),
        col_b_tennessee: DataTypes.DECIMAL(12,2),
        col_b_texas: DataTypes.DECIMAL(12,2),
        col_b_utah: DataTypes.DECIMAL(12,2),
        col_b_vermont: DataTypes.DECIMAL(12,2),
        col_b_virginia: DataTypes.DECIMAL(12,2),
        col_b_washington: DataTypes.DECIMAL(12,2),
        col_b_west_virginia: DataTypes.DECIMAL(12,2),
        col_b_wisconsin: DataTypes.DECIMAL(12,2),
        col_b_wyoming: DataTypes.DECIMAL(12,2),
        col_b_puerto_rico: DataTypes.DECIMAL(12,2),
        col_b_guam: DataTypes.DECIMAL(12,2),
        col_b_virgin_islands: DataTypes.DECIMAL(12,2),
        col_b_totals: DataTypes.DECIMAL(12,2)
    }, {
        classMethods: {
            associate: function(models) {
                PresidentialSummary.belongsTo(models.fec_filing,{
                    constraints: false,
                    foreignKey: 'filing_id'
                });

                PresidentialSummary.belongsTo(models.fec_amended_filing,{
                    constraints: false,
                    foreignKey: 'filing_id'
                });
/*
                PresidentialSummary.belongsTo(models.cpi_group,{
                    constraints: false,
                    foreignKey: 'filer_committee_id_number'
                });*/
            },
            match: function (row) {
                if (row.form_type && row.form_type.match(/^(F3P)/)) {
                    return true;
                }
                return false;
            }
        },
        indexes: [{
            fields: ['filer_committee_id_number']
        }]
    });

    return PresidentialSummary;
};
