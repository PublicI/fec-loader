var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
    var GroupSummary = sequelize.define('fec_group_summary', {
        filing_id: {
            type: DataTypes.INTEGER,
            unique: true
        },
        form_type: DataTypes.STRING(100),
        filer_committee_id_number: DataTypes.STRING(100),
        entity_type: DataTypes.STRING(5),
        organization_name: DataTypes.STRING(255),
        individual_last_name: DataTypes.STRING(255),
        individual_first_name: DataTypes.STRING(255),
        individual_middle_name: DataTypes.STRING(255),
        individual_prefix: DataTypes.STRING(100),
        individual_suffix: DataTypes.STRING(100),
        change_of_address: DataTypes.STRING(10),
        street_1: DataTypes.STRING(255),
        street_2: DataTypes.STRING(255),
        city: DataTypes.STRING(100),
        state: DataTypes.STRING(10),
        zip_code: DataTypes.STRING(20),
        individual_occupation: DataTypes.STRING(255),
        individual_employer: DataTypes.STRING(255),
        report_code: DataTypes.STRING(10),
        report_type: DataTypes.STRING(10),
        original_amendment_date: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{8}$/)) {
                    this.setDataValue('original_amendment_date', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('original_amendment_date', val);
                }
            }
        },
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
        total_contribution: DataTypes.DECIMAL(12, 2),
        total_independent_expenditure: DataTypes.DECIMAL(12, 2),
        person_completing_last_name: DataTypes.STRING(255),
        person_completing_first_name: DataTypes.STRING(255),
        person_completing_middle_name: DataTypes.STRING(255),
        person_completing_prefix: DataTypes.STRING(100),
        person_completing_suffix: DataTypes.STRING(100),
        date_signed: {
            type: DataTypes.DATEONLY,
            set: function(val) {
                if (val && !(val instanceof Date) && val.toString().match(/^[0-9]{8}$/)) {
                    this.setDataValue('date_signed', moment(val, 'YYYYMMDD').toDate());
                } else {
                    this.setDataValue('date_signed', val);
                }
            }
        }
    }, {
        classMethods: {
            associate: function(models) {
                GroupSummary.belongsTo(models.fec_filing, {
                    constraints: false,
                    foreignKey: 'filing_id'
                });

                GroupSummary.belongsTo(models.fec_amended_filing, {
                    constraints: false,
                    foreignKey: 'filing_id'
                });
            },
            match: function (row) {
                if (row.form_type && row.form_type.match(/^(F5)/) && row.report_code) {
                    return true;
                }
                return false;
            }
        },
        indexes: [{
            fields: ['filer_committee_id_number']
        }]
    });

    return GroupSummary;
};
