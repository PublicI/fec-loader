
module.exports = function(sequelize, DataTypes) {
    var AmendedFiling = sequelize.define('fec_amended_filing', {
        filing_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        report_id: DataTypes.INTEGER,
        report_number: DataTypes.INTEGER
    }, {
        timestamps: false,
        underscored: true
    });

    return AmendedFiling;
};
