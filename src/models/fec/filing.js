
module.exports = function(sequelize, DataTypes) {
    var Filing = sequelize.define('fec_filing', {
        filing_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        record_type: DataTypes.STRING(100),
        ef_type: DataTypes.STRING(100),
        fec_version: DataTypes.STRING(100),
        soft_name: DataTypes.STRING(255),
        soft_ver: DataTypes.STRING(100),
        report_id: {
            type: DataTypes.INTEGER,
            set: function(val) {
                if (val) {
                    this.setDataValue('report_id', val.replace('FEC-',''));
                }
                else {
                    this.setDataValue('report_id', val);
                }
            }
        },
        report_number: DataTypes.INTEGER
    }, {
        classMethods: {
            match: function (row) {
                if (row.record_type && row.record_type == 'HDR') {
                    return true;
                }
                return false;
            }
        },
        indexes: [{
            fields: ['report_id']
        },{
            fields: ['report_number']
        }]
    });

    return Filing;
};
